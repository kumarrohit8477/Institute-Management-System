import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, ShieldCheck, Globe, User } from "lucide-react";

export const SuperAdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">IMS Cloud SaaS</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Tenant Platform Control Plane</p>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">{user?.email}</p>
              <p className="text-[10px] text-purple-400 font-medium">Global Platform Owner</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-700/50 transition-all shadow-sm"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
