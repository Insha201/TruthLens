import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, FileCheck, Eye, Cpu, Award } from 'lucide-react';

export const WhyTruthLensSection: React.FC = () => {
  const valueTiles = [
    {
      icon: Cpu,
      title: 'No Wasted Compute on Noise',
      desc: 'Claims scoring below 0.6 confidence are dropped immediately at ingestion—eliminating false alarms and unnecessary server load.',
      highlight: '< 0.6 Drop',
    },
    {
      icon: Lock,
      title: 'Human-in-the-Loop Gating',
      desc: 'Claims scoring ≥ 8 severity are locked behind mandatory human editor review before any rebuttal can be published.',
      highlight: 'Severity ≥ 8 Gate',
    },
    {
      icon: FileCheck,
      title: 'Zero Hallucinated Corrections',
      desc: 'RAG-only retrieval over indexed fact-check databases (WHO, Snopes, PolitiFact). Returns "Insufficient Evidence" if unsupported.',
      highlight: '100% Source-Cited',
    },
    {
      icon: Eye,
      title: 'Immutable Audit Trail',
      desc: 'Every detection score, origin trace, spread graph prediction, draft fragment, and human decision is logged permanently.',
      highlight: 'Full Lineage Log',
    },
  ];

  return (
    <section id="why" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
          >
            <Shield size={14} />
            <span>Built On Absolute Trust</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] uppercase tracking-tight"
          >
            Why TruthLens?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2]"
          >
            Safety guarantees designed to prevent censorship, hallucinated claims, and false accusations.
          </motion.p>
        </div>

        {/* 4 Value Proposition Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {valueTiles.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <motion.div
                key={tile.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="feed-glass-card p-8 border-white/10 hover:border-[#17C3A0]/40 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#17C3A0]/10 border border-[#17C3A0]/30 flex items-center justify-center text-[#17C3A0]">
                      <Icon size={24} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-[#17C3A0] uppercase">
                      {tile.highlight}
                    </span>
                  </div>

                  <h3 className="font-sans-display text-2xl font-extrabold text-[#F5F6FA]">
                    {tile.title}
                  </h3>

                  <p className="font-editorial text-[#9AA3B2] leading-relaxed">
                    {tile.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
