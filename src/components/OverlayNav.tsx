import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ShieldAlert, Cpu, BarChart3, Users, Calendar, ArrowRight } from 'lucide-react';

interface OverlayNavProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenAppView?: () => void;
}

export const OverlayNav: React.FC<OverlayNavProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAppView,
}) => {
  const menuItems = [
    { label: '01. Introduction', id: 'hero' },
    { label: '02. The Problem', id: 'problem' },
    { label: '03. The Technology', id: 'technology' },
    { label: '04. Meet the Four Agents', id: 'agents' },
    { label: '05. Why TruthLens', id: 'why' },
    { label: '06. Dashboard Showcase', id: 'dashboard' },
    { label: '07. Data & Trust Model', id: 'data-trust' },
    { label: '08. Roadmap & Progress', id: 'roadmap' },
    { label: '09. Meet the Team', id: 'team' },
    { label: '10. Schedule a Demo', id: 'cta' },
    { label: '11. Live Prototype', id: 'footer' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#0A0F1E]/95 backdrop-blur-2xl flex flex-col justify-between p-6 md:p-12 overflow-y-auto"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="TruthLens Logo" className="w-9 h-9 object-contain" />
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#F5F6FA]">
                TruthLens
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full border border-white/20 hover:border-[#17C3A0] text-white/80 hover:text-[#17C3A0] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Items List */}
          <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto w-full">
            <div className="space-y-4">
              {menuItems.slice(0, 6).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1, duration: 0.4 }}
                >
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="group flex items-baseline gap-4 text-left w-full cursor-pointer"
                  >
                    <span className="font-sans-display text-2xl md:text-4xl font-extrabold text-[#F5F6FA] group-hover:text-[#17C3A0] transition-colors">
                      {item.label}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-12">
              {menuItems.slice(6).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 6) * 0.05 + 0.1, duration: 0.4 }}
                >
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="group flex items-baseline gap-4 text-left w-full cursor-pointer"
                  >
                    <span className="font-sans-display text-2xl md:text-4xl font-extrabold text-[#F5F6FA] group-hover:text-[#17C3A0] transition-colors">
                      {item.label}
                    </span>
                  </button>
                </motion.div>
              ))}

              {onOpenAppView && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-6"
                >
                  <button
                    onClick={() => {
                      onOpenAppView();
                      onClose();
                    }}
                    className="px-6 py-3.5 bg-gradient-to-r from-[#17C3A0] to-[#2EE6A6] text-[#0A0F1E] font-bold rounded-xl flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#17C3A0]/20"
                  >
                    <span>Launch Intelligence Dashboard</span>
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer Info inside Overlay */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#9AA3B2] gap-4">
            <div>TruthLens — An Agentic AI Ecosystem Against Misinformation</div>
            <div className="flex gap-6">
              <span>Groq API</span>
              <span>LangGraph</span>
              <span>Neo4j AuraDB</span>
              <span>PyTorch Geometric</span>
              <span>Pinecone</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
