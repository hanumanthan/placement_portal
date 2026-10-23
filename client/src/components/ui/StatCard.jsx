import Card from './Card';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'primary', className = '' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary',
    success: 'bg-success-50 text-success',
    warning: 'bg-warning-50 text-warning',
    danger: 'bg-danger-50 text-danger',
  };

  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-muted';

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted font-medium truncate">{title}</p>
          <p className="text-2xl font-semibold text-secondary-900 mt-1">{value}</p>
          {(trend !== undefined || trendLabel) && (
            <p className={`text-xs mt-2 ${trendColor}`}>
              {trend > 0 && '↑ '}
              {trend < 0 && '↓ '}
              {trendLabel || `${Math.abs(trend)}%`}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
