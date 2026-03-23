'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCitations, CitationNode, CitationLink } from '@/features/cases/useCitations';
import { Loader2, Maximize2, ZoomIn, ZoomOut, RefreshCw, MousePointer2, AlertCircle, X, Info, Gavel, ChevronRight, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Import ForceGraph2D dynamically to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-parchment-dim rounded-library">
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
    ctx.font = `bold ${fontSize}px Manrope, system-ui, sans-serif`;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.type === 'root' ? '#B8860B' : (node.type === 'cites' ? '#1A2E44' : '#2D4B33');
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = '#FCF9F4';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();
    
    // Add glow for root or selected
    if (node.type === 'root' || (selectedNode && node.id === selectedNode.id)) {
       ctx.shadowColor = node.type === 'root' ? '#B8860B' : '#1A2E44';
       ctx.shadowBlur = 10;
    } else {
       ctx.shadowBlur = 0;
    }

    // Only show labels when zoomed in or if it's the root node
    if (globalScale > 2 || node.type === 'root' || (selectedNode && node.id === selectedNode.id)) {
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

      ctx.fillStyle = 'rgba(26, 46, 68, 0.9)';
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] - 8, bckgDimensions[0], bckgDimensions[1]);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FCF9F4';
      ctx.fillText(label, node.x, node.y - bckgDimensions[1] - 8 + fontSize / 2);
    }
  }, [selectedNode]);

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-parchment-dim rounded-library border border-divider space-y-4">
        <Loader2 size={32} className="text-gold animate-spin" />
        <p className="text-[10px] font-bold text-ink/20 uppercase tracking-[0.2em]">Mapping Citation Network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-parchment-dim rounded-library border border-divider p-8 text-center space-y-4">
        <AlertCircle size={32} className="text-status-red/50" />
        <p className="text-sm text-ink/40 italic">Unable to map institutional relationships.</p>
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline disabled:opacity-50"
        >
          {isFetching ? 'Retrying...' : 'Retry Mapping'}
        </button>
      </div>
    );
  }

  if (!data || data.nodes.length <= 1) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-parchment-dim rounded-library border border-divider p-8 text-center space-y-4">
        <Network size={32} className={cn("text-ink/10", isFetching && "animate-pulse")} />
        <p className="text-sm text-ink/40 italic leading-relaxed max-w-xs mx-auto">
          {isFetching ? 'Searching archives for references...' : 'No relevant institutional citations found for this record.'}
        </p>
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline disabled:opacity-50"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Archive'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="h-[450px] w-full bg-parchment-dim rounded-library border border-divider overflow-hidden relative group shadow-inner"
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          width={containerWidth}
          height={450}
          backgroundColor="#F5F2ED"
          nodeLabel={(node: any) => node.title}
          nodeColor={(node: any) => {
            if (node.type === 'root') return '#B8860B'; // Gold
            if (node.type === 'cites') return '#1A2E44'; // Ink
            return '#2D4B33'; // Forest
          }}
          nodeRelSize={6}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkColor={() => 'rgba(26, 46, 68, 0.1)'}
          linkWidth={1.5}
          onNodeClick={handleNodeClick}
          nodeCanvasObject={nodeCanvasObject}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          enablePointerInteraction={true}
        />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-parchment/90 backdrop-blur-md p-4 rounded-library border border-divider pointer-events-none group-hover:opacity-20 transition-opacity shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">Current Record</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-ink" />
              <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">Cited by this</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-forest" />
              <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">Citing this record</span>
           </div>
        </div>

        {/* Selected Node Box */}
        {selectedNode && (
          <div className="absolute top-6 left-6 right-6 bottom-6 md:left-auto md:w-80 bg-parchment/95 backdrop-blur-xl border border-divider rounded-library p-8 shadow-2xl flex flex-col animate-fade-up">
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-ink/20 hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
              <div className="space-y-3">
                <span className={cn(
                  "px-2 py-0.5 rounded-library text-[8px] font-bold uppercase tracking-widest border",
                  selectedNode.type === 'root' ? 'bg-gold-dim text-gold border-gold/20' : 
                  (selectedNode.type === 'cites' ? 'bg-ink/5 text-ink border-ink/10' : 'bg-forest-dim text-forest border-forest/10')
                )}>
                  {selectedNode.type === 'root' ? 'Current Archive' : (selectedNode.type === 'cites' ? 'Cited Record' : 'Citing Record')}
                </span>
                <h4 className="text-lg font-serif text-ink leading-tight italic font-bold">
                  {selectedNode.title}
                </h4>
              </div>

              <div className="pt-6 border-t border-divider border-dashed space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <Info size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Tip</span>
                </div>
                <p className="text-[11px] text-ink/50 leading-relaxed italic font-medium">
                  Closely clustered records share high thematic and precedential overlap within the institutional archive.
                </p>
              </div>
            </div>

            <button 
              onClick={() => router.push(`/cases/${selectedNode.id}`)}
              className="mt-6 w-full py-3.5 bg-ink text-parchment text-[10px] font-bold uppercase tracking-widest rounded-library flex items-center justify-center gap-2 hover:bg-ink/90 transition-all shadow-sm"
            >
              <Gavel size={14} className="text-gold" />
              Consult Record
            </button>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)}
             className="w-10 h-10 bg-parchment border border-divider rounded-library flex items-center justify-center text-ink/40 hover:text-ink transition-all shadow-sm"
           >
              <ZoomIn size={18} />
           </button>
           <button 
             onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 400)}
             className="w-10 h-10 bg-parchment border border-divider rounded-library flex items-center justify-center text-ink/40 hover:text-ink transition-all shadow-sm"
           >
              <ZoomOut size={18} />
           </button>
        </div>

        {!selectedNode && (
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-parchment border border-divider px-4 py-2 rounded-library shadow-sm animate-fade-up">
             <MousePointer2 size={12} className="text-gold" />
             <span className="text-[9px] font-bold text-ink/60 uppercase tracking-widest">Inspect Archive Nodes</span>
          </div>
        )}
      </div>
    </div>
  );
}
