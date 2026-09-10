import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onExploreAgents: () => void;
  onSeePrototype: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreAgents, onSeePrototype }) => {
  return (
    <section id="hero" className="feed-chapter justify-center items-center text-center relative z-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
        {/* Kinetic Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-[#17C3A0]/10"
        >
          <Zap size={14} className="text-[#17C3A0] animate-pulse" />
          <span>Multi-Agent Autonomous Defense</span>
        </motion.div>

        {/* Main Kinetic Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#F5F6FA] uppercase leading-none"
        >
          Truth<span className="text-[#17C3A0]">Lens</span>
        </motion.h1>

        {/* Imperial Script Accent Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="font-script text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#17C3A0] my-4 leading-snug drop-shadow-md"
        >
          An Agentic AI Ecosystem Against Misinformation
        </motion.p>

        {/* Pipeline Hero Promise */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-editorial text-lg sm:text-xl md:text-2xl text-[#9AA3B2] max-w-3xl leading-relaxed mt-4 font-normal"
        >
          Detect a false claim. Trace its origin. Predict where it spreads next. Publish a source-backed correction. All in <span className="text-[#F5F6FA] font-bold underline decoration-[#17C3A0] underline-offset-4">under 90 seconds</span> — with a human always in the loop for high-stakes calls.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <button
            onClick={onSeePrototype}
            className="px-8 py-4 bg-[#17C3A0] hover:bg-[#2EE6A6] text-[#0A0F1E] font-sans-display text-sm font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#17C3A0]/25 hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <span>See Live Prototype</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={onExploreAgents}
            className="px-8 py-4 border border-white/20 hover:border-[#17C3A0] bg-white/5 hover:bg-white/10 text-[#F5F6FA] font-sans-display text-sm font-extrabold uppercase tracking-widest rounded-xl transition-all backdrop-blur-md cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck size={18} className="text-[#17C3A0]" />
            <span>Explore the Four Agents</span>
          </button>
        </motion.div>
      </div>

      {/* Scroll Down Affordance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#9AA3B2] cursor-pointer"
        onClick={onExploreAgents}
      >
        <span className="font-sans-display text-[10px] uppercase tracking-[0.3em] font-semibold text-white/50">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border border-white/20 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-[#17C3A0] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};
