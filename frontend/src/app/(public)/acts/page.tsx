'use client';

import React, { useState } from 'react';
import { useActs } from '@/features/acts/useActs';
import { Search, Book, ChevronRight, Loader2, Scale } from 'lucide-react';
import Link from 'next/link';

export default function ActsPage() {
  const { data: acts, isLoading } = useActs();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActs = acts?.filter(act => 
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10 animate-fade-up">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest">
          <Book size={14} />
          Digital Library
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-cream">Bare Acts of India</h1>
        <p className="text-cream/40 max-w-2xl mx-auto font-sans">
          Browse and search through the central legislation of India. Section-by-section breakdown with AI explanations and linked case law.
        </p>
      </header>

      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/20" size={20} />
        <input
          type="text"
          placeholder="Search Acts (e.g. BNS, Constitution, IPC)..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-cream focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none transition-all font-sans"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="text-gold animate-spin" size={40} />
          <p className="text-cream/40 text-sm uppercase tracking-widest animate-pulse">Loading Acts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActs?.map((act) => (
            <Link 
              key={act.slug} 
              href={`/acts/${act.slug}`}
              className="group bg-white/2 hover:bg-gold/5 border border-white/5 hover:border-gold/30 rounded-3xl p-6 transition-all duration-500 flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                  <Scale size={24} />
                </div>
                <h3 className="text-xl font-serif text-cream group-hover:text-gold transition-colors">
                  {act.title}
                </h3>
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cream/20">
                <span>Central Legislation</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filteredActs?.length === 0 && (
        <div className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10">
          <p className="text-cream/40 font-sans">No acts found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
