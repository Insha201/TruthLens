import React from 'react';
import { FileCheck, MapPin, Network, Search, Shield, UserCheck } from 'lucide-react';

const ICONS = {
  detector: Search,
  origin: MapPin,
  spread: Network,
  narrative: FileCheck,
  review: UserCheck,
  evidence: Shield,
};

export const AgentIcon: React.FC<{
  kind: keyof typeof ICONS;
  className?: string;
}> = ({ kind, className = '' }) => {
  const Icon = ICONS[kind];
  return (
    <div className={`agent-icon ${className}`}>
      <Icon className="w-6 h-6 text-cyan-200" strokeWidth={1.6} />
    </div>
  );
};
