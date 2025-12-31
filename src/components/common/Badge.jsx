const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success-light text-green-700',
  warning: 'bg-warning-light text-yellow-700',
  error: 'bg-error-light text-red-700',
  info: 'bg-info-light text-blue-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full mr-1.5
            ${variant === 'success' ? 'bg-green-500' : ''}
            ${variant === 'warning' ? 'bg-yellow-500' : ''}
            ${variant === 'error' ? 'bg-red-500' : ''}
            ${variant === 'info' ? 'bg-blue-500' : ''}
            ${variant === 'primary' ? 'bg-primary' : ''}
            ${variant === 'accent' ? 'bg-accent' : ''}
            ${variant === 'default' ? 'bg-gray-500' : ''}
          `}
        />
      )}
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
