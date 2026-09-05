import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Copy, Check, AlertTriangle, KeyRound, ArrowRight } from "lucide-react";
import { api } from "@/src/services/api";

interface SetupResult {
  exists: boolean;
  newlyCreated: boolean;
  email: string | null;
  temporaryPassword: string | null;
  message: string;
}

export const SuperAdminSetupPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SetupResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSetupStatus = async () => {
      try {
        setLoading(true);
        // Call one-time bootstrap claim endpoint
        const data = await api.post("/auth/super-admin/bootstrap");
        setResult(data);
      } catch (err: any) {
        console.error("Failed to fetch Super Admin setup status:", err);
        setError("Unable to retrieve setup status. The initial password may have already been claimed.");
      } finally {
        setLoading(false);
      }
    };

    fetchSetupStatus();
  }, []);

  const handleCopyPassword = () => {
    if (result?.temporaryPassword) {
      navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-4 border border-indigo-500/30">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Super Admin Account Setup
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            System Initialization & Credential Bootstrap
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-slate-400">Retrieving setup credentials...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Setup Status Unavailable</h3>
              <p className="text-sm text-slate-400 mb-6">{error}</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          ) : result?.newlyCreated && result.temporaryPassword ? (
            <div>
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
                <Check className="shrink-0 text-emerald-400" size={20} />
                <span className="font-medium">Super Admin Account Created Successfully</span>
              </div>

              {/* Credential Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Super Admin Email
                  </label>
                  <div className="text-sm font-mono font-medium text-slate-100 bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-800">
                    {result.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-amber-400 mb-1">
                    Temporary Password
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-lg font-bold tracking-wider text-emerald-400 bg-slate-900 px-4 py-2.5 rounded-lg border border-emerald-500/30 select-all">
                      {result.temporaryPassword}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-indigo-600/30"
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copy Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Critical Security Warning */}
              <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs space-y-2 mb-8">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <AlertTriangle size={18} className="shrink-0 text-amber-400" />
                  <span>IMPORTANT SECURITY WARNING:</span>
                </div>
                <p className="leading-relaxed">
                  Save this temporary password now. For security reasons, <strong>it will not be shown again</strong>.
                </p>
                <p className="leading-relaxed text-amber-300/80">
                  This temporary password will only be displayed once. After leaving this page or refreshing, it cannot be retrieved. If you lose access, use the <strong>Forgot Password</strong> feature on the login page.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link
                  to="/login"
                  className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <span>Proceed to Super Admin Sign In</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <KeyRound size={30} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Super Admin Account Already Active</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                The Super Admin account has already been bootstrapped. For security reasons, generated temporary passwords are only displayed once and cannot be retrieved again.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-6 text-left">
                <p className="mb-1"><strong>Registered Email:</strong> {result?.email || "Configured Super Admin Email"}</p>
                <p className="text-slate-400">If you forgot your password, click "Forgot Password" on the Sign In page.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                >
                  Sign In to Super Admin
                </Link>
                <Link
                  to="/forgot-password"
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSetupPage;
