'use client';

import React from 'react';
import { useCitations } from '@/features/cases/useCitations';
import Link from 'next/link';
import { Loader2, AlertCircle, BookOpen, Quote, Gavel, ArrowRight, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedCasesPanelProps {
  docId: string;
}

export default function RelatedCasesPanel({ docId }: RelatedCasesPanelProps) {
  const { data, isLoading, error } = useCitations(docId);

  // Derive related cases from citation data
  const citedCases = (data?.nodes ?? []).filter(
    (n) => n.type === 'cites' && n.id !== docId
  );
  const citingCases = (data?.nodes ?? []).filter(
    (n) => n.type === 'citedby' && n.id !== docId
  );
  const secondaryCases = (data?.nodes ?? []).filter(
    (n) => n.type === 'secondary' && n.id !== docId
  );

  const hasData =
    citedCases.length > 0 || citingCases.length > 0 || secondaryCases.length > 0;

  if (isLoading) {
    return (
      <div className="bg-parchment border border-divider rounded-library p-10 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={24} className="animate-spin text-gold/50" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
          Mapping Related Archives...
        </p>
      </div>
    );
  }

  if (error) {
    return null; // Silently hide on error — the graph panel is the primary surface
  }

  if (!hasData) {
    return null; // Silently hide when there's no related data
  }

  return (
    <div className="bg-parchment border border-divider rounded-library overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-divider bg-ink/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-library bg-ink text-parchment flex items-center justify-center">
          <Network size={16} className="text-gold" />
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink">
            Related Archives
          </h3>
          <p className="text-[9px] text-ink/30 font-medium">
            {citedCases.length + citingCases.length + secondaryCases.length} connected records
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Cases Cited by This */}
        {citedCases.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Quote size={14} className="text-ink/30" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40">
                Cited in this Record ({citedCases.length})
              </span>
            </div>
            <div className="space-y-2">
              {citedCases.slice(0, 6).map((node) => (
                <RelatedCaseCard key={node.id} node={node} relationship="cited" />
              ))}
              {citedCases.length > 6 && (
                <Link
                  href={`/cases/${docId}/graph`}
                  className="block text-center text-[9px] font-bold uppercase tracking-widest text-gold hover:underline pt-2"
                >
                  View all {citedCases.length} cited in graph →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Cases Citing This */}
        {citingCases.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-ink/30" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40">
                Citing this Record ({citingCases.length})
              </span>
            </div>
            <div className="space-y-2">
              {citingCases.slice(0, 6).map((node) => (
                <RelatedCaseCard key={node.id} node={node} relationship="citing" />
              ))}
              {citingCases.length > 6 && (
                <Link
                  href={`/cases/${docId}/graph`}
                  className="block text-center text-[9px] font-bold uppercase tracking-widest text-gold hover:underline pt-2"
                >
                  View all {citingCases.length} citing in graph →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Extended Network */}
        {secondaryCases.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gavel size={14} className="text-ink/30" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40">
                Extended Network ({secondaryCases.length})
              </span>
            </div>
            <div className="space-y-2">
              {secondaryCases.slice(0, 4).map((node) => (
                <RelatedCaseCard key={node.id} node={node} relationship="extended" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="px-6 py-4 border-t border-divider bg-parchment-dim">
        <Link
          href={`/cases/${docId}/graph`}
          className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold hover:text-ink transition-colors group"
        >
          <Network size={14} />
          <span>Open Citation Graph</span>
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Related Case Card
// ─────────────────────────────────────────────

function RelatedCaseCard({
  node,
  relationship,
}: {
  node: { id: string; title: string; year?: number };
  relationship: 'cited' | 'citing' | 'extended';
}) {
  const label =
    relationship === 'cited'
      ? 'Cited'
      : relationship === 'citing'
        ? 'Citing'
        : 'Extended';

  const badgeColors =
    relationship === 'cited'
      ? 'bg-ink/5 border-ink/10 text-ink'
      : relationship === 'citing'
        ? 'bg-forest-dim border-forest/10 text-forest'
        : 'bg-gold-dim border-gold/20 text-gold';

  return (
    <Link
      href={`/cases/${node.id}`}
      className="block p-4 border border-divider rounded-library hover:bg-parchment-dim hover:border-ink/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span
            className={cn(
              'inline-block px-2 py-0.5 rounded-library text-[8px] font-bold uppercase tracking-widest border',
              badgeColors
            )}
          >
            {label}
          </span>
          <h4 className="text-[13px] font-serif font-bold text-ink leading-snug group-hover:text-gold transition-colors line-clamp-2">
            {node.title}
          </h4>
        </div>
        {node.year && (
          <span className="shrink-0 text-[9px] font-bold text-ink/30 font-mono">
            {node.year}
          </span>
        )}
      </div>
    </Link>
  );
}
