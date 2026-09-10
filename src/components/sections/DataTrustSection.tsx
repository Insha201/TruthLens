import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, ShieldCheck, Share2, CheckCircle2, Award, FileText, User } from 'lucide-react';

export const DataTrustSection: React.FC = () => {
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  const graphEdges = [
    { from: 'Post', to: 'User', rel: 'POSTED_BY', desc: 'Links individual social post to author handle and follower graph.' },
    { from: 'Post', to: 'Claim', rel: 'MATCHES_CLAIM', desc: 'Maps semantically similar post variations to a central canonical claim node.' },
    { from: 'User', to: 'Post', rel: 'SHARED', desc: 'Tracks re-shares, retweets, and amplification paths across networks.' },
    { from: 'Claim', to: 'Source', rel: 'VERIFIED_BY', desc: 'Connects claim directly to indexed fact-checking passages in vector store.' },
  ];

  const trustedOrgs = [
    { name: 'World Health Organization', label: 'WHO', type: 'Global Public Health Authority', color: '#17C3A0' },
    { name: 'Snopes', label: 'Snopes.com', type: 'Independent Fact-Checking Network', color: '#FF8C42' },
    { name: 'PolitiFact', label: 'PolitiFact', type: 'Pulitzer Prize-Winning Fact Checker', color: '#2EE6A6' },
  ];

  return (
    <section id="data-trust" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
          >
            <Database size={14} />
            <span>Structured Graph & Trust Index</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] uppercase tracking-tight"
          >
            Data Model & Grounding
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2]"
          >
            Neo4j property graph schema integrated with accredited global fact-checking organizations.
          </motion.p>
        </div>

        {/* Graph Data Model Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Node Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-7 feed-glass-card p-8 border-white/10 relative min-h-[360px] flex flex-col justify-between"
          >
            <div className="text-xs font-mono text-[#17C3A0] uppercase tracking-widest border-b border-white/10 pb-4">
              Neo4j Property Graph Topology (Click Edge to Inspect)
            </div>

            {/* Micro Graph Diagram Nodes */}
            <div className="grid grid-cols-2 gap-6 my-6">
              {[
                { name: 'Post Node', icon: FileText, sub: 'Hash, Platform, Timestamp' },
                { name: 'User Node', icon: User, sub: 'Handle, Follower Count, Degree' },
                { name: 'Claim Node', icon: ShieldCheck, sub: 'Severity, Confidence, Status' },
                { name: 'Source Node', icon: Award, sub: 'WHO / Snopes / PolitiFact Ref' },
              ].map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.name}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 hover:border-[#17C3A0] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#17C3A0]/10 border border-[#17C3A0]/30 flex items-center justify-center text-[#17C3A0]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-sans-display text-sm font-bold text-[#F5F6FA]">{n.name}</div>
                      <div className="font-mono text-[10px] text-[#9AA3B2]">{n.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Edge Relationship List */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              {graphEdges.map((edge) => (
                <div
                  key={edge.rel}
                  onClick={() => setActiveEdge(edge.rel)}
                  className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${
                    activeEdge === edge.rel ? 'bg-[#17C3A0]/20 border-[#17C3A0] text-white' : 'bg-white/5 border-transparent text-[#9AA3B2] hover:text-white'
                  }`}
                >
                  <span className="font-bold text-[#17C3A0]">({edge.from}) -[:{edge.rel}]-&gt; ({edge.to})</span>
                  <span className="text-[10px] font-sans-display opacity-80">{edge.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Trusted Sources */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono text-[#9AA3B2] uppercase tracking-widest mb-2">
              Vector Store Grounding Partners
            </div>
            {trustedOrgs.map((org) => (
              <motion.div
                key={org.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="feed-glass-card p-6 border-white/10 flex items-center justify-between hover:border-[#17C3A0]"
              >
                <div className="space-y-1">
                  <div className="font-sans-display text-xl font-extrabold text-[#F5F6FA] flex items-center gap-2">
                    <span>{org.name}</span>
                    <CheckCircle2 size={16} className="text-[#17C3A0]" />
                  </div>
                  <div className="font-editorial text-xs text-[#9AA3B2]">{org.type}</div>
                </div>
                <span className="px-3 py-1 rounded bg-[#17C3A0]/10 border border-[#17C3A0]/30 font-mono text-xs text-[#17C3A0]">
                  VERIFIED
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
