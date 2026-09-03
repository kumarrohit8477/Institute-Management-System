import React from "react";
import { LandingNavbar } from "@/src/components/landing/LandingNavbar";
import { LandingHero } from "@/src/components/landing/LandingHero";
import { LandingFeatures } from "@/src/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/src/components/landing/LandingHowItWorks";
import { LandingRoles } from "@/src/components/landing/LandingRoles";
import { LandingPreviewTabs } from "@/src/components/landing/LandingPreviewTabs";
import { LandingSecurity } from "@/src/components/landing/LandingSecurity";
import { LandingPricing } from "@/src/components/landing/LandingPricing";
import { LandingCTA } from "@/src/components/landing/LandingCTA";
import { LandingFooter } from "@/src/components/landing/LandingFooter";

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
