import React from 'react';
import { motion } from 'framer-motion';
import { GoVerified } from 'react-icons/go';
import { BsLightningFill } from 'react-icons/bs';

const Badge = ({
  children,
  variant = 'neutral', // 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral'
  size = 'md', // 'sm' | 'md'
  dot = false,
  className = '',
  pulse = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 font-semibold rounded-full tracking-wide uppercase';
  
  const variants = {
    primary: 'bg-primary-light text-primary border border-primary/10',
    secondary: 'bg-secondary/5 text-secondary border border-secondary/10',
    success: 'bg-accent-light text-accent border border-accent/10',
    danger: 'bg-danger-light text-danger border border-danger/10',
    warning: 'bg-warning-light text-warning border border-warning/10',
    neutral: 'bg-secondary/5 text-secondary/60 border border-secondary/5',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-1 text-[10px]',
  };

  const selectedVariant = variants[variant] || variants.neutral;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <span className={`${baseClasses} ${selectedVariant} ${selectedSize} ${className}`} {...props}>
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? 'animate-pulse-slow' : ''}`} />
      )}
      {children}
    </span>
  );
};

// Specialty Badge: Verified Badge
Badge.Verified = ({ className = '', size = 'md' }) => {
  return (
    <Badge 
      variant="success" 
      size={size} 
      className={`normal-case tracking-normal !font-medium flex items-center ${className}`}
    >
      <GoVerified size={size === 'sm' ? 10 : 12} className="shrink-0 text-accent" />
      Verified
    </Badge>
  );
};

// Specialty Badge: Emergency / Live Badge
Badge.Emergency = ({ className = '', size = 'md' }) => {
  return (
    <Badge 
      variant="danger" 
      size={size} 
      className={`tracking-normal !font-medium flex items-center shadow-sm shadow-danger/10 ${className}`}
    >
      <motion.span
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block shrink-0"
      >
        <BsLightningFill size={size === 'sm' ? 9 : 11} className="text-danger" />
      </motion.span>
      Emergency Service
    </Badge>
  );
};

export default Badge;
