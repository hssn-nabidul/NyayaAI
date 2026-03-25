'use client';

import React from 'react';
import { useCaseTimeline } from '@/features/cases/useCaseTimeline';
import { Loader2, History, Info, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CaseTimelineProps {
  docId: string;
}

export default function CaseTimeline({ docId }: CaseTimelineProps) {
  const { data: timelineData, isLoading, error } = useCaseTimeline(docId);

  if (isLoading) {
    return (
      <div className="bg-parchment border border-divider p-8 rounded-library flex flex-col items-center justify-center space-y-4">
        <Loader2 size={24} className="animate-spin text-gold/50" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Constructing Legal Lineage...</p>
      </div>
    );
  }

  if (error || !timelineData) {
    return null; // Don't show if it fails
  }

  return (
    <div className="bg-parchment border border-divider rounded-library overflow-hidden shadow-sm">
      <div className="p-6 border-b border-divider bg-ink/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink">
          <History size={18} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Case Timeline: {timelineData.legal_issue}</h3>
        </div>
      </div>

      <div className="p-8 space-y-8 relative">
        {/* The Vertical Line */}
        <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-divider border-l border-divider/50 border-dashed" />

        {timelineData.timeline.map((event, idx) => {
          const isCurrent = event.docid === docId;
          
          return (
            <div key={idx} className="relative flex gap-6 items-start group">
              {/* Year Bubble */}
              <div className={cn(
                "relative z-10 w-20 flex-shrink-0 text-right pr-2",
                "text-[10px] font-bold uppercase tracking-widest",
                isCurrent ? "text-gold" : "text-ink/40"
              )}>
                {event.year}
              </div>

              {/* Node on the line */}
              <div className={cn(
                "relative z-10 w-4 h-4 rounded-full mt-0.5 -ml-[30px] border-2 bg-parchment",
                isCurrent ? "border-gold scale-125 shadow-lg shadow-gold/20" : "border-divider group-hover:border-ink/20"
              )} />

              <div className="flex-grow space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  {event.docid ? (
                    <Link 
                      href={`/cases/${event.docid}`}
                      className={cn(
                        "text-[13px] font-serif font-bold transition-colors",
                        isCurrent ? "text-gold" : "text-ink hover:text-gold"
                      )}
                    >
                      {event.case_name}
                    </Link>
                  ) : (
                    <span className={cn(
                      "text-[13px] font-serif font-bold",
                      isCurrent ? "text-gold" : "text-ink"
                    )}>
                      {event.case_name}
                    </span>
                  )}
                  
                  <span className={cn(
                    "px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter border rounded-sm",
                    event.status === 'Landmark' ? "bg-gold/10 border-gold/20 text-gold" :
                    event.status === 'Overruled' ? "bg-status-red/10 border-status-red/20 text-status-red" :
                    event.status === 'Distinguished' ? "bg-status-orange/10 border-status-orange/20 text-status-orange" :
                    "bg-ink/5 border-divider text-ink/40"
                  )}>
                    {event.status}
                  </span>
                </div>
                <p className="text-[11px] text-ink/60 leading-relaxed max-w-xl">
                  {event.one_line}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-8 py-4 bg-ink/[0.02] border-t border-divider flex items-start gap-3">
        <Info size={14} className="text-gold mt-0.5 shrink-0" />
        <p className="text-[10px] leading-normal text-ink/60 font-medium">
          <span className="font-bold text-ink">Precedent Status:</span> {timelineData.status_reason}
        </p>
      </div>
    </div>
  );
}
