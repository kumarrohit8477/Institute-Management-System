import React, { useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { StudentApiService } from "@/src/services/studentApi";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building,
  Award,
  Briefcase
} from "lucide-react";
import "./TeacherProfilePage.css";

export const TeacherProfilePage: React.FC = () => {
  const { user, institute } = useAuth();
  const teacher = user?.teacher;

  // Password Reset / Change Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!currentPassword) {
      setErrorMsg("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMsg("New password must contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await StudentApiService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setSuccessMsg(res?.message || "Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const teacherFullName = teacher
    ? `${teacher.firstName} ${teacher.lastName}`
    : user?.name || user?.email?.split("@")[0] || "Faculty Member";

  return (
    <div className="teacher-profile-page">
      {/* Page Header */}
      <header className="teacher-profile-header">
        <div>
          <h1>My Faculty Profile</h1>
          <p>Manage your instructor profile credentials and update your security password.</p>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="teacher-profile-grid">
        {/* Left Column: Personal Identity & Info */}
        <div className="teacher-profile-col">
          <div className="profile-card identity-card">
            <div className="identity-header">
              <div className="identity-avatar">
                {teacher?.firstName?.[0] || user?.name?.[0] || "T"}
              </div>
              <div className="identity-info">
                <h2>{teacherFullName}</h2>
                <div className="identity-badge-row">
                  <span className="badge badge-code">
                    Emp #: {teacher?.employeeCode || "N/A"}
                  </span>
                  <span className="badge badge-role">
                    Faculty Member
                  </span>
                </div>
              </div>
            </div>

            <div className="identity-details-grid">
              <div className="detail-item">
                <Mail size={16} className="detail-icon" />
                <div>
                  <label>Email Address</label>
                  <span>{teacher?.email || user?.email || "N/A"}</span>
                </div>
              </div>

              <div className="detail-item">
                <Phone size={16} className="detail-icon" />
                <div>
                  <label>Contact Phone</label>
                  <span>{teacher?.phone || "Not Provided"}</span>
                </div>
              </div>

              <div className="detail-item">
                <GraduationCap size={16} className="detail-icon" />
                <div>
                  <label>Qualification</label>
                  <span>{teacher?.qualification || "Ph.D. / Master's"}</span>
                </div>
              </div>

              <div className="detail-item">
                <Award size={16} className="detail-icon" />
                <div>
                  <label>Specialization</label>
                  <span>{teacher?.specialization || "General Faculty"}</span>
                </div>
              </div>

              <div className="detail-item">
                <Building size={16} className="detail-icon" />
                <div>
                  <label>Institute Name</label>
                  <span>{institute?.name || "Institute Management System"}</span>
                </div>
              </div>

              <div className="detail-item">
                <Shield size={16} className="detail-icon" />
                <div>
                  <label>Institute Code</label>
                  <span className="code-text">{institute?.code || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Password Reset / Change Card */}
        <div className="teacher-profile-col">
          <div className="profile-card password-card">
            <div className="card-title">
              <Key size={18} color="#4f46e5" />
              <h3>Reset / Change Password</h3>
            </div>
            <p className="card-subtitle">
              Update your faculty account password. Ensure your password is at least 8 characters with letters and numbers.
            </p>

            {successMsg && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="password-form">
              {/* Current Password */}
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <div className="input-input-wrapper">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <div className="input-input-wrapper">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <div className="input-input-wrapper">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Requirements List */}
              <div className="password-rules">
                <span className="rules-title">Password must contain:</span>
                <ul>
                  <li className={newPassword.length >= 8 ? "rule-met" : ""}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "rule-met" : ""}>
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "rule-met" : ""}>
                    At least one lowercase letter (a-z)
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? "rule-met" : ""}>
                    At least one number (0-9)
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-submit-password"
              >
                {isSubmitting ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
