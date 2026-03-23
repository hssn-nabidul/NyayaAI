'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Book, 
  ShieldCheck, 
  Menu, 
  X,
  Gavel,
  PenTool,
  FileSearch,
  Bookmark,
  Settings,
  Scale,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { signOut, signInWithGoogle } from '@/lib/firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MobileNav = () => {
  const pathname = usePathname();
  const { user, setUser, setIdToken } = useAuthStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close "More" menu when pathname changes
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setIdToken(null);
    setIsMoreOpen(false);
  };

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Book, label: 'Acts', href: '/acts' },
    { icon: ShieldCheck, label: 'Rights', href: '/rights' },
  ];

  const moreItems = [
    { icon: Book, label: 'Legal Dictionary', href: '/dictionary' },
    { icon: Scale, label: 'Legal Maxims', href: '/maxims' },
    { icon: Gavel, label: 'Judge Analytics', href: '/judges' },
    { icon: Gavel, label: 'Moot Prep', href: '/moot' },
    { icon: FileSearch, label: 'Document Analyser', href: '/analyse' },
    { icon: PenTool, label: 'AI Drafter', href: '/draft' },
    { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-ink border-t border-gold/20 flex md:hidden items-center justify-around px-2 pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] h-[72px]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all",
              pathname === item.href ? "text-gold" : "text-cream/40"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
        
        <button
          onClick={() => setIsMoreOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all",
            isMoreOpen ? "text-gold" : "text-cream/40"
          )}
        >
          <Menu size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">More</span>
        </button>
      </div>

      {/* "More" Slide-up Menu Overlay */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* "More" Slide-up Menu */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-[80] bg-ink-2 border-t border-white/10 rounded-t-[2.5rem] p-6 pb-safe md:hidden transform transition-transform duration-500 ease-out shadow-2xl overflow-y-auto max-h-[85vh]",
        isMoreOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-gold/20 rounded-full mx-auto mb-8" onClick={() => setIsMoreOpen(false)} />

        {/* User Profile Info */}
        <div className="mb-8 p-4 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
          {user ? (
            <>
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || 'User'} 
                className="w-12 h-12 rounded-full border border-gold/20 shadow-lg shadow-gold/5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-cream font-bold truncate">{user.displayName}</p>
                <p className="text-xs text-cream/40 truncate uppercase tracking-widest">{user.email}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 text-status-red bg-status-red/10 rounded-full hover:bg-status-red/20 transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-cream/20 border border-white/5">
                <UserIcon size={24} />
              </div>
              <div className="flex-1">
                <p className="text-cream font-bold">Guest Student</p>
                <button 
                  onClick={() => signInWithGoogle()}
                  className="text-[10px] text-gold font-bold uppercase tracking-widest hover:underline"
                >
                  Sign In with Google
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {moreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95",
                pathname === item.href 
                  ? "bg-gold/10 border-gold/30 text-gold" 
                  : "bg-white/2 border-white/5 text-cream/60"
              )}
            >
              <item.icon size={18} className={pathname === item.href ? "text-gold" : "text-cream/20"} />
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          ))}
        </div>

        <button 
          onClick={() => setIsMoreOpen(false)}
          className="w-full py-4 text-cream/40 text-xs font-bold uppercase tracking-widest bg-white/5 rounded-2xl active:bg-white/10"
        >
          Close Menu
        </button>
      </div>
    </>
  );
};

export default MobileNav;
