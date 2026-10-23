const variantStyles = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  muted: 'badge-muted',
};

// Maps application / drive statuses to badge variants
const statusVariantMap = {
  // Application statuses
  'Interested': 'primary',
  'Applied': 'primary',
  'Shortlisted': 'warning',
  'Test Completed': 'primary',
  'Interview': 'warning',
  'Selected': 'success',
  'Rejected': 'danger',
  'Withdrawn': 'muted',
  // Drive statuses
  'draft': 'muted',
  'published': 'success',
  'ongoing': 'warning',
  'completed': 'primary',
  'cancelled': 'danger',
  // General
  'active': 'success',
  'disabled': 'danger',
  'upcoming': 'primary',
  'available': 'success',
  'completed': 'muted',
  'easy': 'success',
  'medium': 'warning',
  'hard': 'danger',
};

export default function Badge({ children, variant, status, className = '' }) {
  // If a status string is passed, auto-map to a variant
  const resolvedVariant = variant || statusVariantMap[status] || 'muted';

  return (
    <span className={`${variantStyles[resolvedVariant]} ${className}`}>
      {children || status}
    </span>
  );
}
