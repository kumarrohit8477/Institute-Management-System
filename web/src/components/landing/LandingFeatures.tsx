import React from "react";
import {
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  Zap,
  Award,
  CreditCard,
  Database,
  Smartphone,
} from "lucide-react";

export const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: Users,
      color: "#3b82f6",
      title: "Student Enrollment & Cohorts",
      desc: "Streamlined student admissions, auto-credential provisioning, roll numbers, and batch capacity tracking.",
    },
    {
      icon: CheckCircle2,
      color: "#10b981",
      title: "Daily Attendance Tracking",
      desc: "Batch-wise daily attendance marking with automated presence % calculations and good standing badges.",
    },
    {
      icon: BookOpen,
      color: "#8b5cf6",
      title: "Curriculum & Faculty Directory",
      desc: "Structured courses, subject disciplines, and faculty qualification mapping without separate credentials.",
    },
    {
      icon: Calendar,
      color: "#f59e0b",
      title: "Timetable & Online Classes",
      desc: "Weekly class scheduling, room allocation, meeting links for virtual masterclasses, and conflict detection.",
    },
    {
      icon: Zap,
      color: "#ec4899",
      title: "Online CBT Examination Engine",
      desc: "Rich question bank with single/multi-choice & numerical questions, live timers, and auto-saving sessions.",
    },
    {
      icon: Award,
      color: "#06b6d4",
      title: "Automated Grading & Dynamic Ranks",
      desc: "Instant test evaluation, negative marking, automated percentile calculation, and cohort-wide rankings.",
    },
    {
      icon: CreditCard,
      color: "#6366f1",
      title: "Tuition Fees & Official Receipts",
      desc: "Fee invoicing, scholarship deductions, installment logs, and official printable receipt vouchers.",
    },
    {
      icon: Database,
      color: "#14b8a6",
      title: "Multi-Tenant SaaS Data Isolation",
      desc: "Strict tenant isolation per institute with real-time resource quota tracking (students, courses, batches).",
    },
    {
      icon: Smartphone,
      color: "#f97316",
      title: "Mobile Student Experience",
      desc: "Dedicated student mobile app (React Native / Expo) for schedules, exams, results, and fee receipts on the go.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-900/50 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Comprehensive Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Everything Your Institute Needs to Run Smoothly
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            From academic prerequisites to financial collection and live online assessments, all modules integrate seamlessly without third-party friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${feat.color}15`, color: feat.color }}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
