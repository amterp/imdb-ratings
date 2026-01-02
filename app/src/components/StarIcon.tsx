interface StarIconProps {
  isStarred: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function StarIcon({
  isStarred,
  onClick,
  size = 'md',
  className = '',
}: StarIconProps) {
  return (
    <button
      onClick={onClick}
      className={`${SIZES[size]} transition-smooth hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded ${className}`}
      aria-label={isStarred ? 'Remove from starred' : 'Add to starred'}
      title={isStarred ? 'Remove from starred' : 'Add to starred'}
    >
      {isStarred ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full text-yellow-400"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-gray-400 hover:text-yellow-400"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
    </button>
  );
}
