import React, { useEffect, useState } from "react";
import { SaasApi, PlatformInvoiceItem } from "@/src/services/saasApi";
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  IndianRupee,
  CreditCard,
  Building2,
  AlertCircle,
  RefreshCw,
  ArrowDownToLine
} from "lucide-react";

export const PlatformBillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<PlatformInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Payment Recording Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoiceItem | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await SaasApi.getPlatformInvoices({
        status: statusFilter || undefined
      });
      setInvoices(res.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayModal = (inv: PlatformInvoiceItem) => {
    setSelectedInvoice(inv);
    setPaymentMethod("BANK_TRANSFER");
    setTransactionRef(`UTR-${Date.now()}`);
    setModalError(null);
    setShowPayModal(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    if (!selectedInvoice) return;
    e.preventDefault();
    try {
      setActionLoading(true);
      setModalError(null);
      await SaasApi.recordInvoicePayment(selectedInvoice.id, {
        paymentMethod,
        transactionReference: transactionRef
      });
      setShowPayModal(false);
      fetchInvoices();
    } catch (err: any) {
      setModalError(err.message || "Failed to record invoice payment");
    } finally {
      setActionLoading(false);
    }
  };

  const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "PENDING")
    .reduce((acc, inv) => acc + Number(inv.totalAmount), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Invoices & B2B Billing</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track subscription invoices, GST breakdowns, payment collections, and tenant renewal statuses.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Total B2B Invoices Raised</span>
          <p className="text-2xl font-bold text-white">₹{Math.round(totalBilled).toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500">{invoices.length} Total Invoices</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-medium text-emerald-400">Collected Revenue (Paid)</span>
          <p className="text-2xl font-bold text-emerald-400">₹{Math.round(totalPaid).toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500">
            {invoices.filter((i) => i.status === "PAID").length} Cleared Invoices
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-medium text-amber-400">Pending Receivables</span>
          <p className="text-2xl font-bold text-amber-400">₹{Math.round(totalPending).toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500">
            {invoices.filter((i) => i.status === "PENDING").length} Unpaid Invoices
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Invoices</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <button
          onClick={fetchInvoices}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700"
          title="Refresh Invoices"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading platform invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No B2B invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Institute Tenant</th>
                  <th className="px-6 py-3.5">Base + 18% GST</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-indigo-400 text-sm">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">{inv.institute?.name || "Unknown Tenant"}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Code: {inv.institute?.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>
                        <span>₹{Number(inv.amount).toLocaleString("en-IN")}</span>
                        <span className="text-[11px] text-slate-500 block">
                          + ₹{Number(inv.taxAmount).toLocaleString("en-IN")} GST
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-sm">
                        ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                          inv.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === "PENDING" ? (
                        <button
                          onClick={() => handleOpenPayModal(inv)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/40 transition-all"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">
                          Paid on {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD MANUAL PAYMENT MODAL */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Record Invoice Payment</h3>
                <p className="text-xs text-slate-400">{selectedInvoice.invoiceNumber} ({selectedInvoice.institute?.name})</p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Total Amount Due:</span>
                  <span className="font-bold text-white text-sm">
                    ₹{Number(selectedInvoice.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Includes 18% GST:</span>
                  <span>₹{Number(selectedInvoice.taxAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BANK_TRANSFER">Bank Wire / NEFT / RTGS</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">UTR / Transaction Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-20260901-XXXX"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm & Clear Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
