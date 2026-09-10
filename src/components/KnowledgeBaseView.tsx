import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Plus, 
  Bookmark, 
  FileText, 
  CheckCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { RetrievedSource } from '../types';

interface KnowledgeBaseViewProps {
  sources: RetrievedSource[];
  onAddSource?: (newSource: RetrievedSource) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  sources,
  onAddSource,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New source form state
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState<'WHO' | 'Snopes' | 'PolitiFact' | 'Reuters' | 'AP News' | 'CDC' | 'FactCheck.org'>('Snopes');
  const [newUrl, setNewUrl] = useState('');
  const [newQuote, setNewQuote] = useState('');

  const filteredSources = sources.filter((src) => {
    if (orgFilter !== 'all' && src.organization !== orgFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        src.title.toLowerCase().includes(q) ||
        src.keyEvidenceQuote.toLowerCase().includes(q) ||
        src.organization.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newQuote) return;

    const source: RetrievedSource = {
      id: `src-custom-${Date.now()}`,
      organization: newOrg,
      title: newTitle,
      url: newUrl || 'https://example.com/fact-check',
      verificationRating: 'False',
      relevanceScore: 95,
      keyEvidenceQuote: newQuote,
      publishDate: new Date().toISOString().split('T')[0],
    };

    if (onAddSource) {
      onAddSource(source);
    }
    setShowAddModal(false);
    setNewTitle('');
    setNewQuote('');
    setNewUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400">
              <Database className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Layer 3: Indexed Ground-Truth Knowledge Base (RAG Storage)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pre-indexed factual ground truth from certified fact-check organizations (Snopes, WHO, PolitiFact, Reuters, CDC, AP News).
          </p>
        </div>

        <button
          id="btn-add-verified-source"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-colors self-start md:self-auto shadow"
        >
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Index Verified Source</span>
        </button>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search indexed fact-checks or quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto scrollbar-none font-mono">
          <span className="text-slate-500 dark:text-slate-400 mr-2 text-[11px]">Filter Org:</span>
          {['all', 'WHO', 'Snopes', 'PolitiFact', 'Reuters', 'CDC', 'AP News'].map((org) => (
            <button
              key={org}
              onClick={() => setOrgFilter(org)}
              className={`px-2 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                orgFilter === org
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {org}
            </button>
          ))}
        </div>
      </div>

      {/* Indexed Sources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-md flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                  {source.organization}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Rating: {source.verificationRating}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                {source.title}
              </h4>

              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 italic bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 leading-relaxed font-sans">
                &ldquo;{source.keyEvidenceQuote}&rdquo;
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                {source.publishDate}
              </span>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Read Fact-Check</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Index New Trusted Fact-Check Article</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-mono">Organization:</label>
                <select
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-white font-mono"
                >
                  <option value="Snopes">Snopes</option>
                  <option value="WHO">WHO</option>
                  <option value="PolitiFact">PolitiFact</option>
                  <option value="Reuters">Reuters</option>
                  <option value="CDC">CDC</option>
                  <option value="AP News">AP News</option>
                  <option value="FactCheck.org">FactCheck.org</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-mono">Article Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fact Check: Drinking Hot Vinegar Does Not Neutralize Toxins"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-mono">Source URL:</label>
                <input
                  type="url"
                  placeholder="https://www.who.int/news/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-mono">Direct Evidence Quote (For Strict RAG Grounding):</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Exact quote from authoritative assessment that will be cited by RAG Drafter..."
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-white font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save to Vector Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
