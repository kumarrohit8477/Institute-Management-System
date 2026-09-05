import React, { useState } from "react";
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
import { EnquiryModal } from "@/src/components/landing/EnquiryModal";
import "./LandingPage.css";

export const LandingPage: React.FC = () => {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleOpenEnquiry = (plan?: string) => {
    setSelectedPlan(plan || null);
    setIsEnquiryModalOpen(true);
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="landing-page">
      <LandingNavbar onOpenEnquiry={handleOpenEnquiry} />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingRoles />
      <LandingPreviewTabs />
      <LandingSecurity />
      <LandingPricing onSelectPlan={handleOpenEnquiry} />
      <LandingCTA onOpenEnquiry={handleOpenEnquiry} />
      <LandingFooter onOpenEnquiry={handleOpenEnquiry} />

      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={handleCloseEnquiry}
        initialPlan={selectedPlan}
      />
    </div>
  );
};

export default LandingPage;
