export default function ProgressBar({ value = 0, max = 100, color = 'primary', size = 'md', label, className = '' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorMap = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-secondary-700">{label}</span>
          <span className="text-sm text-muted">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-secondary-100 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${colorMap[color]} ${sizeMap[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || 'Progress'}
        />
      </div>
    </div>
  );
}
