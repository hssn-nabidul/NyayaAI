'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Book, 
  Scale, 
  ShieldCheck, 
  FileSearch, 
  Gavel, 
  PenTool,
  Bookmark,
  Network,
  Languages,
  ScrollText,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUsageStore } from '@/lib/stores/usage.store';
import { apiClient } from '@/lib/api/client';

const phases = [
  {
    title: 'Phase 1: Discovery',
    items: [
      { icon: Search, label: 'Judicial Search', href: '/search' },
      { icon: FileText, label: 'Case Reader', href: '/cases' },
      { icon: Network, label: 'Citation Graph', href: '/cases/graph' },
    ]
  },
  {
    title: 'Phase 2: Analysis',
    items: [
      { icon: Languages, label: 'Legal Dictionary', href: '/dictionary' },
      { icon: ScrollText, label: 'Bare Acts', href: '/acts' },
      { icon: Scale, label: 'Legal Maxims', href: '/maxims' },
      { icon: ShieldCheck, label: 'Know Your Rights', href: '/rights' },
    ]
  },
  {
    title: 'Phase 3: Production',
    items: [
      { icon: Gavel, label: 'Moot Prep', href: '/moot' },
      { icon: PenTool, label: 'AI Drafter', href: '/draft' },
      { icon: FileSearch, label: 'Document Analyser', href: '/analyse' },
    ]
  }
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
    <aside className="w-64 border-r border-divider bg-parchment-dim flex flex-col sticky top-0 h-screen hidden md:flex shrink-0">
      <div className="p-6 border-b border-divider bg-parchment">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-ink text-parchment rounded-library flex items-center justify-center font-serif font-bold text-sm">N</div>
          <span className="text-lg font-bold tracking-tight serif text-ink">NYAYA</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {phases.map((phase) => (
          <div key={phase.title} className="space-y-1">
            <p className="px-6 text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em] mb-2">{phase.title}</p>
            {phase.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-6 py-2 text-xs font-medium transition-all group border-r-2",
                    isActive 
                      ? "bg-gold-dim text-gold border-gold" 
                      : "text-ink/60 hover:text-ink hover:bg-ink/5 border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-gold" : "text-ink/30 group-hover:text-ink/60"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-divider bg-parchment">
        <div className="p-3 bg-parchment-dim border border-divider rounded-library">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[9px] font-bold text-gold uppercase tracking-widest">AI Librarian</p>
            {user && !isUsageLoading && (
              <span className="text-[9px] text-ink/40">{remaining} left</span>
            )}
          </div>
          
          {authLoading ? (
            <div className="h-1 w-full bg-ink/5 rounded-full overflow-hidden">
              <div className="h-full bg-gold/20 w-1/2 animate-pulse" />
            </div>
          ) : user ? (
            <div className="h-1 w-full bg-ink/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold transition-all duration-500" 
                style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
              />
            </div>
          ) : (
            <div className="h-1 w-full bg-ink/5 rounded-full overflow-hidden">
              <div className="h-full bg-gold w-0" />
            </div>
          )}
          
          {!user && !authLoading && (
            <p className="text-[9px] text-ink/40 mt-1.5 leading-tight">Sign in to unlock AI analysis tools.</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
