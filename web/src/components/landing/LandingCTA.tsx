import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { EnquiryModal } from "./EnquiryModal";
import "./LandingCTA.css";

interface LandingCTAProps {
  onOpenEnquiry?: (plan?: string) => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onOpenEnquiry }) => {
  const [internalModalOpen, setInternalModalOpen] = useState<boolean>(false);

  const handleEnquiryClick = (plan?: string) => {
    if (onOpenEnquiry) {
      onOpenEnquiry(plan);
    } else {
      setInternalModalOpen(true);
    }
  };

  return (
    <>
      <section id="cta" className="landing-cta">
        <div className="landing-cta__container">
          <h2 className="landing-cta__title">
            Ready to Simplify Your Institute Management?
          </h2>
          <p className="landing-cta__desc">
            Join educational leaders using Eduvora SaaS to automate batch schedules, conduct online CBT exams, and provide students with a modern learning experience.
          </p>
          <button
            type="button"
            onClick={() => handleEnquiryClick()}
            className="landing-cta__btn"
            style={{ cursor: "pointer", border: "none" }}
          >
            <span>Send Enquiry</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Internal Enquiry Modal Fallback if not controlled by parent */}
      {!onOpenEnquiry && (
        <EnquiryModal
          isOpen={internalModalOpen}
          onClose={() => setInternalModalOpen(false)}
        />
      )}
    </>
  );
};
