'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    // Intelligent Redirection Logic
    if (q.includes('maxim') || q.includes('latin') || q.includes('nemo') || q.includes('audi') || q.includes('caveat')) {
      router.push(`/maxims?q=${encodeURIComponent(q)}`);
    } else if (q.includes('act') || q.includes('section') || q.includes('bns') || q.includes('bsa') || q.includes('bnss') || q.includes('ipc') || q.includes('crpc')) {
      router.push(`/acts`); // Redirect to library for general act searches
    } else if (q.includes('define') || q.includes('meaning') || q.includes('dictionary')) {
      router.push(`/dictionary?q=${encodeURIComponent(q)}`);
    } else if (q.includes('right') || q.includes('fundamental') || q.includes('article 14') || q.includes('article 21') || q.includes('article 19')) {
      router.push(`/rights?q=${encodeURIComponent(q)}`);
    } else if (q.includes('judge') || q.includes('justice') || q.includes('bench')) {
      router.push(`/judges?q=${encodeURIComponent(q)}`);
    } else {
      // Default to case search
      router.push(`/search?q=${encodeURIComponent(q)}`);
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
