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
import "./LandingFeatures.css";

export const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: Users,
      color: "#2563eb",
      title: "Student Enrollment & Cohorts",
      desc: "Streamlined student admissions, auto-credential provisioning, roll numbers, and batch capacity tracking.",
    },
    {
      icon: CheckCircle2,
      color: "#059669",
      title: "Daily Attendance Tracking",
      desc: "Batch-wise daily attendance marking with automated presence % calculations and good standing badges.",
    },
    {
      icon: BookOpen,
      color: "#7c3aed",
      title: "Curriculum & Faculty Directory",
      desc: "Structured courses, subject disciplines, and faculty qualification mapping without separate credentials.",
    },
    {
      icon: Calendar,
      color: "#d97706",
      title: "Timetable & Online Classes",
      desc: "Weekly class scheduling, room allocation, meeting links for virtual masterclasses, and conflict detection.",
    },
    {
      icon: Zap,
      color: "#db2777",
      title: "Online CBT Examination Engine",
      desc: "Rich question bank with single/multi-choice & numerical questions, live timers, and auto-saving sessions.",
    },
    {
      icon: Award,
      color: "#0891b2",
      title: "Automated Grading & Dynamic Ranks",
      desc: "Instant test evaluation, negative marking, automated percentile calculation, and cohort-wide rankings.",
    },
    {
      icon: CreditCard,
      color: "#4f46e5",
      title: "Tuition Fees & Official Receipts",
      desc: "Fee invoicing, scholarship deductions, installment logs, and official printable receipt vouchers.",
    },
    {
      icon: Database,
      color: "#0d9488",
      title: "Multi-Tenant SaaS Data Isolation",
      desc: "Strict tenant isolation per institute with real-time resource quota tracking (students, courses, batches).",
    },
    {
      icon: Smartphone,
      color: "#ea580c",
      title: "Mobile Student Experience",
      desc: "Dedicated student mobile app (React Native / Expo) for schedules, exams, results, and fee receipts on the go.",
    },
  ];

  return (
    <section id="features" className="landing-features">
      <div className="landing-features__container">
        <div className="landing-features__header">
          <span className="landing-features__tag">
            Comprehensive Modules
          </span>
          <h2 className="landing-features__title">
            Everything Your Institute Needs to Run Smoothly
          </h2>
          <p className="landing-features__desc">
            From academic prerequisites to financial collection and live online assessments, all modules integrate seamlessly without third-party friction.
          </p>
        </div>

        <div className="landing-features__grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="landing-features__card"
              >
                <div
                  className="landing-features__icon-box"
                  style={{ backgroundColor: `${feat.color}15`, color: feat.color }}
                >
                  <Icon size={24} />
                </div>
                <h3 className="landing-features__card-title">{feat.title}</h3>
                <p className="landing-features__card-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
