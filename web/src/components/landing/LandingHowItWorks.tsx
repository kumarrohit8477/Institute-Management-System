import React from "react";

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Onboard Institute Tenant",
      desc: "Super Admin creates your dedicated institute tenant with tailored subscription plans and storage quotas.",
    },
    {
      number: "02",
      title: "Configure Curriculum & Faculty",
      desc: "Set up courses, subjects, faculty profiles, and assign teachers to batches with schedule conflict prevention.",
    },
    {
      number: "03",
      title: "Enroll Students & Distribute Materials",
      desc: "Register students with automated credentials, allocate cohorts, log daily attendance, and upload study notes.",
    },
    {
      number: "04",
      title: "Conduct CBT Exams & Collect Fees",
      desc: "Author test papers, conduct live timed exams with instant grading, and manage fee invoices and receipts.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Simple 4-Step Flow
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">
            How Institutes Operate on IMS Cloud
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 relative space-y-3"
            >
              <div className="text-3xl font-black text-indigo-500/40">{st.number}</div>
              <h4 className="text-base font-bold text-white">{st.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
