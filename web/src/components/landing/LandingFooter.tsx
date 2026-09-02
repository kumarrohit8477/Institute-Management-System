import React from "react";
import { Link } from "react-router-dom";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="py-12 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            IMS
          </div>
          <div>
            <div className="font-bold text-white text-sm">Institute Management System</div>
            <div>Multi-Tenant Educational ERP SaaS v1.3</div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#roles" className="hover:text-white transition-colors">Roles</a>
          <a href="#plans" className="hover:text-white transition-colors">Pricing</a>
          <Link to="/login" className="hover:text-white transition-colors text-indigo-400 font-semibold">
            Sign In
          </Link>
        </div>

        <div>
          © {new Date().getFullYear()} IMS Cloud. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
