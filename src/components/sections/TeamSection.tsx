import React from 'react';
import { motion } from 'motion/react';
import { Users, Linkedin, Twitter, Github } from 'lucide-react';

export const TeamSection: React.FC = () => {
  const team = [
    {
      name: 'Dr. Elena Rostova',
      role: 'Lead AI & Graph Neural Systems',
      bio: 'Ex-DeepMind researcher specializing in GNN network topology and automated claim detection.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Marcus Vance',
      role: 'Chief Architect — Multi-Agent Engineering',
      bio: 'Distributed systems engineer focusing on LangGraph state orchestration and ultra-low-latency Groq integration.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Aisha Patel',
      role: 'Head of RAG & Trust Alignment',
      bio: 'Expert in vector database grounding, source attribution metrics, and zero-hallucination guardrails.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Julian Thorne',
      role: 'Principal Front-End & UX Engineer',
      bio: 'Crafting award-winning interactive interfaces for complex AI intelligence systems.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <section id="team" className="feed-chapter justify-center items-center relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17C3A0]/30 bg-[#17C3A0]/10 text-[#17C3A0] font-sans-display text-xs font-bold uppercase tracking-widest"
          >
            <Users size={14} />
            <span>The Pioneers Behind TruthLens</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FA] uppercase tracking-tight"
          >
            Meet The Team
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-editorial text-lg text-[#9AA3B2]"
          >
            A multidisciplinary team of AI researchers, graph theorists, and front-end creative engineers.
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="feed-glass-card p-6 border-white/10 flex flex-col justify-between space-y-4 hover:border-[#17C3A0]"
            >
              <div className="space-y-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-white/20 shadow-md"
                />
                <div>
                  <h3 className="font-sans-display text-xl font-bold text-[#F5F6FA]">{member.name}</h3>
                  <div className="text-xs font-mono text-[#17C3A0] mt-0.5">{member.role}</div>
                </div>
                <p className="font-editorial text-xs text-[#9AA3B2] leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/10 text-[#9AA3B2]">
                <Twitter size={14} className="hover:text-[#17C3A0] cursor-pointer" />
                <Linkedin size={14} className="hover:text-[#17C3A0] cursor-pointer" />
                <Github size={14} className="hover:text-[#17C3A0] cursor-pointer" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
