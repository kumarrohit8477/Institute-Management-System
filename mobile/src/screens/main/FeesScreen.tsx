import React, { useState, useEffect } from "react";
import { MobileFeeService, MobileNotificationService } from "../../services/feeService";
import { useAuth } from "../../hooks/useAuth";
import { Header, Card, Badge, Button } from "../../components/Header";

export const FeesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [feeData, setFeeData] = useState<any>(null);

  useEffect(() => {
    MobileFeeService.getOverview().then(setFeeData).catch(console.warn);
  }, []);

  const summary = feeData?.summary || {
    totalBilled: 160000,
    totalPaid: 90000,
    totalOutstanding: 70000
  };

  const invoices = feeData?.invoices || [
    {
      id: "1",
      title: "Year 1 Tuition & Material Fee",
      finalAmount: 90000,
      paidAmount: 90000,
      status: "PAID",
      dueDate: "2026-04-15"
    },
    {
      id: "2",
      title: "Year 2 Advanced Mock & Lab Fee",
      finalAmount: 70000,
      paidAmount: 0,
      status: "PENDING",
      dueDate: "2026-11-15"
    }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Fee Invoices" subtitle="Installments & balances" onBack={onBack} />

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>PAID AMOUNT</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#10b981" }}>₹{summary.totalPaid.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>OUTSTANDING</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ef4444" }}>₹{summary.totalOutstanding.toLocaleString()}</div>
          </div>
        </div>
      </Card>

      <div style={{ fontWeight: 800, fontSize: "14px" }}>Installments</div>

      {invoices.map((inv: any) => (
        <Card key={inv.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "13px" }}>{inv.title}</span>
            <Badge
              label={inv.status}
              variant={inv.status === "PAID" ? "success" : "warning"}
            />
          </div>
          <div style={{ fontSize: "12px", color: "#475569" }}>
            Net Payable: <strong>₹{Number(inv.finalAmount).toLocaleString()}</strong> | Paid: <strong>₹{Number(inv.paidAmount).toLocaleString()}</strong>
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Due: {new Date(inv.dueDate).toLocaleDateString()}
          </div>
        </Card>
      ))}
    </div>
  );
};

export const NotificationsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    MobileNotificationService.getNotifications()
      .then((res) => setNotifications(res.notifications || []))
      .catch(console.warn);
  }, []);

  const sampleAlerts = notifications.length > 0 ? notifications : [
    {
      id: "1",
      title: "JEE Main Grand Mock 1 is Live",
      message: "The all-India mock exam is active. Start before deadline.",
      type: "TEST",
      isRead: false
    },
    {
      id: "2",
      title: "Lecture Notes Available",
      message: "Dr. Harish Verma added Physics Chapter 4 notes.",
      type: "ANNOUNCEMENT",
      isRead: false
    }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Notifications" subtitle="Announcements & Alerts" onBack={onBack} />

      {sampleAlerts.map((n: any) => (
        <Card key={n.id} style={{ borderLeft: n.isRead ? "1px solid #e2e8f0" : "4px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>{n.title}</span>
            <Badge label={n.type} variant="primary" />
          </div>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
            {n.message}
          </p>
        </Card>
      ))}
    </div>
  );
};

export const ProfileScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { student, user, institute, logout } = useAuth();

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Student Profile" subtitle="Account details & session" onBack={onBack} />

      <Card style={{ textAlign: "center", padding: "24px 16px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 800,
            margin: "0 auto 12px auto"
          }}
        >
          {student?.firstName?.[0] || "S"}
        </div>
        <h2 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 4px 0" }}>
          {student ? `${student.firstName} ${student.lastName}` : "Student Profile"}
        </h2>
        <div style={{ fontSize: "12px", color: "#64748b" }}>
          {student?.admissionNumber || "ADM-2026-001"} • {institute?.name || "Apex Academy"}
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Email:</span>
            <strong>{student?.email || user?.email}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Phone:</span>
            <strong>{student?.phone || "+91 9876543210"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Status:</span>
            <Badge label="Active" variant="success" />
          </div>
        </div>
      </Card>

      <Button title="Sign Out of App" variant="danger" onClick={logout} />
    </div>
  );
};
