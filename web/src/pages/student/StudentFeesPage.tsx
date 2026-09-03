import React, { useState, useEffect } from "react";
import { FeeApiService, StudentFeeOverviewResponse, StudentFeeInvoice } from "@/src/services/feeApi";
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Download, Receipt, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

export const StudentFeesPage: React.FC = () => {
  const [feeData, setFeeData] = useState<StudentFeeOverviewResponse | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await FeeApiService.getMyFeeOverview();
        setFeeData(data);
      } catch (err) {
        console.error("Failed to load fee overview from database:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overview: StudentFeeOverviewResponse = feeData || {
    student: { id: "", name: "", admissionNumber: "" },
    summary: {
      totalBilled: 0,
      totalPaid: 0,
      totalDiscount: 0,
      totalOutstanding: 0,
      nextDueDate: null
    },
    invoices: [],
    paymentHistory: []
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="badge badge-success" style={{ gap: "0.25rem" }}>
            <CheckCircle2 size={12} /> Paid in Full
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="badge badge-warning" style={{ gap: "0.25rem" }}>
            <Clock size={12} /> Partially Paid
          </span>
        );
      case "OVERDUE":
        return (
          <span className="badge badge-danger" style={{ gap: "0.25rem" }}>
            <AlertTriangle size={12} /> Overdue
          </span>
        );
      case "PENDING":
      default:
        return <span className="badge badge-gray">Upcoming Due</span>;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Fee Invoices & Payment Ledger</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Track your educational installments, scholarship deductions, pending dues, and official payment receipts.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid-cols-4">
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            NET BILLED AMOUNT
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-main)" }}>
            {formatCurrency(overview.summary.totalBilled)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-success)", marginTop: "0.25rem" }}>
            Includes {formatCurrency(overview.summary.totalDiscount)} Scholarship
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            TOTAL PAID AMOUNT
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-success)" }}>
            {formatCurrency(overview.summary.totalPaid)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Cleared & Verified Transactions
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            OUTSTANDING BALANCE
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: overview.summary.totalOutstanding > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
            {formatCurrency(overview.summary.totalOutstanding)}
          </div>
          <div style={{ fontSize: "0.75rem", color: overview.summary.totalOutstanding > 0 ? "#dc2626" : "#059669", marginTop: "0.25rem" }}>
            {overview.summary.totalOutstanding > 0 ? "Balance Pending" : "Zero Dues Remaining"}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            NEXT PAYMENT DEADLINE
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-primary)", marginTop: "0.25rem" }}>
            {overview.summary.nextDueDate ? new Date(overview.summary.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Installment 2 Due
          </div>
        </div>
      </div>

      {/* Fee Invoices Breakdown Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: "1.1rem" }}>Fee Invoices & Installments</h2>
          </div>
          <span className="badge badge-gray">{overview.invoices.length} Invoices</span>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Title</th>
                <th>Course / Cohort</th>
                <th>Gross Fee</th>
                <th>Scholarship</th>
                <th>Net Payable</th>
                <th>Paid Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {overview.invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    No fee invoices generated in the database.
                  </td>
                </tr>
              ) : (
                overview.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.title}</td>
                    <td>{inv.batch?.name || "Enrolled Course"}</td>
                    <td>{formatCurrency(Number(inv.totalAmount))}</td>
                    <td style={{ color: "#059669", fontWeight: 600 }}>
                      {inv.discountAmount > 0 ? `-${formatCurrency(Number(inv.discountAmount))}` : "—"}
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(Number(inv.finalAmount))}</td>
                    <td style={{ color: "#059669", fontWeight: 600 }}>{formatCurrency(Number(inv.paidAmount))}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td>{getStatusBadge(inv.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipts History */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Receipt size={18} color="var(--color-success)" />
            <h2 style={{ fontSize: "1.1rem" }}>Payment Receipts & Transaction Log</h2>
          </div>
          <span className="badge badge-gray">{overview.paymentHistory.length} Receipts</span>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt Voucher #</th>
                <th>Payment Date</th>
                <th>Invoice Title</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Reference #</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {overview.paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    No payment transaction receipts recorded in the database.
                  </td>
                </tr>
              ) : (
                overview.paymentHistory.map((pmt) => (
                  <tr key={pmt.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--color-primary)", fontFamily: "monospace" }}>
                        {pmt.receiptNumber}
                      </span>
                    </td>
                    <td>{new Date(pmt.paymentDate).toLocaleDateString()}</td>
                    <td>{pmt.feeTitle}</td>
                    <td style={{ fontWeight: 700, color: "#059669" }}>{formatCurrency(Number(pmt.amount))}</td>
                    <td>
                    <span className="badge badge-primary">{pmt.paymentMethod}</span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {pmt.transactionReference || "Cash Desk"}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedReceipt(pmt)}
                      className="btn btn-outline"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", gap: "0.3rem" }}
                    >
                      <Receipt size={13} /> View Voucher
                    </button>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Voucher Modal */}
      {selectedReceipt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1.5rem"
          }}
        >
          <div className="card" style={{ maxWidth: "520px", width: "100%", padding: "2rem" }}>
            <div style={{ textAlign: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <ShieldCheck size={24} color="#10b981" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Official Fee Payment Receipt</h2>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                Institute Management System • Cashier Desk
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Receipt Voucher No:</span>
                <strong style={{ fontFamily: "monospace" }}>{selectedReceipt.receiptNumber}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Student Name:</span>
                <strong>{overview.student.name} ({overview.student.admissionNumber})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Fee Invoice:</span>
                <strong>{selectedReceipt.feeTitle}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Payment Date:</span>
                <strong>{new Date(selectedReceipt.paymentDate).toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Payment Mode:</span>
                <span className="badge badge-primary">{selectedReceipt.paymentMethod}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Transaction Reference:</span>
                <span>{selectedReceipt.transactionReference || "Cash Voucher"}</span>
              </div>

              <div style={{ marginTop: "0.5rem", padding: "1rem", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#15803d" }}>Amount Paid (INR):</span>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#15803d" }}>
                  {formatCurrency(Number(selectedReceipt.amount))}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
              >
                <Download size={16} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
