'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from './Logo';
import { Mic, FileText, Video, MessageSquare, Trophy, BarChart2, ChevronDown, User, Coins, Briefcase, Home, Sparkles } from 'lucide-react';
import StreakBadge from './StreakBadge';
import { supabase } from '@/lib/supabaseClient';
import { getUserCredits } from '@/lib/credits';

export default function SidebarLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const mobileNavItems = [
    { href: '/', label: 'Home', icon: <Home size={18} /> },
    { href: '/speech-coach', label: 'Speech', icon: <Mic size={18} /> },
    { href: '/interview', label: 'Interview', icon: <Briefcase size={18} /> },
    { href: '/presentation', label: 'Viva Studio', icon: <FileText size={18} /> },
    { href: '/dashboard', label: 'Dashboard', icon: <User size={18} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auth-aware: check user session for conditional nav buttons
  useEffect(() => {
    const syncAuthCookie = (session: any) => {
      if (typeof document !== 'undefined') {
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
        if (session?.user) {
          document.cookie = `Oratii_logged_in=true; path=/; max-age=31536000; SameSite=Lax${isSecure}`;
        } else {
          document.cookie = `Oratii_logged_in=; path=/; max-age=0; SameSite=Lax${isSecure}`;
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        getUserCredits(session.user.id).then((cr) => setUserCredits(cr));
      }
      syncAuthCookie(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        getUserCredits(session.user.id).then((cr) => setUserCredits(cr));
      } else {
        setUserCredits(null);
      }
      syncAuthCookie(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const noNavRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isNoNav = noNavRoutes.includes(pathname) || pathname.startsWith('/admin');
  const isHomePage = pathname === '/';

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close mobile menu and scroll to top smoothly on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  if (isNoNav) {
    return <div className="min-h-screen bg-transparent text-slate-900">{children}</div>;
  }

  // Helper: active link class
  const navLinkClass = (href) =>
    `text-sm font-medium transition-colors relative ${pathname === href ? 'text-slate-900 after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#F2A93B]' : 'text-slate-500 hover:text-slate-900'}`;

  // Product dropdown items with Oratii brand theme icons
  const productItems = [
    { href: '/speech-coach', label: 'Speech Coach', icon: <Mic size={18} className="text-[#FF6B35]" />, fontWeight: 'font-medium' },
    { href: '/interview', label: 'AI Mock Interviewer', icon: <Briefcase size={18} className="text-amber-500" />, fontWeight: 'font-medium' },
    { href: '/presentation', label: 'Slide Deck & Viva Studio', icon: <FileText size={18} className="text-indigo-900" />, fontWeight: 'font-medium' },
    { href: '/challenge', label: '20-Day Challenge', icon: <Trophy size={18} className="text-[#D98200]" />, fontWeight: 'font-semibold' },
    { type: 'divider' },
    { href: '/reports', label: 'Reports & Analytics', icon: <BarChart2 size={18} className="text-slate-500" />, fontWeight: 'font-medium' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased relative overflow-x-hidden">
      {/* Modern Animated Soft Mesh Background (Identical to Landing Page Hero) */}
      {!isHomePage && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-300/20 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: '12s' }}></div>
          <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-200/20 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-purple-200/15 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        </div>
      )}

      {/* Unified Navbar */}
      <nav className={`${isHomePage ? 'fixed' : 'sticky top-0'} w-full z-50 glass-nav print:hidden transition-all duration-300`}>
        <div className={`${isHomePage ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2`}>
          {/* Logo */}
          <div className="flex items-center group shrink-0 cursor-default">
            <Logo className="text-slate-900 text-2xl" />
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-6 lg:ml-8 mr-auto">
            <Link href="/" className={navLinkClass('/')}>Home</Link>
            
            {/* Products Dropdown */}
            <div className="relative dropdown-container">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'products' ? null : 'products')}
                aria-expanded={activeDropdown === 'products'}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-900 rounded outline-none"
              >
                Products <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-0 mt-3 w-56 bg-white border border-slate-200 shadow-xl rounded-xl transition-all duration-300 ease-out flex flex-col p-2 z-50 ${activeDropdown === 'products' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                {productItems.map((item, i) => {
                  if (item.type === 'divider') return <div key={i} className="h-px bg-slate-100 my-1 mx-2"></div>;
                  return (
                    <Link key={i} href={item.href} onClick={() => setActiveDropdown(null)} className={`px-3 py-2 hover:bg-slate-50 text-sm ${item.fontWeight} text-slate-700 transition-all rounded-lg flex items-center gap-3 ${pathname === item.href ? 'bg-indigo-50 text-indigo-900 font-bold' : ''}`}>
                      {item.icon} {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link href="/pricing" className={navLinkClass('/pricing')}>Pricing</Link>

            {/* Support Dropdown */}
            <div className="relative dropdown-container">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
                aria-expanded={activeDropdown === 'support'}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-900 rounded outline-none"
              >
                Support <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === 'support' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-0 mt-4 w-48 bg-white border border-indigo-200 shadow-xl rounded-xl transition-all duration-300 ease-out flex flex-col p-2 z-50 ${activeDropdown === 'support' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                <Link href="/feedback" onClick={() => setActiveDropdown(null)} className={`px-3 py-2 hover:bg-indigo-50 text-sm font-medium text-slate-700 transition-all rounded-lg ${pathname === '/feedback' ? 'bg-indigo-50 text-slate-900' : ''}`}>
                  Submit Feedback
                </Link>
                <Link href="/support" onClick={() => setActiveDropdown(null)} className={`px-3 py-2 hover:bg-indigo-50 text-sm font-medium text-slate-700 transition-all rounded-lg ${pathname === '/support' ? 'bg-indigo-50 text-slate-900' : ''}`}>
                  My Tickets
                </Link>
              </div>
            </div>

            <Link href="/about" className={navLinkClass('/about')}>About Us</Link>
          </div>

          {/* Right side: streak + auth buttons + hamburger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Streak badge */}
            <div className="hidden sm:block">
              <StreakBadge />
            </div>

            {/* Auth-aware buttons */}
            {!authLoading && (
              user ? (
                <div className="hidden md:flex items-center gap-2.5">
                  <Link href="/pricing" title="View or Top Up Credits" className="px-3 py-1.5 rounded-xl bg-amber-50/90 hover:bg-amber-100 border border-amber-300/80 text-amber-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs">
                    <Coins size={14} className="text-amber-600 shrink-0" />
                    <span>
                      {userCredits !== null && userCredits >= 99999
                        ? '👑 Admin Pass'
                        : userCredits !== null
                        ? `${userCredits} Credits`
                        : 'Credits'}
                    </span>
                    {userCredits !== null && userCredits >= 99999 ? (
                      <span className="text-[10px] bg-[#151930] text-amber-400 font-black px-1.5 py-0.5 rounded-md uppercase ml-0.5 border border-amber-400/30">VIP</span>
                    ) : (
                      <span className="text-[10px] text-indigo-700 font-extrabold ml-0.5">+ Top Up</span>
                    )}
                  </Link>

                  {/* Single Unified Sleek Dashboard Button */}
                  <Link href="/dashboard" title="Dashboard & Profile" className="px-4 py-2 bg-[#1B2140] hover:bg-[#151930] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 border border-slate-800 shrink-0">
                    <User size={14} className="text-amber-400" />
                    <span>Dashboard</span>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/login" className="hidden md:block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" className="hidden md:block px-4 lg:px-5 py-2.5 bg-[#1B2140] text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all shadow-sm whitespace-nowrap">
                    Get Started Free
                  </Link>
                </>
              )
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 border border-indigo-200 rounded-lg bg-white z-50 relative transition-transform"
              aria-label="Toggle menu"
            >
              <span className={`bg-slate-700 block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
              <span className={`bg-slate-700 block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm my-0.5 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-slate-700 block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Dropdown Menu Drawer */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-indigo-200/80 shadow-2xl transition-all duration-300 ease-out overflow-y-auto flex flex-col z-50 rounded-b-3xl ${mobileMenuOpen ? 'max-h-[85vh] opacity-100 py-5 translate-y-0' : 'max-h-0 opacity-0 py-0 -translate-y-2 pointer-events-none border-b-0 shadow-none'}`}>
          <div className="px-5 flex flex-col gap-3">
            {/* Streak badge in mobile menu */}
            <div className="sm:hidden flex items-center justify-between pb-3.5 border-b border-indigo-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Activity</span>
              <StreakBadge />
            </div>

            <Link href="/" className="text-left text-base font-bold text-slate-900 px-4 py-3 min-h-[48px] flex items-center rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 active:scale-[0.99] transition-all">Home</Link>
            
            {/* Auth-aware: show Dashboard & Profile in mobile if logged in */}
            {!authLoading && user && (
              <Link href="/dashboard" className="text-left text-base font-bold text-slate-900 px-4 py-3 min-h-[48px] flex items-center gap-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 active:scale-[0.99] transition-all">
                <User size={18} className="text-[#1B2140]" /> Dashboard & Account
              </Link>
            )}
            
            <div className="flex flex-col gap-1.5 pt-3 border-t border-indigo-100">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1">Products</span>
              {productItems.filter(item => !item.type).map((item, i) => (
                <Link key={i} href={item.href} className={`text-left text-sm ${item.fontWeight} text-slate-800 px-4 py-3 min-h-[48px] flex items-center gap-3 rounded-xl hover:bg-indigo-50 active:bg-indigo-100 transition-all ${pathname === item.href ? 'bg-indigo-50/60 text-[#1B2140] font-bold' : ''}`}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>

            <Link href="/pricing" className="text-left text-base font-bold text-slate-900 px-4 py-3 min-h-[48px] flex items-center rounded-xl hover:bg-indigo-50 active:scale-[0.99] transition-all border-t border-indigo-100 pt-3 mt-1">Pricing</Link>
            
            <div className="flex flex-col gap-1.5 pt-3 border-t border-indigo-100">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1">Support</span>
              <Link href="/feedback" className="text-left text-sm font-semibold text-slate-700 px-4 py-2.5 min-h-[44px] flex items-center rounded-xl hover:bg-indigo-50 transition-colors">Submit Feedback</Link>
              <Link href="/support" className="text-left text-sm font-semibold text-slate-700 px-4 py-2.5 min-h-[44px] flex items-center rounded-xl hover:bg-indigo-50 transition-colors">My Tickets</Link>
            </div>

            <Link href="/about" className="text-left text-base font-bold text-slate-900 px-4 py-3 min-h-[48px] flex items-center rounded-xl hover:bg-indigo-50 active:scale-[0.99] transition-all border-t border-indigo-100 pt-3 mt-1">About Us</Link>

            {/* Mobile auth buttons */}
            {!authLoading && (
              <div className="flex flex-col gap-2.5 pt-4 border-t border-indigo-100 mt-1">
                {user ? (
                  <Link href="/dashboard" className="w-full px-5 py-3.5 bg-[#1B2140] text-white text-base font-bold rounded-2xl text-center min-h-[50px] flex items-center justify-center shadow-lg shadow-[#1B2140]/20 active:scale-[0.98] transition-all">Go to Dashboard</Link>
                ) : (
                  <>
                    <Link href="/signup" className="w-full px-5 py-3.5 bg-[#1B2140] text-white text-base font-bold rounded-2xl text-center min-h-[50px] flex items-center justify-center shadow-lg shadow-[#1B2140]/20 active:scale-[0.98] transition-all">Get Started Free</Link>
                    <Link href="/login" className="w-full px-5 py-3 border border-indigo-200 text-slate-700 text-sm font-bold rounded-2xl text-center hover:bg-indigo-50 transition-colors min-h-[46px] flex items-center justify-center active:scale-[0.98]">Log in to Account</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" key={pathname} className={`flex-1 w-full relative z-10 page-enter pb-20 md:pb-5 ${isHomePage ? '' : ['/pricing', '/about', '/support'].includes(pathname) ? '' : 'max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5'}`}>
        {children}
      </main>

      {/* Modern Sticky Glassmorphic Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-bottom-nav px-2 py-2 flex items-center justify-around print:hidden">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all duration-200 active-touch-scale ${
                isActive 
                  ? 'text-[#1B2140] font-bold bg-indigo-50/90 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className={`relative flex items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-[#1B2140] text-white shadow-sm' : 'text-slate-600'
              }`}>
                {item.icon}
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F2A93B] animate-pulse"></span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'font-extrabold text-[#1B2140]' : 'font-semibold text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
