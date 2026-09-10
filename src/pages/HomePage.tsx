import React, { useState } from 'react';
import { ParticleBackground } from '../components/ParticleBackground';
import { FeedNavbar } from '../components/FeedNavbar';
import { OverlayNav } from '../components/OverlayNav';

import { HeroSection } from '../components/sections/HeroSection';
import { ProblemSection } from '../components/sections/ProblemSection';
import { TechnologySection } from '../components/sections/TechnologySection';
import { AgentsSpotlightSection } from '../components/sections/AgentsSpotlightSection';
import { WhyTruthLensSection } from '../components/sections/WhyTruthLensSection';
import { DashboardShowcaseSection } from '../components/sections/DashboardShowcaseSection';
import { DataTrustSection } from '../components/sections/DataTrustSection';
import { RoadmapSection } from '../components/sections/RoadmapSection';
import { TeamSection } from '../components/sections/TeamSection';
import { CTASection } from '../components/sections/CTASection';
import { FooterSection } from '../components/sections/FooterSection';
import { MainAppPage } from '../types';

interface HomePageProps {
  setPage: (p: MainAppPage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0F1E] text-[#F5F6FA] overflow-x-hidden selection:bg-[#17C3A0] selection:text-[#0A0F1E]">
      {/* Living Generative Particle Canvas Background */}
      <ParticleBackground />

      {/* Overlay Navigation Menu */}
      <OverlayNav
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onNavigate={scrollToSection}
        onOpenAppView={() => setPage('dashboard')}
      />

      {/* Fixed Slim Feed Navbar */}
      <FeedNavbar
        onOpenMenu={() => setIsOverlayOpen(true)}
        onOpenAppView={() => setPage('dashboard')}
      />

      {/* 11 Full-Viewport Scroll Chapters */}
      <main className="relative z-10">
        <HeroSection
          onExploreAgents={() => scrollToSection('agents')}
          onSeePrototype={() => scrollToSection('footer')}
        />

        <ProblemSection />

        <TechnologySection />

        <AgentsSpotlightSection />

        <WhyTruthLensSection />

        <DashboardShowcaseSection onOpenFullApp={() => setPage('dashboard')} />

        <DataTrustSection />

        <RoadmapSection />

        <TeamSection />

        <CTASection />

        <FooterSection onOpenAppView={() => setPage('dashboard')} />
      </main>
    </div>
  );
};
