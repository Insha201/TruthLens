import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Database, Cpu, Share2, Server, HelpCircle, CheckCircle } from 'lucide-react';

interface LayerInfo {
  id: string;
  name: string;
  subtitle: string;
  components: string[];
  techTooltip: string;
  color: string;
}

export const TechnologySection: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const layers: LayerInfo[] = [
    {
      id: 'ingestion',
      name: 'Layer 1: Ingestion & Deduplication',
      subtitle: 'Real-time social stream processing',
      components: ['Redis / Upstash Streaming', 'SHA-256 Hash Dedup', 'TTL Cache'],
      techTooltip: 'Redis (Upstash) drops already-seen posts before compute, keyed by post hash with TTL.',
      color: '#FF8C42',
    },
    {
      id: 'pipeline',
      name: 'Layer 2: Agentic Pipeline Orchestration',
      subtitle: 'Four autonomous AI agents in sequence',
      components: ['LangGraph State Engine', 'Groq API Llama-3-70B', 'PyTorch Geometric GNN'],
      techTooltip: 'LangGraph coordinates four agents in sequence using Groq API for sub-second LLM inference.',
      color: '#17C3A0',
    },
    {
      id: 'storage',
      name: 'Layer 3: Graph & Vector Knowledge Base',
      subtitle: 'Spread topology + Grounded fact retrieval',
      components: ['Neo4j AuraDB Spread Graph', 'Pinecone Vector Store', 'Chroma Fallback'],
      techTooltip: 'Neo4j stores Post, User, Claim, Source nodes; Pinecone holds indexed passages from WHO/Snopes/PolitiFact.',
      color: '#2EE6A6',
    },
    {
      id: 'output',
      name: 'Layer 4: API & Human-In-The-Loop Station',
      subtitle: 'FastAPI backend + Streamlit dashboard',
      components: ['FastAPI Endpoints', 'Mandatory HITL Gate (Sev ≥ 8)', 'Immutable Audit Log'],
      techTooltip: 'FastAPI exposes /api/ingest & /api/claims with a human review gate for high-severity threats.',
      color: '#F5F6FA',
    },
  ];

  return (
    <section id="technology" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
          >
            <Layers size={14} />
            <span>Architecture Breakdown</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] uppercase tracking-tight"
          >
            Under The Hood
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2]"
          >
            A four-layer distributed architecture engineered for sub-90-second detection, origin tracing, and source-grounded response.
          </motion.p>
        </div>

        {/* 4-Layer Interactive Diagram */}
        <div className="space-y-4">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="feed-glass-card p-6 md:p-8 relative group border-white/10 hover:border-[#17C3A0]/40 cursor-pointer"
              onMouseEnter={() => setActiveTooltip(layer.id)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: layer.color, boxShadow: `0 0 12px ${layer.color}` }}
                    />
                    <h3 className="font-sans-display text-xl md:text-2xl font-bold text-[#F5F6FA]">
                      {layer.name}
                    </h3>
                  </div>
                  <p className="text-sm font-editorial text-[#9AA3B2] pl-6">{layer.subtitle}</p>
                </div>

                {/* Micro Component Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {layer.components.map((comp) => (
                    <span
                      key={comp}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-[#F5F6FA] group-hover:border-[#17C3A0]/30 transition-colors"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover Tooltip Box */}
              {activeTooltip === layer.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-[#17C3A0] font-sans-display font-medium bg-[#17C3A0]/5 p-3 rounded-lg border border-[#17C3A0]/20"
                >
                  <CheckCircle size={16} className="shrink-0" />
                  <span>{layer.techTooltip}</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
