'use client';

import React from 'react';
import { Calendar, Building2, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchFilters as IFilters } from '@/features/search/useSearch';

const COURTS = [
  { label: "All Jurisdictions", value: "all" },
  { label: "Supreme Court", value: "supremecourt" },
  { label: "Delhi High Court", value: "delhi" },
  { label: "Bombay High Court", value: "bombay" },
  { label: "Madras High Court", value: "madras" },
  { label: "Calcutta High Court", value: "calcutta" },
  { label: "Karnataka High Court", value: "karnataka" },
  { label: "Allahabad High Court", value: "allahabad" },
  { label: "Gujarat High Court", value: "gujarat" },
  { label: "Rajasthan High Court", value: "rajasthan" },
  { label: "Punjab & Haryana", value: "punjab" },
  { label: "Madhya Pradesh", value: "madhyapradesh" },
  { label: "Kerala High Court", value: "kerala" },
  { label: "Andhra High Court", value: "andhra" },
];

interface SearchFiltersProps {
  filters: IFilters;
  onChange: (filters: IFilters) => void;
  className?: string;
}

export default function SearchFilters({ filters, onChange, className }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const handleUpdate = (updates: Partial<IFilters>) => {
    onChange({
      ...filters,
      ...updates,
    });
  };

  const hasActiveFilters = (filters.court && filters.court !== 'all') || filters.from_year || filters.to_year;
  const currentYear = new Date().getFullYear();

  // Show first 8 courts by default, then the rest under "Show More"
  const visibleCourts = isExpanded ? COURTS : COURTS.slice(0, 8);

  return (
    <div className={cn("bg-parchment border border-divider rounded-library p-6 shadow-sm space-y-8 sticky top-24", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gold" />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">Archive Filters</h4>
        </div>
        
        {hasActiveFilters && (
          <button 
            onClick={() => onChange({ court: 'all', from_year: undefined, to_year: undefined })}
            className="text-[9px] font-bold text-gold uppercase tracking-widest hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Court Select */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[9px] font-bold text-ink/30 uppercase tracking-widest">
            <Building2 size={10} />
            Jurisdiction
          </label>
          <div className="space-y-1">
            {visibleCourts.map(c => (
              <button
                key={c.value}
                onClick={() => handleUpdate({ court: c.value })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-library text-xs transition-all border",
                  (filters.court === c.value || (!filters.court && c.value === 'all'))
                    ? "bg-ink text-parchment border-ink font-bold shadow-sm"
                    : "bg-parchment-dim text-ink/60 border-divider hover:bg-parchment hover:text-ink"
                )}
              >
                {c.label}
              </button>
            ))}
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold text-gold uppercase tracking-widest hover:text-ink transition-colors mt-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={12} />
                  Show Fewer
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  Show All Jurisdictions
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[9px] font-bold text-ink/30 uppercase tracking-widest">
            <Calendar size={10} />
            Temporal Scope
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[8px] font-bold text-ink/20 uppercase tracking-tighter ml-1">From</span>
              <input 
                type="number"
                placeholder="1950"
                min="1950"
                max={currentYear}
                value={filters.from_year || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  handleUpdate({ from_year: val });
                }}
                className="w-full bg-parchment-dim border border-divider rounded-library px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold/20 focus:border-gold/30 font-sans transition-all text-ink placeholder:text-ink/20 shadow-inner"
              />
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[8px] font-bold text-ink/20 uppercase tracking-tighter ml-1">To</span>
              <input 
                type="number"
                placeholder={currentYear.toString()}
                min="1950"
                max={currentYear}
                value={filters.to_year || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  handleUpdate({ to_year: val });
                }}
                className="w-full bg-parchment-dim border border-divider rounded-library px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold/20 focus:border-gold/30 font-sans transition-all text-ink placeholder:text-ink/20 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="pt-4 border-t border-divider">
          <p className="text-[9px] text-ink/30 italic leading-relaxed">
            * Temporal scope applies to the original date of judgment as archived in the National Judicial Data Grid.
          </p>
        </div>
      </div>
    </div>
  );
}
