import { InputHTMLAttributes, forwardRef } from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-pixel text-[10px] text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 bg-pixel-dark border-2 border-gray-600
            text-white font-body text-base
            focus:outline-none focus:border-pixel-primary
            transition-colors placeholder-gray-500
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-red-400 text-xs font-body">{error}</p>
        )}
      </div>
    );
  }
);

PixelInput.displayName = 'PixelInput';

export default PixelInput;
