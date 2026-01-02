import argparse
import logging
import os
import shutil
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import contextmanager
from multiprocessing import get_context
from pathlib import Path

import orjson
import polars as pl

CACHE_DIR = Path("/tmp/imdb-heatmap")

VOTES_URL = "https://datasets.imdbws.com/title.ratings.tsv.gz"
EPISODES_URL = "https://datasets.imdbws.com/title.episode.tsv.gz"
NAMES_URL = "https://datasets.imdbws.com/title.basics.tsv.gz"

DATA_DIR = "data/"

# Tier configurations
LITE_NUM_SHOWS = 5000
EXPANDED_NUM_SHOWS = 25000
DEFAULT_NUM_SHOWS = EXPANDED_NUM_SHOWS  # Generate all expanded shows by default


def clear_data_dir():
    """Remove all JSON files from the data directory."""
    data_path = Path(DATA_DIR)
    for f in data_path.glob("*.json"):
        f.unlink()


# Worker process globals (initialized via pool initializer)
_ratings_dict = None
_episodes_by_parent = None


def _init_worker(ratings_dict, episodes_by_parent):
    """Initialize worker process with shared data."""
    global _ratings_dict, _episodes_by_parent
    _ratings_dict = ratings_dict
    _episodes_by_parent = episodes_by_parent


def _process_show(parent_id):
    """Worker function to process a single show."""
    gen_season_ratings(parent_id, _ratings_dict, _episodes_by_parent)
    return parent_id


# Configure logging with timestamps
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


@contextmanager
def timed_phase(name: str):
    """Context manager that logs duration of a phase."""
    logger.info(f"Starting: {name}")
    start = time.time()
    yield
    elapsed = time.time() - start
    logger.info(f"Completed: {name} in {elapsed:.1f}s")


def download_dataset(name: str, url: str, usecols: list[str]) -> pl.DataFrame:
    """Download a single dataset with timing, using cache if available."""
    filename = url.split("/")[-1]
    cache_path = CACHE_DIR / filename
    start = time.time()

    if cache_path.exists():
        logger.info(f"Loading {name} from cache...")
        df = pl.read_csv(
            cache_path,
            separator="\t",
            columns=usecols,
            null_values=["\\N"],
            quote_char=None,  # IMDB TSV doesn't use standard CSV quoting
            truncate_ragged_lines=True,
        )
        elapsed = time.time() - start
        logger.info(f"Loaded {name} from cache in {elapsed:.1f}s ({len(df):,} rows)")
    else:
        logger.info(f"Downloading {name}...")
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(url) as response:
            data = response.read()
        cache_path.write_bytes(data)
        df = pl.read_csv(
            cache_path,
            separator="\t",
            columns=usecols,
            null_values=["\\N"],
            quote_char=None,  # IMDB TSV doesn't use standard CSV quoting
            truncate_ragged_lines=True,
        )
        elapsed = time.time() - start
        logger.info(f"Downloaded {name} in {elapsed:.1f}s ({len(df):,} rows)")

    return df


def download_all_datasets() -> tuple[pl.DataFrame, pl.DataFrame, pl.DataFrame]:
    """Download all datasets with conservative parallelism (2 workers)."""
    datasets_config = [
        ("names", NAMES_URL, ["tconst", "primaryTitle"]),
        ("episodes", EPISODES_URL, ["tconst", "parentTconst", "seasonNumber", "episodeNumber"]),
        ("votes", VOTES_URL, ["tconst", "averageRating", "numVotes"]),
    ]

    results = {}
    with ThreadPoolExecutor(max_workers=2) as executor:
        future_to_name = {
            executor.submit(download_dataset, name, url, cols): name
            for name, url, cols in datasets_config
        }
        for future in as_completed(future_to_name):
            name = future_to_name[future]
            results[name] = future.result()

    return results["names"], results["episodes"], results["votes"]


def gen_idtitle(parent_votes: pl.DataFrame, names_dict: dict[str, str], filename: str = "titleId.json") -> None:
    """Generate the title ID overview file using pre-indexed names dict."""
    title_ids = []
    for row in parent_votes.iter_rows(named=True):
        show_id = row["tconst"]
        title = names_dict.get(show_id, "Unknown")
        title_ids.append({
            "id": show_id,
            "title": title,
            "rating": row["averageRating"],
            "votes": row["numVotes"],
        })

    with open(f"{DATA_DIR}{filename}", "wb") as f:
        f.write(b"[\n")
        for idx, entry in enumerate(title_ids):
            entry_json = orjson.dumps(entry)
            if idx == len(title_ids) - 1:
                f.write(entry_json + b"\n")
            else:
                f.write(entry_json + b",\n")
        f.write(b"]\n")

    logger.info(f"Generated {filename} with {len(title_ids)} shows")


