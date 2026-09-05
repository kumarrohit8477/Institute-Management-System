import React, { useState } from "react";
import "./LandingPreviewTabs.css";

export const LandingPreviewTabs: React.FC = () => {
  const [activePreviewTab, setActivePreviewTab] = useState<"SUPER_ADMIN" | "ADMIN" | "STUDENT">("ADMIN");

  return (
    <section id="preview" className="landing-preview">
      <div className="landing-preview__container">
        <div className="landing-preview__header">
          <h2 className="landing-preview__title">Designed for Every Stakeholder</h2>
        </div>

        {/* Preview Tab Selector */}
        <div className="landing-preview__tab-wrapper">
          <div className="landing-preview__tab-bar">
            <button
              type="button"
              onClick={() => setActivePreviewTab("ADMIN")}
              className={`landing-preview__tab-btn ${activePreviewTab === "ADMIN" ? "active" : ""}`}
            >
              🏫 Institute Admin Console
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("STUDENT")}
              className={`landing-preview__tab-btn ${activePreviewTab === "STUDENT" ? "active" : ""}`}
            >
              🎓 Student CBT & Learning
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("SUPER_ADMIN")}
              className={`landing-preview__tab-btn ${activePreviewTab === "SUPER_ADMIN" ? "active" : ""}`}
            >
              👑 Super Admin Platform
            </button>
          </div>
        </div>

        {/* Simulated Preview Canvas */}
        <div className="landing-preview__canvas">
          {activePreviewTab === "ADMIN" && (
            <div>
              <div className="landing-preview__canvas-header">
                <div>
                  <h4 className="landing-preview__canvas-title">Apex Academy Campus • Admin Console</h4>
                  <p className="landing-preview__canvas-sub">Institute Code: INST001 • Academic Year 2026-2027</p>
                </div>
                <span className="landing-preview__status-badge status--emerald">
                  Tenant Active
                </span>
              </div>
              <div className="landing-preview__cards-grid">
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">ENROLLED STUDENTS</div>
                  <div className="landing-preview__mini-val">150 Students</div>
                  <div className="landing-preview__mini-sub text--emerald">Batch capacity healthy</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">AVERAGE ATTENDANCE</div>
                  <div className="landing-preview__mini-val" style={{ color: "#4f46e5" }}>94.2%</div>
                  <div className="landing-preview__mini-sub text--slate">Across 2 Active Batches</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">CBT EXAMS CONDUCTED</div>
                  <div className="landing-preview__mini-val" style={{ color: "#d97706" }}>12 Tests</div>
                  <div className="landing-preview__mini-sub text--slate">Automated ranking active</div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === "STUDENT" && (
            <div>
              <div className="landing-preview__canvas-header">
                <div>
                  <h4 className="landing-preview__canvas-title">Student Learning Portal • Rohit Kumar</h4>
                  <p className="landing-preview__canvas-sub">Admission No: ADM-2026-0001 • Roll No: JEE-M1-01</p>
                </div>
                <span className="landing-preview__status-badge status--blue">
                  IIT-JEE 2-Year Program
                </span>
              </div>
              <div className="landing-preview__cards-grid">
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">TODAY'S CLASSES</div>
                  <div className="landing-preview__mini-val" style={{ fontSize: "1.2rem" }}>Physics Mechanics</div>
                  <div className="landing-preview__mini-sub text--indigo">09:00 AM • Room LH-101</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">LATEST MOCK SCORE</div>
                  <div className="landing-preview__mini-val" style={{ color: "#059669" }}>268 / 300</div>
                  <div className="landing-preview__mini-sub text--emerald">Rank #1 • 99.2 Percentile</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">TUITION BALANCE</div>
                  <div className="landing-preview__mini-val">₹0 Dues</div>
                  <div className="landing-preview__mini-sub text--emerald">Q1 & Q2 Installments Cleared</div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === "SUPER_ADMIN" && (
            <div>
              <div className="landing-preview__canvas-header">
                <div>
                  <h4 className="landing-preview__canvas-title">IMS Cloud SaaS • Platform Control Center</h4>
                  <p className="landing-preview__canvas-sub">Global SaaS Multi-Tenancy & B2B Billing</p>
                </div>
                <span className="landing-preview__status-badge status--indigo">
                  Multi-Tenant DB Active
                </span>
              </div>
              <div className="landing-preview__cards-grid">
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">MRR / ARR</div>
                  <div className="landing-preview__mini-val" style={{ color: "#059669" }}>₹69,990 / yr</div>
                  <div className="landing-preview__mini-sub text--slate">Growth Tier Active</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">ONBOARDED TENANTS</div>
                  <div className="landing-preview__mini-val">Apex Academy</div>
                  <div className="landing-preview__mini-sub text--indigo">Plan: Growth Tier (Auto-Renew)</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">SYSTEM HEALTH</div>
                  <div className="landing-preview__mini-val text--cyan">100% Operational</div>
                  <div className="landing-preview__mini-sub text--slate">REST APIs & Quota Gates</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
