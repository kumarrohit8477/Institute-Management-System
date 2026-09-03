import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { InstituteApiService } from "@/src/services/instituteApi";
import { LogOut, Shield, Menu } from "lucide-react";
import "./AdminNavbar.css";

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onToggleSidebar,
}) => {
  const { user, institute, logout } = useAuth();

  const currentLogo = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const adminEmail = user?.email || "admin@ims.edu";

  return (
    <header className="admin-navbar">
      {/* Brand & Campus info */}
      <div className="admin-navbar__brand">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="admin-navbar__menu-button"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {currentLogo ? (
          <img
            src={currentLogo}
            alt={institute?.name || "Institute Logo"}
            className="admin-navbar__logo-image"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="admin-navbar__logo-fallback">
            {institute?.name?.[0] || "IMS"}
          </div>
        )}

        <div className="admin-navbar__brand-info">
          <div className="admin-navbar__brand-title">
            {institute?.name || "Apex Institute"}
          </div>
          <div className="admin-navbar__brand-subtitle">
            {institute?.tagline ? (
              <span className="admin-navbar__tagline" title={institute.tagline} style={{ fontStyle: "italic", color: "#4f46e5" }}>
                "{institute.tagline}"
              </span>
            ) : (
              "Administrator Console"
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="admin-navbar__actions">
        {/* User Identity Chip */}
        <Link
          to="/admin/profile"
          className="admin-navbar__user-profile"
          style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
          title="View Institute & Admin Profile"
        >
          <div className="admin-navbar__user-avatar">
            <Shield size={16} />
          </div>

          <div className="admin-navbar__user-info">
            <span className="admin-navbar__user-name">{adminEmail}</span>
            <span className="admin-navbar__user-role">
              Institute Administrator
            </span>
          </div>

          <span className="admin-navbar__role-badge">ADMIN</span>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="admin-navbar__logout-button"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
