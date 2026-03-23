'use client';

import React from 'react';
import { Building2, Calendar, Filter, X } from 'lucide-react';
import { SearchFilters as IFilters } from '@/features/search/useSearch';
import { cn } from '@/lib/utils';

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

  const hasFilters = filters.court !== 'all' || filters.from_year || filters.to_year;

  return (
    <div className="bg-parchment border border-divider rounded-library p-6 space-y-8 h-fit sticky top-24 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-divider">
        <div className="flex items-center gap-2 text-ink">
          <Filter size={14} />
          <h3 className="text-[10px] font-bold uppercase tracking-widest">Filter Inquiry</h3>
        </div>
        {hasFilters && (
          <button 
            onClick={() => onChange({ court: 'all', from_year: undefined, to_year: undefined })}
            className="text-[9px] font-bold text-ink/30 hover:text-status-red uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            <X size={10} />
            Reset
          </button>
        )}
      </div>

      {/* Court Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-ink/40">
          <Building2 size={12} />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Judicial Forum</h4>
        </div>
        <div className="space-y-1">
          {COURTS.map((court) => (
            <button
              key={court.id}
              onClick={() => onChange({ ...filters, court: court.id })}
              className={cn(
                "w-full text-left px-4 py-2 text-[11px] font-medium transition-all duration-200 rounded-library border-l-2",
                filters.court === court.id 
                  ? 'bg-gold-dim text-gold border-gold' 
                  : 'text-ink/60 hover:text-ink hover:bg-ink/5 border-transparent'
              )}
            >
              {court.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year Range Filter */}
      <div className="space-y-4 pt-4 border-t border-divider">
        <div className="flex items-center gap-2 text-ink/40">
          <Calendar size={12} />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Folio Timeline</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-ink/20 uppercase tracking-widest px-1">From</label>
            <div className="relative">
              <select 
                value={filters.from_year || ''}
                onChange={(e) => onChange({ ...filters, from_year: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full bg-parchment-dim border border-divider rounded-library px-3 py-2 text-[11px] text-ink focus:outline-none focus:border-ink/20 appearance-none cursor-pointer"
              >
                <option value="">Any</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-ink/20 uppercase tracking-widest px-1">To</label>
            <div className="relative">
              <select 
                value={filters.to_year || ''}
                onChange={(e) => onChange({ ...filters, to_year: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full bg-parchment-dim border border-divider rounded-library px-3 py-2 text-[11px] text-ink focus:outline-none focus:border-ink/20 appearance-none cursor-pointer"
              >
                <option value="">Any</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-divider">
         <p className="text-[9px] text-ink/20 italic leading-relaxed">
           Subject matter filters are automatically applied based on your inquiry context.
         </p>
      </div>
    </div>
  );
}
