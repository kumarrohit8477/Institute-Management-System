import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle, ArrowRight, ArrowLeft, Sparkles, Building } from "lucide-react";
import "./LoginPage.css";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();

  const [identifier, setIdentifier] = useState<string>("admin@institute.local");
  const [password, setPassword] = useState<string>("AdminSecurePassword123!");
  const [instituteCode, setInstituteCode] = useState<string>("INST001");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!identifier.trim() || !password) {
      setLocalError("Please enter your email or student ID along with your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userRole = await login({
        email: identifier.trim(),
        password,
        instituteCode: instituteCode.trim() || undefined
      });

      // Role-Based Automatic Redirection
      if (userRole === "SUPER_ADMIN") {
        navigate("/superadmin/dashboard", { replace: true });
      } else if (userRole === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "TEACHER") {
        navigate("/teacher/dashboard", { replace: true });
      } else if (userRole === "STUDENT") {
        navigate("/student/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setLocalError(err.message || "Invalid login credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickCredentials = (id: string, pass: string, code: string = "") => {
    setIdentifier(id);
    setPassword(pass);
    setInstituteCode(code);
    setLocalError(null);
    clearError();
  };

  return (
    <div className="login-page">
      {/* Return to Landing link */}
      <div className="login-page__nav">
        <Link to="/" className="login-page__back-link">
          <ArrowLeft size={16} />
          <span>Back to IMS Home</span>
        </Link>
      </div>

      <div className="login-card">
        {/* Universal Brand Header */}
        <div className="login-card__header">
          <div className="login-card__logo-box">
            <Shield size={28} />
          </div>
          <h1 className="login-card__title">
            Institute Management System
          </h1>
          <p className="login-card__subtitle">
            Universal Single Sign-On Portal
          </p>
        </div>

        {/* Universal Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {(localError || error) && (
            <div className="login-form__error">
              <AlertCircle size={18} className="login-form__error-icon" />
              <div>{localError || error}</div>
            </div>
          )}

          {/* Email or Student/Teacher ID field */}
          <div className="login-form__field">
            <label className="login-form__label">
              Email Address or User ID (Student / Teacher)
            </label>
            <div className="login-form__input-wrapper">
              <Mail size={18} className="login-form__input-icon" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@institute.local, ADM-2026-0001, or FAC-2026-0001"
                className="login-form__input"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="login-form__field">
            <label className="login-form__label">
              Password
            </label>
            <div className="login-form__input-wrapper">
              <Lock size={18} className="login-form__input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="login-form__input login-form__input--password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-form__toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Institute Campus Code */}
          <div className="login-form__field">
            <div className="login-form__label-row">
              <label className="login-form__label">
                Institute Campus Code
              </label>
              <span className="login-form__label-hint">(Optional for Super Admin)</span>
            </div>
            <div className="login-form__input-wrapper">
              <Building size={18} className="login-form__input-icon" />
              <input
                type="text"
                value={instituteCode}
                onChange={(e) => setInstituteCode(e.target.value)}
                placeholder="e.g. INST001"
                className="login-form__input"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="login-form__btn-submit"
          >
            {isSubmitting ? (
              "Authenticating..."
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Role Auto-Detection Note */}
          <p className="login-form__role-note">
            🔒 Role is automatically detected. You will be routed to your respective portal.
          </p>

          {/* Quick Demo Credentials Helper */}
          <div className="login-demo">
            <div className="login-demo__header">
              <Sparkles size={14} color="#4f46e5" />
              <span>Quick Demo Fill:</span>
            </div>
            <div className="login-demo__list">
              <button
                type="button"
                onClick={() => fillQuickCredentials("superadmin@ims.local", "SuperAdminSecure2026!", "")}
                className="login-demo__item"
              >
                <div className="login-demo__role">
                  <span>👑</span>
                  <strong>Super Admin</strong>
                </div>
                <code className="login-demo__code">superadmin@ims.local</code>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("admin@institute.local", "AdminSecurePassword123!", "INST001")}
                className="login-demo__item"
              >
                <div className="login-demo__role">
                  <span>🏫</span>
                  <strong>Institute Admin</strong>
                </div>
                <code className="login-demo__code">admin@institute.local (INST001)</code>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("amit.sharma@apexacademy.local", "Teacher@123", "INST001")}
                className="login-demo__item"
              >
                <div className="login-demo__role">
                  <span>👨‍🏫</span>
                  <strong>Teacher Email</strong>
                </div>
                <code className="login-demo__code">amit.sharma@apexacademy.local (INST001)</code>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("FAC-2026-0001", "Teacher@123", "INST001")}
                className="login-demo__item"
              >
                <div className="login-demo__role">
                  <span>🆔</span>
                  <strong>Teacher ID</strong>
                </div>
                <code className="login-demo__code">FAC-2026-0001 (INST001)</code>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("student@institute.local", "StudentSecurePassword123!", "INST001")}
                className="login-demo__item"
              >
                <div className="login-demo__role">
                  <span>🎓</span>
                  <strong>Student Email</strong>
                </div>
                <code className="login-demo__code">student@institute.local (INST001)</code>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("ADM-2026-0001", "StudentSecurePassword123!", "INST001")}
                className="login-demo__item"
              >
                <div className="login-demo__role">
                  <span>🎫</span>
                  <strong>Student ID</strong>
                </div>
                <code className="login-demo__code">ADM-2026-0001 (INST001)</code>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
