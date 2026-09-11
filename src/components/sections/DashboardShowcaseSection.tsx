import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Search, ShieldCheck, AlertCircle, ArrowRight, ExternalLink, CheckCircle2, UserCheck, BarChart3 } from 'lucide-react';

interface DashboardShowcaseSectionProps {
  onOpenFullApp: () => void;
}

export const DashboardShowcaseSection: React.FC<DashboardShowcaseSectionProps> = ({ onOpenFullApp }) => {
  const [selectedClaimId, setSelectedClaimId] = useState('CLM-9082');

  const claims = [
    {
      id: 'CLM-9082',
      platform: 'NewsAPI',
      author: 'thefreepressjournal.in',
      claimText: 'Emergency warning: Water supply in Region 4 contaminated with synthetic chemicals.',
      confidence: 0.94,
      severity: 9,
      status: 'pending_review',
      origin: 'Post_88921 (@bot_farm_x)',
      sources: ['WHO-Ref-882', 'PolitiFact-ID-9011'],
      draft: 'According to WHO & local health authorities, water testing in Region 4 confirmed 100% safe quality with zero contamination.',
    },
    {
      id: 'CLM-9083',
      platform: 'YouTube',
      author: 'Global Insights Channel',
      claimText: 'Central bank announces immediate replacement of paper currency next week.',
      confidence: 0.86,
      severity: 6,
      status: 'published',
      origin: 'Post_77412 (@crypto_leak)',
      sources: ['Reuters-FactCheck-102'],
      draft: 'The Central Bank officially denied any currency replacement schedule; current notes remain legal tender.',
    },
    {
      id: 'CLM-9084',
      platform: 'RSS Feed',
      author: 'Snopes',
      claimText: 'New satellite images show hidden facility built overnight in desert.',
      confidence: 0.72,
      severity: 4,
      status: 'published',
      origin: 'Post_66190 (Imgur mirror)',
      sources: ['AP-News-Verification-44'],
      draft: 'Satellite imagery matches a standard solar farm installation under construction since January 2024.',
    },
  ];

  const currentClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  return (
    <section id="dashboard" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
          >
            <Activity size={14} />
            <span>Operator Control Center</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] uppercase tracking-tight"
          >
            Live Operator Dashboard
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2]"
          >
            Real-time incident queue, origin mapping, and human-in-the-loop review station.
          </motion.p>
        </div>

        {/* Dashboard Mockup Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="feed-glass-card p-6 md:p-8 border-white/10 rounded-2xl space-y-6"
        >
          {/* Top Bar of Mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#17C3A0] animate-pulse" />
              <span className="font-sans-display text-sm font-bold text-[#F5F6FA] uppercase tracking-wider">
                Streamlit Feed — Active Incidents ({claims.length})
              </span>
            </div>
            <button
              onClick={onOpenFullApp}
              className="px-4 py-2 rounded-lg bg-[#17C3A0] hover:bg-[#2EE6A6] text-[#0A0F1E] font-sans-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
            >
              <span>Launch Full Interactive App</span>
              <ExternalLink size={14} />
            </button>
          </div>

          {/* Grid: Feed on Left, Detail on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Claim Feed */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-mono text-[#9AA3B2] uppercase tracking-widest mb-2">
                Flagged Claim Stream
              </div>
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedClaimId === claim.id
                      ? 'bg-[#17C3A0]/10 border-[#17C3A0] shadow-md shadow-[#17C3A0]/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#17C3A0] font-bold">{claim.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                      claim.status === 'pending_review' ? 'bg-[#FF5A4E]/20 text-[#FF5A4E]' : 'bg-[#17C3A0]/20 text-[#17C3A0]'
                    }`}>
                      {claim.status === 'pending_review' ? 'Gated Review' : 'Published'}
                    </span>
                  </div>
                  <div className="font-editorial text-sm text-[#F5F6FA] line-clamp-2 font-medium">
                    "{claim.claimText}"
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9AA3B2] mt-2 font-sans-display">
                    <span>{claim.platform}</span>
                    <span>Sev: {claim.severity}/10</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Claim Detail View */}
            <div className="lg:col-span-7 bg-[#0A0F1E] p-6 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-xs font-mono text-[#17C3A0]">{currentClaim.id} — Detail Analysis</div>
                  <div className="font-sans-display text-sm font-bold text-white mt-0.5">
                    Platform: {currentClaim.platform} ({currentClaim.author})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#9AA3B2] uppercase">Confidence Score</div>
                  <div className="text-lg font-bold font-sans-display text-[#17C3A0]">
                    {(currentClaim.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Origin & RAG Draft Box */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-[#9AA3B2] uppercase">Origin Node Lineage</div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs font-mono text-[#17C3A0]">
                  Origin: {currentClaim.origin}
                </div>

                <div className="text-xs font-mono text-[#9AA3B2] uppercase pt-2">Generated Counter-Narrative Draft</div>
                <div className="p-4 bg-white/5 rounded-xl border border-[#17C3A0]/30 font-editorial text-sm text-[#F5F6FA] leading-relaxed italic">
                  "{currentClaim.draft}"
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-mono text-[#9AA3B2]">Sources:</span>
                  {currentClaim.sources.map((src) => (
                    <span key={src} className="px-2 py-0.5 rounded bg-[#17C3A0]/20 border border-[#17C3A0]/40 text-[10px] font-mono text-[#17C3A0]">
                      {src}
                    </span>
                  ))}
                </div>
              </div>

              {/* Gated Review Action Bar */}
              {currentClaim.severity >= 8 && (
                <div className="p-4 bg-[#FF5A4E]/10 border border-[#FF5A4E]/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-2 text-xs font-sans-display text-[#FF5A4E] font-bold">
                    <UserCheck size={18} />
                    <span>MANDATORY EDITOR APPROVAL REQUIRED (Sev ≥ 8)</span>
                  </div>
                  <button
                    onClick={onOpenFullApp}
                    className="px-4 py-2 rounded-lg bg-[#17C3A0] hover:bg-[#2EE6A6] text-[#0A0F1E] text-xs font-sans-display font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Approve & Dispatch Rebuttal
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
