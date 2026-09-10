import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Clock, Share2, Network, ShieldAlert } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev >= 90 ? 0 : prev + 1));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="problem" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Copy & Stat Callout */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#FF5A4E]/30 bg-[#FF5A4E]/10 text-[#FF5A4E] font-sans-display text-xs font-bold uppercase tracking-wider"
          >
            <AlertTriangle size={14} />
            <span>The Crisis of Velocity</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] tracking-tight uppercase leading-tight"
          >
            Falsehoods Spread <br />
            <span className="text-[#FF5A4E]">6x Faster</span> Than Truth.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2] leading-relaxed"
          >
            Within minutes of an unverified post going viral across social networks, millions absorb false narratives before legacy fact-checkers can draft a single rebuttal. Traditional manual review takes hours—or days.
          </motion.p>

          {/* Animated Counter KPI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="feed-glass-card p-6 border-[#FF5A4E]/20 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-sans-display text-xs uppercase tracking-widest text-[#9AA3B2] font-semibold">
                  TruthLens Pipeline Benchmark
                </div>
                <div className="font-sans-display text-4xl sm:text-5xl font-black text-[#17C3A0] mt-1 flex items-baseline gap-2">
                  <span>~{timerSeconds.toString().padStart(2, '0')}</span>
                  <span className="text-xl text-[#9AA3B2] font-normal">Seconds</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#17C3A0]/10 border border-[#17C3A0]/30 flex items-center justify-center text-[#17C3A0]">
                <Clock size={28} className="animate-spin-slow" />
              </div>
            </div>
            <p className="text-xs text-[#9AA3B2] mt-3 font-editorial">
              From initial social post ingestion to verified source-backed rebuttal draft.
            </p>
          </motion.div>
        </div>

        {/* Right Column: Animated Node Graph Explosion */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="feed-glass-card p-8 relative min-h-[380px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-sans-display uppercase tracking-widest text-[#FF5A4E] font-bold">
                <Network size={16} />
                <span>Simulated Viral Misinformation Cascade</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#FF5A4E]/20 text-[#FF5A4E] text-[10px] font-mono font-bold">
                UNCONTAINED SPREAD
              </span>
            </div>

            {/* Micro Graphic Simulation */}
            <div className="relative my-8 h-48 flex items-center justify-center">
              {/* Seed origin node */}
              <div className="absolute w-6 h-6 rounded-full bg-[#FF5A4E] shadow-lg shadow-[#FF5A4E]/50 animate-ping opacity-50" />
              <div className="absolute w-6 h-6 rounded-full bg-[#FF5A4E] flex items-center justify-center text-[9px] font-bold text-[#0A0F1E]">
                SEED
              </div>

              {/* Exploding concentric ring nodes */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.5 + ring, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute rounded-full border border-dashed border-[#FF5A4E]/40"
                  style={{
                    width: `${ring * 90}px`,
                    height: `${ring * 90}px`,
                  }}
                />
              ))}

              {/* Orbital bot nodes */}
              {[45, 135, 225, 315].map((angle, idx) => (
                <motion.div
                  key={angle}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12 + idx * 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full bg-[#FF5A4E] shadow-sm shadow-[#FF5A4E]"
                    style={{
                      transform: `translate(${Math.cos((angle * Math.PI) / 180) * 110}px, ${
                        Math.sin((angle * Math.PI) / 180) * 110
                      }px)`,
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Impact Metric Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center">
              <div>
                <div className="text-xs text-[#9AA3B2] uppercase font-sans-display font-semibold">Reach</div>
                <div className="text-xl font-bold font-sans-display text-[#FF5A4E]">2.4M+</div>
              </div>
              <div>
                <div className="text-xs text-[#9AA3B2] uppercase font-sans-display font-semibold">Velocity</div>
                <div className="text-xl font-bold font-sans-display text-[#FF5A4E]">1.8k/min</div>
              </div>
              <div>
                <div className="text-xs text-[#9AA3B2] uppercase font-sans-display font-semibold">Risk Level</div>
                <div className="text-xl font-bold font-sans-display text-[#FF5A4E]">HIGH (9.2)</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
