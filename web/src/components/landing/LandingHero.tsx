import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { ArrowRight } from "lucide-react";
import "./LandingHero.css";

export const LandingHero: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardLink = () => {
    if (role === "SUPER_ADMIN") return "/superadmin/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "TEACHER") return "/teacher/dashboard";
    if (role === "STUDENT") return "/student/dashboard";
    return "/login";
  };

  return (
    <section className="landing-hero">
      <div className="landing-hero__container">
        <h1 className="landing-hero__title">
          Manage Your Institute
            Smarter, Scale Faster.
        </h1>

        <p className="landing-hero__desc">
          The all-in-one SaaS platform empowering academies, coaching centers, and colleges with unified student admissions, automated CBT examination grading, timetables, attendance, and fee ledgers.
        </p>

        <div className="landing-hero__cta-group">
          {isAuthenticated ? (
            <Link
              to={getDashboardLink()}
              className="landing-hero__btn-primary"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="landing-hero__btn-primary"
              >
                <span>Register Your Institute</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="landing-hero__btn-secondary"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Key Metrics Strip */}
        <div className="landing-hero__metrics-grid">
          <div className="landing-hero__metric-card">
            <div className="landing-hero__metric-num">100%</div>
            <div className="landing-hero__metric-label">Tenant Isolation</div>
          </div>
          <div className="landing-hero__metric-card">
            <div className="landing-hero__metric-num metric--indigo">27+</div>
            <div className="landing-hero__metric-label">Data Entities</div>
          </div>
          <div className="landing-hero__metric-card">
            <div className="landing-hero__metric-num metric--emerald">Real-Time</div>
            <div className="landing-hero__metric-label">CBT Auto-Grading</div>
          </div>
          <div className="landing-hero__metric-card">
            <div className="landing-hero__metric-num metric--amber">Web + Mobile</div>
            <div className="landing-hero__metric-label">Unified Multi-Platform</div>
          </div>
        </div>
      </div>
    </section>
  );
};
