'use client';

import React from 'react';
import { Calendar, Building2, FileText, ChevronRight, Scale, Bookmark, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { SearchResult } from '@/types/api';
import { useBookmarks } from '@/features/bookmarks/useBookmarks';
import { cn } from '@/lib/utils';

export default function SearchResultCard({ result }: { result: SearchResult }) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(result.doc_id);

  const cleanHeadline = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  return (
    <div className="group bg-parchment border border-divider hover:border-ink/20 rounded-library p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-forest-dim text-forest text-[9px] font-bold uppercase tracking-widest rounded-library border border-forest/10">
              <Building2 size={10} />
              {result.court}
            </span>
            {result.date && (
              <>
                <span className="text-divider text-xs">•</span>
                <span className="text-ink/40 text-[9px] font-bold uppercase tracking-widest">{result.date}</span>
              </>
            )}
            {result.citation && (
               <>
                <span className="text-divider text-xs">•</span>
                <div className="flex items-center gap-1.5 text-ink/40 text-[9px] font-bold uppercase tracking-widest">
                    <Scale size={10} />
                    <span className="truncate max-w-[150px]">{result.citation}</span>
                </div>
               </>
             )}
          </div>
          
          <Link href={`/cases/${result.doc_id}`}>
            <h3 className="text-xl font-serif text-ink group-hover:text-gold transition-colors leading-tight decoration-gold/0 group-hover:decoration-gold/30 underline underline-offset-4">
              {result.title}
            </h3>
          </Link>
          
          {result.headline && (
            <p className="text-sm text-ink/60 line-clamp-2 font-sans leading-relaxed italic border-l-2 border-divider pl-4">
              {cleanHeadline(result.headline)}
            </p>
          )}

          <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-ink/20">
             <div className="flex items-center gap-1.5">
                <FileText size={10} />
                ARCHIVE ID: {result.doc_id}
             </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(result);
            }}
            className={cn(
              "p-3 rounded-library border transition-all duration-200",
              bookmarked 
                ? 'bg-gold text-parchment border-gold' 
                : 'bg-parchment-dim text-ink/20 border-divider hover:text-ink/60 hover:bg-ink/5'
            )}
            title={bookmarked ? "Remove Bookmark" : "Save to Library"}
          >
            <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          
          <Link 
            href={`/cases/${result.doc_id}`}
            className="flex items-center justify-center w-10 h-10 rounded-library bg-ink text-parchment group-hover:bg-gold transition-all duration-300 active:scale-95 shadow-sm"
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
