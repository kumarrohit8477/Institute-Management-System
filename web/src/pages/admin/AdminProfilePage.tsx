import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { InstituteApiService, InstituteDetails } from "@/src/services/instituteApi";
import {
  Building2,
  Shield,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  Save,
  X,
  Layers,
  Users,
  GraduationCap,
  HardDrive,
  Sparkles,
  Clock,
  Key,
  Quote,
  Zap,
  Award,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShieldCheck,
  DoorOpen
} from "lucide-react";

export const AdminProfilePage: React.FC = () => {
  const { user, institute: authInstitute, refreshInstitute } = useAuth();

  const [instituteData, setInstituteData] = useState<InstituteDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Copy states
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Edit Mode state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
 

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await InstituteApiService.getCurrentInstitute();
      setInstituteData(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load institute details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleCopy = (text: string, type: "ID" | "CODE") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "ID") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
       
      await refreshInstitute();
      setSuccessMsg("Institute details updated successfully!");
      setIsEditModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const logoUrl = instituteData?.logoUrl
    ? InstituteApiService.getLogoFullUrl(instituteData.logoUrl)
    : authInstitute?.logoUrl
      ? InstituteApiService.getLogoFullUrl(authInstitute.logoUrl)
      : null;

  const currentPlan = instituteData?.subscription?.plan;
  const subscription = instituteData?.subscription;
  const usage = instituteData?.tenantUsage;
  const counts = instituteData?._count;

  // Calculate percentages
  const studentLimit = currentPlan?.maxStudents || 100;
  const studentUsed = usage?.studentCount ?? (counts?.students || 0);
  const studentPercent = Math.min(Math.round((studentUsed / studentLimit) * 100), 100);

  const courseLimit = currentPlan?.maxCourses || 10;
  const courseUsed = usage?.courseCount ?? (counts?.courses || 0);
  const coursePercent = Math.min(Math.round((courseUsed / courseLimit) * 100), 100);

  const batchLimit = currentPlan?.maxBatches || 20;
  const batchUsed = usage?.batchCount ?? (counts?.batches || 0);
  const batchPercent = Math.min(Math.round((batchUsed / batchLimit) * 100), 100);

  const storageLimitMB = currentPlan?.maxStorageMB || 5120;
  const storageUsedMB = Number(usage?.storageUsedMB || 0);
  const storagePercent = Math.min(Math.round((storageUsedMB / storageLimitMB) * 100), 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Alert Messages */}
      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background: "#f0fdf4",
            color: "#15803d",
            border: "1px solid #bbf7d0",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            style={{ background: "transparent", border: "none", color: "#15803d", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            style={{ background: "transparent", border: "none", color: "#b91c1c", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>Institute & Administrator Profile</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Master profile information, campus identifiers, active subscription plan, and system credentials.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Link to="/admin/branding" className="btn btn-outline" style={{ gap: "0.4rem" }}>
            <ImageIcon size={15} /> Manage Branding
          </Link>
        </div>
      </div>

      {/* Hero Card: Identity Banner */}
      <div
        className="card"
        style={{
          backgroundColor: "#260781",
          color: "#ffffff",
          borderRadius: "10px",
          padding: "1.75rem",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          {/* Logo + Basic Titles */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "16px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Institute Logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }}
                />
              ) : (
                <Building2 size={44} color="#2563eb" />
              )}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                  {instituteData?.name || authInstitute?.name || "Apex Academy"}
                </h2>
                <span
                  style={{
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#4ade80",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    padding: "0.2rem 0.65rem",
                    borderRadius: "20px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {instituteData?.status || "ACTIVE"}
                </span>
              </div>

              {(instituteData?.tagline || authInstitute?.tagline) ? (
                <div
                  style={{
                    color: "#93c5fd",
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                    marginTop: "0.35rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <Quote size={13} style={{ transform: "rotate(180deg)" }} />
                  <span>"{instituteData?.tagline || authInstitute?.tagline}"</span>
                </div>
              ) : (
                <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                  Educational Institute • Academic Operations
                </div>
              )}

              {/* Subdomain / Website preview */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.6rem", fontSize: "0.8rem", color: "#cbd5e1" }}>
                {instituteData?.customDomain ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Globe size={13} color="#60a5fa" /> {instituteData.customDomain}
                  </span>
                ) : null}
                {instituteData?.website ? (
                  <a
                    href={instituteData.website.startsWith("http") ? instituteData.website : `https://${instituteData.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.3rem", textDecoration: "none" }}
                  >
                    <span>{instituteData.website.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Identifiers with Copy Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              background: "rgba(255, 255, 255, 0.06)",
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minWidth: "260px",
            }}
          >
            {/* Campus Code */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                  CAMPUS CODE
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>
                  {instituteData?.code || authInstitute?.code || "CAMPUS-01"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(instituteData?.code || authInstitute?.code || "", "CODE")}
                style={{
                  background: copiedCode ? "#22c55e" : "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.35rem 0.6rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.2s ease",
                }}
                title="Copy Campus Code"
              >
                {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

            {/* Institute ID (UUID) */}
            <div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                UNIQUE INSTITUTE ID (TENANT)
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.2rem" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    color: "#93c5fd",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "180px",
                  }}
                  title={instituteData?.id || authInstitute?.id || ""}
                >
                  {instituteData?.id || authInstitute?.id || "N/A"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(instituteData?.id || authInstitute?.id || "", "ID")}
                  style={{
                    background: copiedId ? "#22c55e" : "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.35rem 0.6rem",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    transition: "all 0.2s ease",
                  }}
                  title="Copy Unique UUID"
                >
                  {copiedId ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId ? "Copied" : "Copy ID"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Admin Account Info & Subscription Plan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Column 1: Administrator Account Details */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Administrator Account</h3>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Primary tenant administrator identity</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Admin Name</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>
                {user?.name || "Campus Administrator"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Login Email</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Mail size={13} /> {user?.email || "admin@ims.edu"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Assigned Role</span>
              <span className="badge badge-primary">ADMIN (Tenant Operator)</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Account Status</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", fontWeight: 600, color: "#16a34a" }}>
                <CheckCircle size={14} /> Active & Verified
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>User ID</span>
              <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b" }}>
                {user?.id || "N/A"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Last Login</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={13} />
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Active Session"}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Subscription Plan & Billing */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#fdf4ff",
                  color: "#a855f7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CreditCard size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Subscription & License</h3>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Active SaaS tier and billing cycle</p>
              </div>
            </div>

            <span
              style={{
                padding: "0.25rem 0.65rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 700,
                background: "#f3e8ff",
                color: "#7e22ce",
                border: "1px solid #d8b4fe",
              }}
            >
              {currentPlan?.tier || "STARTER"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Plan Tier</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                {currentPlan?.name || "Standard Starter Plan"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Billing Frequency</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>
                {subscription?.billingCycle || "MONTHLY"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>License Status</span>
              <span className="badge badge-success">
                {subscription?.status || "ACTIVE"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Auto Renewal</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: subscription?.autoRenew ? "#16a34a" : "#dc2626" }}>
                {subscription?.autoRenew ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Renews / Expires</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Calendar size={13} />
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : "Active Term"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Quotas & Resource Allocation Metering */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#f0fdf4",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Resource Quotas & Capacity Limits</h3>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Tracked according to your subscription plan entitlement</p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
         
        
          {/* Student Quota */}
          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Users size={15} color="#2563eb" /> Students Capacity
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: studentPercent > 90 ? "#dc2626" : "#2563eb" }}>
                {studentUsed} / {studentLimit}
              </span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${studentPercent}%`,
                  height: "100%",
                  background: studentPercent > 90 ? "#dc2626" : "linear-gradient(90deg, #3b82f6, #2563eb)",
                  borderRadius: "4px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.4rem", textAlign: "right" }}>
              {studentPercent}% utilized
            </div>
          </div>

          {/* Courses Quota */}
          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <GraduationCap size={15} color="#7c3aed" /> Courses Allowed
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: coursePercent > 90 ? "#dc2626" : "#7c3aed" }}>
                {courseUsed} / {courseLimit}
              </span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${coursePercent}%`,
                  height: "100%",
                  background: coursePercent > 90 ? "#dc2626" : "linear-gradient(90deg, #8b5cf6, #7c3aed)",
                  borderRadius: "4px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.4rem", textAlign: "right" }}>
              {coursePercent}% utilized
            </div>
          </div>

          {/* Batches Quota */}
          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Layers size={15} color="#0891b2" /> Active Batches
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: batchPercent > 90 ? "#dc2626" : "#0891b2" }}>
                {batchUsed} / {batchLimit}
              </span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${batchPercent}%`,
                  height: "100%",
                  background: batchPercent > 90 ? "#dc2626" : "linear-gradient(90deg, #06b6d4, #0891b2)",
                  borderRadius: "4px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.4rem", textAlign: "right" }}>
              {batchPercent}% utilized
            </div>
          </div>

          {/* Storage Quota */}
          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <HardDrive size={15} color="#ea580c" /> Cloud Storage
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: storagePercent > 90 ? "#dc2626" : "#ea580c" }}>
                {storageUsedMB.toFixed(1)} MB / {(storageLimitMB / 1024).toFixed(0)} GB
              </span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${storagePercent}%`,
                  height: "100%",
                  background: storagePercent > 90 ? "#dc2626" : "linear-gradient(90deg, #f97316, #ea580c)",
                  borderRadius: "4px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.4rem", textAlign: "right" }}>
              {storagePercent}% utilized
            </div>
          </div>
        </div>

        {/* Feature Entitlements Matrix */}
        <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: "0.75rem" }}>
            Plan Feature Entitlements:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
              {currentPlan?.hasOnlineCBT !== false ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#94a3b8" />}
              <span style={{ color: currentPlan?.hasOnlineCBT !== false ? "#1e293b" : "#94a3b8" }}>Online CBT & Tests</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
              {currentPlan?.hasCustomDomain ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#94a3b8" />}
              <span style={{ color: currentPlan?.hasCustomDomain ? "#1e293b" : "#94a3b8" }}>Custom Subdomain</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
              {currentPlan?.hasPushNotifications ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#94a3b8" />}
              <span style={{ color: currentPlan?.hasPushNotifications ? "#1e293b" : "#94a3b8" }}>Push Notifications</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
              {currentPlan?.hasApiAccess ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#94a3b8" />}
              <span style={{ color: currentPlan?.hasApiAccess ? "#1e293b" : "#94a3b8" }}>API Access & Webhooks</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};
