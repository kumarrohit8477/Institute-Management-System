import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { InstituteApiService } from "@/src/services/instituteApi";
import {
  Image as ImageIcon,
  Building2,
  Upload,
  Trash2,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Quote,
  Save,
  RotateCcw,
  Layout,
  GraduationCap,
  FileText,
  Eye
} from "lucide-react";

const PRESET_TAGLINES = [
  "Empowering Minds, Shaping Tomorrow",
  "Excellence in Modern Education",
  "Inspiring Innovation & Leadership",
  "Knowledge, Integrity, Excellence",
  "Learn Today, Lead Tomorrow"
];

export const AdminBrandingPage: React.FC = () => {
  const { institute, updateInstituteLogo, updateInstituteTagline } = useAuth();

  // Logo modal and upload states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [logoTab, setLogoTab] = useState<"FILE" | "URL">("FILE");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tagline / Slogan states
  const [taglineInput, setTaglineInput] = useState<string>(institute?.tagline || "");
  const [isSavingTagline, setIsSavingTagline] = useState<boolean>(false);
  const [taglineSuccessMsg, setTaglineSuccessMsg] = useState<string | null>(null);
  const [taglineErrorMsg, setTaglineErrorMsg] = useState<string | null>(null);

  // Live preview previewTab state
  const [previewTab, setPreviewTab] = useState<"ADMIN" | "STUDENT" | "CERTIFICATE">("ADMIN");

  useEffect(() => {
    if (institute?.tagline !== undefined) {
      setTaglineInput(institute?.tagline || "");
    }
  }, [institute?.tagline]);

  const currentLogoSrc = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validMimes.includes(file.type)) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5 MB limit.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = logoTab === "FILE" ? logoPreview : externalUrl.trim();

    if (!payload) {
      setErrorMsg(
        logoTab === "FILE"
          ? "Please select an image file first."
          : "Please enter a valid image URL."
      );
      return;
    }

    setIsUploading(true);
    try {
      const res = await InstituteApiService.uploadLogo(
        payload,
        selectedFile?.name,
        selectedFile?.type
      );
      updateInstituteLogo(res.logoUrl);
      setSuccessMsg("Institute logo updated successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        setLogoPreview(null);
        setSelectedFile(null);
        setExternalUrl("");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove the institute logo?")) {
      return;
    }

    setIsUploading(true);
    try {
      await InstituteApiService.deleteLogo();
      updateInstituteLogo(null);
      setLogoPreview(null);
      setSelectedFile(null);
      setExternalUrl("");
      setSuccessMsg("Institute logo removed.");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTagline = async () => {
    setTaglineErrorMsg(null);
    setTaglineSuccessMsg(null);
    setIsSavingTagline(true);

    try {
      const trimmed = taglineInput.trim();
      const res = await InstituteApiService.updateTagline(trimmed || null);
      updateInstituteTagline(res.tagline || null);
      setTaglineSuccessMsg("Tagline / Slogan saved successfully!");
      setTimeout(() => setTaglineSuccessMsg(null), 3000);
    } catch (err: any) {
      setTaglineErrorMsg(err.message || "Failed to save tagline.");
    } finally {
      setIsSavingTagline(false);
    }
  };

  const handleClearTagline = async () => {
    if (!taglineInput && !institute?.tagline) return;
    if (institute?.tagline && !window.confirm("Are you sure you want to clear the institute tagline/slogan?")) {
      return;
    }

    setTaglineErrorMsg(null);
    setTaglineSuccessMsg(null);
    setIsSavingTagline(true);

    try {
      await InstituteApiService.updateTagline(null);
      updateInstituteTagline(null);
      setTaglineInput("");
      setTaglineSuccessMsg("Tagline / Slogan cleared.");
      setTimeout(() => setTaglineSuccessMsg(null), 3000);
    } catch (err: any) {
      setTaglineErrorMsg(err.message || "Failed to clear tagline.");
    } finally {
      setIsSavingTagline(false);
    }
  };

  const activeTagline = taglineInput.trim() || institute?.tagline || "";
  const isTaglineChanged = taglineInput.trim() !== (institute?.tagline || "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Global Alerts */}
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

      {taglineSuccessMsg && (
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
            <span>{taglineSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setTaglineSuccessMsg(null)}
            style={{ background: "transparent", border: "none", color: "#15803d", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Institute Branding & Visual Identity</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Customize your official campus logo, motto/tagline, badge identity, and student portal banner.
        </p>
      </div>

      {/* Current Identity Summary Banner */}
      <div className="card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", border: "1px solid #e2e8f0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "16px",
                background: "#ffffff",
                border: "2px dashed #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
                flexShrink: 0,
              }}
            >
              {currentLogoSrc ? (
                <img
                  src={currentLogoSrc}
                  alt="Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "6px",
                  }}
                />
              ) : (
                <Building2 size={40} color="#2563eb" />
              )}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0 }}>
                  {institute?.name || "Apex Academy"}
                </h2>
                <span className="badge badge-success">Active Campus</span>
              </div>

              {institute?.tagline ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginTop: "0.4rem",
                    padding: "0.25rem 0.75rem",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    fontStyle: "italic",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <Quote size={13} style={{ transform: "rotate(180deg)" }} />
                  <span>{institute.tagline}</span>
                </div>
              ) : (
                <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic", marginTop: "0.3rem" }}>
                  No official tagline or slogan configured yet.
                </div>
              )}

              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--color-text-muted)",
                  margin: "0.5rem 0 0 0",
                }}
              >
                Campus Code: <strong>{institute?.code || "CAMPUS-01"}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ gap: "0.4rem" }}
            >
              <ImageIcon size={16} /> Manage Logo
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Management Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Card 1: Official Logo */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
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
                <ImageIcon size={18} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Official Logo & Crest</h3>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
              Your campus crest or official badge shown on the navigation bar, login screen, and student reports.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                padding: "1rem",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {currentLogoSrc ? (
                  <img
                    src={currentLogoSrc}
                    alt="Logo"
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                  />
                ) : (
                  <Building2 size={28} color="#94a3b8" />
                )}
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                  {institute?.logoUrl ? "Custom Emblem Active" : "Default Monogram Active"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                  Formats supported: PNG, JPG, WebP, SVG (Max 5MB)
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ flex: 1, gap: "0.4rem", justifyContent: "center" }}
            >
              <Upload size={15} /> Upload / Change Logo
            </button>
            {institute?.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="btn btn-outline"
                style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                title="Remove logo"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Institute Tagline / Slogan */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
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
                  <Quote size={18} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Institute Tagline / Slogan</h3>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: taglineInput.length > 220 ? "#dc2626" : "#64748b",
                  fontWeight: 600,
                }}
              >
                {taglineInput.length} / 255
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: "1rem" }}>
              Set your institution's motto, slogan, or official tagline. It appears on the top navigation, student learning portal, and academic reports.
            </p>

            {taglineErrorMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: "0.8rem",
                  marginBottom: "0.75rem",
                  border: "1px solid #fecaca",
                }}
              >
                <AlertCircle size={15} />
                <span>{taglineErrorMsg}</span>
              </div>
            )}

            {/* Input field */}
            <div style={{ marginBottom: "0.75rem" }}>
              <input
                type="text"
                value={taglineInput}
                onChange={(e) => {
                  setTaglineInput(e.target.value);
                  setTaglineErrorMsg(null);
                }}
                maxLength={255}
                placeholder="e.g. Empowering Minds, Shaping Tomorrow"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Presets suggestions */}
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Sparkles size={12} color="#a855f7" /> Quick Suggestions:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {PRESET_TAGLINES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTaglineInput(preset);
                      setTaglineErrorMsg(null);
                    }}
                    style={{
                      background: taglineInput === preset ? "#f3e8ff" : "#f1f5f9",
                      color: taglineInput === preset ? "#7e22ce" : "#475569",
                      border: taglineInput === preset ? "1px solid #d8b4fe" : "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.25rem" }}>
            <button
              type="button"
              disabled={isSavingTagline}
              onClick={handleSaveTagline}
              className="btn btn-primary"
              style={{
                flex: 1,
                gap: "0.4rem",
                justifyContent: "center",
                background: isTaglineChanged ? "linear-gradient(135deg, #7e22ce 0%, #9333ea 100%)" : undefined,
              }}
            >
              <Save size={15} />
              {isSavingTagline ? "Saving..." : isTaglineChanged ? "Save Tagline *" : "Save Tagline"}
            </button>

            {(taglineInput || institute?.tagline) && (
              <button
                type="button"
                disabled={isSavingTagline}
                onClick={handleClearTagline}
                className="btn btn-outline"
                style={{ color: "#64748b" }}
                title="Clear tagline"
              >
                <RotateCcw size={15} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Brand Identity In Action Preview */}
      <div className="card" style={{ border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Eye size={18} color="#2563eb" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Live Identity Preview</h3>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "0.2rem 0 0 0" }}>
              See in real-time how your Logo, Campus Name, and Tagline / Slogan appear across the system.
            </p>
          </div>

          {/* Preview Tab Buttons */}
          <div
            style={{
              display: "flex",
              borderRadius: "8px",
              background: "#f1f5f9",
              padding: "3px",
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewTab("ADMIN")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                background: previewTab === "ADMIN" ? "#ffffff" : "transparent",
                color: previewTab === "ADMIN" ? "#0f172a" : "#64748b",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
                boxShadow: previewTab === "ADMIN" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <Layout size={14} /> Admin Header
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("STUDENT")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                background: previewTab === "STUDENT" ? "#ffffff" : "transparent",
                color: previewTab === "STUDENT" ? "#0f172a" : "#64748b",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
                boxShadow: previewTab === "STUDENT" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <GraduationCap size={14} /> Student Portal
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("CERTIFICATE")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                background: previewTab === "CERTIFICATE" ? "#ffffff" : "transparent",
                color: previewTab === "CERTIFICATE" ? "#0f172a" : "#64748b",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
                boxShadow: previewTab === "CERTIFICATE" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <FileText size={14} /> Academic Letterhead
            </button>
          </div>
        </div>

        {/* Preview Screen Renderings */}
        {previewTab === "ADMIN" && (
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "0.85rem 1.5rem",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {currentLogoSrc ? (
                    <img src={currentLogoSrc} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }} />
                  ) : (
                    <span style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.9rem" }}>{institute?.name?.[0] || "IMS"}</span>
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>
                    {institute?.name || "Apex Academy"}
                  </div>
                  {activeTagline ? (
                    <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 600, fontStyle: "italic" }}>
                      "{activeTagline}"
                    </div>
                  ) : null}
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500 }}>
                    Administrator Console • <span style={{ color: "#2563eb", fontWeight: 700 }}>{institute?.code || "CAMPUS-01"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="badge badge-primary">Admin Console</span>
              </div>
            </div>
            <div style={{ padding: "1.25rem 1.5rem", background: "#f1f5f9", color: "#64748b", fontSize: "0.8rem", textAlign: "center" }}>
              Administrator Header Bar Preview
            </div>
          </div>
        )}

        {previewTab === "STUDENT" && (
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid #bfdbfe",
              background: "#ffffff",
              boxShadow: "0 4px 15px rgba(37,99,235,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1rem 1.5rem",
                background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {currentLogoSrc ? (
                    <img src={currentLogoSrc} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }} />
                  ) : (
                    <span style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.9rem" }}>{institute?.name?.[0] || "IMS"}</span>
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                    {institute?.name || "Apex Academy"}
                  </div>
                  {activeTagline ? (
                    <div style={{ fontSize: "0.8rem", color: "#dbeafe", fontWeight: 500, fontStyle: "italic" }}>
                      "{activeTagline}"
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "#bfdbfe" }}>Student Learning Portal</div>
                  )}
                </div>
              </div>

              <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.3rem 0.75rem", borderRadius: "14px", fontSize: "0.75rem", fontWeight: 600 }}>
                Student Access
              </span>
            </div>
            <div style={{ padding: "1.25rem 1.5rem", background: "#f8fafc", color: "#64748b", fontSize: "0.8rem", textAlign: "center" }}>
              Student Learning Portal Banner Preview
            </div>
          </div>
        )}

        {previewTab === "CERTIFICATE" && (
          <div
            style={{
              padding: "2rem",
              background: "#ffffff",
              border: "3px double #cbd5e1",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 0.75rem auto",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {currentLogoSrc ? (
                <img src={currentLogoSrc} alt="Crest" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
              ) : (
                <Building2 size={32} color="#2563eb" />
              )}
            </div>

            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "0.02em" }}>
              {institute?.name || "Apex Academy Campus"}
            </h2>

            {activeTagline ? (
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.88rem",
                  color: "#475569",
                  fontStyle: "italic",
                  marginBottom: "1rem",
                }}
              >
                — "{activeTagline}" —
              </div>
            ) : (
              <div style={{ height: "0.75rem" }} />
            )}

            <div style={{ width: "80px", height: "2px", background: "#2563eb", margin: "0.75rem auto" }} />

            <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Official Academic Transcript & Certificate Header
            </div>
          </div>
        )}
      </div>

      {/* Modal: Logo Management */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                    Institute Logo & Branding
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                    Upload or update the official logo for {institute?.name || "your campus"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              {errorMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    fontSize: "0.82rem",
                    marginBottom: "1rem",
                    border: "1px solid #fecaca",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Preview Comparison */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.5rem",
                  padding: "1.25rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginBottom: "0.4rem" }}>
                    CURRENT LOGO
                  </div>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "2px dashed #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      overflow: "hidden",
                    }}
                  >
                    {currentLogoSrc ? (
                      <img
                        src={currentLogoSrc}
                        alt="Current"
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                      />
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No Logo</span>
                    )}
                  </div>
                </div>

                <div style={{ color: "#94a3b8", fontSize: "1.25rem" }}>➔</div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.4rem" }}>
                    NEW PREVIEW
                  </div>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "2px solid #3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      overflow: "hidden",
                    }}
                  >
                    {logoPreview || externalUrl ? (
                      <img
                        src={logoPreview || externalUrl}
                        alt="New Preview"
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                      />
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Tabs */}
              <div
                style={{
                  display: "flex",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  padding: "3px",
                  marginBottom: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLogoTab("FILE")}
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    borderRadius: "6px",
                    border: "none",
                    background: logoTab === "FILE" ? "#ffffff" : "transparent",
                    color: logoTab === "FILE" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setLogoTab("URL")}
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    borderRadius: "6px",
                    border: "none",
                    background: logoTab === "URL" ? "#ffffff" : "transparent",
                    color: logoTab === "URL" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Image URL
                </button>
              </div>

              {logoTab === "FILE" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: "12px",
                      padding: "1.75rem 1rem",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#fafafa",
                    }}
                  >
                    <Upload size={28} style={{ color: "#3b82f6", margin: "0 auto 0.5rem auto" }} />
                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>Click to choose image file</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                      Supports PNG, JPG, WebP, SVG (Max 5 MB)
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {institute?.logoUrl ? (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleRemoveLogo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} /> Remove Logo
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleSaveLogo}
                  className="btn btn-primary"
                >
                  {isUploading ? "Saving..." : "Save Logo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
