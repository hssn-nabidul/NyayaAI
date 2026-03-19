'use client';

import React from 'react';
import { useBookmarks } from '@/features/bookmarks/useBookmarks';
import { Bookmark as BookmarkIcon, Trash2, ChevronRight, Scale, Clock, ExternalLink, BookMarked } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BookmarkIcon size={120} className="text-gold" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
              <BookMarked size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold tracking-tight">Your Library</h1>
          </div>
          <p className="text-cream/40 max-w-2xl text-sm md:text-base leading-relaxed">
            Manage your saved judgments and research notes. These cases are stored locally on your device 
            for quick access during your legal research.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/30">
            {bookmarks.length} Saved Judgments
          </h3>
        </div>

        {bookmarks.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 space-y-6">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
               <BookmarkIcon size={40} className="text-cream/10" />
             </div>
             <div className="text-center space-y-2">
              <p className="text-cream/20 uppercase tracking-[0.3em] text-xs font-bold">Empty Library</p>
              <p className="text-cream/10 font-serif text-lg italic">"You haven't saved any cases yet."</p>
              <Link href="/search" className="inline-block pt-4 text-gold text-sm underline hover:text-gold-light transition-colors">Start Searching</Link>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookmarks.map((b) => (
              <div 
                key={b.doc_id}
                className="group bg-white/2 border border-white/5 rounded-[2rem] p-6 hover:border-gold/30 hover:bg-gold/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-bold uppercase tracking-widest rounded border border-gold/20">
                      {b.court}
                    </span>
                    <span className="text-cream/20 text-[10px]">•</span>
                    <span className="text-cream/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} />
                      Saved {new Date(b.bookmarked_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Link href={`/cases/${b.doc_id}`}>
                    <h4 className="text-lg font-serif text-cream group-hover:text-gold transition-colors leading-tight cursor-pointer">{b.title}</h4>
                  </Link>
                  
                  <div className="flex items-center gap-4 text-[11px] text-cream/30 font-medium">
                    <span className="italic">{b.citation}</span>
                    <span className="text-cream/10">|</span>
                    <span>Decided {b.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => removeBookmark(b.doc_id)}
                    className="p-3 bg-white/5 rounded-xl text-cream/20 hover:text-status-red hover:bg-status-red/10 transition-all"
                    title="Remove from bookmarks"
                  >
                    <Trash2 size={18} />
                  </button>
                  <Link 
                    href={`/cases/${b.doc_id}`}
                    className="p-3 bg-gold/10 rounded-xl text-gold hover:bg-gold hover:text-ink transition-all flex items-center gap-2"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest pl-1 hidden md:inline">Open</span>
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
