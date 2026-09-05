import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Send } from "lucide-react";
import "./LandingCTA.css";

interface LandingCTAProps {
  onOpenEnquiry?: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="cta" className="landing-cta">
      <div className="landing-cta__container">
        <h2 className="landing-cta__title">
          Ready to Simplify Your Institute Management?
        </h2>
        <p className="landing-cta__desc">
          Join educational leaders using Eduvora SaaS to automate batch schedules, conduct online CBT exams, and provide students with a modern learning experience.
        </p>
        {onOpenEnquiry ? (
          <button
            type="button"
            onClick={onOpenEnquiry}
            className="landing-cta__btn"
            style={{ cursor: "pointer", border: "none" }}
          >
            <span>Send Enquiry & Request Demo</span>
            <Send size={16} />
          </button>
        ) : (
          <Link to="/login" className="landing-cta__btn">
            <span>Send Enquiry</span>
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </section>
  );
};
