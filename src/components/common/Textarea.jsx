import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  helperText,
  className = '',
  required = false,
  disabled = false,
  fullWidth = true,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-2.5
          border rounded-lg
          bg-white text-text-primary
          placeholder:text-text-light
          transition-all duration-200
          resize-none
          ${error
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-gray-200 focus:border-primary focus:ring-primary/20'
          }
          focus:outline-none focus:ring-2
          disabled:bg-gray-50 disabled:cursor-not-allowed
        `}
        {...props}
      />
      {(error || helperText) && (
        <div className={`flex items-center mt-1.5 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error && <AlertCircle className="w-4 h-4 mr-1" />}
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
