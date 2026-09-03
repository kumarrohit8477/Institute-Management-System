import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import "./LandingPricing.css";

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
    <section id="plans" className="landing-pricing">
      <div className="landing-pricing__container">
        <div className="landing-pricing__header">
          <span className="landing-pricing__tag">
            Transparent Pricing
          </span>
          <h2 className="landing-pricing__title">
            Scalable Plans for Any Institute Size
          </h2>
          <p className="landing-pricing__desc">
            Transparent SaaS billing with monthly and annual options. Upgrade or scale your limits anytime.
          </p>
        </div>

        <div className="landing-pricing__grid">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`landing-pricing__card ${
                p.highlight ? "landing-pricing__card--featured" : ""
              }`}
            >
              <div>
                <div className="landing-pricing__card-top">
                  <span className="landing-pricing__tier-label">
                    {p.tier}
                  </span>
                  <span
                    className={`landing-pricing__badge ${
                      p.highlight ? "badge--featured" : "badge--normal"
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <div>
                  <h4 className="landing-pricing__plan-name">{p.name}</h4>
                  <div className="landing-pricing__price-row">
                    <span className="landing-pricing__price">{p.price}</span>
                    <span className="landing-pricing__period">/{p.period}</span>
                  </div>
                </div>

                <ul className="landing-pricing__features">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="landing-pricing__feature-item">
                      <CheckCircle2 size={14} className="landing-pricing__check" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  to="/login"
                  className={`landing-pricing__btn ${
                    p.highlight ? "btn--featured" : "btn--normal"
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
