import React, { useEffect, useState } from "react";
import { SaasApi, SubscriptionPlanItem } from "@/src/services/saasApi";
import {
  Check,
  X,
  Edit2,
  Users,
  BookOpen,
  HardDrive,
  AlertCircle
} from "lucide-react";
import "./SubscriptionPlansPage.css";

export const SubscriptionPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlanItem>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await SaasApi.getSubscriptionPlans();
      setPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (plan: SubscriptionPlanItem) => {
    setSelectedPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      maxStudents: plan.maxStudents,
      maxCourses: plan.maxCourses,
      maxBatches: plan.maxBatches,
      maxStorageMB: plan.maxStorageMB,
      hasOnlineCBT: plan.hasOnlineCBT,
      hasCustomDomain: plan.hasCustomDomain,
      hasPushNotifications: plan.hasPushNotifications,
      hasApiAccess: plan.hasApiAccess
    });
    setModalError(null);
    setShowEditModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    if (!selectedPlan) return;
    e.preventDefault();
    try {
      setActionLoading(true);
      setModalError(null);
      await SaasApi.updateSubscriptionPlan(selectedPlan.id, editForm);
      setShowEditModal(false);
      fetchPlans();
    } catch (err: any) {
      setModalError(err.message || "Failed to update plan");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="plans-page">
      {/* Header */}
      <div className="plans-page__header">
        <h1 className="plans-page__title">SaaS Subscription Plans</h1>
        <p className="plans-page__subtitle">
          Configure multi-tenant plan tiers, student limits, feature gates, and B2B pricing.
        </p>
      </div>

      {loading ? (
        <div className="superadmin-dashboard__loader">
          <div className="superadmin-dashboard__spinner"></div>
          <p className="superadmin-dashboard__loader-text">Loading plans catalog...</p>
        </div>
      ) : (
        <div className="plans-page__grid">
          {plans.map((plan) => {
            const isFeatured = plan.tier === "GROWTH";

            return (
              <div
                key={plan.id}
                className={`plans-page__card ${isFeatured ? "plans-page__card--featured" : ""}`}
              >
                {isFeatured && (
                  <div className="plans-page__ribbon">
                    Most Popular
                  </div>
                )}

                <div className="plans-page__card-top">
                  {/* Tier Title & Description */}
                  <div>
                    <div className="plans-page__tier-row">
                      <h2 className="plans-page__tier-name">{plan.name}</h2>
                      <span className="plans-page__tier-tag">
                        {plan.tier}
                      </span>
                    </div>
                    <p className="plans-page__tier-desc">
                      {plan.description || "Full access multi-tenant tier."}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="plans-page__price-box">
                    <div className="plans-page__price-row">
                      <span className="plans-page__price-amount">
                        ₹{Number(plan.monthlyPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="plans-page__price-period">/ month</span>
                    </div>
                    <p className="plans-page__annual-note">
                      ₹{Number(plan.annualPrice).toLocaleString("en-IN")} billed annually
                    </p>
                  </div>

                  {/* Quota & Feature Specs */}
                  <div>
                    <p className="plans-page__section-label">Tier Quotas & Limits</p>
                    <div className="plans-page__quota-list">
                      <div className="plans-page__quota-item">
                        <div className="plans-page__quota-left">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>Max Students:</span>
                        </div>
                        <span className="plans-page__quota-val">
                          {plan.maxStudents >= 10000 ? "Unlimited" : plan.maxStudents.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="plans-page__quota-item">
                        <div className="plans-page__quota-left">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>Max Courses:</span>
                        </div>
                        <span className="plans-page__quota-val">{plan.maxCourses}</span>
                      </div>

                      <div className="plans-page__quota-item">
                        <div className="plans-page__quota-left">
                          <HardDrive className="w-4 h-4 text-indigo-600" />
                          <span>Storage Quota:</span>
                        </div>
                        <span className="plans-page__quota-val">{plan.maxStorageMB / 1024} GB</span>
                      </div>
                    </div>

                    <p className="plans-page__section-label" style={{ marginTop: "1rem" }}>Included Features</p>
                    <div className="plans-page__features-list">
                      <div className="plans-page__feature-item">
                        {plan.hasOnlineCBT ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={plan.hasOnlineCBT ? "feature--included" : "feature--excluded"}>
                          Online CBT Exam Simulator
                        </span>
                      </div>

                      <div className="plans-page__feature-item">
                        {plan.hasCustomDomain ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={plan.hasCustomDomain ? "feature--included" : "feature--excluded"}>
                          Custom Subdomain / Branding
                        </span>
                      </div>

                      <div className="plans-page__feature-item">
                        {plan.hasPushNotifications ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={plan.hasPushNotifications ? "feature--included" : "feature--excluded"}>
                          Push Notification Alerts
                        </span>
                      </div>

                      <div className="plans-page__feature-item">
                        {plan.hasApiAccess ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={plan.hasApiAccess ? "feature--included" : "feature--excluded"}>
                          Dedicated REST API Access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="plans-page__card-bottom">
                  <button
                    onClick={() => handleEditClick(plan)}
                    className="plans-page__btn-configure"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Configure Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT PLAN CONFIGURATION MODAL */}
      {showEditModal && selectedPlan && (
        <div className="institutes-page__modal-backdrop">
          <div className="institutes-page__modal">
            <div className="institutes-page__modal-header">
              <div>
                <h3 className="institutes-page__modal-title">Configure Plan Parameters</h3>
                <p className="institutes-page__modal-subtitle">{selectedPlan.name} ({selectedPlan.tier})</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
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

            <form onSubmit={handleSavePlan} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="institutes-page__form-grid-2">
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Monthly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.monthlyPrice}
                    onChange={(e) => setEditForm({ ...editForm, monthlyPrice: Number(e.target.value) })}
                    className="institutes-page__input"
                  />
                </div>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Annual Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.annualPrice}
                    onChange={(e) => setEditForm({ ...editForm, annualPrice: Number(e.target.value) })}
                    className="institutes-page__input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Max Students</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.maxStudents}
                    onChange={(e) => setEditForm({ ...editForm, maxStudents: Number(e.target.value) })}
                    className="institutes-page__input"
                  />
                </div>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Max Courses</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.maxCourses}
                    onChange={(e) => setEditForm({ ...editForm, maxCourses: Number(e.target.value) })}
                    className="institutes-page__input"
                  />
                </div>
                <div className="institutes-page__field">
                  <label className="institutes-page__label">Storage (MB)</label>
                  <input
                    type="number"
                    min="100"
                    value={editForm.maxStorageMB}
                    onChange={(e) => setEditForm({ ...editForm, maxStorageMB: Number(e.target.value) })}
                    className="institutes-page__input"
                  />
                </div>
              </div>

              <div style={{ paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                <p className="institutes-page__label" style={{ marginBottom: "0.5rem" }}>Feature Gate Toggles</p>
                <div className="plans-page__checkboxes-grid">
                  <label className="plans-page__checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.hasOnlineCBT}
                      onChange={(e) => setEditForm({ ...editForm, hasOnlineCBT: e.target.checked })}
                      className="plans-page__checkbox"
                    />
                    <span>Online CBT Exams</span>
                  </label>

                  <label className="plans-page__checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.hasCustomDomain}
                      onChange={(e) => setEditForm({ ...editForm, hasCustomDomain: e.target.checked })}
                      className="plans-page__checkbox"
                    />
                    <span>Custom Subdomain</span>
                  </label>

                  <label className="plans-page__checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.hasPushNotifications}
                      onChange={(e) => setEditForm({ ...editForm, hasPushNotifications: e.target.checked })}
                      className="plans-page__checkbox"
                    />
                    <span>Push Notifications</span>
                  </label>

                  <label className="plans-page__checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.hasApiAccess}
                      onChange={(e) => setEditForm({ ...editForm, hasApiAccess: e.target.checked })}
                      className="plans-page__checkbox"
                    />
                    <span>Dedicated API Access</span>
                  </label>
                </div>
              </div>

              <div className="institutes-page__modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="institutes-page__btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="institutes-page__btn-submit"
                >
                  {actionLoading ? "Saving..." : "Save Plan Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
