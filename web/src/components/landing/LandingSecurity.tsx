import React from "react";
import { CheckCircle2, Lock } from "lucide-react";
import "./LandingSecurity.css";

export const LandingSecurity: React.FC = () => {
  return (
    <section id="security" className="landing-security">
      <div className="landing-security__container">
        <div className="landing-security__grid">
          <div className="landing-security__content">
            <h2 className="landing-security__title">
              Strict Multi-Tenant Isolation by Design
            </h2>
            <p className="landing-security__desc">
              Every institute functions within a private boundary. Organization data is strictly scoped, meaning an administrator or student from Institute A can never query, inspect, or modify records from Institute B.
            </p>
            <div className="landing-security__bullets">
              <div className="landing-security__bullet">
                <CheckCircle2 size={18} className="landing-security__bullet-icon" />
                <span>Subdomain & header-based tenant resolution middleware</span>
              </div>
              <div className="landing-security__bullet">
                <CheckCircle2 size={18} className="landing-security__bullet-icon" />
                <span>Real-time quota gates enforcing plan limits on students & batches</span>
              </div>
              <div className="landing-security__bullet">
                <CheckCircle2 size={18} className="landing-security__bullet-icon" />
                <span>JWT claim security verifying user role & institute association</span>
              </div>
            </div>
          </div>

          <div className="landing-security__card">
            <div className="landing-security__card-header">
              <Lock size={20} />
              <span>Zero Trust Multi-Tenancy Engine</span>
            </div>
            <div className="landing-security__code-box">
              <div>
                <span className="code-key--indigo">Request:</span> GET /api/v1/students
              </div>
              <div>
                <span className="code-key--amber">Middleware:</span> resolveTenantContext()
              </div>
              <div>
                <span className="code-key--emerald">Enforcement:</span> WHERE instituteId = 'tenant-id'
              </div>
              <div>
                <span className="code-key--cyan">Result:</span> Isolated dataset returned securely
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
