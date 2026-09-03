import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { ArrowRight } from "lucide-react";

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardLink = () => {
    if (role === "SUPER_ADMIN") return "/superadmin/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "STUDENT") return "/student/dashboard";
    return "/login";
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/20">
            IMS
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">IMS Cloud</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              SaaS ERP
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#roles" className="hover:text-white transition-colors">Roles & Security</a>
          <a href="#preview" className="hover:text-white transition-colors">Dashboards</a>
          <a href="#plans" className="hover:text-white transition-colors">Plans & Pricing</a>
        </nav>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <Link
              to={getDashboardLink()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Dashboard ({role})</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
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
