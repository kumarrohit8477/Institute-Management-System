import React, { useEffect, useState } from "react";
import { SaasApi, SaasKPIs, InstituteTenantItem, PlatformInvoiceItem } from "@/src/services/saasApi";
import {
  Building2,
  Users,
  Layers,
  IndianRupee,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading SaaS platform metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-semibold text-rose-200">Unable to load platform analytics</h3>
        <p className="text-sm text-rose-300/80">{error}</p>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
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
      color: "from-emerald-600 to-teal-700",
      accent: "text-emerald-400"
    },
    {
      title: "Total Institutes",
      value: kpis?.totalInstitutes || 0,
      subtitle: `${kpis?.activeTenants || 0} Active / ${kpis?.trialTenants || 0} Trial`,
      icon: Building2,
      color: "from-indigo-600 to-blue-700",
      accent: "text-indigo-400"
    },
    {
      title: "System-Wide Students",
      value: (kpis?.totalStudents || 0).toLocaleString("en-IN"),
      subtitle: `${kpis?.totalCourses || 0} Courses across all institutes`,
      icon: Users,
      color: "from-purple-600 to-pink-700",
      accent: "text-purple-400"
    },
    {
      title: "Total Platform Revenue",
      value: `₹${(kpis?.totalLifetimeRevenue || 0).toLocaleString("en-IN")}`,
      subtitle: "Lifetime B2B Invoices Paid",
      icon: TrendingUp,
      color: "from-amber-600 to-orange-700",
      accent: "text-amber-400"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Control Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time SaaS multi-tenancy overview, MRR analytics, and tenant resource health.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/superadmin/institutes"
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Institutes</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.color} shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Institutes & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Institutes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Recent Institute Onboardings</h2>
            </div>
            <Link
              to="/superadmin/institutes"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentInstitutes.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No institutes onboarded yet.</p>
            ) : (
              recentInstitutes.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center justify-between p-3.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-white">{inst.name}</p>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-700 text-slate-300">
                        {inst.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Plan:{" "}
                      <span className="font-semibold text-indigo-300">
                        {inst.subscription?.plan.name || "Free Trial"}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                        inst.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : inst.status === "TRIAL"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {inst.status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(inst.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent B2B Platform Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Recent B2B Invoices</h2>
            </div>
            <Link
              to="/superadmin/invoices"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No platform invoices generated yet.</p>
            ) : (
              recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-white">{inv.invoiceNumber}</p>
                      <span className="text-xs text-slate-400">({inv.institute?.name})</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Amount: <span className="font-semibold text-white">₹{inv.totalAmount.toLocaleString("en-IN")}</span> (incl. 18% GST)
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
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
