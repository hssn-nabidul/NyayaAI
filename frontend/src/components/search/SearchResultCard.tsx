'use client';

import React from 'react';
import { Calendar, Building2, FileText, ChevronRight, Scale, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { SearchResult } from '@/types/api';
import { useBookmarks } from '@/features/bookmarks/useBookmarks';

export default function SearchResultCard({ result }: { result: SearchResult }) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(result.doc_id);

  const cleanHeadline = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  return (
    <div className="group bg-white/2 backdrop-blur-md border border-white/5 hover:border-gold/30 rounded-3xl p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:bg-gold/5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
              <Building2 size={12} />
              {result.court}
            </span>
            {result.date && (
              <>
                <span className="text-cream/20 text-xs">•</span>
                <span className="text-cream/40 text-[10px] font-bold uppercase tracking-widest">{result.date}</span>
              </>
            )}
          </div>
          
          <h3 className="text-xl md:text-2xl font-serif text-cream group-hover:text-gold transition-colors leading-snug">
            {result.title}
          </h3>
          
          {result.headline && (
            <p className="text-sm text-cream/40 line-clamp-2 font-sans leading-relaxed italic">
              {cleanHeadline(result.headline)}
            </p>
          )}

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-cream/20">
             <div className="flex items-center gap-1.5">
                <FileText size={12} />
                ID: {result.doc_id}
             </div>
             {result.citation && (
               <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                    <Scale size={12} />
                    <span className="truncate max-w-[200px]">{result.citation}</span>
                </div>
               </>
             )}
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(result);
            }}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              bookmarked 
                ? 'bg-gold text-ink border-gold' 
                : 'bg-white/5 text-cream/20 border-white/5 hover:text-gold hover:border-gold/30'
            }`}
            title={bookmarked ? "Remove Bookmark" : "Save to Library"}
          >
            <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          
          <Link 
            href={`/cases/${result.doc_id}`}
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 text-gold group-hover:bg-gold group-hover:text-ink transition-all duration-500 active:scale-90 shadow-lg"
          >
            <ChevronRight size={28} />
          </Link>
        </div>
      </div>
    </div>
  );
}
