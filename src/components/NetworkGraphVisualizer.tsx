import React, { useState } from 'react';
import { GitBranch, ShieldCheck, AlertOctagon, Info, Activity } from 'lucide-react';
import { IncidentClaim, NetworkNode } from '../types';
import { formatReach } from '../lib/ui';

interface NetworkGraphVisualizerProps {
  incident: IncidentClaim;
  onNavigateBackToPipeline?: () => void;
}

export const NetworkGraphVisualizer: React.FC<NetworkGraphVisualizerProps> = ({ incident }) => {
  const [simulationMode, setSimulationMode] = useState<'uncontained' | 'contained'>('contained');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(
    incident.spread?.networkNodes[0] || null,
  );

  const spread = incident.spread;
  const nodes = spread?.networkNodes || [];
  const edges = spread?.networkEdges || [];
  const r0 = spread?.r0ViralFactor;

  const uncontained = spread?.projected6hReachUncontained ?? 0;
  const contained = spread?.projected6hReachContained ?? 0;
  const reduction = spread?.reductionPercentage ?? 0;
  const containedPct = uncontained > 0 ? Math.max(3, Math.round((contained / uncontained) * 100)) : 0;

  // Count observed outlets from the Origin Tracer's timeline, NOT from node
  // types: when there is no provenance the graph still draws a placeholder
  // anchor, and counting that as an outlet reported "1 outlet observed" for
  // claims that actually had none.
  const realOutlets = incident.origin?.timeline?.length ?? 0;
  const projectedCount = nodes.filter(
    (n) => n.type === 'community' || n.type === 'susceptible_hub',
  ).length;

  const getNodeColor = (node: NetworkNode) => {
    if (node.type === 'seed') return { fill: '#dc2626', stroke: '#f87171' };
    if (node.type === 'bridge') return { fill: '#d97706', stroke: '#fbbf24' };
    // projected clusters: green when contained, rose when not
    return simulationMode === 'contained'
      ? { fill: '#059669', stroke: '#34d399' }
      : { fill: '#e11d48', stroke: '#fb7185' };
  };

  const isPlaceholder = (n: NetworkNode) => n.id === 'no-outlet';

  const roleText = (node: NetworkNode) => {
    if (isPlaceholder(node)) {
      return 'Placeholder only. The Origin Tracer found no source URL for this claim, so no outlet could be recorded — this node just anchors the projected clusters.';
    }
    switch (node.type) {
      case 'seed':
        return 'First outlet on record carrying this claim — treated as the origin.';
      case 'bridge':
        return 'A later outlet that re-published the claim, extending its reach.';
      case 'susceptible_hub':
        return 'Projected mainstream / aggregator cluster — the last step before wide exposure. Model estimate, not an observed node.';
      default:
        return 'Projected audience cluster at risk if spread continues. Model estimate, not an observed node.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400">
              <GitBranch className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Spread Topology</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {realOutlets === 0
              ? 'No outlet provenance on record for this claim (the solid node is a placeholder). '
              : `${realOutlets} outlet${realOutlets === 1 ? '' : 's'} observed carrying this claim (solid). `}
            {projectedCount} projected susceptible cluster{projectedCount === 1 ? '' : 's'} (dashed), sized by the risk score.
          </p>
        </div>

        {/* Contained / uncontained toggle */}
        <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex space-x-1 self-start md:self-auto">
          <button
            onClick={() => setSimulationMode('contained')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              simulationMode === 'contained'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Contained</span>
          </button>
          <button
            onClick={() => setSimulationMode('uncontained')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              simulationMode === 'uncontained'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Uncontained</span>
          </button>
        </div>
      </div>

      {/* Canvas + inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between z-10 mb-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">TOPOLOGY:</span>
              <span className="text-purple-400 font-bold">{nodes.length} nodes</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-bold">{edges.length} edges</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">
                R0: <strong className="text-amber-400">{r0 ?? '—'}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  simulationMode === 'contained'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {simulationMode === 'contained'
                  ? reduction
                    ? `${reduction}% reach avoided`
                    : 'contained'
                  : 'unmitigated growth'}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full h-full relative">
            <svg viewBox="0 0 850 300" className="w-full h-full select-none">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g opacity="0.12" stroke="#38bdf8" strokeWidth="0.5">
                {[50, 100, 150, 200, 250].map((y) => (
                  <line key={`gy-${y}`} x1="0" y1={y} x2="850" y2={y} strokeDasharray="4 4" />
                ))}
                {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                  <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="300" strokeDasharray="4 4" />
                ))}
              </g>

              {/* Edges */}
              {edges.map((edge, idx) => {
                const s = nodes.find((n) => n.id === edge.source);
                const t = nodes.find((n) => n.id === edge.target);
                if (!s || !t) return null;
                const projectedTarget = t.type === 'community' || t.type === 'susceptible_hub';
                const blocked = simulationMode === 'contained' && projectedTarget;
                return (
                  <line
                    key={`edge-${idx}`}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={blocked ? '#10b981' : projectedTarget ? '#f43f5e' : '#fb7185'}
                    strokeWidth={Math.max(1.5, edge.intensity * 3)}
                    strokeDasharray={projectedTarget ? '5 4' : 'none'}
                    opacity={blocked ? 0.55 : 0.9}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const color = getNodeColor(node);
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform duration-150 hover:scale-110"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  >
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 6}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size}
                      fill={color.fill}
                      stroke={color.stroke}
                      strokeWidth="2.5"
                      strokeDasharray={node.type === 'community' || node.type === 'susceptible_hub' ? '4 3' : 'none'}
                      filter={node.type === 'seed' || isSelected ? 'url(#glow)' : undefined}
                    />
                    <text
                      x={node.x}
                      y={node.y + node.size + 14}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="border-t border-slate-800/80 pt-3 mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                <span>Origin outlet</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                <span>Amplifying outlet</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-slate-400 inline-block" />
                <span>Projected cluster</span>
              </span>
            </div>
            <span className="text-slate-500">Click a node for details</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                NODE DETAILS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-semibold uppercase">
                {selectedNode ? selectedNode.type.replace('_', ' ') : 'none'}
              </span>
            </div>

            {selectedNode ? (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Label</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedNode.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">id: {selectedNode.id}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-mono">Links</span>
                    <strong className="text-base text-cyan-600 dark:text-cyan-400">{selectedNode.degree}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-mono">Kind</span>
                    <strong className="text-xs uppercase text-slate-700 dark:text-slate-300">
                      {isPlaceholder(selectedNode)
                        ? 'placeholder'
                        : selectedNode.type === 'seed' || selectedNode.type === 'bridge'
                        ? 'observed'
                        : 'projected'}
                    </strong>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-600 dark:text-slate-400 block mb-0.5 font-mono">Role</strong>
                  {roleText(selectedNode)}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">Select a node to inspect it</div>
            )}
          </div>

          {/* 6-hour projection — real model numbers */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg transition-colors">
            <h3 className="text-xs font-mono uppercase text-slate-800 dark:text-slate-300 font-bold mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>6-hour reach projection</span>
            </h3>

            {spread ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-rose-600 dark:text-rose-400">Uncontained</span>
                    <span className="text-slate-800 dark:text-slate-300 font-bold">
                      ~{formatReach(uncontained)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400">With counter-narrative</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      ~{formatReach(contained)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${containedPct}%` }} />
                  </div>
                </div>

                {reduction > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <strong>{reduction}% of projected reach avoided</strong> if a counter-narrative
                    holds R0 near 1. Reach figures are order-of-magnitude estimates from per-platform
                    audience proxies, not measured views.
                  </div>
                )}

                {spread.drivers?.length ? (
                  <div className="pt-1">
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Risk drivers</div>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      {spread.drivers.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-cyan-500/80">Spread not yet modelled for this claim.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
