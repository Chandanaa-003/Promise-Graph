import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Info,
  X
} from 'lucide-react';
import { Person, Commitment } from '../types';

interface RelationshipGraphViewProps {
  people: Person[];
  commitments: Commitment[];
  loading?: boolean;
  onSelectCommitment: (comm: Commitment) => void;
}

export const RelationshipGraphView: React.FC<RelationshipGraphViewProps> = ({
  people,
  commitments,
  onSelectCommitment,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas Pan & Zoom State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selected Node State for Inspector
  const [selectedNode, setSelectedNode] = useState<{
    type: 'person' | 'commitment';
    data: Person | Commitment;
  } | null>(null);

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.15, 2.2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.15, 0.45));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 40, y: 30 });
  };
  const handleFit = () => {
    setScale(0.85);
    setPan({ x: 20, y: 20 });
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.graph-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((s) => Math.min(Math.max(s * zoomFactor, 0.45), 2.2));
  };

  // Structured layout coordinates calculation
  // People arranged along left column; commitments arranged in center/right columns
  const peopleNodes = people.map((p, idx) => ({
    ...p,
    x: 120,
    y: 90 + idx * 160,
  }));

  const commitmentNodes = commitments.map((c, idx) => {
    // Find associated person index to position nearby
    const personIndex = people.findIndex((p) => p.id === c.person_id);
    const baseY = personIndex !== -1 ? 70 + personIndex * 150 : 80 + (idx % 4) * 140;
    const colOffset = 520 + (idx % 2) * 280;
    const yOffset = (idx % 3) * 60 - 30;

    return {
      ...c,
      x: colOffset,
      y: Math.max(baseY + yOffset, 60),
    };
  });

  // Calculate directed edges connecting people and commitments
  const edges = commitments
    .filter((c) => c.person_id)
    .map((c) => {
      const pNode = peopleNodes.find((p) => p.id === c.person_id);
      const cNode = commitmentNodes.find((cn) => cn.id === c.id);
      if (!pNode || !cNode) return null;
      return {
        id: `edge-${pNode.id}-${cNode.id}`,
        source: pNode,
        target: cNode,
        type: c.commitment_type,
        status: c.status,
      };
    })
    .filter(Boolean);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-extrabold text-[#172044] tracking-tight">
              Relationship Graph
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              Interactive
            </span>
          </div>
          <p className="mt-1 text-xs text-[#64708B]">
            Interactive topological graph mapping stakeholders to extracted promises and obligations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-[#5146E5]" />
            <span className="text-[#172044] font-medium">People ({people.length})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-md bg-[#24B8A5]" />
            <span className="text-[#172044] font-medium">Commitments ({commitments.length})</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="relative flex-1 rounded-2xl border border-[#E8EAF3] bg-white overflow-hidden shadow-card cursor-grab active:cursor-grabbing select-none"
      >
        {/* Subtle Canvas Dot Grid Background */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#E8EAF3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* Canvas Controls Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-1 rounded-xl border border-[#E8EAF3] bg-white/95 p-1.5 shadow-md backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg text-[#64708B] hover:text-[#5146E5] hover:bg-[#F5F7FF] transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-[#64708B] hover:text-[#5146E5] hover:bg-[#F5F7FF] transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-bold text-[#172044] px-1 font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleFit}
            title="Fit to screen"
            className="p-1.5 rounded-lg text-[#64708B] hover:text-[#5146E5] hover:bg-[#F5F7FF] transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Pan & Zoom"
            className="p-1.5 rounded-lg text-[#64708B] hover:text-[#5146E5] hover:bg-[#F5F7FF] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Hint Pill */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center space-x-2 rounded-xl border border-[#E8EAF3] bg-white/90 px-3 py-1.5 text-[11px] text-[#64708B] shadow-sm">
          <Info className="h-3.5 w-3.5 text-[#5146E5]" />
          <span>Click any node to view details • Scroll to zoom • Drag to pan</span>
        </div>

        {/* Transformable Canvas Surface */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            width: '1800px',
            height: '1400px',
            position: 'absolute',
          }}
        >
          <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <marker
                id="arrow-made"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#5146E5" />
              </marker>
              <marker
                id="arrow-received"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#24B8A5" />
              </marker>
            </defs>

            {/* Render Directed Edges */}
            {edges.map((edge: any) => {
              const x1 = edge.source.x + 190;
              const y1 = edge.source.y + 40;
              const x2 = edge.target.x;
              const y2 = edge.target.y + 40;
              const cx = (x1 + x2) / 2;

              const isMade = edge.type === 'promise_made';
              const strokeColor = isMade ? '#5146E5' : '#24B8A5';

              return (
                <g key={edge.id} className="transition-opacity">
                  <path
                    d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeDasharray={edge.status === 'pending' ? '4,4' : undefined}
                    markerEnd={`url(#${isMade ? 'arrow-made' : 'arrow-received'})`}
                    opacity={selectedNode ? (selectedNode.data.id === edge.source.id || selectedNode.data.id === edge.target.id ? 1 : 0.2) : 0.75}
                  />
                  {/* Midpoint Label Pill */}
                  <text
                    x={cx}
                    y={(y1 + y2) / 2 - 6}
                    fill={strokeColor}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none font-sans"
                  >
                    {isMade ? 'responsible for →' : '← promised by'}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* PEOPLE NODES */}
          {peopleNodes.map((p) => {
            const isSelected = selectedNode?.data.id === p.id;
            return (
              <div
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode({ type: 'person', data: p });
                }}
                style={{
                  position: 'absolute',
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: '200px',
                }}
                className={`graph-node rounded-2xl border-2 p-3.5 bg-white shadow-card hover:shadow-card-hover transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#5146E5] ring-4 ring-[#5146E5]/20'
                    : 'border-[#5146E5]/40 hover:border-[#5146E5]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5146E5] text-white font-bold text-xs shadow-sm">
                    {p.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#172044] truncate">
                      {p.display_name}
                    </h4>
                    <p className="text-[10px] text-[#64708B] truncate">
                      {p.organization || 'Stakeholder'}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E8EAF3] flex items-center justify-between text-[10px]">
                  <span className="text-[#64708B] font-medium">Affinity Score</span>
                  <span className="font-bold text-[#24B8A5]">
                    {Math.round(p.relationship_score * 100)}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* COMMITMENT NODES */}
          {commitmentNodes.map((c) => {
            const isSelected = selectedNode?.data.id === c.id;
            return (
              <div
                key={c.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode({ type: 'commitment', data: c });
                }}
                style={{
                  position: 'absolute',
                  left: `${c.x}px`,
                  top: `${c.y}px`,
                  width: '240px',
                }}
                className={`graph-node rounded-2xl border p-3.5 bg-white shadow-card hover:shadow-card-hover transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#5146E5] ring-4 ring-[#5146E5]/20'
                    : 'border-[#E8EAF3] hover:border-[#D6D9EB]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[9px] font-bold capitalize ${
                      c.status === 'fulfilled'
                        ? 'bg-[#E6F8F5] text-[#24B8A5]'
                        : c.status === 'overdue'
                        ? 'bg-[#FDF1F0] text-[#E66D68]'
                        : 'bg-[#EEF0FD] text-[#5146E5]'
                    }`}
                  >
                    <span>{c.status}</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#64708B]">
                    {c.due_date ? new Date(c.due_date).toLocaleDateString() : 'No date'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#172044] line-clamp-2 leading-snug">
                  {c.title}
                </h4>

                <div className="mt-2 pt-1.5 border-t border-[#E8EAF3] flex items-center justify-between text-[10px] text-[#64708B]">
                  <span className="truncate">{c.person_name || 'Assigned'}</span>
                  <span className="text-[#5146E5] font-semibold">
                    {Math.round(c.confidence_score * 100)}% Conf.
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* NODE INSPECTOR DRAWER */}
        {selectedNode && (
          <div className="absolute top-4 left-4 z-30 w-80 rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-2xl animate-in fade-in-50">
            <div className="flex items-start justify-between pb-3 border-b border-[#E8EAF3]">
              <div>
                <span className="text-[10px] font-bold text-[#5146E5] uppercase tracking-wider">
                  {selectedNode.type === 'person' ? 'Person Inspector' : 'Commitment Inspector'}
                </span>
                <h3 className="text-sm font-bold text-[#172044] mt-0.5">
                  {selectedNode.type === 'person'
                    ? (selectedNode.data as Person).display_name
                    : (selectedNode.data as Commitment).title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#64708B] hover:text-[#172044]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {selectedNode.type === 'person' ? (
                <>
                  <p className="text-[#64708B]">
                    Org: <span className="font-semibold text-[#172044]">{(selectedNode.data as Person).organization}</span>
                  </p>
                  <p className="text-[#64708B]">
                    Email: <span className="font-semibold text-[#172044]">{(selectedNode.data as Person).email}</span>
                  </p>
                  <p className="text-[#64708B]">
                    Affinity Score:{' '}
                    <span className="font-bold text-[#24B8A5]">
                      {Math.round((selectedNode.data as Person).relationship_score * 100)}%
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[#64708B]">
                    Status:{' '}
                    <span className="font-bold text-[#5146E5] capitalize">
                      {(selectedNode.data as Commitment).status}
                    </span>
                  </p>
                  <p className="text-[#64708B]">
                    Stakeholder:{' '}
                    <span className="font-semibold text-[#172044]">
                      {(selectedNode.data as Commitment).person_name || 'Unassigned'}
                    </span>
                  </p>
                  <p className="text-[#64708B]">
                    Due Date:{' '}
                    <span className="font-semibold text-[#172044]">
                      {(selectedNode.data as Commitment).due_date
                        ? new Date((selectedNode.data as Commitment).due_date!).toLocaleDateString()
                        : 'None'}
                    </span>
                  </p>
                  <button
                    onClick={() => onSelectCommitment(selectedNode.data as Commitment)}
                    className="w-full mt-2 rounded-xl bg-[#5146E5] py-2 text-xs font-bold text-white hover:bg-[#4338CA] transition-colors"
                  >
                    View Full Details
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
