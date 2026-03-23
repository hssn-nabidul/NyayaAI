'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { signOut } from '@/lib/firebase/auth';
import { LogOut, User as UserIcon, Bookmark, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserMenu = () => {
  const { user, setUser, setIdToken } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setIdToken(null);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-ink/5 p-1 rounded-library transition-colors border border-divider shadow-sm"
      >
        <img 
          src={user.photoURL || ''} 
          alt={user.displayName || 'User'} 
          className="w-8 h-8 rounded-library border border-divider shadow-sm"
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-parchment border border-divider rounded-library shadow-2xl z-50 overflow-hidden animate-fade-up">
            <div className="p-4 border-b border-divider bg-parchment-dim">
              <p className="text-sm font-bold text-ink truncate font-serif italic">{user.displayName}</p>
              <p className="text-[10px] text-ink/40 truncate uppercase tracking-widest font-bold">{user.email}</p>
            </div>
            
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-ink hover:bg-ink/5 rounded-library transition-all">
                <Bookmark className="w-4 h-4 text-gold" />
                My Library
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-ink hover:bg-ink/5 rounded-library transition-all">
                <Settings className="w-4 h-4 text-ink/30" />
                Preferences
              </button>
            </div>

            <div className="p-2 border-t border-divider bg-status-red/5">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-status-red hover:bg-status-red/10 rounded-library transition-all"
              >
                <LogOut className="w-4 h-4" />
                Relinquish Access
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
