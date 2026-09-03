import React from "react";
import { Shield, Building2, GraduationCap } from "lucide-react";
import "./LandingRoles.css";

export const LandingRoles: React.FC = () => {
  return (
    <section id="roles" className="landing-roles">
      <div className="landing-roles__container">
        <div className="landing-roles__header">
          <span className="landing-roles__tag">
            Unified Architecture
          </span>
          <h2 className="landing-roles__title">
            One Universal Login. Three Tailored Experiences.
          </h2>
          <p className="landing-roles__desc">
            Users simply enter their email or student ID at <code>/login</code>. Our backend automatically determines their role and routes them directly to their dedicated console.
          </p>
        </div>

        <div className="landing-roles__grid">
          {/* Super Admin */}
          <div className="landing-roles__card">
            <div>
              <div className="landing-roles__icon-box box--amber">
                <Shield size={20} />
              </div>
              <span className="landing-roles__role-tag tag--amber">
                Global SaaS Control
              </span>
              <h3 className="landing-roles__role-title">Super Admin</h3>
              <p className="landing-roles__role-desc">
                Controls the multi-tenant SaaS platform. Onboards new institute campuses, defines subscription tiers, oversees MRR/ARR financial analytics, and manages B2B invoices.
              </p>
            </div>
            <div className="landing-roles__card-footer">
              <span>Route:</span>
              <code className="landing-roles__route-code route--amber">/superadmin/dashboard</code>
            </div>
          </div>

          {/* Institute Admin */}
          <div className="landing-roles__card">
            <div>
              <div className="landing-roles__icon-box box--indigo">
                <Building2 size={20} />
              </div>
              <span className="landing-roles__role-tag tag--indigo">
                Campus Administration
              </span>
              <h3 className="landing-roles__role-title">Institute Admin</h3>
              <p className="landing-roles__role-desc">
                Manages single-tenant campus operations: student admissions, batch rosters, faculty assignments, daily timetables, study materials, exam creation, and tuition fees.
              </p>
            </div>
            <div className="landing-roles__card-footer">
              <span>Route:</span>
              <code className="landing-roles__route-code route--indigo">/admin/dashboard</code>
            </div>
          </div>

          {/* Student */}
          <div className="landing-roles__card">
            <div>
              <div className="landing-roles__icon-box box--emerald">
                <GraduationCap size={20} />
              </div>
              <span className="landing-roles__role-tag tag--emerald">
                Learner Experience
              </span>
              <h3 className="landing-roles__role-title">Student Portal & Mobile</h3>
              <p className="landing-roles__role-desc">
                Self-service access to live lectures, study notes, attendance tracking, timed CBT online examinations with instant scores and ranks, plus official payment receipts.
              </p>
            </div>
            <div className="landing-roles__card-footer">
              <span>Route:</span>
              <code className="landing-roles__route-code route--emerald">/student/dashboard</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
