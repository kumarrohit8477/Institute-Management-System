import React from "react";
import { Shield, Building2, GraduationCap } from "lucide-react";

export const LandingRoles: React.FC = () => {
  return (
    <section id="roles" className="py-20 bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Unified Architecture
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">
            One Universal Login. Three Tailored Experiences.
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Users simply enter their email or student ID at <code>/login</code>. Our backend automatically determines their role and routes them directly to their dedicated console.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Super Admin */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Shield size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Global SaaS Control
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Super Admin</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Controls the multi-tenant SaaS platform. Onboards new institute campuses, defines subscription tiers, oversees MRR/ARR financial analytics, and manages B2B invoices.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Route: <code className="text-amber-300">/superadmin/dashboard</code>
            </div>
          </div>

          {/* Institute Admin */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Building2 size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Campus Administration
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Institute Admin</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Manages single-tenant campus operations: student admissions, batch rosters, faculty assignments, daily timetables, study materials, exam creation, and tuition fees.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Route: <code className="text-indigo-300">/admin/dashboard</code>
            </div>
          </div>

          {/* Student */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <GraduationCap size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Learner Experience
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Student Portal & Mobile</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Self-service access to live lectures, study notes, attendance tracking, timed CBT online examinations with instant scores and ranks, plus official payment receipts.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Route: <code className="text-emerald-300">/student/dashboard</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
