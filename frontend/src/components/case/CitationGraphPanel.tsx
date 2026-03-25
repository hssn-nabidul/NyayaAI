'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCitations, CitationNode, CitationLink } from '@/features/cases/useCitations';
import { Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, MousePointer2, AlertCircle, X, Info, Gavel, ChevronRight, Network } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    const timeout = setTimeout(updateWidth, 50);
    
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  // Apply Temporal Orbits (Radial Force) if data has years
  useEffect(() => {
    if (data && graphRef.current) {
      // We need to access d3 forces
      try {
        const d3 = require('d3-force');
        const rootNode = data.nodes.find(n => n.type === 'root');
        
        if (rootNode && rootNode.year) {
           const rootYear = rootNode.year;
           // Radius scale: 1 year difference = 20 pixels
           const radialForce = d3.forceRadial(
             (d: any) => {
               if (d.type === 'root') return 0;
               const dYear = d.year || 2024;
               return Math.max(50, Math.abs(rootYear - dYear) * 20); // Min radius 50
             },
             0, 0 // Center at 0,0
           ).strength(0.8);
           
           graphRef.current.d3Force('radial', radialForce);
           // Reduce standard collision/charge to let radial force dominate
           graphRef.current.d3Force('charge').strength(-20);
        }
      } catch (e) {
        console.warn("Could not apply radial force", e);
      }
      
      const timer = setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.pauseAnimation();
        }
      }, 8000); 
      return () => clearTimeout(timer);
    }
  }, [data, isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    if (graphRef.current) {
      graphRef.current.resumeAnimation();
    }
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 600);
    }
  }, []);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (typeof node.x !== 'number' || typeof node.y !== 'number' || isNaN(node.x) || isNaN(node.y)) {
      return;
    }

    const label = node.title || 'Unknown Record';
    const fontSize = 12 / globalScale;
    ctx.font = `bold ${fontSize}px Manrope, system-ui, sans-serif`;
    
    // Theme Colors
    const COLOR_ROOT = '#FFD700'; // Gold Pulse
    const COLOR_CITES = '#00BFFF'; // Electric Blue
    const COLOR_CITEDBY = '#39FF14'; // Neon Green
    const COLOR_SECONDARY = '#BF00FF'; // Deep Violet
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.type === 'root' ? 8 : 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.type === 'root' ? COLOR_ROOT : 
                   (node.type === 'cites' ? COLOR_CITES : 
                   (node.type === 'citedby' ? COLOR_CITEDBY : COLOR_SECONDARY));
    ctx.fill();
    
    // Add border for contrast
    ctx.strokeStyle = '#0B0E14';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();
    
    // Add intense glow for root or hovered/selected
    if (node.type === 'root' || (selectedNode && node.id === selectedNode.id) || (hoverNode && node.id === hoverNode.id)) {
       ctx.shadowColor = ctx.fillStyle;
       ctx.shadowBlur = node.type === 'root' ? 20 : 15;
       // Redraw to apply shadow strongly
       ctx.fill();
    } else {
       ctx.shadowBlur = 0;
    }

    // Hover Intelligence: Only show labels for Root, Selected, or Hovered node
    const shouldShowLabel = node.type === 'root' || 
                            (selectedNode && node.id === selectedNode.id) || 
                            (hoverNode && node.id === hoverNode.id);

    if (shouldShowLabel && globalScale > 0.5) {
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

      // Dark background for text visibility
      ctx.fillStyle = 'rgba(11, 14, 20, 0.85)';
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] - 12, bckgDimensions[0], bckgDimensions[1]);

      // Border for text box
      ctx.strokeStyle = ctx.shadowColor || COLOR_ROOT;
      ctx.lineWidth = 0.5 / globalScale;
      ctx.strokeRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] - 12, bckgDimensions[0], bckgDimensions[1]);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0; // Turn off shadow for text rendering
      ctx.fillText(label, node.x, node.y - bckgDimensions[1] - 12 + fontSize / 2);
    }
  }, [selectedNode, hoverNode]);

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
    <div className={cn(
      "space-y-4",
      isFullscreen && "fixed inset-0 z-[100] bg-parchment p-6 flex flex-col"
    )}>
      {isFullscreen && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Network className="text-gold" size={20} />
            <h2 className="text-lg font-serif italic font-bold text-ink uppercase tracking-widest">Institutional Network Graph</h2>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-ink/5 rounded-full transition-colors"
          >
            <X size={24} className="text-ink/40" />
          </button>
        </div>
      )}

      <div 
        ref={containerRef}
        className={cn(
          "bg-parchment-dim rounded-library border border-divider overflow-hidden relative group shadow-inner flex-1",
          !isFullscreen ? "h-[450px]" : "h-full"
        )}
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          width={containerWidth}
          height={isFullscreen ? (typeof window !== 'undefined' ? window.innerHeight - 150 : 800) : 450}
          backgroundColor="#0B0E14" // Deep Space
          nodeLabel={(node: any) => ""} // Disable default tooltip since we draw it on canvas
          nodeColor={(node: any) => {
            if (node.type === 'root') return '#FFD700'; // Gold
            if (node.type === 'cites') return '#00BFFF'; // Blue
            if (node.type === 'citedby') return '#39FF14'; // Green
            return '#BF00FF'; // Violet
          }}
          nodeRelSize={6}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkColor={() => 'rgba(212, 175, 55, 0.3)'} // Golden Orbits
          linkWidth={1.5}
          linkDirectionalParticles={2} // Flow effect
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => '#D4AF37'} // Gold particles
          onNodeClick={handleNodeClick}
          onNodeHover={setHoverNode}
          onBackgroundClick={() => setSelectedNode(null)}
          nodeCanvasObject={nodeCanvasObject}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          enablePointerInteraction={true}
          minZoom={0.2}
          maxZoom={20}
        />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-[#1A1A1A]/95 backdrop-blur-md p-4 rounded-library border border-gold/30 shadow-2xl z-10">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700]" />
              <span className="text-[9px] font-bold text-[#F5F2ED] uppercase tracking-widest">Current Record</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
              <span className="text-[9px] font-bold text-[#F5F2ED] uppercase tracking-widest">Citing this record</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00BFFF] shadow-[0_0_8px_#00BFFF]" />
              <span className="text-[9px] font-bold text-[#F5F2ED] uppercase tracking-widest">Cited by this</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#BF00FF] shadow-[0_0_8px_#BF00FF]" />
              <span className="text-[9px] font-bold text-[#F5F2ED] uppercase tracking-widest">Extended Network</span>
           </div>
        </div>

        {/* Selected Node Box */}
        {selectedNode && (
          <div className="absolute top-6 left-6 right-6 bottom-6 md:left-auto md:w-80 bg-parchment/95 backdrop-blur-xl border border-divider rounded-library p-8 shadow-2xl flex flex-col animate-fade-up">
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 p-2 bg-ink/5 hover:bg-ink/10 rounded-full text-ink transition-colors z-10"
              title="Dismiss Card"
            >
              <X size={18} />
            </button>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
              <div className="space-y-3">
                <span className={cn(
                  "px-2 py-0.5 rounded-library text-[8px] font-bold uppercase tracking-widest border",
                  selectedNode.type === 'root' ? 'bg-gold-dim text-gold border-gold/20' : 
                  (selectedNode.type === 'cites' ? 'bg-ink/5 text-ink border-ink/10' : 
                  (selectedNode.type === 'citedby' ? 'bg-forest-dim text-forest border-forest/10' : 'bg-gray-100 text-gray-500 border-gray-200'))
                )}>
                  {selectedNode.type === 'root' ? 'Current Archive' : 
                  (selectedNode.type === 'cites' ? 'Cited Record' : 
                  (selectedNode.type === 'citedby' ? 'Citing Record' : 'Extended Archive'))}
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
             onClick={toggleFullscreen}
             className="w-10 h-10 bg-parchment border border-divider rounded-library flex items-center justify-center text-ink/40 hover:text-ink transition-all shadow-sm"
             title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
           >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
           </button>
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
