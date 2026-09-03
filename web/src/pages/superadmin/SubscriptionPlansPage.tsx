import React, { useEffect, useState } from "react";
import { SaasApi, SubscriptionPlanItem } from "@/src/services/saasApi";
import {
  Layers,
  Check,
  X,
  Edit2,
  Users,
  BookOpen,
  HardDrive,
  Globe,
  Radio,
  Zap,
  IndianRupee,
  AlertCircle
} from "lucide-react";

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">SaaS Subscription Plans</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure multi-tenant plan tiers, student limits, feature gates, and B2B pricing.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Loading plans catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isFeatured = plan.tier === "GROWTH";

            return (
              <div
                key={plan.id}
                className={`bg-slate-900 rounded-2xl p-6 border transition-all flex flex-col justify-between relative shadow-lg ${
                  isFeatured
                    ? "border-indigo-500/80 shadow-indigo-500/10 ring-1 ring-indigo-500/40"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-0.5 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  {/* Tier Title & Description */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white tracking-tight">{plan.name}</h2>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {plan.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 min-h-[32px] leading-relaxed">
                      {plan.description || "Full access multi-tenant tier."}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-extrabold text-white">
                        ₹{Number(plan.monthlyPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-medium mt-1">
                      ₹{Number(plan.annualPrice).toLocaleString("en-IN")} billed annually
                    </p>
                  </div>

                  {/* Quota & Feature Specs */}
                  <div className="space-y-3 pt-2 text-xs text-slate-300">
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                      Tier Quotas & Limits
                    </p>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Max Students:</span>
                      </div>
                      <span className="font-bold text-white">
                        {plan.maxStudents >= 10000 ? "Unlimited" : plan.maxStudents.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>Max Courses:</span>
                      </div>
                      <span className="font-bold text-white">{plan.maxCourses}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <HardDrive className="w-4 h-4 text-indigo-400" />
                        <span>Storage Quota:</span>
                      </div>
                      <span className="font-bold text-white">{plan.maxStorageMB / 1024} GB</span>
                    </div>

                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500 pt-2">
                      Included Features
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5">
                        {plan.hasOnlineCBT ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={plan.hasOnlineCBT ? "text-slate-200" : "text-slate-500 line-through"}>
                          Online CBT Exam Simulator
                        </span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        {plan.hasCustomDomain ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={plan.hasCustomDomain ? "text-slate-200" : "text-slate-500 line-through"}>
                          Custom Subdomain / Branding
                        </span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        {plan.hasPushNotifications ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={plan.hasPushNotifications ? "text-slate-200" : "text-slate-500 line-through"}>
                          Push Notification Alerts
                        </span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        {plan.hasApiAccess ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={plan.hasApiAccess ? "text-slate-200" : "text-slate-500 line-through"}>
                          Dedicated REST API Access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-6 border-t border-slate-800 mt-6">
                  <button
                    onClick={() => handleEditClick(plan)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Configure Plan Parameters</h3>
                <p className="text-xs text-slate-400">{selectedPlan.name} ({selectedPlan.tier})</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
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

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.monthlyPrice}
                    onChange={(e) => setEditForm({ ...editForm, monthlyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Annual Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.annualPrice}
                    onChange={(e) => setEditForm({ ...editForm, annualPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Max Students</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.maxStudents}
                    onChange={(e) => setEditForm({ ...editForm, maxStudents: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Max Courses</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.maxCourses}
                    onChange={(e) => setEditForm({ ...editForm, maxCourses: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Storage (MB)</label>
                  <input
                    type="number"
                    min="100"
                    value={editForm.maxStorageMB}
                    onChange={(e) => setEditForm({ ...editForm, maxStorageMB: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="font-semibold text-slate-400">Feature Gate Toggles</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasOnlineCBT}
                      onChange={(e) => setEditForm({ ...editForm, hasOnlineCBT: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Online CBT Exams</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasCustomDomain}
                      onChange={(e) => setEditForm({ ...editForm, hasCustomDomain: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Custom Subdomain</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasPushNotifications}
                      onChange={(e) => setEditForm({ ...editForm, hasPushNotifications: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Push Notifications</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasApiAccess}
                      onChange={(e) => setEditForm({ ...editForm, hasApiAccess: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Dedicated API Access</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
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
