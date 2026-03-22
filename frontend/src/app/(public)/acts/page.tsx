'use client';

import React, { useState } from 'react';
import { ACTS_INDEX, ACTS_BY_CATEGORY } from '@/lib/data/acts';
import { Search, Book, ChevronRight, Scale, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';

export default function ActsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Map of display names for categories
  const categoryLabels = {
    criminal: "Criminal & Penal Laws",
    civil: "Civil Laws & Procedures",
    special: "Special & Local Laws",
    constitutional: "Constitutional Framework"
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
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest">
          <Book size={14} />
          Legislative Repository
        </div>
        <h1 className="text-5xl md:text-6xl font-serif text-cream tracking-tight">Bare Acts of India</h1>
        <p className="text-cream/40 max-w-2xl mx-auto font-sans text-lg leading-relaxed">
          Access the complete library of Indian legislation. Search through statutes, 
          compare new and old laws, and explore section-wise breakdowns.
        </p>
      </header>

      <div className="relative max-w-3xl mx-auto">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-cream/20" size={24} />
        <input
          type="text"
          placeholder="Search by title, acronym, or year (e.g. BNS, 2023, IPC)..."
          className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-cream text-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none transition-all font-sans shadow-2xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-16">
        {filteredGroups.map((group) => (
          <section key={group.category} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <h2 className="text-cream/30 text-xs font-black uppercase tracking-[0.3em] whitespace-nowrap px-4">
                {group.label}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.acts.map((act) => (
                <Link 
                  key={act.slug} 
                  href={`/acts/${act.slug}`}
                  className="group relative flex flex-col justify-between bg-white/2 hover:bg-gold/5 border border-white/5 hover:border-gold/30 rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors" />
                  
                  <div className="relative space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-500">
                        {act.category === 'constitutional' ? <Layers size={28} /> : <Scale size={28} />}
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 rounded bg-white/5 text-cream/40 group-hover:text-gold/60 transition-colors">
                        {act.year}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-serif text-cream group-hover:text-gold transition-colors leading-tight">
                        {act.title}
                      </h3>
                      <p className="text-cream/20 text-xs font-bold mt-1 uppercase tracking-widest">{act.shortTitle}</p>
                    </div>

                    <p className="text-cream/40 text-sm font-sans line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                  
                  <div className="relative pt-6 flex items-center justify-between border-t border-white/5 mt-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cream/30">
                      <BookOpen size={14} />
                      <span>{act.totalSections} Sections</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-cream/20 group-hover:text-gold group-hover:translate-x-1 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-32 bg-white/2 rounded-[3rem] border border-dashed border-white/10">
          <BookOpen className="mx-auto text-cream/10 mb-6" size={64} />
          <p className="text-cream/40 font-serif text-2xl italic tracking-wide">No legislation found matching your query</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-gold text-xs font-black uppercase tracking-widest hover:underline"
          >
            View All Acts
          </button>
        </div>
      )}
    </div>
  );
}
