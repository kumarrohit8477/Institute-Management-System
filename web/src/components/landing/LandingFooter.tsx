import React from "react";
import { Link } from "react-router-dom";
import "./LandingFooter.css";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__container">
        <div className="landing-footer__brand">
          <div className="landing-footer__logo-box">
            IMS
          </div>
          <div>
            <div className="landing-footer__brand-title">Institute Management System</div>
            <div className="landing-footer__brand-sub">Multi-Tenant Educational ERP SaaS v1.3</div>
          </div>
        </div>

        <div className="landing-footer__links">
          <a href="#features" className="landing-footer__link">Features</a>
          <a href="#roles" className="landing-footer__link">Roles</a>
          <a href="#plans" className="landing-footer__link">Pricing</a>
          <Link to="/login" className="landing-footer__link link--signin">
            Sign In
          </Link>
        </div>

        <div className="landing-footer__copy">
          © {new Date().getFullYear()} IMS Cloud. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
