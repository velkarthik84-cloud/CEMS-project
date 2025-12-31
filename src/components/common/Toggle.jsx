import { forwardRef } from 'react';

const Toggle = forwardRef(({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  size = 'md',
}, ref) => {
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const currentSize = sizes[size];

  return (
    <label
      className={`
        flex items-start gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            ${currentSize.track}
            rounded-full transition-colors duration-200
            ${checked ? 'bg-primary' : 'bg-gray-200'}
          `}
        />
        <div
          className={`
            absolute top-0.5 left-0.5
            ${currentSize.thumb}
            bg-white rounded-full shadow-sm
            transition-transform duration-200
            ${checked ? currentSize.translate : 'translate-x-0'}
          `}
        />
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-secondary mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;
