'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      className={`relative w-full max-w-2xl mx-auto group ${className}`}
    >
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold group-focus-within:text-gold transition-colors duration-300 z-10" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for cases, citations, or legal topics..."
        className="w-full bg-ink-2/50 backdrop-blur-xl border border-white/10 text-cream rounded-full py-4 pl-14 pr-32 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 shadow-2xl placeholder:text-cream/20 font-sans"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-gold text-ink px-6 py-2 rounded-full font-bold text-sm hover:bg-gold-light transition-all active:scale-95 duration-200"
      >
        Search
      </button>
    </form>
  );
}
