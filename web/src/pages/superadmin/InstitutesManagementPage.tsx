import React, { useEffect, useState } from "react";
import { SaasApi, InstituteTenantItem, SubscriptionPlanItem } from "@/src/services/saasApi";
import {
  Building2,
  Plus,
  Search,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import "./InstitutesManagementPage.css";

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
    <div className="institutes-page">
      {/* Header */}
      <div className="institutes-page__header">
        <div>
          <h1 className="institutes-page__title">Institutes Directory</h1>
          <p className="institutes-page__subtitle">
            Manage multi-tenant subscriptions, quota health, and onboard new educational academies.
          </p>
        </div>
        <button
          onClick={() => {
            setModalError(null);
            setShowOnboardModal(true);
          }}
          className="institutes-page__btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Institute</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="institutes-page__filter-bar">
        <form onSubmit={handleSearchSubmit} className="institutes-page__search-form">
          <div className="institutes-page__search-box">
            <Search className="w-4 h-4 institutes-page__search-icon" />
            <input
              type="text"
              placeholder="Search by institute name, code, domain, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="institutes-page__search-input"
            />
          </div>
          <button
            type="submit"
            className="institutes-page__btn-search"
          >
            Search
          </button>
        </form>

        <div className="institutes-page__filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="institutes-page__select"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Free Trial</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="institutes-page__select"
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
            className="institutes-page__btn-icon"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Institutes Table */}
      <div className="institutes-page__table-card">
        {loading ? (
          <div className="superadmin-dashboard__loader">
            <div className="superadmin-dashboard__spinner"></div>
            <p className="superadmin-dashboard__loader-text">Loading institutes directory...</p>
          </div>
        ) : institutes.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <Building2 className="w-10 h-10 mx-auto text-slate-400" />
            <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", fontWeight: 600, color: "#64748b" }}>
              No institutes found matching criteria
            </p>
          </div>
        ) : (
          <div className="institutes-page__table-wrapper">
            <table className="institutes-page__table">
              <thead className="institutes-page__thead">
                <tr>
                  <th className="institutes-page__th">Institute</th>
                  <th className="institutes-page__th">Active Plan</th>
                  <th className="institutes-page__th">Students Quota</th>
                  <th className="institutes-page__th">Status</th>
                  <th className="institutes-page__th">Created</th>
                  <th className="institutes-page__th" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutes.map((inst) => {
                  const studentCount = inst._count?.students || inst.tenantUsage?.studentCount || 0;
                  const maxStudents = inst.subscription?.plan?.maxStudents || 100;
                  const quotaPercent = Math.min(100, Math.round((studentCount / maxStudents) * 100));

                  return (
                    <tr key={inst.id} className="institutes-page__tr">
                      <td className="institutes-page__td">
                        <div className="institutes-page__inst-info">
                          <p className="institutes-page__inst-name">{inst.name}</p>
                          <div className="institutes-page__inst-meta">
                            <span className="institutes-page__code-badge">
                              {inst.code}
                            </span>
                            {inst.customDomain && (
                              <span className="institutes-page__domain">
                                {inst.customDomain}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="institutes-page__td">
                        <div className="institutes-page__plan-info">
                          <span className="institutes-page__plan-badge">
                            {inst.subscription?.plan?.name || "Free Trial"}
                          </span>
                          <span className="institutes-page__cycle">
                            Cycle: {inst.subscription?.billingCycle || "MONTHLY"}
                          </span>
                        </div>
                      </td>
                      <td className="institutes-page__td">
                        <div className="institutes-page__quota-container">
                          <div className="institutes-page__quota-numbers">
                            <strong>{studentCount}</strong>
                            <span>/ {maxStudents}</span>
                          </div>
                          <div className="institutes-page__quota-bar">
                            <div
                              className={`institutes-page__quota-fill ${
                                quotaPercent >= 90
                                  ? "quota-fill--rose"
                                  : quotaPercent >= 70
                                  ? "quota-fill--amber"
                                  : "quota-fill--green"
                              }`}
                              style={{ width: `${quotaPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="institutes-page__td">
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
                      </td>
                      <td className="institutes-page__td" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {new Date(inst.createdAt).toLocaleDateString()}
                      </td>
                      <td className="institutes-page__td">
                        <div className="institutes-page__actions">
                          <button
                            onClick={() => {
                              setSelectedInstitute(inst);
                              setChangePlanTier(inst.subscription?.plan?.tier || "GROWTH");
                              setChangeBillingCycle(inst.subscription?.billingCycle || "ANNUAL");
                              setModalError(null);
                              setShowPlanModal(true);
                            }}
                            className="institutes-page__btn-plan"
                            title="Upgrade / Change Plan"
                          >
                            Plan
                          </button>
                          <button
                            onClick={() => handleToggleStatus(inst)}
                            className={
                              inst.status === "ACTIVE"
                                ? "institutes-page__btn-suspend"
                                : "institutes-page__btn-activate"
                            }
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
        <div className="institutes-page__modal-backdrop">
          <div className="institutes-page__modal">
            <div className="institutes-page__modal-header">
              <div className="institutes-page__modal-title-row">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="institutes-page__modal-title">Onboard New Institute Tenant</h3>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="institutes-page__modal-close"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="institutes-page__modal-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="institutes-page__form-grid-2">
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Institute Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Knowledge Academy"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    className="institutes-page__input"
                  />
                </div>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APEX01"
                    value={onboardForm.code}
                    onChange={(e) => setOnboardForm({ ...onboardForm, code: e.target.value.toUpperCase() })}
                    className="institutes-page__input"
                    style={{ textTransform: "uppercase", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div className="institutes-page__form-grid-2">
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Custom Subdomain</label>
                  <input
                    type="text"
                    placeholder="e.g. apex.ims.local"
                    value={onboardForm.customDomain}
                    onChange={(e) => setOnboardForm({ ...onboardForm, customDomain: e.target.value })}
                    className="institutes-page__input"
                  />
                </div>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@apex.local"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="institutes-page__input"
                  />
                </div>
              </div>

              <div className="institutes-page__form-grid-2">
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@apex.local"
                    value={onboardForm.adminEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                    className="institutes-page__input"
                  />
                </div>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Admin Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={onboardForm.adminPassword}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                    className="institutes-page__input"
                  />
                </div>
              </div>

              <div className="institutes-page__form-grid-2">
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Plan Tier *</label>
                  <select
                    value={onboardForm.planTier}
                    onChange={(e) => setOnboardForm({ ...onboardForm, planTier: e.target.value })}
                    className="institutes-page__input"
                  >
                    <option value="FREE_TRIAL">Free Trial (14 Days - 30 Students)</option>
                    <option value="STARTER">Starter (₹2,999/m - 150 Students)</option>
                    <option value="GROWTH">Growth (₹6,999/m - 600 Students)</option>
                    <option value="ENTERPRISE">Enterprise (₹14,999/m - Unlimited)</option>
                  </select>
                </div>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Billing Cycle</label>
                  <select
                    value={onboardForm.billingCycle}
                    onChange={(e) => setOnboardForm({ ...onboardForm, billingCycle: e.target.value })}
                    className="institutes-page__input"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual (10 Months Price)</option>
                  </select>
                </div>
              </div>

              <div className="institutes-page__field">
                <label className="institutes-page__label">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  className="institutes-page__input"
                />
              </div>

              <div className="institutes-page__modal-footer">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="institutes-page__btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="institutes-page__btn-submit"
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
        <div className="institutes-page__modal-backdrop">
          <div className="institutes-page__modal institutes-page__modal--sm">
            <div className="institutes-page__modal-header">
              <div>
                <h3 className="institutes-page__modal-title">Upgrade Subscription Plan</h3>
                <p className="institutes-page__modal-subtitle">{selectedInstitute.name}</p>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="institutes-page__modal-close"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="institutes-page__modal-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handlePlanChangeSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="institutes-page__field">
                <label className="institutes-page__label">Target Plan Tier *</label>
                <select
                  value={changePlanTier}
                  onChange={(e) => setChangePlanTier(e.target.value)}
                  className="institutes-page__input"
                >
                  <option value="FREE_TRIAL">Free Trial (14 Days - 30 Students)</option>
                  <option value="STARTER">Starter Academy (₹2,999/m - 150 Students)</option>
                  <option value="GROWTH">Growth Institute (₹6,999/m - 600 Students)</option>
                  <option value="ENTERPRISE">Enterprise Multi-Branch (₹14,999/m - Unlimited)</option>
                </select>
              </div>

              <div className="institutes-page__field">
                <label className="institutes-page__label">Billing Term</label>
                <select
                  value={changeBillingCycle}
                  onChange={(e) => setChangeBillingCycle(e.target.value)}
                  className="institutes-page__input"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="ANNUAL">Annual (Includes 2 Months Free)</option>
                </select>
              </div>

              <div className="institutes-page__summary-box">
                <div className="institutes-page__summary-row">
                  <span>Current Plan:</span>
                  <strong>{selectedInstitute.subscription?.plan?.name || "Free Trial"}</strong>
                </div>
                <div className="institutes-page__summary-row">
                  <span>GST Tax Rate:</span>
                  <strong>18% Standard B2B</strong>
                </div>
              </div>

              <div className="institutes-page__modal-footer">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="institutes-page__btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="institutes-page__btn-submit"
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
