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
          </div>


          {/* Contact & Enquiry Column */}
          <div className="landing-footer__col">
            <h4 className="landing-footer__col-title">Enquiry & Support</h4>
            <p className="landing-footer__contact-text">
              Have questions about onboarding or custom campus requirements?
            </p>
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
        </div>
      </div>
    </footer>
  );
};