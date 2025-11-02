interface StatusIndicatorProps {
  status: 'loading' | 'ready' | 'error' | 'show-loaded';
  showTitle?: string;
  errorMessage?: string;
}

export function StatusIndicator({
  status,
  showTitle,
  errorMessage,
}: StatusIndicatorProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="text-yellow-400 font-semibold">Loading...</span>
        );
      case 'ready':
        return <span className="text-green-400 font-semibold">Ready!</span>;
      case 'error':
        return (
          <span className="text-red-400 font-semibold">
            {errorMessage || 'Error loading data'}
          </span>
        );
      case 'show-loaded':
        return <span className="text-white font-semibold">{showTitle}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="text-center py-4 min-h-12 flex items-center justify-center">
      {getStatusContent()}
    </div>
  );
}
