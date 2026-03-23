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
  User as UserIcon,
  Library,
  Languages,
  ScrollText,
  FileText,
  Network
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { signOut, signInWithGoogle } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';

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
    { icon: Search, label: 'Search', href: '/search' },
    { icon: ScrollText, label: 'Acts', href: '/acts' },
    { icon: Languages, label: 'Glossary', href: '/dictionary' },
    { icon: ShieldCheck, label: 'Rights', href: '/rights' },
  ];

  const toolGroups = [
    {
      title: 'Discovery',
      items: [
        { icon: FileText, label: 'Case Reader', href: '/cases' },
        { icon: Network, label: 'Citation Graph', href: '/cases/graph' },
      ]
    },
    {
      title: 'Production',
      items: [
        { icon: Gavel, label: 'Moot Prep', href: '/moot' },
        { icon: PenTool, label: 'AI Drafter', href: '/draft' },
        { icon: FileSearch, label: 'Analyser', href: '/analyse' },
      ]
    },
    {
      title: 'Personal',
      items: [
        { icon: Bookmark, label: 'Library', href: '/bookmarks' },
        { icon: Settings, label: 'Settings', href: '/settings' },
      ]
    }
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-parchment border-t border-divider flex md:hidden items-center justify-around px-2 pb-safe pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] h-[72px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all",
                isActive ? "text-gold" : "text-ink/40"
              )}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
        
        <button
          onClick={() => setIsMoreOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all",
            isMoreOpen ? "text-gold" : "text-ink/40"
          )}
        >
          <Menu size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Archive</span>
        </button>
      </div>

      {/* "More" Slide-up Menu Overlay */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* "More" Slide-up Menu */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-[80] bg-parchment border-t border-divider rounded-t-library p-6 pb-safe md:hidden transform transition-transform duration-500 ease-out shadow-2xl overflow-y-auto max-h-[90vh]",
        isMoreOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-divider rounded-full mx-auto mb-8" onClick={() => setIsMoreOpen(false)} />

        {/* User Profile Info */}
        <div className="mb-8 p-5 bg-parchment-dim rounded-library border border-divider flex items-center gap-4 shadow-sm">
          {user ? (
            <>
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || 'User'} 
                className="w-12 h-12 rounded-library border border-divider shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-ink font-serif font-bold italic truncate">{user.displayName}</p>
                <p className="text-[10px] text-ink/40 truncate uppercase tracking-widest font-bold">{user.email}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2.5 text-status-red bg-status-red/5 border border-divider rounded-library hover:bg-status-red/10 transition-all shadow-sm"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center border border-ink/10 shadow-sm">
                <UserIcon size={24} />
              </div>
              <div className="flex-1">
                <p className="text-ink font-serif font-bold italic">Archive Guest</p>
                <button 
                  onClick={() => signInWithGoogle()}
                  className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] hover:underline underline-offset-4"
                >
                  Sign In to Archives
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Grid by Phases */}
        <div className="space-y-8 mb-8">
          {toolGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.3em] px-1">{group.title}</h3>
              <div className="grid grid-cols-2 gap-3">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-library border transition-all active:scale-95 shadow-sm",
                        isActive 
                          ? "bg-gold-dim border-gold text-gold" 
                          : "bg-parchment-dim border-divider text-ink/60"
                      )}
                    >
                      <item.icon size={16} className={cn(isActive ? "text-gold" : "text-ink/30")} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsMoreOpen(false)}
          className="w-full py-4 text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] bg-parchment-dim border border-divider rounded-library active:bg-ink/5 mb-4"
        >
          Close Archive
        </button>
      </div>
    </>
  );
};

export default MobileNav;