def gen_season_ratings(
    parent_id: str,
    ratings_dict: dict[str, tuple[float, int]],
    episodes_by_parent: dict[str, list[tuple[str, int, int]]]
) -> None:
    """Generate ratings for a single show using pre-indexed lookups."""
    show_ratings = []

    # O(1) lookup for episodes of this show (already filtered tuples)
    show_episodes = episodes_by_parent.get(parent_id)
    if not show_episodes:
        with open(f"{DATA_DIR}{parent_id}.json", "wb") as f:
            f.write(b"[]\n")
        return

    # show_episodes is already sorted list of (tconst, season, episode) tuples
    # Group by season
    seasons: dict[int, list[tuple[str, int]]] = {}
    for tconst, season, episode in show_episodes:
        if season not in seasons:
            seasons[season] = []
        seasons[season].append((tconst, episode))

    # Process each season in order
    for season in sorted(seasons.keys()):
        season_eps = seasons[season]
        if not season_eps:
            continue

        max_ep = max(ep for _, ep in season_eps)
        season_data = [None] * max_ep

        for episode_id, episode_num in season_eps:
            # O(1) lookup for ratings
            episode_data = ratings_dict.get(episode_id)
            if episode_data is None:
                continue

            rating, votes = episode_data
            # Format: [rating, votes, id] - episode number is implicit (index + 1)
            season_data[episode_num - 1] = [rating, votes, episode_id]

        show_ratings.append(season_data)

    # Write JSON using orjson for speed
    with open(f"{DATA_DIR}{parent_id}.json", "wb") as f:
        if not show_ratings:
            f.write(b"[]\n")
        else:
            # Build output maintaining the expected format with newlines between episodes
            parts = [b"[", b"["]
            for season_idx, season in enumerate(show_ratings):
                is_last_season = season_idx == len(show_ratings) - 1
                for ep_idx, episode in enumerate(season):
                    ep_json = orjson.dumps(episode)
                    is_last_ep = ep_idx == len(season) - 1
                    parts.append(ep_json if is_last_ep else ep_json + b",")
                parts.append(b"]" if is_last_season else b"],\n[")
            parts.append(b"]")
            f.write(b"\n".join(parts) + b"\n")


def build_indexes(names: pl.DataFrame, episodes: pl.DataFrame, votes: pl.DataFrame):
    """Build all indexes in parallel using ThreadPoolExecutor."""

    def build_names_dict():
        # Names: tconst -> primaryTitle
        return dict(zip(
            names["tconst"].to_list(),
            names["primaryTitle"].to_list()
        ))

    def build_ratings_dict():
        # Ratings: tconst -> (averageRating, numVotes)
        return dict(zip(
            votes["tconst"].to_list(),
            zip(votes["averageRating"].to_list(), votes["numVotes"].to_list())
        ))

    def build_episodes_by_parent():
        # Filter out null seasons/episodes and episode 0, convert to int, sort
        valid_episodes = episodes.filter(
            (pl.col("seasonNumber").is_not_null()) &
            (pl.col("episodeNumber").is_not_null())
        ).with_columns([
            pl.col("seasonNumber").cast(pl.Int32),
            pl.col("episodeNumber").cast(pl.Int32),
        ]).filter(
            pl.col("episodeNumber") > 0
        ).sort(["parentTconst", "seasonNumber", "episodeNumber"])

        # Group into dict of lists of tuples - use iter_rows() for speed (no dict per row)
        result: dict[str, list[tuple[str, int, int]]] = {}
        # Column order: tconst, parentTconst, seasonNumber, episodeNumber
        for tconst, parent, season, episode in valid_episodes.iter_rows():
            if parent not in result:
                result[parent] = []
            result[parent].append((tconst, season, episode))
        return result

    # Run all three index builds in parallel
    with ThreadPoolExecutor(max_workers=3) as executor:
        names_future = executor.submit(build_names_dict)
        ratings_future = executor.submit(build_ratings_dict)
        episodes_future = executor.submit(build_episodes_by_parent)

        names_dict = names_future.result()
        logger.info(f"Indexed {len(names_dict):,} titles")

        ratings_dict = ratings_future.result()
        logger.info(f"Indexed {len(ratings_dict):,} ratings")

        episodes_by_parent = episodes_future.result()
        logger.info(f"Indexed episodes for {len(episodes_by_parent):,} parent shows")

    return names_dict, ratings_dict, episodes_by_parent


