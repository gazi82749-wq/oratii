import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: 'circle' | 'rectangle';
  animate?: boolean;
}

export function Skeleton({
  className = '',
  shape = 'rectangle',
  animate = true,
  ...props
}: SkeletonProps) {
  const baseStyles = 'bg-indigo-200/60';
  const shapeStyles = shape === 'circle' ? 'rounded-full' : 'rounded-md';
  const animationStyles = animate ? 'animate-pulse' : '';

  return (
    <div
      className={`${baseStyles} ${shapeStyles} ${animationStyles} ${className}`}
      {...props}
    />
  );
}
