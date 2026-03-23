'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import NLPSearchBox from '@/components/search/NLPSearchBox';
import SearchResultCard from '@/components/search/SearchResultCard';
import SearchFilters from '@/components/search/SearchFilters';
import { useSearch, SearchFilters as IFilters } from '@/features/search/useSearch';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Loader2, Search as SearchIcon, AlertCircle, Sparkles, Filter, Info } from 'lucide-react';
import Link from 'next/link';
import { NLPSearchResponse } from '@/features/search/useNLPSearch';
import { SearchResult } from '@/types/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '0');
  
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

  React.useEffect(() => {
    if (data) {
      console.log('Search response:', JSON.stringify(data, null, 2));
    }
  }, [data]);

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
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-6">
      {/* Header Container */}
      <div className="bg-ink-2/30 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg shadow-gold/5">
              {searchMode === 'keyword' ? <SearchIcon size={24} /> : <Sparkles size={24} />}
            </div>
            <div>
              <h1 className="text-3xl font-serif text-gold tracking-tight">Judicial Search</h1>
              <p className="text-[10px] text-cream/30 uppercase tracking-[0.2em] font-bold">Indian Kanoon Academic API</p>
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start md:self-center">
            <button 
              onClick={() => setSearchMode('keyword')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${searchMode === 'keyword' ? 'bg-gold text-ink shadow-lg shadow-gold/20' : 'text-cream/40 hover:text-cream/60'}`}
            >
              Keyword
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  alert("Sign in to use AI-powered natural language search!");
                  return;
                }
                setSearchMode('nlp');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${searchMode === 'nlp' ? 'bg-gold text-ink shadow-lg shadow-gold/20' : 'text-cream/40 hover:text-cream/60'}`}
            >
              <Sparkles size={14} />
              AI Search
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
            <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                 <SearchIcon size={40} className="text-cream/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-cream/20 uppercase tracking-[0.3em] text-xs font-bold">Awaiting Input</p>
                <p className="text-cream/10 font-serif text-lg italic">"Search millions of cases by keyword..."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gold/10 rounded-full" />
                <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin absolute top-0" />
              </div>
              <p className="text-cream/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Querying Indian Kanoon...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-status-red/10 rounded-3xl p-12 text-center space-y-4 animate-fade-up">
              <div className="w-16 h-16 bg-status-red/10 rounded-full flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-serif text-cream">Search Failed</h3>
              <p className="text-cream/40 text-sm max-w-xs mx-auto">We encountered an issue while connecting to the legal database. Please try again.</p>
              <button onClick={() => window.location.reload()} className="text-gold underline text-xs font-bold uppercase tracking-widest">Retry Search</button>
            </div>
          ) : (results.length === 0 && (query || nlpResults)) ? (
            <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 space-y-6">
               <p className="text-cream/40 font-serif text-2xl italic">"No judgments found..."</p>
               <p className="text-cream/20 text-xs uppercase tracking-widest">Try adjusting your filters or search terms</p>
            </div>
          ) : (displayTotal > 0 || results.length > 0) ? (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold/40 uppercase tracking-[0.2em]">Results for</span>
                  <span className="text-sm font-medium text-cream italic">"{searchMode === 'keyword' ? query : 'AI Analysis'}"</span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-cream/30 uppercase tracking-widest">
                    Showing <span className="text-gold font-bold">{results.length}</span> of <span className="text-gold font-bold">{displayTotal.toLocaleString()}</span> entries
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
                <div className="flex items-center justify-center gap-4 pt-12">
                  <button 
                    disabled={page === 0}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', (page - 1).toString());
                      router.push(`/search?${params.toString()}`);
                    }}
                    className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${page === 0 ? 'opacity-20 cursor-not-allowed text-cream/40 border border-white/5' : 'bg-white/5 text-cream/60 hover:bg-gold hover:text-ink border border-white/5'}`}
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gold px-6 py-3 bg-gold/5 rounded-2xl border border-gold/20">Page {page + 1}</span>
                  <button 
                    disabled={results.length < 10}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', (page + 1).toString());
                      router.push(`/search?${params.toString()}`);
                    }}
                    className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${results.length < 10 ? 'opacity-20 cursor-not-allowed text-cream/40 border border-white/5' : 'bg-white/5 text-cream/60 hover:bg-gold hover:text-ink border border-white/5'}`}
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
