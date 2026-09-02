import React from "react";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingHowItWorks } from "../components/landing/LandingHowItWorks";
import { LandingRoles } from "../components/landing/LandingRoles";
import { LandingPreviewTabs } from "../components/landing/LandingPreviewTabs";
import { LandingSecurity } from "../components/landing/LandingSecurity";
import { LandingPricing } from "../components/landing/LandingPricing";
import { LandingCTA } from "../components/landing/LandingCTA";
import { LandingFooter } from "../components/landing/LandingFooter";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingRoles />
      <LandingPreviewTabs />
      <LandingSecurity />
      <LandingPricing />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
