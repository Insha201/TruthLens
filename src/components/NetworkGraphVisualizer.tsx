import React, { useState } from 'react';
import { 
  GitBranch, 
  ShieldCheck, 
  AlertOctagon, 
  Info, 
  Maximize2, 
  RefreshCw, 
  Sliders, 
  Users, 
  Activity,
  Layers
} from 'lucide-react';
import { IncidentClaim, NetworkNode, NetworkEdge } from '../types';

interface NetworkGraphVisualizerProps {
  incident: IncidentClaim;
  onNavigateBackToPipeline?: () => void;
}

export const NetworkGraphVisualizer: React.FC<NetworkGraphVisualizerProps> = ({
  incident,
  onNavigateBackToPipeline,
}) => {
  const [simulationMode, setSimulationMode] = useState<'uncontained' | 'contained'>('contained');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(
    incident.spread?.networkNodes[0] || null
  );

  const nodes = incident.spread?.networkNodes || [];
  const edges = incident.spread?.networkEdges || [];
  const r0 = incident.spread?.r0ViralFactor || 3.4;

  const getNodeColor = (node: NetworkNode) => {
    if (simulationMode === 'contained' && node.status === 'at_risk') {
      return { fill: '#059669', stroke: '#34d399', text: 'Shielded' }; // emerald contained
    }
    if (node.type === 'seed') {
      return { fill: '#dc2626', stroke: '#f87171', text: 'Patient Zero' };
    }
    if (node.type === 'bot_amplifier') {
      return { fill: '#ea580c', stroke: '#fb923c', text: 'Bot Swarm' };
    }
    if (node.type === 'bridge') {
      return { fill: '#d97706', stroke: '#fbbf24', text: 'Cross-Bridge' };
    }
    if (node.type === 'community') {
      return { fill: simulationMode === 'contained' ? '#059669' : '#e11d48', stroke: simulationMode === 'contained' ? '#34d399' : '#fb7185', text: 'Echo Chamber' };
    }
    return { fill: '#334155', stroke: '#64748b', text: 'Mainstream' };
  };

  return (
    <div className="space-y-6">
      {/* Visualizer Header */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400">
              <GitBranch className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Graph-Based Cascade Spread Predictor & Topology
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Visualizing multi-agent network cascades, seed origin bot clusters, and counter-narrative containment perimeter.
          </p>
        </div>

        {/* Mode Toggle Controls */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex space-x-1">
            <button
              id="btn-mode-contained"
              onClick={() => setSimulationMode('contained')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                simulationMode === 'contained'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>With 90s Counter-Narrative</span>
            </button>

            <button
              id="btn-mode-uncontained"
              onClick={() => setSimulationMode('uncontained')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                simulationMode === 'uncontained'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Uncontained Cascade</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Interactive SVG Network Graph (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden flex flex-col min-h-[460px]">
          {/* Top Status Overlay */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">CASCADE TOPOLOGY:</span>
              <span className="text-purple-400 font-bold">{nodes.length} Nodes</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-bold">{edges.length} Propagation Edges</span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">R0: <strong className="text-amber-400">{r0}</strong></span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                simulationMode === 'contained' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {simulationMode === 'contained' ? '82.8% Cascade Suppressed' : 'Exponential Infection'}
              </span>
            </div>
          </div>

          {/* SVG Canvas Stage */}
          <div className="flex-1 w-full h-full relative">
            <svg
              viewBox="0 0 850 300"
              className="w-full h-full select-none"
            >
              <defs>
                {/* Glow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Radial gradients for nodes */}
                <radialGradient id="grad-seed" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#991b1b" />
                </radialGradient>
                <radialGradient id="grad-contained" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#047857" />
                </radialGradient>
              </defs>

              {/* Grid Background Lines */}
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
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isBlocked = simulationMode === 'contained' && (targetNode.type === 'community' || targetNode.type === 'susceptible_hub');

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isBlocked ? '#10b981' : edge.active ? '#f43f5e' : '#475569'}
                      strokeWidth={isBlocked ? 2 : edge.intensity * 3}
                      strokeDasharray={isBlocked ? '4 3' : 'none'}
                      opacity={isBlocked ? 0.7 : 0.85}
                    />
                    {/* Animated pulse dots along active propagation links */}
                    {edge.active && !isBlocked && (
                      <circle r="3" fill="#fb7185">
                        <animateMotion
                          path={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`}
                          dur={`${2.5 / (edge.intensity || 1)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Containment Shield Area Overlay in Contained Mode */}
              {simulationMode === 'contained' && (
                <g>
                  <path
                    d="M 400 30 Q 550 20 700 80 L 700 280 Q 550 290 400 260 Z"
                    fill="#059669"
                    fillOpacity="0.08"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  <text x="500" y="55" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    🛡️ RAG COUNTER-NARRATIVE INOCULATION ZONE
                  </text>
                </g>
              )}

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
                    {/* Outer selection ring */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 6}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin"
                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size}
                      fill={color.fill}
                      stroke={color.stroke}
                      strokeWidth="2.5"
                      filter={node.type === 'seed' || isSelected ? 'url(#glow)' : undefined}
                    />

                    {/* Node Label */}
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

          {/* Legend Strip */}
          <div className="border-t border-slate-800/80 pt-3 mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                <span>Seed Patient Zero</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                <span>Bot Swarm Amplifier</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Inoculated Hub</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                <span>Mainstream Fringe</span>
              </span>
            </div>
            <span className="text-slate-500">Click any node to inspect properties</span>
          </div>
        </div>

        {/* Right Sidebar: Node Inspector & Cascade Forecast */}
        <div className="space-y-6">
          {/* Node Inspector Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                NODE TELEMETRY
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-semibold uppercase">
                {selectedNode ? selectedNode.type.replace('_', ' ') : 'None'}
              </span>
            </div>

            {selectedNode ? (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Node Identifier:</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedNode.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">ID: {selectedNode.id}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-mono">Degree (Links):</span>
                    <strong className="text-base text-cyan-600 dark:text-cyan-400">{selectedNode.degree}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-mono">Status:</span>
                    <strong className={`text-xs uppercase ${
                      simulationMode === 'contained' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {simulationMode === 'contained' ? 'Shielded' : selectedNode.status}
                    </strong>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-600 dark:text-slate-400 block mb-0.5 font-mono">Cascade Role:</strong>
                  {selectedNode.type === 'seed' && 'Original propagation source. High coordination probability and scripted publishing cadence.'}
                  {selectedNode.type === 'bot_amplifier' && 'Automated sockpuppet accounts executing synchronized quote-retweets and hashtag flooding.'}
                  {selectedNode.type === 'bridge' && 'High-follower influencer bridges connecting fringe channels to public mainstream feeds.'}
                  {selectedNode.type === 'community' && 'Highly receptive demographic echo chamber targeted for viral emotional engagement.'}
                  {selectedNode.type === 'susceptible_hub' && 'General news aggregation and syndication wire. Critical to inoculate before breach.'}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Select a node on the canvas to inspect telemetry
              </div>
            )}
          </div>

          {/* 6-Hour Reach Forecast Comparison */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg transition-colors">
            <h3 className="text-xs font-mono uppercase text-slate-800 dark:text-slate-300 font-bold mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>6-Hour Containment Model</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-rose-600 dark:text-rose-400">Uncontained Trajectory</span>
                  <span className="text-slate-800 dark:text-slate-300 font-bold">2,850,000 users</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">With 90s Counter-Narrative</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">490,000 users</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '17.2%' }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-800 dark:text-emerald-300">
                <strong>82.8% Infection Reduction:</strong> Inoculating bridge influencer nodes at T+85s stops second-order cascade transmission into regional subreddits and mainstream feeds.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
