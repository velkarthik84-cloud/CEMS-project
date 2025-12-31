import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  icon: Icon,
  className = '',
  required = false,
  disabled = false,
  fullWidth = true,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const containerStyle = {
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E3A5F',
    marginBottom: '0.375rem',
  };

  const inputWrapperStyle = {
    position: 'relative',
  };

  const iconStyle = {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748B',
    width: '1.25rem',
    height: '1.25rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 1rem',
    paddingLeft: Icon ? '2.5rem' : '1rem',
    paddingRight: isPassword ? '2.5rem' : '1rem',
    border: `1px solid ${error ? '#EF4444' : isFocused ? '#1E3A5F' : '#E2E8F0'}`,
    borderRadius: '0.5rem',
    backgroundColor: disabled ? '#F8FAFC' : '#FFFFFF',
    color: '#1E3A5F',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: isFocused ? `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 58, 95, 0.1)'}` : 'none',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748B',
    padding: '0.25rem',
  };

  const helperStyle = {
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.375rem',
    fontSize: '0.875rem',
    color: error ? '#EF4444' : '#64748B',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#EF4444', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {Icon && (
          <Icon style={iconStyle} />
        )}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={passwordToggleStyle}
          >
            {showPassword ? (
              <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} />
            ) : (
              <Eye style={{ width: '1.25rem', height: '1.25rem' }} />
            )}
          </button>
        )}
      </div>
      {(error || helperText) && (
        <div style={helperStyle}>
          {error && <AlertCircle style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />}
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
