'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Zap, Sparkles, ArrowRight, X, CreditCard, ShieldCheck } from 'lucide-react';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits?: number;
  currentBalance?: number;
  featureName?: string;
}

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  requiredCredits = 1,
  currentBalance = 0,
  featureName = 'this feature',
}: InsufficientCreditsModalProps) {
  // Unlimited testing mode: Never display Insufficient Credits modal popup
  return null;
}
