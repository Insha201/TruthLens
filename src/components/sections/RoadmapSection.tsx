import React from 'react';
import { motion } from 'motion/react';
import { Flag, CheckCircle, Clock, CircleDashed } from 'lucide-react';

export const RoadmapSection: React.FC = () => {
  const milestones = [
    {
      phase: 'Phase 1',
      title: 'Environment & Core Architecture',
      desc: 'LangGraph state engine, Redis Upstash streaming setup, FastAPI endpoints.',
      status: 'Complete',
      date: 'Q3 2024',
    },
    {
      phase: 'Phase 2',
      title: 'Claim Detector Agent (Groq API)',
      desc: 'LLM classification, confidence scoring gauge, <0.6 drop safety filter.',
      status: 'Complete',
      date: 'Q3 2024',
    },
    {
      phase: 'Phase 3',
      title: 'Origin Tracer & Neo4j Graph',
      desc: 'Neo4j AuraDB spread graph schema, POSTED / MATCHES lineage tracing.',
      status: 'In Progress',
      date: 'Q4 2024',
    },
    {
      phase: 'Phase 4',
      title: 'PyTorch Geometric GNN Predictor',
      desc: 'Graph neural network running over Neo4j topology for community reach prediction.',
      status: 'In Progress',
      date: 'Q4 2024',
    },
    {
      phase: 'Phase 5',
      title: 'RAG Counter-Narrative & HITL Gate',
      desc: 'Pinecone vector store indexing, mandatory human editor gating station.',
      status: 'Planning',
      date: 'Q1 2025',
    },
  ];

  return (
    <section id="roadmap" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
          >
            <Flag size={14} />
            <span>Development Milestones</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] uppercase tracking-tight"
          >
            Product Roadmap
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2]"
          >
            Honest development progress tracking from core setup through multi-agent deployment.
          </motion.p>
        </div>

        {/* Milestone Rail */}
        <div className="relative border-l-2 border-white/10 ml-4 md:ml-32 space-y-8 pl-8">
          {milestones.map((m, index) => (
            <motion.div
              key={m.phase}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative feed-glass-card p-6 border-white/10 hover:border-[#17C3A0]"
            >
              {/* Rail Node Bullet */}
              <div className="absolute -left-[45px] top-6 w-6 h-6 rounded-full bg-[#0A0F1E] border-2 border-[#17C3A0] flex items-center justify-center">
                {m.status === 'Complete' ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#17C3A0]" />
                ) : m.status === 'In Progress' ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF8C42] animate-ping" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9AA3B2]" />
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#17C3A0] uppercase">{m.phase}</span>
                  <h3 className="font-sans-display text-xl font-bold text-[#F5F6FA]">{m.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold ${
                    m.status === 'Complete'
                      ? 'bg-[#17C3A0]/20 text-[#17C3A0]'
                      : m.status === 'In Progress'
                      ? 'bg-[#FF8C42]/20 text-[#FF8C42]'
                      : 'bg-white/10 text-[#9AA3B2]'
                  }`}>
                    {m.status}
                  </span>
                  <span className="text-[#9AA3B2]">{m.date}</span>
                </div>
              </div>

              <p className="font-editorial text-sm text-[#9AA3B2]">
                {m.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
