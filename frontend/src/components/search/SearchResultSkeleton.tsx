'use client';

import React from 'react';

export default function SearchResultSkeleton() {
  return (
    <div className="bg-parchment border border-divider rounded-library p-6 space-y-4 animate-pulse">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-4 w-24 bg-ink/5 rounded-library" />
        <div className="h-4 w-4 bg-ink/5 rounded-full" />
        <div className="h-4 w-20 bg-ink/5 rounded-library" />
      </div>
      
      <div className="h-8 w-3/4 bg-ink/10 rounded-library" />
      
      <div className="space-y-2 pt-2">
        <div className="h-4 w-full bg-ink/5 rounded-library" />
        <div className="h-4 w-5/6 bg-ink/5 rounded-library" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-divider border-dashed">
        <div className="h-3 w-32 bg-ink/5 rounded-library" />
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-ink/10 rounded-library" />
          <div className="h-10 w-10 bg-ink/10 rounded-library" />
        </div>
      </div>
    </div>
  );
}
