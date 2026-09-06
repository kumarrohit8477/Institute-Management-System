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
                  <h4 className="landing-preview__canvas-title">Institute Admin Console</h4>
                  <p className="landing-preview__canvas-sub">Tenant Workspace • Academic Management</p>
                </div>
                <span className="landing-preview__status-badge status--emerald">
                  Tenant Active
                </span>
              </div>
              <div className="landing-preview__cards-grid">
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">ENROLLED STUDENTS</div>
                  <div className="landing-preview__mini-val">Active Roster</div>
                  <div className="landing-preview__mini-sub text--emerald">Batch capacity healthy</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">AVERAGE ATTENDANCE</div>
                  <div className="landing-preview__mini-val" style={{ color: "#4f46e5" }}>Attendance Metrics</div>
                  <div className="landing-preview__mini-sub text--slate">Across Active Batches</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">CBT EXAMS CONDUCTED</div>
                  <div className="landing-preview__mini-val" style={{ color: "#d97706" }}>Online Exams</div>
                  <div className="landing-preview__mini-sub text--slate">Automated ranking active</div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === "STUDENT" && (
            <div>
              <div className="landing-preview__canvas-header">
                <div>
                  <h4 className="landing-preview__canvas-title">Student Learning Portal</h4>
                  <p className="landing-preview__canvas-sub">Student Dashboard • CBT Examination & Timetable</p>
                </div>
                <span className="landing-preview__status-badge status--blue">
                  Enrolled Program
                </span>
              </div>
              <div className="landing-preview__cards-grid">
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">TODAY'S CLASSES</div>
                  <div className="landing-preview__mini-val" style={{ fontSize: "1.2rem" }}>Interactive Lectures</div>
                  <div className="landing-preview__mini-sub text--indigo">Live Schedule & Rooms</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">LATEST MOCK SCORE</div>
                  <div className="landing-preview__mini-val" style={{ color: "#059669" }}>CBT Analytics</div>
                  <div className="landing-preview__mini-sub text--emerald">Ranks & Scorecards</div>
                </div>
                <div className="landing-preview__mini-card">
                  <div className="landing-preview__mini-label">TUITION BALANCE</div>
                  <div className="landing-preview__mini-val">Fee Overview</div>
                  <div className="landing-preview__mini-sub text--emerald">Installment Clearance</div>
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
