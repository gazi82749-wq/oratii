'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Bell, Search, LogOut, Menu, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AdminSearchModal from './AdminSearchModal';
import AdminNotificationsDrawer from './AdminNotificationsDrawer';

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'All Users',
  '/admin/users/premium': 'Premium Users',
  '/admin/speech': 'Speech Reports',
  '/admin/viva': 'Mock Interviews',
  '/admin/ppt': 'PPT Presentations',
  '/admin/challenge': 'Daily Habits',
  '/admin/speech/analytics': 'Speech Analytics',
  '/admin/subscriptions': 'Plans',
  '/admin/subscriptions/payments': 'Payments',
  '/admin/feedback': 'User Feedback',
  '/admin/feedback/tickets': 'Support Tickets',
  '/admin/ai-settings': 'AI Settings & Usage Limits',
  '/admin/logs': 'System Logs',
  '/admin/settings': 'Settings',
};

interface AdminHeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function AdminHeader({ onToggleMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const currentPage = breadcrumbMap[pathname] || 'Dashboard';

  // Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExitAdmin = () => {
    router.push('/dashboard');
  };

  const handleExplicitLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-indigo-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 md:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
        {/* Left — Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden w-9 h-9 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-indigo-100 transition-colors shrink-0"
            title="Toggle Navigation Menu"
          >
            <Menu size={18} />
          </button>

          {/* Mobile Logo — show icon-sized version in header */}
          <div className="flex lg:hidden items-center shrink-0">
            <svg className="w-8 h-8" viewBox="20 40 220 240" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="waveGradH" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F2A93B"/>
                  <stop offset="100%" stopColor="#2FBF9F"/>
                </linearGradient>
                <clipPath id="badgeClipH">
                  <rect x="30" y="50" width="200" height="200" rx="52"/>
                </clipPath>
              </defs>
              <g>
                <path d="M 55 235 L 55 275 L 95 240 Z" fill="#1B2140"/>
                <rect x="30" y="50" width="200" height="200" rx="52" fill="#1B2140"/>
                <g clipPath="url(#badgeClipH)">
                  <path d="M 178 50 L 230 50 L 230 102 Z" fill="#FFFFFF" opacity="0.10"/>
                </g>
                <g>
                  <rect x="66" y="145" width="16" height="60" rx="8" fill="url(#waveGradH)"/>
                  <rect x="92" y="115" width="16" height="120" rx="8" fill="url(#waveGradH)"/>
                  <rect x="118" y="95" width="16" height="160" rx="8" fill="url(#waveGradH)"/>
                  <rect x="144" y="125" width="16" height="100" rx="8" fill="url(#waveGradH)"/>
                  <rect x="170" y="150" width="16" height="50" rx="8" fill="url(#waveGradH)"/>
                </g>
              </g>
            </svg>
          </div>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 truncate">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Shield size={10} /> ADMIN
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
            <span className="text-xs sm:text-[13px] font-black text-[#151930] dark:text-[#F2A93B] truncate">{currentPage}</span>
          </div>
        </div>

        {/* Right — Search & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Interactive Global Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-400 text-[13px] w-36 sm:w-48 lg:w-60 cursor-pointer hover:bg-indigo-100/60 dark:hover:bg-slate-800 transition-colors"
          >
            <Search size={14} className="shrink-0 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">Search admin...</span>
            <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono border border-indigo-200 dark:border-slate-600 shrink-0">⌘K</kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Notifications Bell Button */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-800 transition-colors"
            title="System Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
              </>
            )}
          </button>

          {/* Return to Main Website Button */}
          <button
            onClick={handleExitAdmin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Return to Main Website Dashboard"
          >
            <span>Exit Admin</span>
          </button>
        </div>
      </header>

      {/* Global Search Command Palette Modal */}
      <AdminSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Notifications Drawer */}
      <AdminNotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}


