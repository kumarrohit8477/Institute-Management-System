import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export const LandingHero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-24 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-indigo-300 mb-6 shadow-sm">
          <Sparkles size={14} className="text-indigo-400" />
          <span>Multi-Tenant Educational ERP & Computer-Based Testing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Manage Your Institute{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Smarter
          </span>
          , Scale Faster.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one SaaS platform empowering academies, coaching centers, and colleges with unified student admissions, automated CBT examination grading, timetables, attendance, and fee ledgers.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all"
          >
            <span>Universal Sign In</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            <span>Explore Capabilities</span>
          </a>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
            <div className="text-xs text-slate-400 mt-1">Tenant Isolation</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">27+</div>
            <div className="text-xs text-slate-400 mt-1">Data Entities</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Real-Time</div>
            <div className="text-xs text-slate-400 mt-1">CBT Auto-Grading</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">Web + Mobile</div>
            <div className="text-xs text-slate-400 mt-1">Unified Multi-Platform</div>
          </div>
        </div>
      </div>
    </section>
  );
};
