import React, { useEffect, useState } from "react";
import { SaasApi, InstituteTenantItem, SubscriptionPlanItem } from "../../services/saasApi";
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  ArrowUpRight,
  UserPlus,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export const InstitutesManagementPage: React.FC = () => {
  const [institutes, setInstitutes] = useState<InstituteTenantItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // Modals state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState<InstituteTenantItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states for onboarding
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    code: "",
    customDomain: "",
    email: "",
    phone: "",
    address: "",
    adminEmail: "",
    adminPassword: "",
    planTier: "STARTER",
    billingCycle: "MONTHLY"
  });

  // Form state for plan change
  const [changePlanTier, setChangePlanTier] = useState("GROWTH");
  const [changeBillingCycle, setChangeBillingCycle] = useState("ANNUAL");

  useEffect(() => {
    fetchInstitutes();
    fetchPlans();
  }, [statusFilter, planFilter]);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const res = await SaasApi.getInstitutes({
        search: search || undefined,
        status: statusFilter || undefined,
        planTier: planFilter || undefined
      });
      setInstitutes(res.institutes || []);
    } catch (err: any) {
      console.error("Failed to load institutes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const p = await SaasApi.getSubscriptionPlans();
      setPlans(p);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInstitutes();
  };

  const handleToggleStatus = async (inst: InstituteTenantItem) => {
    const nextStatus = inst.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!window.confirm(`Are you sure you want to change ${inst.name} status to ${nextStatus}?`)) {
      return;
    }

    try {
      await SaasApi.updateInstituteStatus(inst.id, nextStatus);
      fetchInstitutes();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setModalError(null);
      await SaasApi.onboardInstitute(onboardForm);
      setShowOnboardModal(false);
      setOnboardForm({
        name: "",
        code: "",
        customDomain: "",
        email: "",
        phone: "",
        address: "",
        adminEmail: "",
        adminPassword: "",
        planTier: "STARTER",
        billingCycle: "MONTHLY"
      });
      fetchInstitutes();
    } catch (err: any) {
      setModalError(err.message || "Failed to onboard institute");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlanChangeSubmit = async (e: React.FormEvent) => {
    if (!selectedInstitute) return;
    e.preventDefault();
    try {
      setActionLoading(true);
      setModalError(null);
      await SaasApi.changeInstituteSubscription(selectedInstitute.id, {
        planTier: changePlanTier,
        billingCycle: changeBillingCycle,
        autoRenew: true
      });
      setShowPlanModal(false);
      fetchInstitutes();
    } catch (err: any) {
      setModalError(err.message || "Failed to update subscription");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutes Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage multi-tenant subscriptions, quota health, and onboard new educational academies.
          </p>
        </div>
        <button
          onClick={() => {
            setModalError(null);
            setShowOnboardModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Institute</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by institute name, code, domain, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Free Trial</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Plans</option>
            <option value="FREE_TRIAL">Free Trial</option>
            <option value="STARTER">Starter</option>
            <option value="GROWTH">Growth</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPlanFilter("");
              fetchInstitutes();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Institutes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading institutes directory...</p>
          </div>
        ) : institutes.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Building2 className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No institutes found matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Institute</th>
                  <th className="px-6 py-3.5">Active Plan</th>
                  <th className="px-6 py-3.5">Students Quota</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {institutes.map((inst) => {
                  const studentCount = inst._count?.students || inst.tenantUsage?.studentCount || 0;
                  const maxStudents = inst.subscription?.plan?.maxStudents || 100;
                  const quotaPercent = Math.min(100, Math.round((studentCount / maxStudents) * 100));

                  return (
                    <tr key={inst.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white text-sm">{inst.name}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">
                              {inst.code}
                            </span>
                            {inst.customDomain && (
                              <span className="text-indigo-400 font-mono flex items-center space-x-1">
                                <span>{inst.customDomain}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {inst.subscription?.plan?.name || "Free Trial"}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            Cycle: {inst.subscription?.billingCycle || "MONTHLY"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 w-32">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-200">{studentCount}</span>
                            <span className="text-slate-500">/ {maxStudents}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                quotaPercent >= 90
                                  ? "bg-rose-500"
                                  : quotaPercent >= 70
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${quotaPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(inst.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedInstitute(inst);
                              setChangePlanTier(inst.subscription?.plan?.tier || "GROWTH");
                              setChangeBillingCycle(inst.subscription?.billingCycle || "ANNUAL");
                              setModalError(null);
                              setShowPlanModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
                            title="Upgrade / Change Plan"
                          >
                            Plan
                          </button>
                          <button
                            onClick={() => handleToggleStatus(inst)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              inst.status === "ACTIVE"
                                ? "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60"
                                : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60"
                            }`}
                          >
                            {inst.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ONBOARD NEW INSTITUTE */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Onboard New Institute Tenant</h3>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Institute Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Knowledge Academy"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APEX01"
                    value={onboardForm.code}
                    onChange={(e) => setOnboardForm({ ...onboardForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Custom Subdomain</label>
                  <input
                    type="text"
                    placeholder="e.g. apex.ims.local"
                    value={onboardForm.customDomain}
                    onChange={(e) => setOnboardForm({ ...onboardForm, customDomain: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@apex.local"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@apex.local"
                    value={onboardForm.adminEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Admin Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={onboardForm.adminPassword}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plan Tier *</label>
                  <select
                    value={onboardForm.planTier}
                    onChange={(e) => setOnboardForm({ ...onboardForm, planTier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FREE_TRIAL">Free Trial (14 Days - 30 Students)</option>
                    <option value="STARTER">Starter (₹2,999/m - 150 Students)</option>
                    <option value="GROWTH">Growth (₹6,999/m - 600 Students)</option>
                    <option value="ENTERPRISE">Enterprise (₹14,999/m - Unlimited)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Billing Cycle</label>
                  <select
                    value={onboardForm.billingCycle}
                    onChange={(e) => setOnboardForm({ ...onboardForm, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual (10 Months Price)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {actionLoading ? "Onboarding..." : "Onboard Institute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE SUBSCRIPTION PLAN */}
      {showPlanModal && selectedInstitute && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Upgrade Subscription Plan</h3>
                <p className="text-xs text-slate-400">{selectedInstitute.name}</p>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handlePlanChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Plan Tier *</label>
                <select
                  value={changePlanTier}
                  onChange={(e) => setChangePlanTier(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="FREE_TRIAL">Free Trial (14 Days - 30 Students)</option>
                  <option value="STARTER">Starter Academy (₹2,999/m - 150 Students)</option>
                  <option value="GROWTH">Growth Institute (₹6,999/m - 600 Students)</option>
                  <option value="ENTERPRISE">Enterprise Multi-Branch (₹14,999/m - Unlimited)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Billing Term</label>
                <select
                  value={changeBillingCycle}
                  onChange={(e) => setChangeBillingCycle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="ANNUAL">Annual (Includes 2 Months Free)</option>
                </select>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Current Plan:</span>
                  <span className="font-semibold text-white">
                    {selectedInstitute.subscription?.plan?.name || "Free Trial"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax Rate:</span>
                  <span className="font-semibold text-white">18% Standard B2B</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Confirm Plan Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
