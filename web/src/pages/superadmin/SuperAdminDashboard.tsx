import React, { useEffect, useState } from "react";
import { SaasApi, SaasKPIs, InstituteTenantItem, PlatformInvoiceItem } from "@/src/services/saasApi";
import {
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import "./SuperAdminDashboard.css";

export const SuperAdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<SaasKPIs | null>(null);
  const [recentInstitutes, setRecentInstitutes] = useState<InstituteTenantItem[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<PlatformInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SaasApi.getPlatformOverview();
      setKpis(data.kpis);
      setRecentInstitutes(data.recentInstitutes || []);
      setRecentInvoices(data.recentInvoices || []);
    } catch (err: any) {
      setError(err.message || "Failed to load platform analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="superadmin-dashboard__loader">
        <div className="superadmin-dashboard__spinner"></div>
        <p className="superadmin-dashboard__loader-text">Loading SaaS platform metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="superadmin-dashboard__error">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <h3 className="superadmin-dashboard__error-title">Unable to load platform analytics</h3>
        <p className="superadmin-dashboard__error-desc">{error}</p>
        <button
          onClick={fetchOverview}
          className="superadmin-dashboard__btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Monthly Recurring Revenue",
      value: `₹${(kpis?.monthlyRecurringRevenue || 0).toLocaleString("en-IN")}`,
      subtitle: `ARR: ₹${(kpis?.annualRecurringRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconClass: "icon-emerald"
    },
    {
      title: "Total Institutes",
      value: kpis?.totalInstitutes || 0,
      subtitle: `${kpis?.activeTenants || 0} Active / ${kpis?.trialTenants || 0} Trial`,
      icon: Building2,
      iconClass: "icon-indigo"
    },
    {
      title: "System-Wide Students",
      value: (kpis?.totalStudents || 0).toLocaleString("en-IN"),
      subtitle: `${kpis?.totalCourses || 0} Courses across all institutes`,
      icon: Users,
      iconClass: "icon-purple"
    },
    {
      title: "Total Platform Revenue",
      value: `₹${(kpis?.totalLifetimeRevenue || 0).toLocaleString("en-IN")}`,
      subtitle: "Lifetime B2B Invoices Paid",
      icon: TrendingUp,
      iconClass: "icon-amber"
    }
  ];

  return (
    <div className="superadmin-dashboard">
      {/* Header */}
      <div className="superadmin-dashboard__header">
        <div>
          <h1 className="superadmin-dashboard__title">Platform Control Center</h1>
          <p className="superadmin-dashboard__subtitle">
            Real-time SaaS multi-tenancy overview, MRR analytics, and tenant resource health.
          </p>
        </div>
        <div>
          <Link
            to="/superadmin/institutes"
            className="superadmin-dashboard__btn-primary"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Institutes</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="superadmin-dashboard__kpis">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="superadmin-dashboard__kpi-card">
              <div className="superadmin-dashboard__kpi-top">
                <span className="superadmin-dashboard__kpi-label">{card.title}</span>
                <div className={`superadmin-dashboard__kpi-icon ${card.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="superadmin-dashboard__kpi-val">{card.value}</p>
                <p className="superadmin-dashboard__kpi-sub">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Institutes & Recent Invoices */}
      <div className="superadmin-dashboard__grid-2">
        {/* Recent Institutes */}
        <div className="superadmin-dashboard__card">
          <div className="superadmin-dashboard__card-header">
            <div className="superadmin-dashboard__card-title-row">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h2 className="superadmin-dashboard__card-title">Recent Institute Onboardings</h2>
            </div>
            <Link
              to="/superadmin/institutes"
              className="superadmin-dashboard__card-link"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="superadmin-dashboard__list">
            {recentInstitutes.length === 0 ? (
              <p className="superadmin-dashboard__empty-text">No institutes onboarded yet.</p>
            ) : (
              recentInstitutes.map((inst) => (
                <div key={inst.id} className="superadmin-dashboard__list-item">
                  <div className="superadmin-dashboard__item-info">
                    <div className="superadmin-dashboard__item-title-row">
                      <p className="superadmin-dashboard__item-name">{inst.name}</p>
                      <span className="superadmin-dashboard__code-tag">
                        {inst.code}
                      </span>
                    </div>
                    <p className="superadmin-dashboard__item-sub">
                      Plan: <strong>{inst.subscription?.plan.name || "Free Trial"}</strong>
                    </p>
                  </div>
                  <div className="superadmin-dashboard__item-right">
                    <span
                      className={`sa-badge ${
                        inst.status === "ACTIVE"
                          ? "sa-badge--active"
                          : inst.status === "TRIAL"
                          ? "sa-badge--trial"
                          : "sa-badge--suspended"
                      }`}
                    >
                      {inst.status}
                    </span>
                    <span className="superadmin-dashboard__date">
                      {new Date(inst.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent B2B Platform Invoices */}
        <div className="superadmin-dashboard__card">
          <div className="superadmin-dashboard__card-header">
            <div className="superadmin-dashboard__card-title-row">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              <h2 className="superadmin-dashboard__card-title">Recent B2B Invoices</h2>
            </div>
            <Link
              to="/superadmin/invoices"
              className="superadmin-dashboard__card-link"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="superadmin-dashboard__list">
            {recentInvoices.length === 0 ? (
              <p className="superadmin-dashboard__empty-text">No platform invoices generated yet.</p>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.id} className="superadmin-dashboard__list-item">
                  <div className="superadmin-dashboard__item-info">
                    <div className="superadmin-dashboard__item-title-row">
                      <p className="superadmin-dashboard__item-name">{inv.invoiceNumber}</p>
                      <span className="superadmin-dashboard__item-sub">({inv.institute?.name})</span>
                    </div>
                    <p className="superadmin-dashboard__item-sub">
                      Amount: <strong>₹{inv.totalAmount.toLocaleString("en-IN")}</strong> (incl. 18% GST)
                    </p>
                  </div>
                  <div className="superadmin-dashboard__item-right">
                    <span
                      className={`sa-badge ${
                        inv.status === "PAID"
                          ? "sa-badge--paid"
                          : "sa-badge--pending"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <span className="superadmin-dashboard__date">
                      Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
