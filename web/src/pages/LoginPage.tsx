import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import {
Lock,
Mail,
Eye,
EyeOff,
Shield,
AlertCircle,
ArrowRight,
Building,
X
} from "lucide-react";
import "./LoginPage.css";

export const LoginPage: React.FC = () => {
const navigate = useNavigate();
const { login, error, clearError } = useAuth();

const [identifier, setIdentifier] = useState("");
const [password, setPassword] = useState("");
const [instituteCode, setInstituteCode] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [localError, setLocalError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();


setLocalError(null);
clearError();

if (!identifier.trim() || !password) {
  setLocalError("Please enter your login ID and password.");
  return;
}

setIsSubmitting(true);

try {
  const userRole = await login({
    email: identifier.trim(),
    password,
    instituteCode: instituteCode.trim() || undefined
  });

  const roleRoutes: Record<string, string> = {
    SUPER_ADMIN: "/superadmin/dashboard",
    ADMIN: "/admin/dashboard",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/student/dashboard"
  };

  navigate(roleRoutes[userRole] || "/", {
    replace: true
  });
} catch (err: any) {
  setLocalError(
    err.message || "Invalid login credentials. Please try again."
  );
} finally {
  setIsSubmitting(false);
}


};

return ( <main className="login-page"> <div className="login-container"> <section className="login-card">
{/* Close / Back to Home Button */} <Link
         to="/"
         className="login-close-btn"
         aria-label="Back to Home"
         title="Back to Home"
       > <X size={20} /> </Link>

      {/* Login Header */}
      <header className="login-header">
        <div className="login-logo">
          <Shield size={26} />
        </div>

        <h1>Welcome Back</h1>

        <p>
          Sign in to access your Institute Management System dashboard.
        </p>
      </header>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="login-form">
        {(localError || error) && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Email or User ID */}
        <div className="form-group">
          <label htmlFor="identifier">
            Email Address or User ID
          </label>

          <div className="input-wrapper">
            <Mail size={18} />

            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or User ID"
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="password-label-row">
            <label htmlFor="password">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>

          <div className="input-wrapper password-wrapper">
            <Lock size={18} />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Institute Code */}
        <div className="form-group">
          <label htmlFor="instituteCode">
            Institute Code

            <span className="optional-text">
              Optional 
            </span>
          </label>

          <div className="input-wrapper">
            <Building size={18} />

            <input
              id="instituteCode"
              type="text"
              value={instituteCode}
              onChange={(e) =>
                setInstituteCode(e.target.value)
              }
              placeholder="e.g. INST001"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="login-submit-btn"
        >
          {isSubmitting ? (
            "Signing in..."
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Footer */}
        <div className="login-footer">
          <span>
            Setting up the system for the first time?
          </span>

        </div>
      </form>
    </section>
  </div>
</main>


);
};
