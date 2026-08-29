import React from 'react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  type?: 'default' | 'audio' | 'slides';
  className?: string;
}

export default function EmptyState({ title, description, actionText, onAction, type = 'default', className = '' }: EmptyStateProps) {
  const getIllustration = () => {
    switch (type) {
      case 'audio':
        return (
          <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="35" y="15" width="30" height="50" rx="15" />
            <path d="M25 45v10a25 25 0 0 0 50 0v-10" />
            <line x1="50" y1="80" x2="50" y2="95" />
            <line x1="35" y1="95" x2="65" y2="95" />
          </svg>
        );
      case 'slides':
        return (
          <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="15" y="25" width="70" height="50" rx="2" />
            <path d="M15 40h70" />
            <circle cx="30" cy="60" r="8" />
            <path d="M50 75v-15l10-5v20" />
            <path d="M70 75v-25" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="20" y="20" width="60" height="60" rx="8" />
            <path d="M20 20l60 60" />
            <path d="M80 20l-60 60" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 ${className}`}>
      <div className="w-20 h-20 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center mb-6">
        {getIllustration()}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
