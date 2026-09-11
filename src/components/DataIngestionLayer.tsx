import React, { useState } from 'react';
import { 
  Layers, 
  Radio, 
  TrendingUp, 
  Zap, 
  Filter, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { IncidentClaim, INGESTION_SOURCES } from '../types';

const LIVE_SOURCES = INGESTION_SOURCES.filter((s) => s.status === 'live');
const PLANNED_SOURCES = INGESTION_SOURCES.filter((s) => s.status === 'planned');
const LIVE_STRIP = LIVE_SOURCES.map((s) => s.shortLabel).join(', ');

interface DataIngestionLayerProps {
  incidents: IncidentClaim[];
  currentIncidentId: string;
  onSelectIncident: (id: string) => void;
  onOpenIngestModal: () => void;
}

export const DataIngestionLayer: React.FC<DataIngestionLayerProps> = ({
  incidents,
  currentIncidentId,
  onSelectIncident,
  onOpenIngestModal,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredIncidents = incidents.filter((inc) => {
    if (platformFilter !== 'all' && inc.ingestion.platform !== platformFilter) return false;
    if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Ingestion Stream Dashboard Banner */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Layer 1: Multi-Source Data Ingestion & Signal Extraction
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Live crawlers pulling from {LIVE_SOURCES.map((s) => s.label).join(', ')}.{' '}
            {PLANNED_SOURCES.map((s) => s.label).join(', ')} connectors are staged &mdash; add each API key in{' '}
            <code className="font-mono text-[11px] px-1 rounded bg-slate-100 dark:bg-slate-800">backend/.env</code> to enable.
          </p>
        </div>

        <button
          id="btn-ingest-custom"
          onClick={onOpenIngestModal}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm transition-colors self-start md:self-auto shadow-md shadow-cyan-950"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ingest New Viral Claim</span>
        </button>
      </div>

      {/* Stream Ingestion Metrics & Platform Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>STREAM VELOCITY</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            4,820 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">signals/min</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">▲ 14% anomalous spike detected</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ACTIVE INGESTION CRAWLERS</div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            {LIVE_SOURCES.length} Live <span className="text-xs font-normal text-slate-500 dark:text-slate-400">· {PLANNED_SOURCES.length} Staged</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{LIVE_STRIP}</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">OCR & MULTIMODAL PARSER</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            Active
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Video OCR + Audio Transcription</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">INGESTION-TO-AGENT DELAY</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            &lt; 3.2s
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Instant pipeline trigger</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-mono">Filter Source:</span>
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
              platformFilter === 'all'
                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            all
          </button>
          {INGESTION_SOURCES.map((src) => (
            <button
              key={src.id}
              onClick={() => setPlatformFilter(src.id)}
              title={`${src.label}${src.status === 'planned' ? ' — connector staged' : ''}`}
              className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
                platformFilter === src.id
                  ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 font-semibold'
                  : src.status === 'planned'
                  ? 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {src.shortLabel}
              {src.status === 'planned' && <span className="ml-1 text-[8px] align-top opacity-60">soon</span>}
            </button>
          ))}
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredIncidents.length} active viral incidents
        </div>
      </div>

      {/* Ingested Incidents Stream List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          const isSelected = currentIncidentId === incident.id;

          return (
            <div
              key={incident.id}
              className={`border rounded-xl p-4 sm:p-5 transition-all shadow-md ${
                isSelected
                  ? 'border-cyan-500 ring-1 ring-cyan-500/40 bg-cyan-50/40 dark:bg-slate-900'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    {incident.ingestion.platform.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {incident.ingestion.timestamp}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-medium">
                    ID: {incident.id}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Category: {incident.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-amber-600 dark:text-amber-400">
                    Velocity: <strong>{incident.ingestion.velocityPerMin}</strong>/min
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    incident.detector?.severity === 'critical'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  }`}>
                    {incident.detector?.severity} Severity
                  </span>
                </div>
              </div>

              {/* Claim Body */}
              <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {incident.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic font-sans">
                    &ldquo;{incident.claimText}&rdquo;
                  </p>
                </div>

                {/* Pipeline Action Button */}
                <div className="shrink-0 flex items-center space-x-2">
                  <button
                    id={`btn-select-incident-${incident.id}`}
                    onClick={() => onSelectIncident(incident.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <span>{isSelected ? 'Loaded in Pipeline' : 'Open in Pipeline'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Engagement Stats Strip */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 gap-2">
                <div className="flex items-center space-x-4">
                  <span>Author: <strong className="text-slate-800 dark:text-slate-200">{incident.ingestion.authorHandle}</strong></span>
                  <span>Views: <strong className="text-slate-800 dark:text-slate-200">{incident.ingestion.engagement.views.toLocaleString()}</strong></span>
                  <span>Reposts: <strong className="text-slate-800 dark:text-slate-200">{incident.ingestion.engagement.reposts.toLocaleString()}</strong></span>
                </div>

                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <span>Stage: <strong className="text-cyan-600 dark:text-cyan-400 uppercase">{incident.currentStage}</strong></span>
                  <span>•</span>
                  <span>Latency: <strong className="text-slate-800 dark:text-slate-200">{incident.totalElapsedSeconds}s</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
