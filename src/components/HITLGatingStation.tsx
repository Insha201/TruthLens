import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Edit3, 
  Send, 
  RotateCcw, 
  XCircle, 
  ExternalLink, 
  FileCheck, 
  Layers, 
  Bookmark, 
  AlertTriangle,
  Lock,
  Radio,
  Share2
} from 'lucide-react';
import { IncidentClaim } from '../types';

interface HITLGatingStationProps {
  incident: IncidentClaim;
  onApproveAndDispatch: (
    editedHeadline: string, 
    editedRebuttal: string, 
    reviewNotes: string, 
    channels: string[]
  ) => void;
  onRequestRedraft: () => void;
  onDismiss: () => void;
  isDispatching: boolean;
}

export const HITLGatingStation: React.FC<HITLGatingStationProps> = ({
  incident,
  onApproveAndDispatch,
  onRequestRedraft,
  onDismiss,
  isDispatching,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState(
    incident.ragDrafter?.counterNarrative.headline || ''
  );
  const [editedRebuttal, setEditedRebuttal] = useState(
    incident.ragDrafter?.counterNarrative.fullRebuttal || ''
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'x_community_notes',
    'platform_moderation_api',
    'social_reply_bot',
  ]);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(
    incident.ragDrafter?.sources[0]?.id || null
  );

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const isAlreadyDispatched = incident.currentStage === 'dispatched';

  return (
    <div className="space-y-6">
      {/* Station Alert Banner */}
      <div className={`border rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isAlreadyDispatched 
          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
          : 'bg-rose-950/40 border-rose-800 text-rose-300'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2.5 rounded-lg border shrink-0 ${
            isAlreadyDispatched 
              ? 'bg-emerald-900/60 border-emerald-700 text-emerald-400' 
              : 'bg-rose-900/60 border-rose-700 text-rose-400'
          }`}>
            {isAlreadyDispatched ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Lock className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                {isAlreadyDispatched ? 'CONTAINMENT DISPATCH COMPLETE' : 'GATE ACTIVE: HIGH-SEVERITY HUMAN EDITOR REQUIRED'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-900 border border-slate-700 text-slate-300">
                Stage: {incident.currentStage.toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {isAlreadyDispatched
                ? `Dispatched by ${incident.humanReview.reviewedBy || 'Editor'} at ${incident.humanReview.reviewedAt || '10:02 UTC'}. Algorithmic down-ranking and verified rebuttals are live across target platforms.`
                : 'Per safety containment protocols, claims evaluated as Critical or High severity may NOT publish counter-narratives automatically without explicit human editorial sign-off.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
          <span className="text-slate-400">Editor On Duty:</span>
          <strong className="text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
            {incident.humanReview.reviewedBy}
          </strong>
        </div>
      </div>

      {/* Side-by-Side Review Station */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Viral Claim Under Review */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Ingested Viral Claim</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                {incident.detector?.severity.toUpperCase()} SEVERITY
              </span>
            </div>

            {/* Ingested Post Body */}
            <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                    {incident.ingestion.authorHandle.slice(1, 3).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block leading-tight">
                      {incident.ingestion.authorHandle}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {incident.ingestion.authorFollowers.toLocaleString()} followers • Platform: {incident.ingestion.platform.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                  {incident.ingestion.velocityPerMin} shares/min
                </span>
              </div>

              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed font-sans">
                {incident.claimText}
              </p>

              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Views: <strong className="text-slate-800 dark:text-slate-200">{incident.ingestion.engagement.views.toLocaleString()}</strong></span>
                <span>Reposts: <strong className="text-slate-800 dark:text-slate-200">{incident.ingestion.engagement.reposts.toLocaleString()}</strong></span>
                <span>Likes: <strong className="text-slate-800 dark:text-slate-200">{incident.ingestion.engagement.likes.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Forensic Detection Breakdown */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Detector Agent Findings:</div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Veracity Score:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-mono">{incident.detector?.veracityScore}% (Fabricated)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Origin Attribution:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {incident.origin?.patientZero.geographicCluster} ({incident.origin?.patientZero.botProbability}% bot score)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Identified Manipulation:</span>
                  <div className="flex flex-wrap gap-1">
                    {incident.detector?.manipulationTechniques.map((tech, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-mono">
            Origin Hop Count: {incident.origin?.hops.length || 3} • Spread R0: {incident.spread?.r0ViralFactor}
          </div>
        </div>

        {/* RIGHT: Source-Backed Counter-Narrative */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold uppercase">
                <FileCheck className="w-4 h-4" />
                <span>RAG Counter-Narrative (Strictly Source-Backed)</span>
              </div>
              <button
                id="btn-toggle-edit-mode"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isAlreadyDispatched}
                className="flex items-center space-x-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors disabled:opacity-40"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Copy'}</span>
              </button>
            </div>

            {/* Counter-Narrative Content */}
            <div className="mt-4 space-y-3">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-1">
                      Counter-Narrative Headline:
                    </label>
                    <input
                      type="text"
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-1">
                      Full Source-Backed Rebuttal:
                    </label>
                    <textarea
                      rows={5}
                      value={editedRebuttal}
                      onChange={(e) => setEditedRebuttal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-emerald-300 dark:border-emerald-900/40 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Approved Headline:
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {editedHeadline || incident.ragDrafter?.counterNarrative.headline}
                    </h4>
                  </div>

                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                    {editedRebuttal || incident.ragDrafter?.counterNarrative.fullRebuttal}
                  </div>
                </div>
              )}

              {/* Verified Source Citations Grounding Inspector */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Bookmark className="w-3.5 h-3.5" />
                    Indexed Verification Citations:
                  </span>
                  <span className="text-slate-500">100% Zero-Hallucination Enforced</span>
                </div>

                {incident.ragDrafter?.sources.map((src, i) => (
                  <div 
                    key={src.id}
                    onClick={() => setHighlightedSourceId(src.id)}
                    className={`p-2 rounded border cursor-pointer transition-colors text-xs ${
                      highlightedSourceId === src.id 
                        ? 'bg-slate-900 border-emerald-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-emerald-400 font-mono text-[11px]">
                        [{i + 1}] {src.organization}
                      </strong>
                      <a 
                        href={src.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        Verify Original <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="text-[11px] font-medium text-slate-200 mt-0.5">
                      {src.title}
                    </div>
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      &ldquo;{src.keyEvidenceQuote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>

              {/* Editor Notes Input */}
              {!isAlreadyDispatched && (
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Editorial Review Notes (Audit Trail Log):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Verified cross-platform footage match against 2018 archives with County Clerk office."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dispatch Channel Checkboxes & Actions */}
          <div className="pt-4 mt-4 border-t border-slate-800 space-y-3">
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-1.5">
                Target Containment Dispatch Channels:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('x_community_notes')}
                    onChange={() => toggleChannel('x_community_notes')}
                    disabled={isAlreadyDispatched}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>X Community Note Proposal</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('platform_moderation_api')}
                    onChange={() => toggleChannel('platform_moderation_api')}
                    disabled={isAlreadyDispatched}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Platform Downranking API</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('social_reply_bot')}
                    onChange={() => toggleChannel('social_reply_bot')}
                    disabled={isAlreadyDispatched}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Automated Rebuttal Reply Bot</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('press_wire')}
                    onChange={() => toggleChannel('press_wire')}
                    disabled={isAlreadyDispatched}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Emergency Media Wire Alert</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            {!isAlreadyDispatched ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  id="btn-approve-dispatch"
                  onClick={() => onApproveAndDispatch(editedHeadline, editedRebuttal, reviewNotes, selectedChannels)}
                  disabled={isDispatching || selectedChannels.length === 0}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
                >
                  {isDispatching ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Under 90s SLA...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Approve & Dispatch Containment</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-request-redraft"
                  onClick={onRequestRedraft}
                  disabled={isDispatching}
                  className="w-full sm:w-auto py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Request Re-Draft
                </button>

                <button
                  id="btn-dismiss-claim"
                  onClick={onDismiss}
                  disabled={isDispatching}
                  className="w-full sm:w-auto py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-mono">
                  ✓ Containment payload live on {incident.humanReview.selectedDispatchChannels?.join(', ') || 'All Selected Channels'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Audit Stamp #9021-DISPATCH-OK</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
