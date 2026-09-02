import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export const LandingPricing: React.FC = () => {
  const plans = [
    {
      name: "Free Trial",
      tier: "14 Days Full Access",
      price: "₹0",
      period: "forever trial",
      features: [
        "Up to 30 Students",
        "3 Academic Courses",
        "5 Active Batches",
        "1 GB Storage for Materials",
        "Online CBT Testing Engine",
        "Standard Email Support",
      ],
      highlight: false,
      badge: "Starter Trial",
    },
    {
      name: "Starter Academy",
      tier: "Boutique Centers",
      price: "₹2,999",
      period: "per month",
      features: [
        "Up to 150 Students",
        "10 Academic Courses",
        "20 Active Batches",
        "5 GB Storage for Materials",
        "Online CBT Testing Engine",
        "Push Notifications System",
        "Priority Support",
      ],
      highlight: false,
      badge: "Most Popular",
    },
    {
      name: "Growth Institute",
      tier: "Expanding Academies",
      price: "₹6,999",
      period: "per month",
      features: [
        "Up to 600 Students",
        "30 Academic Courses",
        "60 Active Batches",
        "25 GB Storage for Materials",
        "Online CBT Engine + Analytics",
        "Custom Domain Support",
        "Multi-Batch Timetables",
        "24/7 Priority SLA",
      ],
      highlight: true,
      badge: "Best Value",
    },
    {
      name: "Enterprise Multi-Branch",
      tier: "Colleges & Large Chains",
      price: "₹14,999",
      period: "per month",
      features: [
        "Unlimited Students (100,000+)",
        "1,000 Courses & Batches",
        "100 GB Cloud Storage",
        "Full Online CBT + Ranks",
        "Custom Domain & White Label",
        "Direct REST API Access",
        "Dedicated Account Manager",
      ],
      highlight: false,
      badge: "Enterprise",
    },
  ];

  return (
    <section id="plans" className="py-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Transparent Pricing
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">
            Scalable Plans for Any Institute Size
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Transparent SaaS billing with monthly and annual options. Upgrade or scale your limits anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl flex flex-col justify-between transition-all ${
                p.highlight
                  ? "bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10"
                  : "bg-slate-900/60 border border-slate-800"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {p.tier}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      p.highlight
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{p.name}</h4>
                  <div className="mt-2 flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-slate-400">/{p.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center space-x-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link
                  to="/login"
                  className={`w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                    p.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  Select Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
