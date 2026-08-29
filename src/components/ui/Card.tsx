import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function Card({
  children,
  padding = 'md',
  elevation = 'sm',
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8 sm:p-12',
  };

  const elevations = {
    none: '',
    sm: 'shadow-sm border border-indigo-200/80',
    md: 'shadow-md border border-indigo-200',
    lg: 'shadow-lg border border-indigo-200',
  };

  const interactions = interactive 
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300' 
    : '';

  return (
    <div
      className={`bg-white rounded-2xl ${paddings[padding]} ${elevations[elevation]} ${interactions} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
