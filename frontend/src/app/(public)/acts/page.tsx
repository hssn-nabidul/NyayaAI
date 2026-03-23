'use client';

import React, { useState } from 'react';
import { ACTS_INDEX, ACTS_BY_CATEGORY } from '@/lib/data/acts';
import { Search, Book, ChevronRight, Scale, BookOpen, Layers, Library, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ActsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Map of display names for categories
  const categoryLabels = {
    criminal: "Criminal & Penal Archives",
    civil: "Civil Procedures & Statutes",
    special: "Special & Local Jurisdictions",
    constitutional: "Constitutional Foundation"
  };

  const filteredGroups = Object.entries(ACTS_BY_CATEGORY).map(([category, acts]) => {
    const filtered = acts.filter(act => 
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      category,
      label: categoryLabels[category as keyof typeof categoryLabels],
      acts: filtered
    };
  }).filter(group => group.acts.length > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-6 animate-fade-up">
      <header className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-8 shadow-sm relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Book size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Library size={24} />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-serif text-ink tracking-tight">Legislative Repository</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.3em] font-bold mt-2">Phase 2: Statutory Analysis & Bare Acts</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl mx-auto text-lg leading-relaxed font-sans border-t border-divider pt-6">
            Access the official institutional library of Indian legislation. Search through complete statutes, 
            examine historical amendments, and explore section-wise archival breakdowns.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto pt-4 z-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/30" size={20} />
          <input
            type="text"
            placeholder="Consult by title, acronym, or year (e.g. BNS, 2023, IPC)..."
            className="w-full bg-parchment-dim border border-divider rounded-library py-5 pl-16 pr-6 text-ink text-lg focus:outline-none focus:ring-1 focus:ring-ink/10 focus:border-ink/20 focus:bg-parchment transition-all font-sans shadow-inner placeholder:text-ink/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="space-y-20">
        {filteredGroups.map((group) => (
          <section key={group.category} className="space-y-8">
            <div className="flex items-center gap-6">
              <h2 className="text-ink text-[10px] font-bold uppercase tracking-[0.4em] whitespace-nowrap bg-parchment px-4 py-1.5 border border-divider rounded-library shadow-sm">
                {group.label}
              </h2>
              <div className="h-px flex-1 bg-divider" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {group.acts.map((act) => (
                <Link 
                  key={act.slug} 
                  href={`/acts/${act.slug}`}
                  className="group relative flex flex-col justify-between bg-parchment hover:bg-parchment-dim border border-divider p-10 transition-all duration-300 overflow-hidden min-h-[340px]"
                >
                  <div className="relative space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        {act.category === 'constitutional' ? <Layers size={24} /> : <ScrollText size={24} />}
                      </div>
                      <span className="text-[10px] font-bold px-3 py-1 rounded-library bg-ink/5 text-ink/40 group-hover:text-gold transition-colors border border-divider">
                        FOLIO {act.year}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif text-ink group-hover:text-gold transition-colors leading-tight italic font-bold">
                        {act.title}
                      </h3>
                      <p className="text-gold text-[9px] font-bold uppercase tracking-widest">{act.shortTitle}</p>
                    </div>

                    <p className="text-ink/60 text-[13px] font-medium line-clamp-3 leading-relaxed border-l-2 border-divider pl-4">
                      {act.description}
                    </p>
                  </div>
                  
                  <div className="relative pt-6 flex items-center justify-between border-t border-divider border-dashed mt-8">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-ink/30">
                      <BookOpen size={12} className="text-gold" />
                      <span>{act.totalSections} Statutory Sections</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                       Consult Folio <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-32 bg-parchment-dim rounded-library border border-dashed border-divider">
          <BookOpen className="mx-auto text-ink/10 mb-6" size={64} />
          <p className="text-ink/40 font-serif text-2xl italic tracking-wide">No legislative records found matching your inquiry</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-gold text-[10px] font-bold uppercase tracking-widest hover:underline underline-offset-4"
          >
            Clear Archive Inquiry
          </button>
        </div>
      )}
    </div>
  );
}
