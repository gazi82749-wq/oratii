'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyEmailButtonProps {
  email?: string;
  className?: string;
}

export default function CopyEmailButton({
  email = 'support@oratii.in',
  className = 'text-indigo-700 hover:text-indigo-900',
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy email address"
      className={`inline-flex items-center gap-1.5 text-sm font-bold transition-all cursor-pointer group focus:outline-none ${className}`}
    >
      <span className="group-hover:underline truncate">{email}</span>
      {copied ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black animate-fade-in shadow-2xs">
          <Check size={12} className="text-emerald-700" /> Copied!
        </span>
      ) : (
        <Copy size={13} className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
      )}
    </button>
  );
}
