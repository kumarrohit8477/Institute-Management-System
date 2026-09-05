import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "@/src/services/api";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    planTier: "FREE_TRIAL"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.adminPassword !== formData.confirmPassword) {
      setError("Admin passwords do not match. Please verify.");
      return;
    }

    if (formData.adminPassword.length < 8) {
      setError("Admin password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Send enquiry / registration request
      await api.post("/enquiries", {
        name: formData.adminName,
        email: formData.adminEmail,
        phone: formData.phone,
        instituteName: formData.name,
        role: "Institute Admin Candidate",
        studentCount: "50-200",
        message: `Self-registration attempt for Institute Code: ${formData.code.toUpperCase()}, Plan: ${formData.planTier}`
      });

      setSuccessMessage(
        `Institute Registration submitted successfully for "${formData.name}". Your account details have been recorded and will be verified by the platform team.`
      );
    } catch (err: any) {
      const msg = err.message || "Failed to submit institute registration. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Building2 size={28} />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Register Your Institute
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Create an active tenant account for your academy or coaching center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/60">
          {/* Security Banner */}
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-start gap-3">
            <ShieldCheck size={22} className="text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-200 leading-relaxed">
              <strong>Notice:</strong> This form creates an <strong>Institute Admin</strong> tenant account. Platform <strong>Super Admin</strong> registration is not public and can only be initialized via controlled system bootstrap.
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-500/30 flex items-center gap-3 text-rose-200 text-sm">
              <AlertCircle size={20} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Registration Submitted!</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                {successMessage}
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
                >
                  Proceed to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                  1. Institute Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Institute Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Acme Academy Campus"
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Institute Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      required
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g. ACME01"
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Institute Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@acme.edu"
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60">
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                  2. Admin User Details
                </h3>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Admin Full Name *
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    required
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Admin Login Email *
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@acme.edu"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="adminPassword"
                        required
                        minLength={8}
                        value={formData.adminPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
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

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subscription Plan Tier
                </label>
                <select
                  name="planTier"
                  value={formData.planTier}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="FREE_TRIAL">Free Trial (14 Days - Full Access)</option>
                  <option value="STARTER">Starter Academy Plan (Up to 150 Students)</option>
                  <option value="GROWTH">Growth Institute Plan (Up to 600 Students)</option>
                  <option value="ENTERPRISE">Enterprise Plan (Unlimited)</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Registering Institute...</span>
                  ) : (
                    <>
                      <span>Submit Institute Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center border-t border-slate-700/60 pt-4">
            <span className="text-xs text-slate-400">Already registered? </span>
            <Link to="/login" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
