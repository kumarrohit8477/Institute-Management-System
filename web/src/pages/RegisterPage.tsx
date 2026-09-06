import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "@/src/services/api";
import "./RegisterPage.css";

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
      await api.post("/auth/register-institute", {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        adminPassword: formData.adminPassword,
        planTier: formData.planTier || "FREE_TRIAL"
      });

      setSuccessMessage(
        `Institute "${formData.name}" (Code: ${formData.code.trim().toUpperCase()}) registered successfully! You can now log in using Institute Code (${formData.code.trim().toUpperCase()}), Admin Email (${formData.adminEmail.trim().toLowerCase()}), and your password.`
      );
    } catch (err: any) {
      const msg = err.message || "Failed to submit institute registration. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card-wrapper">
        <div className="register-card">
          <div className="register-header-section">
            <Link to="/" className="register-logo-link">
              <div className="register-logo-icon">
                <Building2 size={28} />
              </div>
            </Link>
            <h2 className="register-title">Register Your Institute</h2>
          </div>
          {/* Security Banner */}
          <div className="register-security-banner">
            <ShieldCheck size={22} className="register-security-icon" />
            <div className="register-security-text">
              <strong>Notice:</strong> This form creates an <strong>Institute Admin</strong> tenant account.
            </div>
          </div>
          {error && (
            <div className="register-error-banner">
              <AlertCircle size={20} className="register-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="register-success-container">
              <div className="register-success-icon-wrapper">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="register-success-title">Registration Submitted!</h3>
              <p className="register-success-message">{successMessage}</p>
              <div className="register-success-actions">
                <Link to="/login" className="register-primary-btn">
                  Proceed to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="register-form">
              <div>
                <h3 className="register-section-heading">1. Institute Profile</h3>
                <div className="register-grid-2">
                  <div className="register-field">
                    <label className="register-label">Institute Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Acme Academy Campus"
                      className="register-input"
                    />
                  </div>

                  <div className="register-field">
                    <label className="register-label">Institute Code *</label>
                    <input
                      type="text"
                      name="code"
                      required
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g. ACME01"
                      className="register-input uppercase-input"
                    />
                  </div>
                </div>

                <div className="register-grid-2 register-mt">
                  <div className="register-field">
                    <label className="register-label">Institute Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@acme.edu"
                      className="register-input"
                    />
                  </div>

                  <div className="register-field">
                    <label className="register-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="register-input"
                    />
                  </div>
                </div>
              </div>

              <div className="register-divider">
                <h3 className="register-section-heading">2. Admin User Details</h3>

                <div className="register-field register-mb">
                  <label className="register-label">Admin Full Name *</label>
                  <input
                    type="text"
                    name="adminName"
                    required
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="register-input"
                  />
                </div>

                <div className="register-field register-mb">
                  <label className="register-label">Admin Login Email *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@acme.edu"
                    className="register-input"
                  />
                </div>

                <div className="register-grid-2">
                  <div className="register-field">
                    <label className="register-label">Password *</label>
                    <div className="register-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="adminPassword"
                        required
                        minLength={8}
                        value={formData.adminPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="register-input register-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="register-password-toggle"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="register-field">
                    <label className="register-label">Confirm Password *</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="register-input"
                    />
                  </div>
                </div>
              </div>

              <div className="register-divider">
                <label className="register-label">Subscription Plan Tier</label>
                <select
                  name="planTier"
                  value={formData.planTier}
                  onChange={handleChange}
                  className="register-input register-select"
                >
                  <option value="FREE_TRIAL">Free Trial (14 Days - Full Access)</option>
                  <option value="STARTER">Starter Academy Plan (Up to 150 Students)</option>
                  <option value="GROWTH">Growth Institute Plan (Up to 600 Students)</option>
                  <option value="ENTERPRISE">Enterprise Plan (Unlimited)</option>
                </select>
              </div>

              <div className="register-submit-wrapper">
                <button
                  type="submit"
                  disabled={loading}
                  className="register-primary-btn register-submit-btn"
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

          <div className="register-footer-link-wrapper">
            <span className="register-footer-text">Already registered? </span>
            <Link to="/login" className="register-footer-action">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;