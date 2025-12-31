const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    default: { backgroundColor: '#F1F5F9', color: '#475569' },
    primary: { backgroundColor: 'rgba(30, 58, 95, 0.1)', color: '#1E3A5F' },
    accent: { backgroundColor: 'rgba(233, 30, 99, 0.1)', color: '#E91E63' },
    success: { backgroundColor: '#D1FAE5', color: '#059669' },
    warning: { backgroundColor: '#FEF3C7', color: '#D97706' },
    error: { backgroundColor: '#FEE2E2', color: '#DC2626' },
    info: { backgroundColor: '#DBEAFE', color: '#2563EB' },
  };

  const sizeStyles = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.25rem 0.625rem', fontSize: '0.75rem' },
    lg: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
  };

  const dotColors = {
    default: '#6B7280',
    primary: '#1E3A5F',
    accent: '#E91E63',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '500',
    borderRadius: '9999px',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const dotStyle = {
    width: '0.375rem',
    height: '0.375rem',
    borderRadius: '50%',
    marginRight: '0.375rem',
    backgroundColor: dotColors[variant],
  };

  return (
    <span style={badgeStyle} className={className}>
      {dot && <span style={dotStyle} />}
      {children}
    </span>
  );
};

// Status Badge helper
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'success', label: 'Published' },
    closed: { variant: 'warning', label: 'Closed' },
    completed: { variant: 'info', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    failed: { variant: 'error', label: 'Failed' },
    refunded: { variant: 'info', label: 'Refunded' },
    not_checked_in: { variant: 'default', label: 'Not Checked In' },
    checked_in: { variant: 'success', label: 'Checked In' },
    checked_out: { variant: 'info', label: 'Checked Out' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
};

export default Badge;
