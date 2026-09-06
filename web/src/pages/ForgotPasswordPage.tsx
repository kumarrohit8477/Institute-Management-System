import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/src/services/api";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      setMessage(
        res?.message ||
          "If an account exists with this email address, a password reset link has been sent."
      );
    } catch (err: any) {
      const msg = err.message || "Failed to send reset link. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans box-sizing border-box overflow-y-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-3 shadow-lg shadow-blue-600/30">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Forgot Password
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Enter your registered email to receive a password reset link
          </p>
        </div>

        <div className="bg-white backdrop-blur-md border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Check Your Inbox</h3>
              <p className="text-slate-600 text-xs mb-4 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {message}
              </p>
              <p className="text-xs text-slate-400 mb-5">
                Please check your email inbox and spam folder. The link is valid for 60 minutes.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 text-center"
                >
                  Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
                >
                  Didn't receive email? Request again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Sending Reset Link...</span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={12} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;