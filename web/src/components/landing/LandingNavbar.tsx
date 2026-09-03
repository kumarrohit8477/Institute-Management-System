import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { ArrowRight } from "lucide-react";
import "./LandingNavbar.css";

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardLink = () => {
    if (role === "SUPER_ADMIN") return "/superadmin/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "STUDENT") return "/student/dashboard";
    return "/login";
  };

  return (
    <header className="landing-navbar">
      <div className="landing-navbar__container">
        <Link to="/" className="landing-navbar__brand">
          <div className="landing-navbar__logo-box">
            IMS
          </div>
          <div className="landing-navbar__brand-text">
            <span className="landing-navbar__brand-title">IMS Cloud</span>
            <span className="landing-navbar__brand-tag">
              SaaS ERP
            </span>
          </div>
        </Link>

        <nav className="landing-navbar__nav">
          <a href="#features" className="landing-navbar__nav-link">Features</a>
          <a href="#how-it-works" className="landing-navbar__nav-link">How It Works</a>
          <a href="#roles" className="landing-navbar__nav-link">Roles & Security</a>
          <a href="#preview" className="landing-navbar__nav-link">Dashboards</a>
          <a href="#plans" className="landing-navbar__nav-link">Plans & Pricing</a>
        </nav>

        <div className="landing-navbar__actions">
          {isAuthenticated ? (
            <Link
              to={getDashboardLink()}
              className="landing-navbar__btn-getstarted"
            >
              <span>Dashboard ({role})</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="landing-navbar__btn-signin"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="landing-navbar__btn-getstarted"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
