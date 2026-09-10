import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, GitBranch, Network, FileCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Scale } from 'lucide-react';

export const AgentsSpotlightSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'detector' | 'tracer' | 'predictor' | 'drafter'>('detector');
  const [showRAGFallbackState, setShowRAGFallbackState] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0.88);

  const agents = [
    {
      id: 'detector' as const,
      name: '01. Claim Detector Agent',
      tech: 'Groq API (Llama-3-70B)',
      role: 'Classifies incoming posts with LLM inference, assigns confidence score, and immediately drops anything below 0.6 confidence.',
      rule: 'Claims < 0.6 confidence dropped instantly — zero wasted compute.',
      icon: ShieldAlert,
    },
    {
      id: 'tracer' as const,
      name: '02. Origin Tracer Agent',
      tech: 'Neo4j AuraDB Spread Graph',
      role: 'Traces surviving claims back to earliest matching post & user, creating a verified point-of-origin graph.',
      rule: 'Constructs verified lineage across POSTED, MATCHES, and SHARED edges.',
      icon: GitBranch,
    },
    {
      id: 'predictor' as const,
      name: '03. Spread Predictor Agent',
      tech: 'PyTorch Geometric GNN',
      role: 'Runs a Graph Neural Network over Neo4j topology to predict which target communities the claim will reach next.',
      rule: 'Models velocity, community clustering, and high-risk hub infection.',
      icon: Network,
    },
    {
      id: 'drafter' as const,
      name: '04. Counter-Narrative Drafter',
      tech: 'Pinecone Vector Store + RAG',
      role: 'Generates evidence-backed corrections strictly from indexed trusted sources (WHO, Snopes, PolitiFact). Never hallucinates.',
      rule: 'Returns "Insufficient Evidence" if no indexed source verifies the claim.',
      icon: FileCheck,
    },
  ];

  return (
    <section id="agents" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
          >
            <ShieldAlert size={14} />
            <span>Autonomous Intelligence Suite</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] uppercase tracking-tight"
          >
            Meet The Four Agents
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2]"
          >
            The core engine of TruthLens: four specialized autonomous agents operating in an immutable pipeline.
          </motion.p>
        </div>

        {/* Pipeline Connecting Thread Tabs */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4 overflow-x-auto">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF5A4E] via-[#FF8C42] to-[#17C3A0] -z-10" />
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = activeTab === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setActiveTab(agent.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#17C3A0] text-[#0A0F1E] shadow-lg shadow-[#17C3A0]/30 scale-105'
                    : 'bg-[#0A0F1E] border border-white/10 text-[#9AA3B2] hover:text-[#F5F6FA] hover:border-white/20'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{agent.name.split('.')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Agent Spotlight Card */}
        {agents
          .filter((a) => a.id === activeTab)
          .map((agent) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="feed-glass-card p-8 lg:p-12 border-[#17C3A0]/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Side: Info */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#17C3A0] uppercase tracking-widest bg-[#17C3A0]/10 px-3 py-1.5 rounded-lg border border-[#17C3A0]/20 w-fit">
                    <span>{agent.tech}</span>
                  </div>

                  <h3 className="font-sans-display text-3xl sm:text-4xl font-extrabold text-[#F5F6FA]">
                    {agent.name}
                  </h3>

                  <p className="font-editorial text-lg text-[#9AA3B2] leading-relaxed">
                    {agent.role}
                  </p>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#17C3A0] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-sans-display uppercase font-bold text-[#F5F6FA]">
                        Safety Benchmark
                      </div>
                      <div className="text-xs font-editorial text-[#9AA3B2] mt-0.5">
                        {agent.rule}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Micro-Illustration */}
                <div className="lg:col-span-6 bg-[#0A0F1E] rounded-2xl p-6 border border-white/10 relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                  {agent.id === 'detector' && (
                    <div className="space-y-6 text-center">
                      <div className="text-xs font-mono text-[#9AA3B2] uppercase tracking-widest">
                        Confidence Threshold Evaluator
                      </div>
                      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="96" cy="96" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
                          <circle
                            cx="96"
                            cy="96"
                            r="70"
                            stroke={confidenceScore >= 0.6 ? '#17C3A0' : '#FF5A4E'}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * confidenceScore)}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <div className="text-3xl font-black font-sans-display text-[#F5F6FA]">
                            {(confidenceScore * 100).toFixed(0)}%
                          </div>
                          <div className={`text-[10px] font-mono font-bold uppercase mt-1 ${confidenceScore >= 0.6 ? 'text-[#17C3A0]' : 'text-[#FF5A4E]'}`}>
                            {confidenceScore >= 0.6 ? 'SURVIVING (≥0.6)' : 'DROPPED (<0.6)'}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setConfidenceScore(0.88)}
                          className="px-3 py-1.5 text-xs font-mono rounded bg-[#17C3A0]/20 text-[#17C3A0] border border-[#17C3A0]/40 cursor-pointer"
                        >
                          High Confidence (0.88)
                        </button>
                        <button
                          onClick={() => setConfidenceScore(0.42)}
                          className="px-3 py-1.5 text-xs font-mono rounded bg-[#FF5A4E]/20 text-[#FF5A4E] border border-[#FF5A4E]/40 cursor-pointer"
                        >
                          Low Confidence (0.42)
                        </button>
                      </div>
                    </div>
                  )}

                  {agent.id === 'tracer' && (
                    <div className="space-y-4 text-center">
                      <div className="text-xs font-mono text-[#9AA3B2] uppercase tracking-widest">
                        Neo4j Origin Lineage Traversal
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left font-mono text-xs space-y-2">
                        <div className="text-[#17C3A0]">[Neo4j Graph Trace] Root Seed Identified</div>
                        <div className="text-white/70">Node: Post_88921 (Platform: X)</div>
                        <div className="text-white/70">Author: @bot_amplifier_09</div>
                        <div className="text-white/70">Path: Seed → Bridge_Hub → Community_Beta</div>
                        <div className="text-[#17C3A0] font-bold">Origin Confidence: 99.4% VERIFIED</div>
                      </div>
                    </div>
                  )}

                  {agent.id === 'predictor' && (
                    <div className="space-y-4 text-center">
                      <div className="text-xs font-mono text-[#9AA3B2] uppercase tracking-widest">
                        PyTorch Geometric GNN Projected Reach
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="p-3 bg-white/5 rounded-lg border border-[#FF5A4E]/30">
                          <div className="text-[10px] font-mono text-[#FF5A4E] uppercase">Target Cluster A</div>
                          <div className="text-sm font-bold text-white font-sans-display">Reddit /r/news</div>
                          <div className="text-xs text-[#FF5A4E] mt-1 font-mono">Risk: 94%</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-[#17C3A0]/30">
                          <div className="text-[10px] font-mono text-[#17C3A0] uppercase">Target Cluster B</div>
                          <div className="text-sm font-bold text-white font-sans-display">Telegram Channels</div>
                          <div className="text-xs text-[#17C3A0] mt-1 font-mono">Risk: 82%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {agent.id === 'drafter' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono text-[#9AA3B2] uppercase tracking-widest">
                          RAG Evidence Synthesis
                        </div>
                        <button
                          onClick={() => setShowRAGFallbackState(!showRAGFallbackState)}
                          className="text-[10px] font-mono underline text-[#17C3A0] cursor-pointer"
                        >
                          Toggle {showRAGFallbackState ? 'Source Found' : 'Fallback State'}
                        </button>
                      </div>

                      {showRAGFallbackState ? (
                        <div className="p-4 bg-[#FF5A4E]/10 border border-[#FF5A4E]/40 rounded-xl space-y-2 text-center">
                          <AlertCircle size={28} className="text-[#FF5A4E] mx-auto" />
                          <div className="font-sans-display text-sm font-bold text-[#FF5A4E]">
                            INSUFFICIENT EVIDENCE
                          </div>
                          <p className="text-xs font-editorial text-[#9AA3B2]">
                            No indexed document in vector store (WHO, Snopes, PolitiFact) confirms or denies this statement. Zero hallucinated output generated.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-white/5 border border-[#17C3A0]/30 rounded-xl space-y-3 font-editorial text-xs text-white">
                          <div className="text-[10px] font-mono text-[#17C3A0] uppercase">
                            Draft Correction (100% Source-Attributed)
                          </div>
                          <p className="italic">
                            "According to official World Health Organization documentation (WHO-2024-C3), the claim regarding water supply contamination is false. Independent testing confirmed zero toxic markers."
                          </p>
                          <div className="flex gap-2 pt-2 border-t border-white/10 font-mono text-[10px] text-[#17C3A0]">
                            <span>Citations: [1] WHO-Ref-882</span>
                            <span>[2] PolitiFact-ID-9011</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
      </div>
    </section>
  );
};
