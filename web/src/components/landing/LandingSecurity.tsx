import React from "react";
import { CheckCircle2, Lock } from "lucide-react";

export const LandingSecurity: React.FC = () => {
  return (
    <section id="multi-tenant" className="py-20 bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Enterprise Security
            </span>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Strict Multi-Tenant Isolation by Design
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every institute functions within a private boundary. Organization data is strictly scoped, meaning an administrator or student from Institute A can never query, inspect, or modify records from Institute B.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>Subdomain & header-based tenant resolution middleware</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>Real-time quota gates enforcing plan limits on students & batches</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>JWT claim security verifying user role & institute association</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950/40 border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-indigo-400 font-bold text-sm">
              <Lock size={20} />
              <span>Zero Trust Multi-Tenancy Engine</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <div>
                <span className="text-indigo-400">Request:</span> GET /api/v1/students
              </div>
              <div>
                <span className="text-amber-400">Middleware:</span> resolveTenantContext()
              </div>
              <div>
                <span className="text-emerald-400">Enforcement:</span> WHERE instituteId = 'tenant-id'
              </div>
              <div>
                <span className="text-cyan-400">Result:</span> Isolated dataset returned securely
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
