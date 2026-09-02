import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Button } from "../../components/Header";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("student@institute.local");
  const [password, setPassword] = useState("StudentSecurePassword123!");
  const [instituteCode, setInstituteCode] = useState("INST001");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email: identifier.trim(), password, instituteCode: instituteCode.trim() || undefined });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your student credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={{ justifyContent: "center", padding: "24px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: "18px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 800,
              margin: "0 auto 12px auto"
            }}
          >
            🎓
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
            Student Mobile App
          </h1>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Sign in to access your classes, tests, & attendance
          </p>
        </div>

        {error && (
          <div style={{ padding: "10px 12px", borderRadius: "8px", background: "#fef2f2", color: "#b91c1c", fontSize: "12px", marginBottom: "16px", lineHeight: "1.4" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
              Student Email or Admission No.
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="student@institute.local or ADM-2026-0001"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
              Institute Campus Code
            </label>
            <input
              type="text"
              value={instituteCode}
              onChange={(e) => setInstituteCode(e.target.value)}
              placeholder="INST001"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          <Button
            title={loading ? "Signing in..." : "Sign In to Student App"}
            disabled={loading}
            style={{ marginTop: "10px" }}
          />

          <div style={{ padding: "10px", borderRadius: "8px", background: "#f8fafc", fontSize: "11px", color: "#64748b", textAlign: "center" }}>
            💡 Demo: <code>student@institute.local</code> or <code>ADM-2026-0001</code>
          </div>
        </form>
      </div>
    </ScreenWrapper>
  );
};
