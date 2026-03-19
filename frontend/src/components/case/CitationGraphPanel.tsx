'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCitations, CitationNode, CitationLink } from '@/features/cases/useCitations';
import { Loader2, Maximize2, ZoomIn, ZoomOut, RefreshCw, MousePointer2, AlertCircle, X, Info, Gavel, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Import ForceGraph2D dynamically to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-white/2 rounded-2xl">
      <Loader2 size={24} className="text-gold animate-spin" />
    </div>
  ),
});

interface CitationGraphPanelProps {
  docId: string;
}

export default function CitationGraphPanel({ docId }: CitationGraphPanelProps) {
  const { data, isLoading, isFetching, error, refetch } = useCitations(docId);
  const router = useRouter();
  const graphRef = useRef<any>();
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Performance optimization: Stop simulation after a few seconds
  useEffect(() => {
    if (data && graphRef.current) {
      const timer = setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.pauseAnimation();
        }
      }, 5000); // Wait 5s for stabilization then freeze
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 600);
    }
  }, []);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.title;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.type === 'root' ? '#D4A843' : (node.type === 'cites' ? '#5B9CF6' : '#3ECF8E');
    ctx.fill();
    
    // Add glow for root or selected
    if (node.type === 'root' || (selectedNode && node.id === selectedNode.id)) {
       ctx.shadowColor = node.type === 'root' ? '#D4A843' : '#F2ECD8';
       ctx.shadowBlur = 15;
    } else {
       ctx.shadowBlur = 0;
    }

    // Only show labels when zoomed in or if it's the root node
    if (globalScale > 2 || node.type === 'root' || (selectedNode && node.id === selectedNode.id)) {
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

      ctx.fillStyle = 'rgba(11, 12, 15, 0.8)';
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] - 6, bckgDimensions[0], bckgDimensions[1]);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.type === 'root' ? '#D4A843' : (selectedNode && node.id === selectedNode.id ? '#FFFFFF' : '#F2ECD8');
      ctx.fillText(label, node.x, node.y - bckgDimensions[1] - 6 + fontSize / 2);
    }
  }, [selectedNode]);

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-white/2 rounded-3xl border border-white/5 space-y-4">
        <Loader2 size={32} className="text-gold animate-spin" />
        <p className="text-[10px] font-bold text-cream/20 uppercase tracking-[0.2em]">Building Citation Graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-white/2 rounded-3xl border border-white/5 p-8 text-center space-y-4">
        <AlertCircle size={32} className="text-status-red/50" />
        <p className="text-sm text-cream/40 italic">Unable to build citation graph.</p>
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline disabled:opacity-50"
        >
          {isFetching ? 'Retrying...' : 'Retry Fetch'}
        </button>
      </div>
    );
  }

  if (!data || data.nodes.length <= 1) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-white/2 rounded-3xl border border-white/5 p-8 text-center space-y-4">
        <RefreshCw size={32} className={isFetching ? "text-gold animate-spin" : "text-cream/10"} />
        <p className="text-sm text-cream/40 italic">
          {isFetching ? 'Searching for references...' : 'No citations or references found for this case.'}
        </p>
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline disabled:opacity-50"
        >
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,168,67,0.8)]" />
          <h3 className="text-xs font-bold text-cream/60 uppercase tracking-widest">Citation Universe</h3>
        </div>
        <button 
          onClick={() => router.push(`/cases/${docId}/graph`)}
          className="flex items-center gap-2 text-[10px] font-bold text-gold/60 hover:text-gold uppercase tracking-widest transition-colors"
        >
          <Maximize2 size={12} />
          Full Screen
        </button>
      </div>

      <div 
        ref={containerRef}
        className="h-[450px] w-full bg-ink-3 rounded-3xl border border-white/10 overflow-hidden relative group"
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          width={containerWidth}
          height={450}
          backgroundColor="#0B0C0F"
          nodeLabel={(node: any) => node.title}
          nodeColor={(node: any) => {
            if (node.type === 'root') return '#D4A843'; // Gold
            if (node.type === 'cites') return '#5B9CF6'; // Blue
            return '#3ECF8E'; // Green (citedby)
          }}
          nodeRelSize={6}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkColor={() => 'rgba(255,255,255,0.1)'}
          linkWidth={1.5}
          onNodeClick={handleNodeClick}
          nodeCanvasObject={nodeCanvasObject}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          enablePointerInteraction={true}
        />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-ink/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 pointer-events-none group-hover:opacity-20 transition-opacity">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-[9px] font-bold text-cream/40 uppercase tracking-widest">Current Case</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-status-blue" />
              <span className="text-[9px] font-bold text-cream/40 uppercase tracking-widest">This case cites</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-status-green" />
              <span className="text-[9px] font-bold text-cream/40 uppercase tracking-widest">Cited by these</span>
           </div>
        </div>

        {/* Selected Node Box */}
        {selectedNode && (
          <div className="absolute top-6 left-6 right-6 bottom-6 md:left-auto md:w-72 bg-ink-2/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col animate-fade-in">
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-cream/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
              <div className="space-y-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                  selectedNode.type === 'root' ? 'bg-gold/10 text-gold' : 
                  (selectedNode.type === 'cites' ? 'bg-status-blue/10 text-status-blue' : 'bg-status-green/10 text-status-green')
                }`}>
                  {selectedNode.type === 'root' ? 'Current Case' : (selectedNode.type === 'cites' ? 'Cited Judgment' : 'Citing Case')}
                </span>
                <h4 className="text-sm font-serif text-cream leading-snug">
                  {selectedNode.title}
                </h4>
              </div>

              <button 
                onClick={() => router.push(`/cases/${selectedNode.id}`)}
                className="w-full flex items-center justify-between text-gold hover:text-white transition-colors py-2 group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">View Full Text</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-gold/60">
                  <Info size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Graph Tip</span>
                </div>
                <p className="text-[10px] text-cream/40 leading-relaxed italic">
                  Nodes are positioned based on their legal relationships. Closer nodes often share more legal principles.
                </p>
              </div>
            </div>

            <button 
              onClick={() => router.push(`/cases/${selectedNode.id}`)}
              className="mt-4 w-full py-3 bg-gold text-ink text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
            >
              <Gavel size={14} />
              Open Case
            </button>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)}
             className="w-10 h-10 bg-ink-2 border border-white/10 rounded-xl flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/30 transition-all shadow-xl"
           >
              <ZoomIn size={18} />
           </button>
           <button 
             onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 400)}
             className="w-10 h-10 bg-ink-2 border border-white/10 rounded-xl flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/30 transition-all shadow-xl"
           >
              <ZoomOut size={18} />
           </button>
        </div>

        {!selectedNode && (
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full backdrop-blur-md animate-fade-up">
             <MousePointer2 size={12} className="text-gold" />
             <span className="text-[9px] font-bold text-gold uppercase tracking-[0.1em]">Click nodes to inspect</span>
          </div>
        )}
      </div>
    </div>
  );
}
