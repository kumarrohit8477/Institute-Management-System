import React, { useEffect, useState } from "react";
import { SaasApi, SaasKPIs, InstituteTenantItem, PlatformInvoiceItem } from "@/src/services/saasApi";
import { api } from "@/src/services/api";
import { useAuth } from "@/src/hooks/useAuth";
import {
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import "./SuperAdminDashboard.css";

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<SaasKPIs | null>(null);
  const [recentInstitutes, setRecentInstitutes] = useState<InstituteTenantItem[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<PlatformInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [mustChangePwdState, setMustChangePwdState] = useState<boolean>(user?.mustChangePassword ?? false);

  useEffect(() => {
    fetchOverview();
    if (user?.mustChangePassword !== undefined) {
      setMustChangePwdState(user.mustChangePassword);
    }
  }, [user]);

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

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword) {
      setPwdError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword
      });

      setPwdSuccess(res?.message || "Password updated successfully! Your account credentials have been secured.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMustChangePwdState(false);
      if (user) {
        user.mustChangePassword = false;
      }
    } catch (err: any) {
      const msg = err.message || "Failed to update password. Please check your current password.";
      setPwdError(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdStrength = getStrength(newPassword);

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

      {/* Mandatory Password Change Alert Banner */}
      {mustChangePwdState && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-sm flex items-start gap-3.5 shadow-lg">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-300 text-base mb-1">
              Security Action Required: Update Temporary Password
            </h4>
            <p className="text-amber-200/90 text-xs leading-relaxed">
              You logged in using a temporary setup password. For account safety, please change your password using the Security Settings panel below.
            </p>
          </div>
          <a
            href="#security-settings"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shrink-0 self-center shadow"
          >
            Change Now
          </a>
        </div>
      )}

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

      {/* Super Admin Security & Password Settings Panel */}
      <div id="security-settings" className="mt-8">
        <div className="superadmin-dashboard__card border border-indigo-500/20 shadow-xl">
          <div className="superadmin-dashboard__card-header border-b border-slate-800 pb-4">
            <div className="superadmin-dashboard__card-title-row">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              <div>
                <h2 className="superadmin-dashboard__card-title">Super Admin Security Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage and update your platform Super Admin password</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {pwdSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="mb-5 p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle size={18} className="text-rose-400 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="max-w-xl space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  {newPassword && (
                    <div className="mt-1.5">
                      <div className="flex gap-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${pwdStrength >= 1 ? "w-1/4 bg-rose-500" : ""}`}></div>
                        <div className={`h-full transition-all ${pwdStrength >= 3 ? "w-1/4 bg-amber-500" : ""}`}></div>
                        <div className={`h-full transition-all ${pwdStrength >= 4 ? "w-1/4 bg-indigo-500" : ""}`}></div>
                        <div className={`h-full transition-all ${pwdStrength >= 5 ? "w-1/4 bg-emerald-500" : ""}`}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {pwdLoading ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Update Super Admin Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
