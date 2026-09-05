import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Send, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";
import "./LandingFooter.css";

interface LandingFooterProps {
  onOpenEnquiry?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenEnquiry }) => {
  const [imgError, setImgError] = useState<boolean>(false);

  return (
    <footer className="landing-footer">
      <div className="landing-footer__container">
        <div className="landing-footer__grid">
          {/* Brand Column */}
          <div className="landing-footer__col-brand">
            <div className="landing-footer__brand">
              <div className="landing-footer__logo-box">
                {!imgError ? (
                  <img
                    src="/assets/ims.png"
                    alt="Eduvora Logo"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Building2 size={24} className="text-blue-400" />
                )}
              </div>
              <div className="landing-footer__brand-info">
                <span className="landing-footer__brand-title">Eduvora SaaS ERP</span>
                <span className="landing-footer__brand-sub">Multi-Tenant Educational Management v1.3</span>
              </div>
            </div>
            <p className="landing-footer__brand-desc">
              Empowering academies, schools, and colleges with unified student admissions, CBT examinations, timetables, and fee ledgers.
            </p>
            <div className="landing-footer__status">
              <span className="landing-footer__status-dot"></span>
              <span>All Systems Operational • REST API & CBT Engine Live</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="landing-footer__col">
            <h4 className="landing-footer__col-title">Platform Features</h4>
            <ul className="landing-footer__links">
              <li><a href="#features">Student Enrollment & Cohorts</a></li>
              <li><a href="#features">Daily Attendance Tracking</a></li>
              <li><a href="#features">CBT Examination Engine</a></li>
              <li><a href="#preview">Interactive Dashboards</a></li>
              <li><a href="#security">Multi-Tenant Isolation</a></li>
            </ul>
          </div>

          {/* User Portals Column */}
          <div className="landing-footer__col">
            <h4 className="landing-footer__col-title">Portals & Roles</h4>
            <ul className="landing-footer__links">
              <li><Link to="/login">Super Admin Console</Link></li>
              <li><Link to="/login">Institute Admin Portal</Link></li>
              <li><Link to="/login">Student CBT Exam Portal</Link></li>
              <li><a href="#roles">Role Security Overview</a></li>
              <li><a href="#plans">Subscription Tiers</a></li>
            </ul>
          </div>

          {/* Contact & Enquiry Column */}
          <div className="landing-footer__col">
            <h4 className="landing-footer__col-title">Enquiry & Support</h4>
            <p className="landing-footer__contact-text">
              Have questions about onboarding or custom campus requirements?
            </p>
            {onOpenEnquiry && (
              <button
                type="button"
                className="landing-footer__btn-enquiry"
                onClick={onOpenEnquiry}
              >
                <Send size={14} />
                <span>Send Enquiry Form</span>
              </button>
            )}
            <div className="landing-footer__contact-info">
              <div><Mail size={14} /> <span>support@eduvora.local</span></div>
              <div><Phone size={14} /> <span>+91 (800) 123-4567</span></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="landing-footer__bottom">
          <div className="landing-footer__copy">
            &copy; {new Date().getFullYear()} Eduvora Institute Management System. All rights reserved.
          </div>
          <div className="landing-footer__badges">
            <span className="landing-footer__badge"><ShieldCheck size={13} /> Strict Data Scoping</span>
            <span className="landing-footer__badge">React 18 + Vite + Express</span>
          </div>
        </div>
      </div>
    </footer>
  );
};