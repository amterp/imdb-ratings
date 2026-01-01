import argparse
import json
import logging
import os
import shutil
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import contextmanager
from multiprocessing import Pool, get_context
from pathlib import Path

import pandas as pd

CACHE_DIR = Path("/tmp/imdb-heatmap")

VOTES_URL = "https://datasets.imdbws.com/title.ratings.tsv.gz"
EPISODES_URL = "https://datasets.imdbws.com/title.episode.tsv.gz"
NAMES_URL = "https://datasets.imdbws.com/title.basics.tsv.gz"

DATA_DIR = "data/"
NUM_SHOWS = 2500

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


def download_dataset(name: str, url: str, usecols: list[str]) -> pd.DataFrame:
    """Download a single dataset with timing, using cache if available."""
    filename = url.split("/")[-1]
    cache_path = CACHE_DIR / filename
    start = time.time()

    if cache_path.exists():
        logger.info(f"Loading {name} from cache...")
        df = pd.read_csv(cache_path, header=0, usecols=usecols, compression="gzip", sep="\t")
        elapsed = time.time() - start
        logger.info(f"Loaded {name} from cache in {elapsed:.1f}s ({len(df):,} rows)")
    else:
        logger.info(f"Downloading {name}...")
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(url) as response:
            data = response.read()
        cache_path.write_bytes(data)
        df = pd.read_csv(cache_path, header=0, usecols=usecols, compression="gzip", sep="\t")
        elapsed = time.time() - start
        logger.info(f"Downloaded {name} in {elapsed:.1f}s ({len(df):,} rows)")

    return df


def download_all_datasets() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
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


def gen_idtitle(parent_votes: pd.DataFrame, names_dict: dict[str, str]) -> None:
    """Generate the title ID overview file using pre-indexed names dict."""
    title_ids = []
    for show_id in parent_votes["tconst"]:
        title = names_dict.get(show_id, "Unknown")
        title_ids.append({"id": show_id, "title": title})

    with open(f"{DATA_DIR}titleId.json", "w") as f:
        f.write("[\n")
        for idx, entry in enumerate(title_ids):
            entry_json = json.dumps(entry, separators=(',', ':'))
            if idx == len(title_ids) - 1:
                f.write(f"{entry_json}\n")
            else:
                f.write(f"{entry_json},\n")
        f.write("]\n")

    logger.info(f"Generated titleId.json with {len(title_ids)} shows")


def gen_season_ratings(
    parent_id: str,
    ratings_dict: dict[str, dict],
    episodes_by_parent: dict[str, pd.DataFrame]
) -> None:
    """Generate ratings for a single show using pre-indexed lookups."""
    show_ratings = []

    # O(1) lookup for episodes of this show
    show_episodes = episodes_by_parent.get(parent_id)
    if show_episodes is None:
        # No episodes found for this show
        with open(f"{DATA_DIR}{parent_id}.json", "w") as f:
            f.write("[]\n")
        return

    # Filter and sort
    show_episodes = show_episodes[
        (show_episodes["seasonNumber"] != "\\N") &
        (show_episodes["episodeNumber"] != "\\N")
    ].copy()

    if show_episodes.empty:
        with open(f"{DATA_DIR}{parent_id}.json", "w") as f:
            f.write("[]\n")
        return

    show_episodes["seasonNumber"] = show_episodes["seasonNumber"].astype(int)
    show_episodes["episodeNumber"] = show_episodes["episodeNumber"].astype(int)
    show_episodes = show_episodes.sort_values(by=["seasonNumber", "episodeNumber"])

    # Process each season
    for season in show_episodes["seasonNumber"].unique():
        season_episodes = show_episodes[show_episodes["seasonNumber"] == season]
        # Filter to valid episode numbers (IMDb sometimes has episode 0 for specials)
        season_episodes = season_episodes[season_episodes["episodeNumber"] > 0]

        if season_episodes.empty:
            continue

        max_ep = season_episodes["episodeNumber"].max()

        # Initialize with None for all episode slots (episode number = index + 1)
        season_data = [None] * max_ep

        for row in season_episodes.itertuples():
            episode_id = row.tconst
            episode_num = row.episodeNumber

            # O(1) lookup for ratings
            episode_data = ratings_dict.get(episode_id)
            if episode_data is None:
                continue

            episode_rating = episode_data["averageRating"]
            votes = episode_data["numVotes"]
            episode_votes = int(votes) if pd.notna(votes) else None

            # Format: [rating, votes, id] - episode number is implicit (index + 1)
            season_data[episode_num - 1] = [episode_rating, episode_votes, episode_id]

        show_ratings.append(season_data)

    # Write JSON in one go (preserving original formatting)
    with open(f"{DATA_DIR}{parent_id}.json", "w") as f:
        if not show_ratings:
            f.write("[]\n")
        else:
            lines = ["[", "["]
            for season_idx, season in enumerate(show_ratings):
                is_last_season = season_idx == len(show_ratings) - 1
                for ep_idx, episode in enumerate(season):
                    ep_json = json.dumps(episode, separators=(',', ':'))
                    is_last_ep = ep_idx == len(season) - 1
                    lines.append(ep_json if is_last_ep else f"{ep_json},")
                lines.append("]" if is_last_season else "],\n[")
            lines.append("]")
            f.write("\n".join(lines) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Generate IMDb ratings data files")
    parser.add_argument("--shows", nargs="+", metavar="ID",
                        help="Generate data for specific show IDs only (e.g., tt0903747 tt0944947)")
    parser.add_argument("-n", "--num-shows", type=int, default=NUM_SHOWS, metavar="N",
                        help=f"Number of top shows to process (default: {NUM_SHOWS})")
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

    # Build indexes for O(1) lookups
    with timed_phase("Build indexes"):
        # Names: tconst -> primaryTitle
        names_dict = names.set_index("tconst")["primaryTitle"].to_dict()
        logger.info(f"Indexed {len(names_dict):,} titles")

        # Ratings: tconst -> {averageRating, numVotes}
        ratings_dict = votes.set_index("tconst").to_dict("index")
        logger.info(f"Indexed {len(ratings_dict):,} ratings")

        # Episodes: dict of DataFrames by parentTconst for O(1) lookup and pickling
        episodes_by_parent = {name: group for name, group in episodes.groupby("parentTconst")}
        logger.info(f"Indexed episodes for {len(episodes_by_parent):,} parent shows")

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
            parent_shows = set(episodes["parentTconst"].unique())
            parent_votes = votes[votes["tconst"].isin(parent_shows)]
            parent_votes = parent_votes.sort_values(by=["numVotes"], ascending=False)
            parent_votes = parent_votes.head(num_shows)
            logger.info(f"Selected top {len(parent_votes)} shows by vote count")

        with timed_phase("Generate titleId.json"):
            gen_idtitle(parent_votes, names_dict)

        with timed_phase(f"Generate data for {num_shows} shows"):
            show_ids = parent_votes["tconst"].tolist()
            progress_interval = max(1, num_shows // 5)  # Log ~5 times during run
            gen_start = time.time()

            num_workers = os.cpu_count() or 4
            logger.info(f"Using {num_workers} parallel workers")

            # Use 'fork' context to share data via copy-on-write (avoids pickling 230k DataFrames)
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
