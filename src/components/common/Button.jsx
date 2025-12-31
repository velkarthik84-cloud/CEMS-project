import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    border: 'none',
    outline: 'none',
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#1E3A5F',
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#F1F5F9',
      color: '#1E3A5F',
    },
    accent: {
      backgroundColor: '#E91E63',
      color: '#FFFFFF',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#1E3A5F',
      border: '2px solid #1E3A5F',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#1E3A5F',
    },
    danger: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
    success: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },
  };

  const sizeStyles = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    xl: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(fullWidth ? { width: '100%' } : {}),
  };

  const handleMouseEnter = (e) => {
    if (disabled || loading) return;
    if (variant === 'primary') {
      e.target.style.backgroundColor = '#152C4A';
    } else if (variant === 'accent') {
      e.target.style.backgroundColor = '#C2185B';
    } else if (variant === 'secondary' || variant === 'ghost') {
      e.target.style.backgroundColor = '#E2E8F0';
    } else if (variant === 'outline') {
      e.target.style.backgroundColor = '#1E3A5F';
      e.target.style.color = '#FFFFFF';
    } else if (variant === 'danger') {
      e.target.style.backgroundColor = '#DC2626';
    } else if (variant === 'success') {
      e.target.style.backgroundColor = '#059669';
    }
  };

  const handleMouseLeave = (e) => {
    if (disabled || loading) return;
    e.target.style.backgroundColor = variantStyles[variant].backgroundColor;
    e.target.style.color = variantStyles[variant].color;
  };

  return (
    <button
      ref={ref}
      type={type}
      style={combinedStyles}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
