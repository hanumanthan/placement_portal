export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src="/logo.svg" alt="PlaceMe Logo" className={sizes[size]} />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-semibold text-secondary-900 ${textSizes[size]}`}>
            PlaceMe
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-muted tracking-wider uppercase">
              Prepare. Apply. Get Placed.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
