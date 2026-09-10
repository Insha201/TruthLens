import React from 'react';
import { motion } from 'motion/react';
import { Github, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface FooterSectionProps {
  onOpenAppView?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onOpenAppView }) => {
  return (
    <footer id="footer" className="relative z-10 bg-[#0B0E14] border-t border-white/10 pt-16 pb-12 px-6 md:px-12 text-[#9AA3B2]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Banner: Live Prototype Link */}
        <div className="feed-glass-card p-8 border-[#17C3A0]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-sans-display text-2xl font-extrabold text-[#F5F6FA]">
              Ready to Explore the Live Environment?
            </h3>
            <p className="font-editorial text-sm text-[#9AA3B2]">
              Experience real-time signal injection, agent step-through, and human gating station.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {onOpenAppView && (
              <button
                onClick={onOpenAppView}
                className="px-6 py-3 bg-[#17C3A0] hover:bg-[#2EE6A6] text-[#0A0F1E] font-sans-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#17C3A0]/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Interactive Dashboard</span>
                <ExternalLink size={16} />
              </button>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 border border-white/20 hover:border-white text-[#F5F6FA] font-sans-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
            >
              <Github size={16} />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="TruthLens Logo" className="w-8 h-8 object-contain" />
              <span className="font-editorial text-2xl font-bold text-[#F5F6FA]">TruthLens</span>
            </div>
            <p className="font-editorial text-xs text-[#9AA3B2] leading-relaxed">
              An agentic AI ecosystem against misinformation. Detecting, tracing, predicting, and countering false claims in under 90 seconds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 font-sans-display text-xs">
            <div className="font-bold text-[#F5F6FA] uppercase tracking-wider">Navigation</div>
            <ul className="space-y-2">
              <li><a href="#hero" className="hover:text-[#17C3A0] transition-colors">01. Introduction</a></li>
              <li><a href="#technology" className="hover:text-[#17C3A0] transition-colors">03. Technology</a></li>
              <li><a href="#agents" className="hover:text-[#17C3A0] transition-colors">04. Four Agents</a></li>
              <li><a href="#dashboard" className="hover:text-[#17C3A0] transition-colors">06. Operator Dashboard</a></li>
              <li><a href="#roadmap" className="hover:text-[#17C3A0] transition-colors">08. Roadmap</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <div className="font-bold font-sans-display text-[#F5F6FA] uppercase tracking-wider">Tech Stack</div>
            <ul className="space-y-1.5 text-white/70">
              <li>Groq API (Ultra-low latency)</li>
              <li>LangGraph Agent Orchestrator</li>
              <li>Neo4j AuraDB Spread Graph</li>
              <li>PyTorch Geometric GNN</li>
              <li>Pinecone Vector Store</li>
              <li>FastAPI + Redis Upstash</li>
            </ul>
          </div>

          {/* Safety Rules */}
          <div className="md:col-span-2 space-y-3 font-sans-display text-xs">
            <div className="font-bold text-[#F5F6FA] uppercase tracking-wider">Trust Signals</div>
            <ul className="space-y-2 text-white/70">
              <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#17C3A0]" /> Confidence &ge; 0.6 Filter</li>
              <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#17C3A0]" /> Severity &ge; 8 Human Gate</li>
              <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#17C3A0]" /> RAG-Only (Zero Hallucination)</li>
              <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#17C3A0]" /> Immutable Audit Trail</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-sans-display gap-4">
          <div>&copy; {new Date().getFullYear()} TruthLens Intelligence Inc. All rights reserved.</div>
          <div className="flex items-center gap-2 text-[#17C3A0] font-semibold">
            <span>Built with an agentic AI pipeline</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
