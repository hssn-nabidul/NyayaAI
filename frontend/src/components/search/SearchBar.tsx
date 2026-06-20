'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { determineSearchRoute } from '@/lib/search-router';
import { cn } from '@/lib/utils';

export default function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    // Use shared intelligent routing logic
    const route = determineSearchRoute(q);
    router.push(route.path);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className={cn("relative w-full max-w-3xl mx-auto group", className)}
    >
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
        <Search className="w-5 h-5 text-ink/30 group-focus-within:text-gold transition-colors duration-300" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cases, citations, or legal topics..."
        className="w-full bg-parchment border border-divider text-ink rounded-library py-5 pl-16 pr-36 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all duration-300 shadow-sm placeholder:text-ink/30 font-sans text-lg"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <button
          type="submit"
          className="bg-ink text-parchment px-8 py-2.5 rounded-library font-bold text-sm hover:bg-ink/90 transition-all active:scale-95 duration-200"
        >
          Search
        </button>
      </div>
    </form>
  );
}
