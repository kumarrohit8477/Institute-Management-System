import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { LogOut, ShieldCheck, Globe } from "lucide-react";
import "./SuperAdminNavbar.css";

export const SuperAdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="superadmin-navbar">
      <div className="superadmin-navbar__inner">
        {/* Left: Brand Identity */}
        <div className="superadmin-navbar__brand">
          <div className="superadmin-navbar__brand-icon">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="superadmin-navbar__brand-info">
            <div className="superadmin-navbar__brand-row">
              <span className="superadmin-navbar__brand-title">IMS Cloud SaaS</span>
              <span className="superadmin-navbar__badge">
                Super Admin
              </span>
            </div>
            <p className="superadmin-navbar__brand-sub">Multi-Tenant Platform Control Plane</p>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="superadmin-navbar__actions">
          <div className="superadmin-navbar__profile">
            <div className="superadmin-navbar__profile-avatar">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="superadmin-navbar__profile-details">
              <p className="superadmin-navbar__profile-email">{user?.email}</p>
              <p className="superadmin-navbar__profile-role">Global Platform Owner</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="superadmin-navbar__logout-btn"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
