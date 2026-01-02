import { useShowCatalog } from './hooks/useShowCatalog';
import { useShowData } from './hooks/useShowData';
import { useUrlState } from './hooks/useUrlState';
import { useCatalogTier } from './hooks/useCatalogTier';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { useStarredShows } from './hooks/useStarredShows';
import { SearchBar } from './components/SearchBar';
import { HeatmapGrid } from './components/HeatmapGrid';
import { StatusIndicator } from './components/StatusIndicator';
import { EpisodeInfoPanel } from './components/EpisodeInfoPanel';
import { CatalogTierToggle } from './components/CatalogTierToggle';
import { StarredShowsDropdown } from './components/StarredShowsDropdown';
import { RecentlyViewedDropdown } from './components/RecentlyViewedDropdown';
import { StarIcon } from './components/StarIcon';
import { HoverProvider } from './contexts/HoverContext';
import { useRatingMode } from './contexts/RatingModeContext';
import { RatingModeToggle } from './components/RatingModeToggle';
import { COMMIT_HASH, COMMIT_DATE, COMMIT_URL } from './utils/constants';
import { formatVotes } from './utils/statsUtils';
import type { ShowMetadata } from './types';

function App() {
  const { showId, setShowId } = useUrlState();
  const { tier, toggleTier } = useCatalogTier();
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();
  const { starredShows, isStarred, toggleStarred, removeStarred, reorderStarred } =
    useStarredShows();
  const { ratingMode, toggleRatingMode } = useRatingMode();

  const {
    data: showCatalog,
    isLoading: isCatalogLoading,
    error: catalogError,
  } = useShowCatalog(tier);

  const {
    data: showData,
    isLoading: isShowLoading,
    error: showError,
  } = useShowData(showId);

  // Find the current show's title
  const currentShow = showCatalog?.find((show) => show.id === showId);

  const handleSelectShow = (show: ShowMetadata) => {
    setShowId(show.id, show.title);
    addRecentlyViewed(show);
  };

  // Determine status for status indicator
  const getStatus = () => {
    if (isCatalogLoading) return 'loading';
    if (catalogError) return 'error';
    if (showId && isShowLoading) return 'loading';
    if (showId && showError) return 'error';
    if (showId && showData && currentShow) return 'show-loaded';
    return 'ready';
  };

  const status = getStatus();

  return (
    <HoverProvider>
      <EpisodeInfoPanel showData={showData} />
      <div className="min-h-screen py-8 px-4">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-8">
          <div className="glass rounded-2xl p-8 mb-6 relative z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  IMDb Series Heatmap
                </h1>
                <p className="text-gray-400 text-sm">
                  Visualize TV show ratings at a glance
                </p>
              </div>
              {/* Header controls: Catalog + Ratings on top, Starred + Recent below */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <CatalogTierToggle
                    tier={tier}
                    onToggle={toggleTier}
                    isLoading={isCatalogLoading}
                  />
                  <RatingModeToggle mode={ratingMode} onToggle={toggleRatingMode} />
                </div>
                <div className="flex gap-2 w-full">
                  <StarredShowsDropdown
                    starredShows={starredShows}
                    onSelectShow={handleSelectShow}
                    onRemoveStarred={removeStarred}
                    onReorder={reorderStarred}
                    className="flex-1"
                  />
                  <RecentlyViewedDropdown
                    recentlyViewed={recentlyViewed}
                    onSelectShow={handleSelectShow}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <SearchBar
            shows={showCatalog || []}
            onSelectShow={handleSelectShow}
            isLoading={isCatalogLoading}
          />

          <StatusIndicator
            status={status}
            showTitle={currentShow?.title}
            errorMessage={
              catalogError?.message ||
              showError?.message ||
              'Failed to load data'
            }
          />
        </header>

        {/* Prominent Show Title with Star */}
        {showData && currentShow && (
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-white bg-clip-text text-transparent">
                  {currentShow.title}
                </h2>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4">
                  <StarIcon
                    isStarred={isStarred(currentShow.id)}
                    onClick={() => toggleStarred(currentShow)}
                    size="lg"
                  />
                </div>
              </div>
            </div>
            <div className="h-6 mt-2">
              {currentShow.rating != null && currentShow.votes != null && (
                <span className="text-sm text-slate-400">
                  Rated {currentShow.rating.toFixed(1)} · {formatVotes(currentShow.votes)} votes
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="w-full">
          {showData && currentShow && (
            <div className="glass rounded-2xl p-8 mx-auto" style={{ width: 'fit-content', maxWidth: '95vw' }}>
              <HeatmapGrid showData={showData} />
            </div>
          )}

          {!showId && !isCatalogLoading && (
            <div className="text-center text-gray-400 mt-12">
              <p className="text-lg">
                Search for a TV show to view its episode ratings heatmap
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-12 text-center text-gray-500 text-sm">
          <p>
            Data from{' '}
            <a
              href="https://www.imdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-smooth"
            >
              IMDb
            </a>
            {' · '}
            Updated daily · Version: {COMMIT_DATE} (<a
              href={COMMIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-smooth"
            >{COMMIT_HASH}</a>)
            {' · '}
            <a
              href="https://github.com/amterp/imdb-ratings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-smooth"
            >
              Source
            </a>
          </p>
        </footer>
      </div>
    </HoverProvider>
  );
}

export default App;
