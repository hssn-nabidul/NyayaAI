'use client';

import React from 'react';
import { useSimilarCases } from '@/features/cases/useSimilarCases';
import Link from 'next/link';
import {
  Loader2,
  Sparkles,
  AlertCircle,
  BookOpen,
  Scale,
  Gavel,
  Search,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimilarCasesPanelProps {
  docId: string;
  caseTitle?: string;
}

export default function SimilarCasesPanel({
  docId,
  caseTitle,
}: SimilarCasesPanelProps) {
  const {
    mutate: findSimilar,
    data,
    isPending,
    error,
  } = useSimilarCases(docId);

  const [hasStarted, setHasStarted] = React.useState(false);

  const handleFindSimilar = () => {
    setHasStarted(true);
    findSimilar();
  };

  // Initial state: Show a "Find Similar Cases" button
  if (!hasStarted) {
    return (
      <div className="bg-parchment border border-divider rounded-library overflow-hidden shadow-sm">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-library bg-ink/5 border border-divider flex items-center justify-center">
            <Search size={28} className="text-gold" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-serif font-bold text-ink">
              Thematically Similar Cases
            </h3>
            <p className="text-sm text-ink/60 leading-relaxed max-w-md mx-auto">
              AI-powered analysis finds cases that share the same legal
              principles and constitutional issues — going beyond direct
              citations.
            </p>
          </div>
          <button
            onClick={handleFindSimilar}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-8 py-3 bg-ink text-parchment rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-gold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {isPending ? 'Analyzing Themes...' : 'Find Similar Cases'}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isPending) {
    return (
      <div className="bg-parchment border border-divider rounded-library overflow-hidden shadow-sm">
        <div className="p-10 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-ink/5 rounded-library" />
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-library animate-spin absolute top-0" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 animate-pulse">
            Analyzing Legal Themes...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-parchment border border-divider rounded-library p-8 text-center space-y-4">
        <AlertCircle size={32} className="mx-auto text-status-red/50" />
        <p className="text-sm text-ink/40 italic">
          Unable to complete thematic analysis.
        </p>
        <button
          onClick={handleFindSimilar}
          className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { thematic_analysis: analysis, similar_cases: suggestions } = data;
  const allCases = suggestions || [];

  if (allCases.length === 0) {
    return (
      <div className="bg-parchment border border-divider rounded-library p-8 text-center space-y-4">
        <Search size={32} className="mx-auto text-ink/10" />
        <p className="text-sm text-ink/40 italic">
          No thematically similar cases identified for this judgment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-parchment border border-divider rounded-library overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-divider bg-ink/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-library bg-gold-dim border border-gold/20 flex items-center justify-center">
          <Lightbulb size={16} className="text-gold" />
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink">
            Thematically Similar Cases
          </h3>
          <p className="text-[9px] text-ink/30 font-medium">
            AI analysis &middot; {allCases.length} cases found
          </p>
        </div>
      </div>

      {/* Thematic Analysis Summary */}
      {analysis && (
        <div className="px-6 pt-6 space-y-4">
          <div className="p-4 bg-gold-dim border border-gold/10 rounded-library">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={14} className="text-gold" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">
                {analysis.primary_area || 'Legal Analysis'}
              </span>
            </div>
            <p className="text-xs text-ink/70 leading-relaxed italic">
              {analysis.thematic_summary}
            </p>
            {analysis.core_principles &&
              analysis.core_principles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {analysis.core_principles.map((p: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-ink/5 border border-divider rounded-library text-[9px] font-medium text-ink/60"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
          </div>

          {/* Relevant Statutes */}
          {analysis.relevant_statutes &&
            analysis.relevant_statutes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[8px] font-bold uppercase tracking-widest text-ink/30 mr-1 self-center">
                  Statutes:
                </span>
                {analysis.relevant_statutes.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-ink/5 rounded-library text-[9px] font-mono text-ink/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
        </div>
      )}

      {/* Similar Cases List */}
      <div className="p-6 space-y-3">
        {allCases.slice(0, 8).map((c: any, i: number) => (
          <SimilarCaseCard key={i} caseData={c} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Single Case Card
// ─────────────────────────────────────────────

function SimilarCaseCard({ caseData }: { caseData: any }) {
  const score = caseData.relevance_score || 0;
  const scoreLabel =
    score >= 0.9 ? 'Highly Relevant' : score >= 0.7 ? 'Relevant' : 'Related';
  const docId = caseData.doc_id;

  const cardContent = (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          {docId ? (
            <h4 className="text-[13px] font-serif font-bold text-ink leading-snug group-hover:text-gold transition-colors">
              {caseData.title}
            </h4>
          ) : (
            <h4 className="text-[13px] font-serif font-bold text-ink leading-snug group-hover:text-gold transition-colors">
              {caseData.title}
            </h4>
          )}
          <div className="flex items-center gap-3 text-[9px] text-ink/30 font-medium">
            {caseData.year && <span>{caseData.year}</span>}
            {caseData.court && (
              <>
                <span className="text-divider">·</span>
                <span>{caseData.court}</span>
              </>
            )}
            {caseData.citation && (
              <>
                <span className="text-divider">·</span>
                <span className="font-mono">{caseData.citation}</span>
              </>
            )}
          </div>
        </div>
        {/* Relevance Badge */}
        <span
          className={cn(
            'shrink-0 px-2 py-0.5 rounded-library text-[8px] font-bold uppercase tracking-widest border',
            score >= 0.9
              ? 'bg-gold-dim border-gold/20 text-gold'
              : score >= 0.7
                ? 'bg-forest-dim border-forest/10 text-forest'
                : 'bg-ink/5 border-divider text-ink/40'
          )}
        >
          {scoreLabel}
        </span>
      </div>

      {/* Shared Principle */}
      <div className="flex items-start gap-2">
        <Gavel size={12} className="text-gold mt-0.5 shrink-0" />
        <p className="text-[11px] text-ink/50 leading-relaxed italic">
          {caseData.shared_principle || caseData.reasoning}
        </p>
      </div>

      {/* Reasoning */}
      {caseData.reasoning && caseData.shared_principle && (
        <p className="text-[10px] text-ink/40 leading-relaxed pl-6">
          {caseData.reasoning}
        </p>
      )}
    </div>
  );

  if (docId) {
    return (
      <Link
        href={`/cases/${docId}`}
        className="block p-4 border border-divider rounded-library hover:bg-parchment-dim hover:border-gold/20 transition-all group"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="p-4 border border-divider rounded-library hover:bg-parchment-dim hover:border-gold/20 transition-all group">
      {cardContent}
    </div>
  );
}
