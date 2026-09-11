import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  X, 
  Send, 
  Radio, 
  AlertCircle,
  Zap,
  Globe
} from 'lucide-react';
import { Platform, INGESTION_SOURCES } from '../types';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitClaim: (claimText: string, platform: Platform, category: string) => Promise<void>;
  isProcessing: boolean;
}

const PRESET_CLAIMS = [
  {
    title: 'Election Ballot Warehouse Hoax',
    category: 'elections_civic',
    platform: 'newsapi' as Platform,
    text: 'URGENT: Workers just caught on camera shredding over 45,000 pre-marked election ballots in Clark County recycling depot warehouse right now!! Media is in total blackout mode, share everywhere before taken down!',
  },
  {
    title: 'Emergency Dam Rupture Alarm',
    category: 'emergency_disaster',
    platform: 'youtube' as Platform,
    text: 'BREAKING NEWS: Highland Valley Dam wall has collapsed following magnitude 4.1 tremor! Wall of water moving toward lower valley. Immediate emergency evacuation ordered by national guard!!',
  },
  {
    title: 'Central Bank Wire Freeze Hoax',
    category: 'financial_panic',
    platform: 'rss' as Platform,
    text: 'Leak from insider: Central Bank is shutting down all domestic wire transfers and regional bank withdrawals tonight at 00:00! Pull your cash immediately from ATMs before liquidity lock!',
  },
  {
    title: 'Contaminated Water / Vinegar Remedy',
    category: 'public_health',
    platform: 'x' as Platform,
    text: 'URGENT WARNING FROM MEDICAL NURSE: Municipal water supplies in city center have been poisoned with chemical fluoride flutters. Drink 2 tablespoons of concentrated vinegar immediately to neutralize toxins in your bloodstream!!',
  },
];

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onSubmitClaim,
  isProcessing,
}) => {
  const [claimText, setClaimText] = useState('');
  const [platform, setPlatform] = useState<Platform>('newsapi');
  const [category, setCategory] = useState('elections_civic');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;
    await onSubmitClaim(claimText.trim(), platform, category);
  };

  const handleSelectPreset = (preset: typeof PRESET_CLAIMS[0]) => {
    setClaimText(preset.text);
    setPlatform(preset.platform);
    setCategory(preset.category);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ingest a Claim
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Runs Detector, Origin Tracer, Spread Predictor and RAG Drafter, then stores the result.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Strip */}
        <div>
          <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Example claims:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_CLAIMS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs transition-all group"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                  {preset.platform} • {preset.category.replace('_', ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2.5 text-[11px] text-slate-400">
          A hand-typed claim has no source URL, so the Origin Tracer cannot build a
          provenance chain for it — it will show <span className="font-mono">no outlet recorded</span>.
          The source label and category below are hints; the Claim Detector classifies
          the category itself from the text.
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400 block mb-1">
                Label as source:
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <optgroup label="Live sources">
                  {INGESTION_SOURCES.filter((s) => s.status === 'live').map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Staged connectors (need API key)">
                  {INGESTION_SOURCES.filter((s) => s.status === 'planned').map((s) => (
                    <option key={s.id} value={s.id}>{s.label} — connector staged</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400 block mb-1">
                Category hint:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="elections_civic">Elections & Civic Integrity</option>
                <option value="emergency_disaster">Emergency & Disaster Safety</option>
                <option value="public_health">Public Health & Medical</option>
                <option value="financial_panic">Financial & Market Stability</option>
                <option value="geopolitics">Geopolitical & Civil Defense</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400 block mb-1">
              Raw Post / Article / Transcript Text:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Paste a news headline, YouTube description, RSS item, or viral post..."
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Typical run: 2-10s (longer if the LLM is rate-limited)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isProcessing || !claimText.trim()}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-cyan-950 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Running pipeline...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
