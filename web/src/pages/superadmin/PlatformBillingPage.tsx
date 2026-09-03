import React, { useEffect, useState } from "react";
import { SaasApi, PlatformInvoiceItem } from "@/src/services/saasApi";
import {
  Receipt,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import "./PlatformBillingPage.css";

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
    <div className="billing-page">
      {/* Header */}
      <div className="billing-page__header">
        <h1 className="billing-page__title">Platform Invoices & B2B Billing</h1>
        <p className="billing-page__subtitle">
          Track subscription invoices, GST breakdowns, payment collections, and tenant renewal statuses.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="billing-page__stats-grid">
        <div className="billing-page__stat-card">
          <span className="billing-page__stat-label">Total B2B Invoices Raised</span>
          <p className="billing-page__stat-val">₹{Math.round(totalBilled).toLocaleString("en-IN")}</p>
          <p className="billing-page__stat-sub">{invoices.length} Total Invoices</p>
        </div>

        <div className="billing-page__stat-card">
          <span className="billing-page__stat-label" style={{ color: "#059669" }}>Collected Revenue (Paid)</span>
          <p className="billing-page__stat-val val--emerald">₹{Math.round(totalPaid).toLocaleString("en-IN")}</p>
          <p className="billing-page__stat-sub">
            {invoices.filter((i) => i.status === "PAID").length} Cleared Invoices
          </p>
        </div>

        <div className="billing-page__stat-card">
          <span className="billing-page__stat-label" style={{ color: "#d97706" }}>Pending Receivables</span>
          <p className="billing-page__stat-val val--amber">₹{Math.round(totalPending).toLocaleString("en-IN")}</p>
          <p className="billing-page__stat-sub">
            {invoices.filter((i) => i.status === "PENDING").length} Unpaid Invoices
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="billing-page__filter-bar">
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="billing-page__filter-select"
          >
            <option value="">All Invoices</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <button
          onClick={fetchInvoices}
          className="billing-page__btn-refresh"
          title="Refresh Invoices"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Invoices Table */}
      <div className="billing-page__table-card">
        {loading ? (
          <div className="superadmin-dashboard__loader">
            <div className="superadmin-dashboard__spinner"></div>
            <p className="superadmin-dashboard__loader-text">Loading platform invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <Receipt className="w-10 h-10 mx-auto text-slate-400" />
            <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", fontWeight: 600, color: "#64748b" }}>
              No B2B invoices found
            </p>
          </div>
        ) : (
          <div className="institutes-page__table-wrapper">
            <table className="institutes-page__table">
              <thead className="institutes-page__thead">
                <tr>
                  <th className="institutes-page__th">Invoice #</th>
                  <th className="institutes-page__th">Institute Tenant</th>
                  <th className="institutes-page__th">Base + 18% GST</th>
                  <th className="institutes-page__th">Total Amount</th>
                  <th className="institutes-page__th">Status</th>
                  <th className="institutes-page__th">Due Date</th>
                  <th className="institutes-page__th" style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="institutes-page__tr">
                    <td className="institutes-page__td">
                      <span className="billing-page__inv-number">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="institutes-page__td">
                      <div>
                        <p className="billing-page__tenant-name">{inv.institute?.name || "Unknown Tenant"}</p>
                        <p className="billing-page__tenant-code">Code: {inv.institute?.code}</p>
                      </div>
                    </td>
                    <td className="institutes-page__td">
                      <div>
                        <span style={{ fontWeight: 600 }}>₹{Number(inv.amount).toLocaleString("en-IN")}</span>
                        <span className="billing-page__tax-sub">
                          + ₹{Number(inv.taxAmount).toLocaleString("en-IN")} GST
                        </span>
                      </div>
                    </td>
                    <td className="institutes-page__td">
                      <span className="billing-page__total-amount">
                        ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="institutes-page__td">
                      <span
                        className={`sa-badge ${
                          inv.status === "PAID"
                            ? "sa-badge--paid"
                            : "sa-badge--pending"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="institutes-page__td" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="institutes-page__td" style={{ textAlign: "right" }}>
                      {inv.status === "PENDING" ? (
                        <button
                          onClick={() => handleOpenPayModal(inv)}
                          className="billing-page__btn-pay"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="billing-page__paid-text">
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
        <div className="institutes-page__modal-backdrop">
          <div className="institutes-page__modal institutes-page__modal--sm">
            <div className="institutes-page__modal-header">
              <div>
                <h3 className="institutes-page__modal-title">Record Invoice Payment</h3>
                <p className="institutes-page__modal-subtitle">{selectedInvoice.invoiceNumber} ({selectedInvoice.institute?.name})</p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="institutes-page__modal-close"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="institutes-page__modal-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="institutes-page__summary-box">
                <div className="institutes-page__summary-row">
                  <span>Total Amount Due:</span>
                  <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                    ₹{Number(selectedInvoice.totalAmount).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="institutes-page__summary-row" style={{ fontSize: "0.75rem" }}>
                  <span>Includes 18% GST:</span>
                  <span>₹{Number(selectedInvoice.taxAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="institutes-page__field">
                <label className="institutes-page__label">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="institutes-page__input"
                >
                  <option value="BANK_TRANSFER">Bank Wire / NEFT / RTGS</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                </select>
              </div>

              <div className="institutes-page__field">
                <label className="institutes-page__label">UTR / Transaction Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-20260901-XXXX"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="institutes-page__input"
                  style={{ fontFamily: "monospace" }}
                />
              </div>

              <div className="institutes-page__modal-footer">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="institutes-page__btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="institutes-page__btn-submit"
                  style={{ backgroundColor: "#059669" }}
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
