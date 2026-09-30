'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '../Logo';
import {
  LayoutDashboard, Users, Crown, Mic, FileText, Video,
  MessageSquare, CreditCard, Receipt, MessageCircle, Headphones,
  Bot, ScrollText, Settings, ChevronDown, ChevronLeft, Menu, X,
  BarChart3, Bell
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isComingSoon?: boolean;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

type SidebarEntry = NavItem | NavGroup;

function isGroup(entry: SidebarEntry): entry is NavGroup {
  return 'items' in entry;
}

const navigation: SidebarEntry[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
  {
    label: 'Users', icon: <Users size={18} />,
    items: [
      { label: 'All Users', href: '/admin/users', icon: <Users size={16} /> },
      { label: 'Premium Users', href: '/admin/users/premium', icon: <Crown size={16} /> },
    ],
  },
  {
    label: 'Speech Coach', icon: <Mic size={18} />,
    items: [
      { label: 'Speech Reports', href: '/admin/speech', icon: <FileText size={16} /> },
      { label: 'Analytics', href: '/admin/speech/analytics', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    label: 'Interview Coach', icon: <Mic size={18} />,
    items: [
      { label: 'Mock Interviews', href: '/admin/interview', icon: <FileText size={16} /> },
      { label: 'Analytics', href: '/admin/interview/analytics', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    label: 'Other Features', icon: <FileText size={18} />,
    items: [
      { label: 'PPT Presentations', href: '/admin/ppt', icon: <FileText size={16} />, isComingSoon: true },
      { label: 'Daily Habits', href: '/admin/challenge', icon: <FileText size={16} /> },
    ],
  },
  {
    label: 'Subscriptions', icon: <CreditCard size={18} />,
    items: [
      { label: 'Plans', href: '/admin/subscriptions', icon: <CreditCard size={16} /> },
      { label: 'Payments', href: '/admin/subscriptions/payments', icon: <Receipt size={16} /> },
    ],
  },
  {
    label: 'Feedback', icon: <MessageCircle size={18} />,
    items: [
      { label: 'User Feedback', href: '/admin/feedback', icon: <MessageCircle size={16} /> },
      { label: 'Support Tickets', href: '/admin/feedback/tickets', icon: <Headphones size={16} /> },
    ],
  },
  { label: 'AI Settings & Limits', href: '/admin/ai-settings', icon: <Bot size={18} /> },
  { label: 'Push Notifications', href: '/admin/notifications', icon: <Bell size={18} /> },
  { label: 'System Logs', href: '/admin/logs', icon: <ScrollText size={18} /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((entry) => {
      if (isGroup(entry)) {
        initial[entry.label] = entry.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
      }
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const linkClasses = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
      href === '#'
        ? 'opacity-50 blur-[0.5px] cursor-not-allowed pointer-events-none select-none text-slate-400'
        : isActive(href)
        ? 'bg-indigo-900 text-white font-semibold shadow-xs dark:bg-indigo-600 dark:text-white'
        : 'text-slate-600 hover:bg-indigo-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-200'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Sidebar Header Brand Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-5 py-4 border-b border-indigo-200 dark:border-slate-800 shrink-0`}>
        {!collapsed && (
          <Link href="/admin" className="flex flex-col gap-1" onClick={onCloseMobile}>
            <Logo className="text-2xl text-slate-900 dark:text-white" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-800 dark:hover:text-indigo-300 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {navigation.map((entry) => {
          if (!isGroup(entry)) {
            if (collapsed) {
              return (
                <Link key={entry.label} href={entry.href} title={entry.label}
                  className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-150 ${
                    isActive(entry.href)
                      ? 'bg-indigo-900 text-white dark:bg-indigo-600'
                      : 'text-slate-500 hover:bg-indigo-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-200'
                  }`}
                >
                  {entry.icon}
                </Link>
              );
            }
            return (
              <Link key={entry.label} href={entry.href} className={linkClasses(entry.href)} onClick={onCloseMobile}>
                {entry.icon}
                <span>{entry.label}</span>
              </Link>
            );
          }

          // Group dropdown
          const groupActive = entry.items.some((item) => isActive(item.href));
          const isOpen = openGroups[entry.label] || false;

          if (collapsed) {
            return (
              <div key={entry.label} className="relative group">
                <div
                  className={`flex items-center justify-center p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    groupActive
                      ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-400'
                      : 'text-slate-500 hover:bg-indigo-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-200'
                  }`}
                >
                  {entry.icon}
                </div>
                {/* Tooltip submenu */}
                <div className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{entry.label}</div>
                  {entry.items.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.isComingSoon ? '#' : item.href} 
                      onClick={(e) => {
                        if (item.isComingSoon) {
                          e.preventDefault();
                          return;
                        }
                        onCloseMobile();
                      }} 
                      className={`flex items-center gap-2 px-3 py-2 text-[13px] transition-colors ${
                        isActive(item.href)
                          ? 'text-indigo-900 font-bold bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10'
                          : 'text-slate-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800'
                      } ${item.isComingSoon ? 'opacity-50 blur-[0.5px] cursor-not-allowed pointer-events-none' : ''}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={entry.label}>
              <button
                onClick={() => toggleGroup(entry.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  groupActive
                    ? 'text-indigo-900 font-bold dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-indigo-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-200'
                }`}
              >
                {entry.icon}
                <span className="flex-1 text-left">{entry.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-48 mt-1' : 'max-h-0'}`}>
                <div className="ml-4 pl-3 border-l-2 border-indigo-200 dark:border-slate-800 space-y-0.5">
                  {entry.items.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.isComingSoon ? '#' : item.href} 
                      className={`${linkClasses(item.href)} ${item.isComingSoon ? 'opacity-50 blur-[0.5px] cursor-not-allowed pointer-events-none' : ''}`}
                      onClick={(e) => {
                        if (item.isComingSoon) {
                          e.preventDefault();
                          return;
                        }
                        onCloseMobile();
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Profile badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-indigo-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 bg-indigo-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-indigo-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white text-xs font-black shadow-xs">GA</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate">Gazi Abbas</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Super Admin</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onCloseMobile} />
          <div className="relative w-72 bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col h-full border-r border-indigo-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-200 dark:border-slate-800 shrink-0">
              <Logo className="text-2xl text-slate-900 dark:text-white" />
              <button
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-indigo-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-950 border-r border-indigo-200 dark:border-slate-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-[270px]'} shrink-0`}>
        {sidebarContent}
      </aside>
    </>
  );
}
