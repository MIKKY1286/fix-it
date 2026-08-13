import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  glass = false,
  hoverable = true,
  onClick,
  ...props
}) => {
  const baseClasses = `
    rounded-2xl border transition-all duration-300 overflow-hidden
    ${glass 
      ? 'glass-effect border-white/30 shadow-sm' 
      : 'bg-white border-secondary/5 shadow-[0_4px_20px_-4px_rgba(17,24,39,0.03)]'
    }
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const motionProps = onClick && hoverable
    ? {
        whileHover: { y: -4, boxShadow: '0 12px 30px -4px rgba(17, 24, 39, 0.08)' },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 350, damping: 25 },
        onClick,
      }
    : hoverable
      ? {
          whileHover: { y: -4, boxShadow: '0 12px 30px -4px rgba(17, 24, 39, 0.08)' },
          transition: { type: 'spring', stiffness: 350, damping: 25 },
        }
      : {};

  if (onClick || hoverable) {
    return (
      <motion.div className={baseClasses} {...motionProps} {...props}>
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

// Reusable Sub-components
Card.Header = ({ children, className = '', separator = false }) => (
  <div className={`px-6 py-4 flex items-center justify-between ${separator ? 'border-b border-secondary/5' : ''} ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`px-6 py-5 ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', separator = false }) => (
  <div className={`px-6 py-4 bg-secondary/[0.01] ${separator ? 'border-t border-secondary/5' : ''} ${className}`}>
    {children}
  </div>
);

// Specialty Stat Card
Card.Stat = ({
  title,
  value,
  icon,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  className = '',
  ...props
}) => {
  return (
    <Card hoverable={true} className={`relative flex flex-col justify-between ${className}`} {...props}>
      <Card.Body>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-secondary/50 uppercase tracking-wider">{title}</span>
          {icon && (
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-secondary tracking-tight">{value}</h3>
          
          {change && (
            <div className="mt-1.5 flex items-center gap-1">
              <span className={`
                text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5
                ${changeType === 'increase' ? 'bg-accent-light text-accent' : ''}
                ${changeType === 'decrease' ? 'bg-danger-light text-danger' : ''}
                ${changeType === 'neutral' ? 'bg-secondary/5 text-secondary/60' : ''}
              `}>
                {changeType === 'increase' && '↑'}
                {changeType === 'decrease' && '↓'}
                {change}
              </span>
              <span className="text-[10px] text-secondary/40">vs last month</span>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Card;
