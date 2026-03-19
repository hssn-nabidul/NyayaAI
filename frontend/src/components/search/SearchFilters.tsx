'use client';

import React from 'react';
import { Building2, Calendar, Filter, X } from 'lucide-react';
import { SearchFilters as IFilters } from '@/features/search/useSearch';

interface SearchFiltersProps {
  filters: IFilters;
  onChange: (filters: IFilters) => void;
}

const COURTS = [
  { id: 'all', label: 'All Courts' },
  { id: 'SC', label: 'Supreme Court' },
  { id: 'DHC', label: 'Delhi High Court' },
  { id: 'BHC', label: 'Bombay High Court' },
  { id: 'MHC', label: 'Madras High Court' },
  { id: 'KHC', label: 'Karnataka High Court' },
  { id: 'AHC', label: 'Allahabad High Court' },
];

export default function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-8 h-fit sticky top-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gold">
          <Filter size={16} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Refine Search</h3>
        </div>
        {(filters.court !== 'all' || filters.from_year || filters.to_year) && (
          <button 
            onClick={() => onChange({ court: 'all', from_year: undefined, to_year: undefined })}
            className="text-[10px] font-bold text-cream/20 hover:text-status-red uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            <X size={10} />
            Reset
          </button>
        )}
      </div>

      {/* Court Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-cream/40">
          <Building2 size={14} />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Judicial Forum</h4>
        </div>
        <div className="space-y-1.5">
          {COURTS.map((court) => (
            <button
              key={court.id}
              onClick={() => onChange({ ...filters, court: court.id })}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all duration-300 ${
                filters.court === court.id 
                  ? 'bg-gold/10 text-gold font-bold border border-gold/20 shadow-lg shadow-gold/5' 
                  : 'text-cream/40 hover:text-cream/60 hover:bg-white/5'
              }`}
            >
              {court.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year Range Filter */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-cream/40">
          <Calendar size={14} />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Timeline</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-cream/20 uppercase tracking-widest px-1">From</label>
            <select 
              value={filters.from_year || ''}
              onChange={(e) => onChange({ ...filters, from_year: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full bg-ink-3 border border-white/10 rounded-xl px-3 py-2 text-xs text-cream/60 focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
            >
              <option value="">Any</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-cream/20 uppercase tracking-widest px-1">To</label>
            <select 
              value={filters.to_year || ''}
              onChange={(e) => onChange({ ...filters, to_year: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full bg-ink-3 border border-white/10 rounded-xl px-3 py-2 text-xs text-cream/60 focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
            >
              <option value="">Any</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6">
         <p className="text-[9px] text-cream/20 italic leading-relaxed">
           Data sourced from Indian Kanoon Academic API. Subject to daily query limits.
         </p>
      </div>
    </div>
  );
}
