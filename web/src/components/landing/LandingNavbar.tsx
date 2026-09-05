import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { ArrowRight, Send, Menu, X, Building2 } from "lucide-react";
import { EnquiryModal } from "./EnquiryModal";
import "./LandingNavbar.css";

interface LandingNavbarProps {
  onOpenEnquiry?: (plan?: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenEnquiry }) => {
  const { isAuthenticated, role } = useAuth();
  const [internalModalOpen, setInternalModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const handleEnquiryClick = (plan?: string) => {
    setIsMobileMenuOpen(false);
    if (onOpenEnquiry) {
      onOpenEnquiry(plan);
    } else {
      setInternalModalOpen(true);
    }
  };

  const getDashboardLink = () => {
    if (role === "SUPER_ADMIN") return "/superadmin/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "STUDENT") return "/student/dashboard";
    return "/login";
  };

  return (
    <>
      <header className="landing-navbar">
        <div className="landing-navbar__container">
          <Link to="/" className="landing-navbar__brand">
            <div className="landing-navbar__logo-box">
              {!imgError ? (
                <img
                  src="/assets/ims.png"
                  alt="Eduvora Logo"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Building2 size={24} className="text-indigo-600" />
              )}
            </div>
            <div className="landing-navbar__brand-text">
              <span className="landing-navbar__brand-title">Eduvora</span>
              <span className="landing-navbar__brand-tag">SaaS ERP</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="landing-navbar__nav">
            <a href="#features" className="landing-navbar__nav-link">Features</a>
            <a href="#how-it-works" className="landing-navbar__nav-link">How It Works</a>
            <a href="#roles" className="landing-navbar__nav-link">Roles</a>
            <a href="#preview" className="landing-navbar__nav-link">Dashboards</a>
            <a href="#security" className="landing-navbar__nav-link">Security</a>
            <a href="#plans" className="landing-navbar__nav-link">Plans & Pricing</a>
          </nav>

          {/* Desktop Actions */}
          <div className="landing-navbar__actions">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => handleEnquiryClick()}
                  className="landing-navbar__btn-enquiry-outline"
                >
                  <Send size={15} />
                  <span>Send Enquiry</span>
                </button>

                <Link
                  to={getDashboardLink()}
                  className="landing-navbar__btn-getstarted"
                >
                  <span>Dashboard ({role})</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="landing-navbar__btn-signin">
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => handleEnquiryClick()}
                  className="landing-navbar__btn-getstarted"
                >
                  <span>Send Enquiry</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            className="landing-navbar__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="landing-navbar__mobile-drawer">
            <nav className="landing-navbar__mobile-nav">
              <a
                href="#features"
                className="landing-navbar__mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="landing-navbar__mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#roles"
                className="landing-navbar__mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Roles & Security
              </a>
              <a
                href="#preview"
                className="landing-navbar__mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboards
              </a>
              <a
                href="#security"
                className="landing-navbar__mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Security & Isolation
              </a>
              <a
                href="#plans"
                className="landing-navbar__mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Plans & Pricing
              </a>
            </nav>

            <div className="landing-navbar__mobile-actions">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="landing-navbar__btn-getstarted"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Dashboard ({role})</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="landing-navbar__btn-signin"
                  style={{ textAlign: "center" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In to Account
                </Link>
              )}

              <button
                type="button"
                onClick={() => handleEnquiryClick()}
                className="landing-navbar__btn-getstarted"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span>Send Enquiry</span>
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

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
