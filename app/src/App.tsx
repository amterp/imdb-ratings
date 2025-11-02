import { useShowCatalog } from './hooks/useShowCatalog';
import { useShowData } from './hooks/useShowData';
import { useUrlState } from './hooks/useUrlState';
import { SearchBar } from './components/SearchBar';
import { HeatmapGrid } from './components/HeatmapGrid';
import { StatusIndicator } from './components/StatusIndicator';
import { HoverProvider } from './contexts/HoverContext';
import type { ShowMetadata } from './types';

function App() {
  const { showId, setShowId } = useUrlState();
  const {
    data: showCatalog,
    isLoading: isCatalogLoading,
    error: catalogError,
  } = useShowCatalog();

  const {
    data: showData,
    isLoading: isShowLoading,
    error: showError,
  } = useShowData(showId);

  // Find the current show's title
  const currentShow = showCatalog?.find((show) => show.id === showId);

  const handleSelectShow = (show: ShowMetadata) => {
    setShowId(show.id, show.title);
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
      <div className="min-h-screen py-8 px-4">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-8">
          <div className="glass rounded-2xl p-8 mb-6">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              IMDb Series Heatmap
            </h1>
            <p className="text-center text-gray-400 text-sm">
              Visualize TV show ratings at a glance
            </p>
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

        {/* Prominent Show Title */}
        {showData && currentShow && (
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-white bg-clip-text text-transparent">
              {currentShow.title}
            </h2>
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
            Updated daily
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