def main():
    parser = argparse.ArgumentParser(description="Generate IMDb ratings data files")
    parser.add_argument("--shows", nargs="+", metavar="ID",
                        help="Generate data for specific show IDs only (e.g., tt0903747 tt0944947)")
    parser.add_argument("-n", "--num-shows", type=int, default=DEFAULT_NUM_SHOWS, metavar="N",
                        help=f"Number of top shows to process (default: {DEFAULT_NUM_SHOWS})")
    parser.add_argument("--clear-cache", action="store_true",
                        help="Clear cached IMDb data files before running")
    args = parser.parse_args()

    if args.clear_cache:
        if CACHE_DIR.exists():
            shutil.rmtree(CACHE_DIR)
            logger.info("Cache cleared")

    Path(DATA_DIR).mkdir(exist_ok=True)

    total_start = time.time()

    # Download datasets
    with timed_phase("Download datasets"):
        names, episodes, votes = download_all_datasets()

    # Build indexes for O(1) lookups (parallelized)
    with timed_phase("Build indexes"):
        names_dict, ratings_dict, episodes_by_parent = build_indexes(names, episodes, votes)

    if args.shows:
        # Generate data for specific shows only
        target_shows = args.shows
        logger.info(f"Targeting specific shows: {target_shows}")

        with timed_phase(f"Generate data for {len(target_shows)} shows"):
            for idx, show_id in enumerate(target_shows):
                gen_season_ratings(show_id, ratings_dict, episodes_by_parent)
                logger.info(f"Generated {show_id} ({idx + 1}/{len(target_shows)})")
    else:
        # Full run: top N shows by votes
        num_shows = args.num_shows
        with timed_phase("Identify top shows"):
            parent_shows = set(episodes["parentTconst"].to_list())
            parent_votes = votes.filter(pl.col("tconst").is_in(parent_shows))
            parent_votes = parent_votes.sort("numVotes", descending=True).head(num_shows)
            logger.info(f"Selected top {len(parent_votes)} shows by vote count")

        with timed_phase("Clear existing data"):
            clear_data_dir()

        with timed_phase("Generate catalog files"):
            # Generate expanded catalog (all shows being processed)
            gen_idtitle(parent_votes, names_dict, "titleId-expanded.json")

            # Generate lite catalog (top LITE_NUM_SHOWS)
            lite_votes = parent_votes.head(LITE_NUM_SHOWS)
            gen_idtitle(lite_votes, names_dict, "titleId-lite.json")

        with timed_phase(f"Generate data for {num_shows} shows"):
            show_ids = parent_votes["tconst"].to_list()
            progress_interval = max(1, num_shows // 5)  # Log ~5 times during run
            gen_start = time.time()

            num_workers = os.cpu_count() or 4
            logger.info(f"Using {num_workers} parallel workers")

            # Use 'fork' context to share data via copy-on-write
            ctx = get_context('fork')
            _init_worker(ratings_dict, episodes_by_parent)  # Set globals before forking

            with ctx.Pool(num_workers) as pool:
                for idx, _ in enumerate(pool.imap_unordered(_process_show, show_ids, chunksize=100)):
                    if (idx + 1) % progress_interval == 0:
                        elapsed = time.time() - gen_start
                        rate = (idx + 1) / elapsed if elapsed > 0 else 0
                        remaining = (num_shows - idx - 1) / rate if rate > 0 else 0
                        logger.info(f"Progress: {idx + 1}/{num_shows} shows ({elapsed:.1f}s elapsed, ~{remaining:.1f}s remaining)")

        # Success indicator
        with open("done", "w") as f:
            f.write("done")

    total_elapsed = time.time() - total_start
    logger.info(f"Total runtime: {total_elapsed:.1f}s ({total_elapsed / 60:.1f} min)")


if __name__ == "__main__":
    main()
