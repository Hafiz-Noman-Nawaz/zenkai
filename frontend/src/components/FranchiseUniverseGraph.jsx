import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Network, Sparkles, ZoomIn, ZoomOut, RotateCcw, Play, Maximize2 } from 'lucide-react';
import { AnimeImage } from './AnimeImage';

export const FranchiseUniverseGraph = ({ currentAnime, franchiseData = {} }) => {
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const entries = franchiseData.entries || [];

  // Build initial node layout in a radial constellation
  useEffect(() => {
    if (!currentAnime) return;

    const allItems = entries.length > 0 ? entries : [currentAnime];
    const width = 680;
    const height = 420;
    const centerX = width / 2;
    const centerY = height / 2;

    const total = allItems.length;
    const radius = Math.min(220, Math.max(130, total * 30));

    const initialNodes = allItems.map((item, idx) => {
      const isCurrent = item.id === currentAnime.id;
      if (isCurrent) {
        return {
          ...item,
          x: centerX,
          y: centerY,
          isCurrent: true,
        };
      }

      // Distribute other nodes in an orbit
      const angle = ((idx + 1) / total) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius + (idx % 2 === 0 ? 30 : -20));
      const y = centerY + Math.sin(angle) * (radius + (idx % 2 === 0 ? 20 : -30));

      return {
        ...item,
        x,
        y,
        isCurrent: false,
      };
    });

    setNodes(initialNodes);
    setSelectedNode(initialNodes.find((n) => n.isCurrent) || initialNodes[0]);
  }, [currentAnime, franchiseData]);

  // Drag handlers
  const handleMouseDown = (node, e) => {
    e.stopPropagation();
    setDraggingNodeId(node.id);
    setSelectedNode(node);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(50, Math.min(rect.width - 50, e.clientX - rect.left));
    const newY = Math.max(50, Math.min(rect.height - 50, e.clientY - rect.top));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const centerNode = nodes.find((n) => n.isCurrent) || nodes[0];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-[460px] sm:h-[500px] rounded-3xl bg-zenkai-card/90 border border-zenkai-border overflow-hidden shadow-2xl select-none"
    >
      {/* Background Starfield & Constellation Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-zenkai-bg via-transparent to-zenkai-bg/50 pointer-events-none" />

      {/* Header Info Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-zenkai-surface/90 border border-white/10 px-3.5 py-1.5 rounded-2xl backdrop-blur-md shadow-lg">
        <Network className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span className="text-xs font-display font-black text-white">
          {franchiseData.rootTitle || currentAnime.title} Universe
        </span>
        <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-600/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
          {nodes.length} Nodes
        </span>
      </div>

      {/* Zoom / Reset Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-zenkai-surface/90 border border-white/10 p-1 rounded-2xl backdrop-blur-md shadow-lg">
        <button
          onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
          className="p-1.5 text-zenkai-muted hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
          className="p-1.5 text-zenkai-muted hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(1)}
          className="p-1.5 text-zenkai-muted hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Connection Lines with Energy Pulses */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-transform duration-150"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {centerNode &&
          nodes
            .filter((n) => n.id !== centerNode.id)
            .map((node) => (
              <g key={`edge-${centerNode.id}-${node.id}`}>
                {/* Connection Glow */}
                <line
                  x1={centerNode.x}
                  y1={centerNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-pulse opacity-75"
                />
                {/* Floating particle node */}
                <circle
                  cx={(centerNode.x + node.x) / 2}
                  cy={(centerNode.y + node.y) / 2}
                  r="3.5"
                  fill="#38bdf8"
                  className="animate-ping opacity-60"
                />
              </g>
            ))}
      </svg>

      {/* Interactive Draggable Nodes */}
      <div
        className="absolute inset-0 z-20 transition-transform duration-150"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      >
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isCurrent = node.isCurrent;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(node, e)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-grab active:cursor-grabbing group transition-all duration-200 ${
                isCurrent
                  ? 'scale-110 z-30'
                  : isSelected
                  ? 'scale-105 z-25'
                  : 'hover:scale-105 z-20'
              }`}
            >
              {/* Node Card Artwork */}
              <div
                className={`relative w-14 h-20 sm:w-16 sm:h-24 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all ${
                  isCurrent
                    ? 'border-cyan-400 ring-4 ring-cyan-500/40 shadow-cyan-500/30'
                    : isSelected
                    ? 'border-indigo-400 ring-2 ring-indigo-500/30'
                    : 'border-white/20 opacity-85 group-hover:opacity-100 group-hover:border-white/60'
                }`}
              >
                <img
                  src={node.coverImage}
                  alt={node.title}
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Badge Overlay */}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-white">
                  {node.seasonYear || (node.badge ? node.badge.split(' ')[0] : 'TV')}
                </div>
              </div>

              {/* Node Label Tooltip */}
              <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl pointer-events-none shadow-xl">
                <p className="text-[11px] font-bold text-white max-w-[130px] truncate text-center">
                  {node.title}
                </p>
                {node.badge && (
                  <span className="text-[9px] font-mono text-indigo-300 block text-center">
                    {node.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Preview Dock (Bottom) */}
      {selectedNode && (
        <div className="absolute bottom-4 inset-x-4 z-30 flex items-center justify-between p-3.5 rounded-2xl bg-zenkai-surface/90 border border-white/15 backdrop-blur-xl shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-14 shrink-0 rounded-xl overflow-hidden bg-zenkai-card shadow-md">
              <img
                src={selectedNode.coverImage}
                alt={selectedNode.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h5 className="font-bold text-xs sm:text-sm text-white truncate">
                {selectedNode.title}
              </h5>
              <div className="flex items-center gap-2 text-[11px] text-zenkai-muted mt-0.5">
                <span className="font-mono text-indigo-300 font-bold">
                  {selectedNode.badge || 'Canon Entry'}
                </span>
                <span>•</span>
                <span>{selectedNode.type || 'TV'}</span>
                {selectedNode.episodes && <span>• {selectedNode.episodes} eps</span>}
              </div>
            </div>
          </div>

          <div className="shrink-0 pl-3">
            {selectedNode.id === currentAnime.id ? (
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
                Currently Viewing
              </span>
            ) : (
              <Link
                to={`/anime/${selectedNode.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-spring btn-press"
              >
                <span>Explore Timeline</span>
                <Play className="w-3 h-3 fill-white" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
