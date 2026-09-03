import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./LandingCTA.css";

export const LandingCTA: React.FC = () => {
  return (
    <section className="landing-cta">
      <div className="landing-cta__container">
        <h2 className="landing-cta__title">
          Ready to Simplify Your Institute Management?
        </h2>
        <p className="landing-cta__desc">
          Join educational leaders using IMS Cloud to automate batch schedules, conduct online CBT exams, and provide students with a modern learning experience.
        </p>
        <Link
          to="/login"
          className="landing-cta__btn"
        >
          <span>Access Universal Login</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};
