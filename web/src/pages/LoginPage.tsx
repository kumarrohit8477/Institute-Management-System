import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle, ArrowRight, ArrowLeft, Sparkles, Building } from "lucide-react";

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 60%, #020617 100%)",
        padding: "1.5rem"
      }}
    >
      {/* Return to Landing link */}
      <div style={{ width: "100%", maxWidth: "460px", marginBottom: "1rem" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#94a3b8",
            fontSize: "0.85rem",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color 0.15s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <ArrowLeft size={16} /> Back to IMS Home
        </Link>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Universal Brand Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
            color: "#ffffff",
            padding: "2rem 1.5rem",
            textAlign: "center",
            position: "relative"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 0.85rem auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: "1.45rem", color: "#ffffff", marginBottom: "0.3rem", fontWeight: 800 }}>
            Institute Management System
          </h1>
          <p style={{ color: "#dbeafe", fontSize: "0.875rem" }}>
            Universal Single Sign-On Portal
          </p>
        </div>

        {/* Universal Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.75rem 1.5rem" }}>
          {(localError || error) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.85rem",
                borderRadius: "10px",
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                lineHeight: "1.4"
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{localError || error}</div>
            </div>
          )}

          {/* Email or Student ID field */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
              Email Address or Student ID
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@institute.local or ADM-2026-0001"
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem 0.7rem 2.5rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: "1.1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>
                Password
              </label>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  padding: "0.7rem 2.5rem 0.7rem 2.5rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Institute Campus Code */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>
                Institute Campus Code
              </label>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>(Leave empty for Super Admin)</span>
            </div>
            <div style={{ position: "relative" }}>
              <Building size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="text"
                value={instituteCode}
                onChange={(e) => setInstituteCode(e.target.value)}
                placeholder="e.g. INST001"
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem 0.7rem 2.5rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.8rem", fontSize: "0.95rem", fontWeight: 700 }}
          >
            {isSubmitting ? (
              "Authenticating..."
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Role Auto-Detection Note */}
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#64748b", marginTop: "1rem" }}>
            🔒 Role is automatically detected. You will be routed to your respective portal.
          </p>

          {/* Quick Demo Credentials Helper */}
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              fontSize: "0.75rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.6rem" }}>
              <Sparkles size={14} color="#3b82f6" /> Quick Demo Fill:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <button
                type="button"
                onClick={() => fillQuickCredentials("superadmin@ims.local", "SuperAdminSecure2026!", "")}
                style={{
                  textAlign: "left",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "0.45rem 0.65rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#334155"
                }}
              >
                👑 <strong>Super Admin:</strong> <code>superadmin@ims.local</code>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("admin@institute.local", "AdminSecurePassword123!", "INST001")}
                style={{
                  textAlign: "left",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "0.45rem 0.65rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#334155"
                }}
              >
                🏫 <strong>Institute Admin:</strong> <code>admin@institute.local</code> (INST001)
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("student@institute.local", "StudentSecurePassword123!", "INST001")}
                style={{
                  textAlign: "left",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "0.45rem 0.65rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#334155"
                }}
              >
                🎓 <strong>Student Email:</strong> <code>student@institute.local</code> (INST001)
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("ADM-2026-0001", "StudentSecurePassword123!", "INST001")}
                style={{
                  textAlign: "left",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "0.45rem 0.65rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#334155"
                }}
              >
                🎫 <strong>Student ID:</strong> <code>ADM-2026-0001</code> (INST001)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
