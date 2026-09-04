import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from "react-native";
import {
  MobileFeeService,
  MobileNotificationService,
  StudentFeeOverviewResponse,
  NotificationItem
} from "../../services/feeService";
import { useAuth } from "../../hooks/useAuth";
import { Header, Card, Badge, Button } from "../../components/Header";

export const FeesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [feeData, setFeeData] = useState<StudentFeeOverviewResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"INVOICES" | "RECEIPTS">("INVOICES");
  const [payModalOpen, setPayModalOpen] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState<string>("UPI");
  const [isPaying, setIsPaying] = useState<boolean>(false);

  const loadFees = async () => {
    try {
      const data = await MobileFeeService.getOverview();
      setFeeData(data);
    } catch (err) {
      console.warn("Fees fallback:", err);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const summary = feeData?.summary || {
    totalBilled: 160000,
    totalPaid: 90000,
    totalDiscount: 10000,
    totalOutstanding: 70000,
    nextDueDate: "2026-11-15"
  };

  const invoices = feeData?.invoices?.length ? feeData.invoices : [
    {
      id: "inv-1",
      title: "Year 1 Tuition & Material Comprehensive Fee",
      totalAmount: 100000,
      discountAmount: 10000,
      finalAmount: 90000,
      paidAmount: 90000,
      status: "PAID",
      dueDate: "2026-04-15"
    },
    {
      id: "inv-2",
      title: "Year 2 Advanced CBT Mock & Laboratory Fee",
      totalAmount: 70000,
      discountAmount: 0,
      finalAmount: 70000,
      paidAmount: 0,
      status: "PENDING",
      dueDate: "2026-11-15"
    }
  ];

  const receipts = feeData?.paymentHistory?.length ? feeData.paymentHistory : [
    {
      id: "pay-1",
      receiptNumber: "REC-2026-0891",
      feeTitle: "Year 1 Tuition & Material Fee",
      amount: 90000,
      paymentMethod: "UPI",
      transactionReference: "UPI/392019481029",
      paymentDate: "2026-04-10"
    }
  ];

  const handleOpenPay = (inv: any) => {
    setSelectedInvoice(inv);
    setPayModalOpen(true);
  };

  const handleSimulatePayment = async () => {
    if (!selectedInvoice) return;
    setIsPaying(true);
    try {
      await MobileFeeService.initiatePayment({
        feeId: selectedInvoice.id,
        amount: Number(selectedInvoice.finalAmount) - Number(selectedInvoice.paidAmount),
        paymentMethod: payMethod
      });
      Alert.alert("Payment Successful! 🎉", "Your transaction receipt has been generated.");
      await loadFees();
    } catch {
      Alert.alert("Payment Recorded", `Simulated ${payMethod} payment of ₹${(Number(selectedInvoice.finalAmount) - Number(selectedInvoice.paidAmount)).toLocaleString()}`);
    } finally {
      setIsPaying(false);
      setPayModalOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Fee Invoices & Payments" subtitle="Installments, balances & receipts" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* Financial Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>STUDENT FINANCIAL OVERVIEW</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>PAID AMOUNT</Text>
              <Text style={[styles.summaryVal, { color: "#10b981" }]}>
                ₹{Number(summary.totalPaid).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>OUTSTANDING</Text>
              <Text style={[styles.summaryVal, { color: "#ef4444" }]}>
                ₹{Number(summary.totalOutstanding).toLocaleString()}
              </Text>
            </View>
          </View>

          {summary.nextDueDate ? (
            <View style={styles.dueDateRow}>
              <Text style={styles.dueDateText}>
                ⏳ Next Installment Due: {new Date(summary.nextDueDate).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Invoices vs Receipts Switcher */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("INVOICES")}
            style={[styles.toggleBtn, activeTab === "INVOICES" && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, activeTab === "INVOICES" && styles.toggleTextActive]}>
              Invoices & Dues ({invoices.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("RECEIPTS")}
            style={[styles.toggleBtn, activeTab === "RECEIPTS" && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, activeTab === "RECEIPTS" && styles.toggleTextActive]}>
              Receipt History ({receipts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "INVOICES" ? (
          invoices.map((inv: any) => {
            const isPaid = inv.status === "PAID";
            const dueBalance = Number(inv.finalAmount) - Number(inv.paidAmount);

            return (
              <Card key={inv.id} style={styles.invoiceCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.invoiceTitle}>{inv.title}</Text>
                  <Badge
                    label={inv.status}
                    variant={isPaid ? "success" : inv.status === "OVERDUE" ? "danger" : "warning"}
                  />
                </View>

                <View style={styles.invoiceAmounts}>
                  <Text style={styles.amountItem}>
                    Net: <Text style={styles.amountBold}>₹{Number(inv.finalAmount).toLocaleString()}</Text>
                  </Text>
                  <Text style={styles.amountDot}>•</Text>
                  <Text style={styles.amountItem}>
                    Paid: <Text style={styles.amountBold}>₹{Number(inv.paidAmount).toLocaleString()}</Text>
                  </Text>
                </View>

                <View style={styles.invoiceFooter}>
                  <Text style={styles.dueText}>
                    📅 Due: {new Date(inv.dueDate).toLocaleDateString()}
                  </Text>

                  {!isPaid ? (
                    <TouchableOpacity
                      onPress={() => handleOpenPay(inv)}
                      style={styles.payNowBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.payNowText}>Pay ₹{dueBalance.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.clearedText}>✓ Cleared</Text>
                  )}
                </View>
              </Card>
            );
          })
        ) : (
          receipts.map((rec: any) => (
            <Card key={rec.id} style={styles.receiptCard}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.receiptNum}>{rec.receiptNumber}</Text>
                  <Text style={styles.receiptFeeTitle}>{rec.feeTitle || "Academic Fee"}</Text>
                </View>
                <Badge label={rec.paymentMethod || "ONLINE"} variant="primary" />
              </View>

              <View style={styles.receiptBottomRow}>
                <Text style={styles.receiptAmount}>
                  ₹{Number(rec.amount).toLocaleString()}
                </Text>
                <Text style={styles.receiptDate}>
                  📅 {new Date(rec.paymentDate).toLocaleDateString()}
                </Text>
              </View>

              {rec.transactionReference ? (
                <Text style={styles.refText}>Ref: {rec.transactionReference}</Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={payModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Online Fee Payment</Text>
            <Text style={styles.modalSubtitle}>{selectedInvoice?.title}</Text>

            <View style={styles.payAmountBox}>
              <Text style={styles.payAmountLabel}>PAYABLE AMOUNT</Text>
              <Text style={styles.payAmountBig}>
                ₹{(Number(selectedInvoice?.finalAmount || 0) - Number(selectedInvoice?.paidAmount || 0)).toLocaleString()}
              </Text>
            </View>

            <Text style={styles.methodTitle}>Select Payment Method:</Text>
            <View style={styles.methodsRow}>
              {["UPI", "CARD", "NET_BANKING"].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setPayMethod(m)}
                  style={[styles.methodBtn, payMethod === m && styles.methodBtnActive]}
                >
                  <Text style={[styles.methodText, payMethod === m && styles.methodTextActive]}>
                    {m === "UPI" ? "📱 UPI" : m === "CARD" ? "💳 Card" : "🏛 NetBanking"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={isPaying ? "Processing..." : `Pay ₹${(Number(selectedInvoice?.finalAmount || 0) - Number(selectedInvoice?.paidAmount || 0)).toLocaleString()} Now`}
              variant="success"
              disabled={isPaying}
              onPress={handleSimulatePayment}
              style={{ marginTop: 16 }}
            />

            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setPayModalOpen(false)}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const NotificationsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const loadNotifications = async () => {
    try {
      const res = await MobileNotificationService.getNotifications();
      setNotifications(res?.notifications || []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const sampleNotifications: NotificationItem[] = notifications.length > 0 ? notifications : [
    {
      id: "notif-1",
      title: "JEE Main Grand Mock Test 1 is Live 📝",
      message: "The all-India mock exam is active in your CBT portal. Complete your 3-hour attempt before the deadline.",
      type: "TEST",
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "notif-2",
      title: "Physics Lecture Notes Uploaded 📚",
      message: "Dr. Harish Verma added Chapter 4 Electrodynamics & Ray Optics notes to Study Materials.",
      type: "ACADEMIC",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "notif-3",
      title: "Installment Fee Due Reminder 💳",
      message: "Your Year 2 Advance Mock & Lab Fee installment is due on Nov 15, 2026.",
      type: "FEE",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  const handleMarkRead = async (id: string) => {
    try {
      await MobileNotificationService.markAsRead(id);
    } catch {
      // Local update
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await MobileNotificationService.markAllAsRead();
    } catch {
      // Local update
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = sampleNotifications.filter((n) => {
    if (activeFilter === "ALL") return true;
    return n.type === activeFilter;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Notifications & Alerts"
        subtitle="Important institute broadcasts"
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {["ALL", "TEST", "ACADEMIC", "FEE", "ATTENDANCE"].map((cat) => {
            const isSel = activeFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveFilter(cat)}
                style={[styles.chip, isSel && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSel && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {filtered.map((n) => (
          <TouchableOpacity
            key={n.id}
            onPress={() => handleMarkRead(n.id)}
            activeOpacity={0.8}
          >
            <Card style={[styles.notifCard, !n.isRead && styles.notifCardUnread]}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Badge label={n.type} variant="primary" />
              </View>

              <Text style={styles.notifMessage}>{n.message}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const ProfileScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { student, user, institute, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Header title="Student Profile" subtitle="Account details & session" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* Avatar & Name Card */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {student?.firstName?.[0] || user?.name?.[0] || "S"}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {student ? `${student.firstName} ${student.lastName}` : "Student Profile"}
          </Text>
          <Text style={styles.profileInstitute}>
            {student?.admissionNumber || "ADM-2026-001"} • {institute?.name || "Apex Academy"}
          </Text>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.detailsSectionTitle}>PERSONAL & ACADEMIC INFO</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email Address:</Text>
            <Text style={styles.detailValue}>{student?.email || user?.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mobile Phone:</Text>
            <Text style={styles.detailValue}>{student?.phone || "+91 9876543210"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Role:</Text>
            <Badge label="STUDENT" variant="primary" />
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Institute Code:</Text>
            <Text style={styles.detailValue}>{institute?.code || "INST001"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Badge label="Active" variant="success" />
          </View>
        </Card>

        <Button
          title="Sign Out of Student Account 🚪"
          variant="danger"
          onPress={logout}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  scrollList: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  summaryCard: {
    padding: 18
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 12
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryCol: {
    flex: 1
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700"
  },
  summaryVal: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2
  },
  dueDateRow: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginTop: 14,
    paddingTop: 10
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6"
  },
  tabToggleRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8
  },
  toggleBtnActive: {
    backgroundColor: "#3b82f6"
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b"
  },
  toggleTextActive: {
    color: "#ffffff",
    fontWeight: "700"
  },
  invoiceCard: {
    marginBottom: 4
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8
  },
  invoiceTitle: {
    flex: 1,
    fontWeight: "800",
    fontSize: 14,
    color: "#0f172a",
    marginRight: 8
  },
  invoiceAmounts: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  amountItem: {
    fontSize: 12,
    color: "#64748b"
  },
  amountBold: {
    fontWeight: "800",
    color: "#0f172a"
  },
  amountDot: {
    color: "#cbd5e1"
  },
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10
  },
  dueText: {
    fontSize: 11,
    color: "#64748b"
  },
  payNowBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  payNowText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700"
  },
  clearedText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "800"
  },
  receiptCard: {
    marginBottom: 4
  },
  receiptNum: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a"
  },
  receiptFeeTitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  receiptBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: "#10b981"
  },
  receiptDate: {
    fontSize: 11,
    color: "#64748b"
  },
  refText: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center"
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 16
  },
  payAmountBox: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16
  },
  payAmountLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b"
  },
  payAmountBig: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 4
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8
  },
  methodsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0"
  },
  methodBtnActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff"
  },
  methodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569"
  },
  methodTextActive: {
    color: "#2563eb",
    fontWeight: "700"
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6"
  },
  chipRow: {
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9"
  },
  chipActive: {
    backgroundColor: "#3b82f6"
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b"
  },
  chipTextActive: {
    color: "#ffffff"
  },
  notifCard: {
    marginBottom: 4
  },
  notifCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6"
  },
  notifTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: "#0f172a"
  },
  notifTime: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2
  },
  notifMessage: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginTop: 6
  },
  profileHeaderCard: {
    alignItems: "center",
    paddingVertical: 24
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  profileAvatarText: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900"
  },
  profileName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a"
  },
  profileInstitute: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4
  },
  detailsCard: {
    padding: 16
  },
  detailsSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 14
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b"
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a"
  }
});
