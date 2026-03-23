'use client';

import React from 'react';
import { useBookmarks } from '@/features/bookmarks/useBookmarks';
import { Bookmark as BookmarkIcon, Trash2, ChevronRight, Scale, Clock, ExternalLink, BookMarked, Library, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-6">
      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BookmarkIcon size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Library size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">Institutional Library</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 1: Personal Archive & Discovery</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            Manage your saved judgments and scholarly records. These folios are indexed locally 
            for high-speed retrieval during your institutional research.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30 whitespace-nowrap">
            {bookmarks.length} Indexed Records
          </h3>
          <div className="h-px flex-1 bg-divider" />
        </div>

        {bookmarks.length === 0 ? (
          <div className="h-[450px] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-6 border-dashed">
             <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
               <BookmarkIcon size={32} className="text-ink/10" />
             </div>
             <div className="text-center space-y-2">
              <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Empty Archive</p>
              <p className="text-ink/30 font-serif text-xl italic max-w-xs mx-auto">"Begin your inquiry to populate your personal library."</p>
              <Link href="/search" className="inline-block pt-6 text-gold text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 hover:text-ink transition-colors">Start Discovery</Link>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-fade-up">
            {bookmarks.map((b) => (
              <div 
                key={b.doc_id}
                className="group bg-parchment border border-divider rounded-library p-8 hover:border-ink/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm hover:shadow-md"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2 py-0.5 bg-forest-dim text-forest text-[9px] font-bold uppercase tracking-widest rounded-library border border-forest/10">
                      {b.court}
                    </span>
                    <span className="text-divider text-[10px]">•</span>
                    <span className="text-ink/40 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={10} />
                      Indexed {new Date(b.bookmarked_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Link href={`/cases/${b.doc_id}`}>
                    <h4 className="text-2xl font-serif text-ink group-hover:text-gold transition-colors leading-tight italic font-bold underline decoration-gold/0 group-hover:decoration-gold/20 underline-offset-4">{b.title}</h4>
                  </Link>
                  
                  <div className="flex items-center gap-4 text-[10px] text-ink/30 font-mono italic font-medium uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                       <FileText size={12} />
                       {b.citation}
                    </div>
                    <span className="text-divider">|</span>
                    <span>Decided {b.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => removeBookmark(b.doc_id)}
                    className="p-3 bg-parchment-dim border border-divider rounded-library text-ink/20 hover:text-status-red hover:bg-status-red/5 transition-all shadow-sm"
                    title="Remove from archive"
                  >
                    <Trash2 size={18} />
                  </button>
                  <Link 
                    href={`/cases/${b.doc_id}`}
                    className="p-3 bg-ink text-parchment border border-ink rounded-library hover:bg-gold hover:border-gold transition-all flex items-center gap-3 shadow-sm group/btn"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest pl-1 hidden md:inline">Consult Record</span>
                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
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
