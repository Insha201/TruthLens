const fs = require('fs');
const path = require('path');

const typesContent = fs.readFileSync('src/types.ts', 'utf8');
const updatedTypesContent = typesContent.replace(
  /export type MainAppPage = .*?;/,
  "export type MainAppPage = 'home' | 'dashboard' | 'live_claims' | 'investigation' | 'agent_intelligence' | 'spread_intelligence' | 'evidence_review' | 'counter_narrative' | 'status';"
);
fs.writeFileSync('src/types.ts', updatedTypesContent);

const pages = [
  'Home',
  'Dashboard',
  'LiveClaims',
  'Investigation',
  'AgentIntelligence',
  'SpreadIntelligence',
  'EvidenceReview',
  'CounterNarrative',
  'SystemStatus'
];

pages.forEach(page => {
  const code = `
import React from 'react';
import { IncidentClaim, PipelineStage, RetrievedSource, SystemMetrics } from '../types';

export const ${page}Page = (props: any) => {
  return (
    <div className="w-full text-slate-100 flex flex-col space-y-6">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl">
        <h1 className="text-3xl font-bold mb-4 text-cyan-400 uppercase tracking-widest">${page}</h1>
        <p className="text-slate-400">This is the ${page} view of the MISINFORMATION CONTAINMENT SYSTEM.</p>
      </div>
    </div>
  );
};
`;
  fs.writeFileSync(`src/pages/${page}Page.tsx`, code.trim());
});

console.log("Created pages and updated types");
