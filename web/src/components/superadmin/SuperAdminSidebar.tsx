import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Layers,
  Receipt,
  Server,
  Zap
} from "lucide-react";
import "./SuperAdminSidebar.css";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Platform Overview", to: "/superadmin/dashboard", icon: LayoutDashboard },
  { label: "Institutes Directory", to: "/superadmin/institutes", icon: Building2 },
  { label: "Subscription Plans", to: "/superadmin/plans", icon: Layers },
  { label: "Platform Invoices", to: "/superadmin/invoices", icon: Receipt }
];

export const SuperAdminSidebar: React.FC = () => {
  return (
    <aside className="superadmin-sidebar">
      <div className="superadmin-sidebar__content">
        <div>
          <p className="superadmin-sidebar__section-title">
            Platform Management
          </p>
          <nav className="superadmin-sidebar__nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `superadmin-sidebar__nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon className="superadmin-sidebar__nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Multi-Tenant Quick Stats card */}
        <div className="superadmin-sidebar__widget">
          <div className="superadmin-sidebar__widget-header">
            <Zap className="w-4 h-4" />
            <span>Multi-Tenancy</span>
          </div>
          <p className="superadmin-sidebar__widget-desc">
            Multi-Tenant isolated architecture with dynamic quotas and sub-tenant routing.
          </p>
          <div className="superadmin-sidebar__widget-status">
            <Server className="w-3.5 h-3.5" />
            <span>Multi-Tenant DB Active</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="superadmin-sidebar__footer">
        <span>IMS Cloud SaaS v1.3</span>
        <div className="superadmin-sidebar__status-pill">
          <span className="superadmin-sidebar__pulse-dot"></span>
          <span>Online</span>
        </div>
      </div>
    </aside>
  );
};
