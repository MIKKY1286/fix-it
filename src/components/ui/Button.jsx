import React from 'react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({
  children,
  className = '',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  
  // Base classes
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98]',
    secondary: 'bg-secondary text-white shadow-lg shadow-secondary/15 hover:bg-secondary-light active:scale-[0.98]',
    outline: 'border border-secondary/10 bg-transparent text-secondary hover:bg-secondary/5 active:scale-[0.98]',
    ghost: 'bg-transparent text-secondary hover:bg-secondary/5 hover:text-secondary-light',
    danger: 'bg-danger text-white shadow-lg shadow-danger/20 hover:bg-danger-hover active:scale-[0.98]',
    glass: 'glass-effect text-secondary hover:bg-white/80 border border-white/40 shadow-sm active:scale-[0.98]',
  };
  
  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={!disabled && !loading ? { scale: 1.015 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.985 } : {}}
      className={`${baseStyle} ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && iconLeft && <span className="inline-flex">{iconLeft}</span>}
      {children}
      {!loading && iconRight && <span className="inline-flex">{iconRight}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
