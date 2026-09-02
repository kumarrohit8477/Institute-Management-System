import React, { useState } from "react";

export const LandingPreviewTabs: React.FC = () => {
  const [activePreviewTab, setActivePreviewTab] = useState<"SUPER_ADMIN" | "ADMIN" | "STUDENT">("ADMIN");

  return (
    <section id="preview" className="py-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Interactive Preview
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">Designed for Every Stakeholder</h2>
        </div>

        {/* Preview Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setActivePreviewTab("ADMIN")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === "ADMIN"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🏫 Institute Admin Console
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("STUDENT")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === "STUDENT"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎓 Student CBT & Learning
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("SUPER_ADMIN")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === "SUPER_ADMIN"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              👑 Super Admin Platform
            </button>
          </div>
        </div>

        {/* Simulated Preview Canvas */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl max-w-5xl mx-auto">
          {activePreviewTab === "ADMIN" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white">Apex Academy Campus • Admin Console</h4>
                  <p className="text-xs text-slate-400">Institute Code: INST001 • Academic Year 2026-2027</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Tenant Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">ENROLLED STUDENTS</div>
                  <div className="text-2xl font-bold text-white mt-1">150 Students</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Batch capacity healthy</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">AVERAGE ATTENDANCE</div>
                  <div className="text-2xl font-bold text-indigo-400 mt-1">94.2%</div>
                  <div className="text-[11px] text-slate-400 mt-1">Across 2 Active Batches</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">CBT EXAMS CONDUCTED</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">12 Tests</div>
                  <div className="text-[11px] text-slate-400 mt-1">Automated ranking active</div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === "STUDENT" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white">Student Learning Portal • Rohit Kumar</h4>
                  <p className="text-xs text-slate-400">Admission No: ADM-2026-0001 • Roll No: JEE-M1-01</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  IIT-JEE 2-Year Program
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">TODAY'S CLASSES</div>
                  <div className="text-lg font-bold text-white mt-1">Physics Mechanics</div>
                  <div className="text-[11px] text-indigo-400 mt-1">09:00 AM • Room LH-101</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">LATEST MOCK SCORE</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">268 / 300</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Rank #1 • 99.2 Percentile</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">TUITION BALANCE</div>
                  <div className="text-2xl font-bold text-white mt-1">₹0 Dues</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Q1 & Q2 Installments Cleared</div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === "SUPER_ADMIN" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white">IMS Cloud SaaS • Platform Control Center</h4>
                  <p className="text-xs text-slate-400">Global SaaS Multi-Tenancy & B2B Billing</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Multi-Tenant DB Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">MRR / ARR</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">₹69,990 / yr</div>
                  <div className="text-[11px] text-slate-400 mt-1">Growth Tier Active</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">ONBOARDED TENANTS</div>
                  <div className="text-2xl font-bold text-white mt-1">Apex Academy</div>
                  <div className="text-[11px] text-indigo-400 mt-1">Plan: Growth Tier (Auto-Renew)</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">SYSTEM HEALTH</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">100% Operational</div>
                  <div className="text-[11px] text-slate-400 mt-1">REST APIs & Quota Gates</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
