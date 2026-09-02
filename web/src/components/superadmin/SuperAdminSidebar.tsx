import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Layers,
  Receipt,
  Server,
  Zap,
  TrendingUp
} from "lucide-react";

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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-61px)] text-slate-300">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Platform Management
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm font-semibold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Multi-Tenant Quick Stats card */}
        <div className="bg-gradient-to-b from-slate-800/80 to-slate-800/40 rounded-2xl p-4 border border-slate-700/60 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Multi-Tenancy</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-Tenant isolated architecture with dynamic quotas and sub-tenant routing.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium pt-1">
            <Server className="w-3.5 h-3.5" />
            <span>Multi-Tenant DB Active</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>IMS Cloud SaaS v1.3</span>
        <div className="flex items-center space-x-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online</span>
        </div>
      </div>
    </aside>
  );
};
