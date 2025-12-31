import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  className = '',
  required = false,
  disabled = false,
  fullWidth = true,
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
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 pr-10
            border rounded-lg
            bg-white text-text-primary
            appearance-none cursor-pointer
            transition-all duration-200
            ${error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-gray-200 focus:border-primary focus:ring-primary/20'
            }
            focus:outline-none focus:ring-2
            disabled:bg-gray-50 disabled:cursor-not-allowed
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      {(error || helperText) && (
        <div className={`flex items-center mt-1.5 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error && <AlertCircle className="w-4 h-4 mr-1" />}
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
