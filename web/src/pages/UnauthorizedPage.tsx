import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const UnauthorizedPage: React.FC = () => {
  const { role } = useAuth();
  const dashboardLink = role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "1.5rem"
      }}
    >
      <div className="card" style={{ maxWidth: "480px", textAlign: "center", padding: "2.5rem 2rem" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem auto"
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Access Restricted (403)</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
          You do not have the required permissions or role privileges to view this section of the portal.
        </p>

        <Link to={dashboardLink} className="btn btn-primary" style={{ width: "100%" }}>
          <ArrowLeft size={16} /> Return to My Dashboard
        </Link>
      </div>
    </div>
  );
};
