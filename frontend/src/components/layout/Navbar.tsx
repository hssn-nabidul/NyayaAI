'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, BookMarked, User } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { signInWithGoogle } from '@/lib/firebase/auth';
import UserMenu from '@/components/auth/UserMenu';

const Navbar = () => {
  const { user, isLoading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="h-16 border-b border-white/5 bg-ink-2/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 bg-gold rounded flex items-center justify-center font-bold text-ink">N</div>
          <span className="text-xl font-bold tracking-tight serif text-gold">NYAYA</span>
        </Link>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
          <input 
            type="text" 
            placeholder="Search cases, judges, or topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-ink-3 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <Link href="/bookmarks" className="p-2 hover:bg-white/5 rounded-full transition-colors relative hidden md:block">
            <BookMarked className="w-5 h-5 text-cream/60" />
          </Link>
        )}
        <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
        
        {isLoading ? (
          <div className="w-24 h-8 bg-white/5 animate-pulse rounded-full" />
        ) : user ? (
          <UserMenu />
        ) : (
          <button 
            onClick={() => signInWithGoogle()}
            className="flex items-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold px-4 py-1.5 rounded-full border border-gold/20 transition-all text-sm font-medium"
          >
            <User className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
