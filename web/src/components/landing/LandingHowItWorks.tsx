import React from "react";
import "./LandingHowItWorks.css";

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
    <section id="how-it-works" className="landing-how">
      <div className="landing-how__container">
        <div className="landing-how__header">
          <h2 className="landing-how__title">
            How Institutes Operate on IMS Cloud
          </h2>
        </div>

        <div className="landing-how__grid">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="landing-how__card"
            >
              <div className="landing-how__number">{st.number}</div>
              <h4 className="landing-how__step-title">{st.title}</h4>
              <p className="landing-how__step-desc">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
