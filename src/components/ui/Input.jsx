import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  iconLeft,
  iconRight,
  className = '',
  id,
  floating = false,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // CSS variables class matching
  const hasValue = props.value !== undefined && props.value !== '';
  
  return (
    <div className={`relative w-full ${className}`}>
      {/* Standard non-floating Label */}
      {!floating && label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-semibold text-secondary/70 mb-1.5 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left Icon */}
        {iconLeft && (
          <div className="absolute left-4 text-secondary/45 pointer-events-none transition-colors duration-300">
            {iconLeft}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          onFocus={(e) => {
            setFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          placeholder={floating ? (focused ? placeholder : '') : placeholder}
          className={`
            w-full px-4 py-3 bg-white text-secondary text-sm rounded-xl border transition-all duration-300 outline-none
            ${iconLeft ? 'pl-11' : ''} 
            ${iconRight ? 'pr-11' : ''} 
            ${error 
              ? 'border-danger focus:ring-1 focus:ring-danger' 
              : focused 
                ? 'border-primary ring-2 ring-primary/20 shadow-sm' 
                : 'border-secondary/10 hover:border-secondary/20'
            }
            ${floating ? 'pt-5 pb-1.5' : ''}
            disabled:bg-secondary/5 disabled:opacity-50 disabled:cursor-not-allowed
          `}
          {...props}
        />

        {/* Floating Label overlay */}
        {floating && label && (
          <label
            htmlFor={inputId}
            className={`
              absolute left-4 pointer-events-none transition-all duration-200 ease-in-out origin-top-left
              ${iconLeft ? 'left-11' : ''}
              ${focused || hasValue || props.defaultValue
                ? 'text-[10px] top-1.5 font-semibold text-primary' 
                : 'text-sm top-3.5 text-secondary/40'
              }
            `}
          >
            {label}
          </label>
        )}

        {/* Right Icon */}
        {iconRight && (
          <div className="absolute right-4 text-secondary/45 hover:text-secondary/70 transition-colors duration-200 cursor-pointer">
            {iconRight}
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-xs text-danger font-medium flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
