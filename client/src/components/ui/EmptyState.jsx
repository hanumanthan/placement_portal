import { FileX } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FileX,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="p-4 rounded-full bg-secondary-100 mb-4">
        <Icon className="w-10 h-10 text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
