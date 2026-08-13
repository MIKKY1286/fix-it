import React from 'react';

const Skeleton = ({
  variant = 'text', // 'text' | 'circular' | 'rectangular'
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-secondary/[0.06] animate-pulse rounded-xl';
  
  const variants = {
    text: 'h-4 w-full rounded-md mb-2',
    circular: 'rounded-full shrink-0',
    rectangular: 'w-full rounded-2xl',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  const selectedVariant = variants[variant] || variants.text;

  return (
    <div
      className={`${baseClasses} ${selectedVariant} ${className}`}
      style={style}
      {...props}
    />
  );
};

// Specialty Skeleton Feed Layout
Skeleton.FeedCard = () => {
  return (
    <div className="p-6 bg-white border border-secondary/5 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="flex-1">
          <Skeleton variant="text" width="40%" className="!mb-1" />
          <Skeleton variant="text" width="20%" className="!mb-0" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="85%" />
      </div>
      <div className="flex justify-between items-center mt-2">
        <Skeleton variant="text" width={80} height={28} className="!mb-0" />
        <Skeleton variant="text" width={100} height={36} className="!mb-0" />
      </div>
    </div>
  );
};

// Specialty Skeleton Dashboard Grid
Skeleton.Grid = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton.FeedCard key={idx} />
      ))}
    </div>
  );
};

export default Skeleton;
