'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import NLPSearchBox from '@/components/search/NLPSearchBox';
import SearchResultCard from '@/components/search/SearchResultCard';
import SearchFilters from '@/components/search/SearchFilters';
import { useSearch, SearchFilters as IFilters } from '@/features/search/useSearch';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Loader2, Search as SearchIcon, AlertCircle, Sparkles, Filter, Info, Library } from 'lucide-react';
import Link from 'next/link';
import { NLPSearchResponse } from '@/features/search/useNLPSearch';
import { SearchResult } from '@/types/api';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '0');
  const openAuthModal = useAuthModalStore((state) => state.openModal);
  
  // Local state for filters
  const [filters, setFilters] = React.useState<IFilters>({
    court: searchParams.get('court') || 'all',
    from_year: searchParams.get('from_year') ? parseInt(searchParams.get('from_year')!) : undefined,
    to_year: searchParams.get('to_year') ? parseInt(searchParams.get('to_year')!) : undefined,
  });

  const [searchMode, setSearchMode] = React.useState<'keyword' | 'nlp'>('keyword');
  const [nlpResults, setNlpResults] = React.useState<NLPSearchResponse | null>(null);

  const { user } = useAuthStore();
  const { data, isLoading, error } = useSearch(query, page, filters);

  // Correctly mapping the results based on mode
  const results = searchMode === 'keyword' 
    ? (data?.results || []) 
    : (nlpResults?.results.results || []);

  const total = searchMode === 'keyword' 
    ? (data?.total || 0) 
    : (nlpResults?.results.total || 0);

  const displayTotal = total > 0 ? total : results.length;

  const handleNLPResults = (data: NLPSearchResponse) => {
    setNlpResults(data);
    setSearchMode('nlp');
  };

  const handleNLPClear = () => {
    setNlpResults(null);
    setSearchMode('keyword');
  };

  const updateFilters = (newFilters: IFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.court && newFilters.court !== 'all') params.set('court', newFilters.court);
    else params.delete('court');
    
    if (newFilters.from_year) params.set('from_year', newFilters.from_year.toString());
    else params.delete('from_year');
    
    if (newFilters.to_year) params.set('to_year', newFilters.to_year.toString());
    else params.delete('to_year');
    
    params.set('page', '0'); 
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-6">
      {/* Header Container */}
      <div className="bg-parchment border border-divider p-8 rounded-library shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              {searchMode === 'keyword' ? <SearchIcon size={24} /> : <Sparkles size={24} />}
            </div>
            <div>
              <h1 className="text-3xl font-serif text-ink tracking-tight">Judicial Search</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 1: Discovery & Retrieval</p>
            </div>
          </div>

          <div className="flex bg-ink/5 p-1 rounded-library border border-divider self-start md:self-center">
            <button 
              onClick={() => setSearchMode('keyword')}
              className={cn(
                "px-4 py-2 rounded-library text-[10px] font-bold transition-all uppercase tracking-widest",
                searchMode === 'keyword' ? 'bg-ink text-parchment shadow-sm' : 'text-ink/40 hover:text-ink/60'
              )}
            >
              Keyword
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  openAuthModal('AI Natural Language Search');
                  return;
                }
                setSearchMode('nlp');
              }}
              className={cn(
                "px-4 py-2 rounded-library text-[10px] font-bold transition-all uppercase tracking-widest flex items-center gap-2",
                searchMode === 'nlp' ? 'bg-ink text-parchment shadow-sm' : 'text-ink/40 hover:text-ink/60'
              )}
            >
              <Sparkles size={14} />
              AI Assistant
            </button>
          </div>
        </div>

        {searchMode === 'keyword' ? (
          <SearchBar className="max-w-none" />
        ) : (
          <NLPSearchBox onResultsFound={handleNLPResults} onClear={handleNLPClear} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Filters */}
        <div className="lg:col-span-1">
          <SearchFilters filters={filters} onChange={updateFilters} />
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-6">
          {searchMode === 'keyword' && !query && !isLoading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-6 border-dashed">
               <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
                 <SearchIcon size={32} className="text-ink/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Ready for Inquiry</p>
                <p className="text-ink/30 font-serif text-lg italic max-w-xs mx-auto">"Consult the archives by keyword, citation, or legal principle."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
                <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
              </div>
              <p className="text-ink/40 text-[9px] font-bold uppercase tracking-[0.3em] animate-pulse">Retrieving from Archives...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-divider rounded-library p-12 text-center space-y-4 animate-fade-up">
              <div className="w-12 h-12 bg-status-red/10 rounded-library flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-serif text-ink">Retrieval Error</h3>
              <p className="text-ink/40 text-sm max-w-xs mx-auto">We encountered an issue connecting to the Indian Kanoon Academic API.</p>
              <button onClick={() => window.location.reload()} className="text-gold underline text-[10px] font-bold uppercase tracking-widest">Retry Inquiry</button>
            </div>
          ) : (results.length === 0 && (query || nlpResults)) ? (
            <div className="h-[50vh] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-4 border-dashed">
               <p className="text-ink/40 font-serif text-xl italic">"No relevant judgments found..."</p>
               <p className="text-ink/20 text-[10px] uppercase tracking-widest">Consider broader terminology or removing filters</p>
            </div>
          ) : (displayTotal > 0 || results.length > 0) ? (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-ink/30 uppercase tracking-[0.2em]">Inquiry</span>
                  <span className="text-sm font-medium text-ink italic">"{searchMode === 'keyword' ? query : 'AI Analysis'}"</span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[9px] font-bold text-ink/30 uppercase tracking-widest">
                    Showing <span className="text-ink font-bold">{results.length}</span> of <span className="text-ink font-bold">{displayTotal.toLocaleString()}</span> records
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {results.map((result: SearchResult) => (
                  <SearchResultCard key={result.doc_id} result={result} />
                ))}
              </div>

              {/* Pagination */}
              {searchMode === 'keyword' && (
                <div className="flex items-center justify-center gap-2 pt-12">
                  <button 
                    disabled={page === 0}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', (page - 1).toString());
                      router.push(`/search?${params.toString()}`);
                    }}
                    className={cn(
                      "px-6 py-2 rounded-library text-[10px] font-bold uppercase tracking-widest transition-all border",
                      page === 0 
                        ? 'opacity-30 cursor-not-allowed text-ink/40 border-divider bg-parchment-dim' 
                        : 'bg-parchment text-ink/60 hover:bg-ink hover:text-parchment border-divider shadow-sm'
                    )}
                  >
                    Previous
                  </button>
                  <div className="text-[10px] font-bold text-ink px-4 py-2 bg-parchment border border-divider rounded-library shadow-sm">
                    Folio {page + 1}
                  </div>
                  <button 
                    disabled={results.length < 10}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', (page + 1).toString());
                      router.push(`/search?${params.toString()}`);
                    }}
                    className={cn(
                      "px-6 py-2 rounded-library text-[10px] font-bold uppercase tracking-widest transition-all border",
                      results.length < 10 
                        ? 'opacity-30 cursor-not-allowed text-ink/40 border-divider bg-parchment-dim' 
                        : 'bg-parchment text-ink/60 hover:bg-ink hover:text-parchment border-divider shadow-sm'
                    )}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
