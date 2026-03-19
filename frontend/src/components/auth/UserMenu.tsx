'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { signOut } from '@/lib/firebase/auth';
import { LogOut, User as UserIcon, Bookmark, Settings } from 'lucide-react';

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
        className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-full transition-colors border border-white/5"
      >
        <img 
          src={user.photoURL || ''} 
          alt={user.displayName || 'User'} 
          className="w-8 h-8 rounded-full border border-gold/20"
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-ink-2 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-up">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <p className="text-sm font-bold text-cream truncate">{user.displayName}</p>
              <p className="text-[10px] text-cream/40 truncate uppercase tracking-widest">{user.email}</p>
            </div>
            
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/5 rounded-lg transition-all">
                <Bookmark className="w-4 h-4" />
                My Bookmarks
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/5 rounded-lg transition-all">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            <div className="p-2 border-t border-white/5 bg-red-500/5">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-status-red hover:bg-status-red/10 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
