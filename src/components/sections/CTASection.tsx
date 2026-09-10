import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export const CTASection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', org: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    setSubmitted(true);
  };

  return (
    <section id="cta" className="feed-chapter justify-center items-center text-center relative z-10">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
        >
          <ShieldCheck size={14} />
          <span>Early Access Partnership</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-sans-display text-4xl sm:text-6xl lg:text-7xl font-black text-[#F5F6FA] uppercase tracking-tight leading-none"
        >
          Contain Misinformation <br />
          <span className="text-[#17C3A0]">In Real Time.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-editorial text-lg sm:text-xl text-[#9AA3B2] max-w-2xl mx-auto leading-relaxed"
        >
          Schedule a live demonstration of TruthLens or request early API integration access for your newsroom, trust & safety team, or organization.
        </motion.p>

        {/* Demo Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="feed-glass-card p-8 max-w-xl mx-auto border-white/10"
        >
          {submitted ? (
            <div className="py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#17C3A0]/20 text-[#17C3A0] flex items-center justify-center mx-auto border border-[#17C3A0]/40">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-sans-display text-2xl font-bold text-[#F5F6FA]">
                Demo Request Submitted!
              </h3>
              <p className="font-editorial text-sm text-[#9AA3B2]">
                Our team will reach out to <span className="text-[#17C3A0]">{form.email}</span> within 24 hours to coordinate your briefing session.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono text-[#9AA3B2] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#17C3A0] focus:outline-none transition-colors font-sans-display"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9AA3B2] uppercase mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@organization.org"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#17C3A0] focus:outline-none transition-colors font-sans-display"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9AA3B2] uppercase mb-1">Organization / Newsroom</label>
                <input
                  type="text"
                  placeholder="Global News Trust"
                  value={form.org}
                  onChange={(e) => setForm({ ...form, org: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#17C3A0] focus:outline-none transition-colors font-sans-display"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#17C3A0] hover:bg-[#2EE6A6] text-[#0A0F1E] font-sans-display text-sm font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#17C3A0]/25 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>Request Early Access Briefing</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
