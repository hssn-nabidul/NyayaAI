'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Book, 
  Scale, 
  ShieldCheck, 
  FileSearch, 
  Gavel, 
  PenTool,
  Bookmark
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUsageStore } from '@/lib/stores/usage.store';
import { apiClient } from '@/lib/api/client';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Book, label: 'Bare Acts', href: '/acts' },
  { icon: Gavel, label: 'Judge Analytics', href: '/judges' },
  { icon: Gavel, label: 'Moot Prep', href: '/moot' },
  { icon: PenTool, label: 'AI Drafter', href: '/draft' },
  { icon: Book, label: 'Legal Dictionary', href: '/dictionary' },
  { icon: Scale, label: 'Legal Maxims', href: '/maxims' },
  { icon: ShieldCheck, label: 'Know Your Rights', href: '/rights' },
];

const toolItems = [
  { icon: FileSearch, label: 'Document Analyser', href: '/analyse' },
  { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuthStore();
  const { used, limit, remaining, setUsage } = useUsageStore();
  const [isUsageLoading, setIsUsageLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsUsageLoading(true);
      apiClient.get<{ usage: { used: number; limit: number; remaining: number } }>('/auth/me')
        .then(data => {
          setUsage(data.usage);
          setIsUsageLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch usage:", err);
          setIsUsageLoading(false);
        });
    }
  }, [user, setUsage]);

  return (
    <aside className="w-64 border-r border-white/5 bg-ink flex flex-col sticky top-0 h-screen hidden md:flex">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded flex items-center justify-center font-bold text-ink">N</div>
          <span className="text-xl font-bold tracking-tight serif text-gold">NYAYA</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-2">Research</p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                pathname === item.href 
                  ? "bg-gold/10 text-gold" 
                  : "text-cream/60 hover:text-cream hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-colors",
                pathname === item.href ? "text-gold" : "text-cream/40 group-hover:text-cream/60"
              )} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-3 text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-2">Tools</p>
          {toolItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                pathname === item.href 
                  ? "bg-gold/10 text-gold" 
                  : "text-cream/60 hover:text-cream hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-colors",
                pathname === item.href ? "text-gold" : "text-cream/40 group-hover:text-cream/60"
              )} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="p-3 bg-white/5 rounded-xl">
          <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">AI Usage</p>
          {authLoading ? (
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold/20 w-1/2 animate-pulse" />
            </div>
          ) : user ? (
            <>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold transition-all duration-500" 
                  style={{ width: `${(used / limit) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-cream/40 mt-2">
                {isUsageLoading ? 'Updating usage...' : `${remaining} requests left today`}
              </p>
            </>
          ) : (
            <>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gold w-0" />
              </div>
              <p className="text-[10px] text-cream/40 mt-2">Sign in to use AI features</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
