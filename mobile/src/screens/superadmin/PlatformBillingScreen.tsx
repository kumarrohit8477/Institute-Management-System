import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/Header";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingScreen } from "../../components/shared/LoadingScreen";
import { FormModal } from "../../components/shared/FormModal";
import { Input } from "../../components/shared/Input";
import { SelectPicker } from "../../components/shared/SelectPicker";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService, PlatformInvoiceItem } from "../../services/superAdminService";

export const PlatformBillingScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [invoices, setInvoices] = useState<PlatformInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoiceItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionRef, setTransactionRef] = useState("");

  const loadInvoices = async () => {
    try {
      const res = await MobileSuperAdminService.getInvoices({
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      });
      setInvoices(res.invoices || []);
    } catch (err) {
      console.warn("Failed loading invoices:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const handleRecordPaymentClick = (invoice: PlatformInvoiceItem) => {
    setSelectedInvoice(invoice);
    setPaymentMethod("UPI");
    setTransactionRef("");
    setModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      await MobileSuperAdminService.recordInvoicePayment(selectedInvoice.id, {
        paymentMethod,
        transactionReference: transactionRef,
      });
      Alert.alert("Success", `Invoice ${selectedInvoice.invoiceNumber} marked as PAID!`);
      setModalVisible(false);
      loadInvoices();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed recording invoice payment");
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_TABS = ["ALL", "PENDING", "PAID", "FAILED"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Platform Billing & Invoices" onBack={onBack} />

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {STATUS_TABS.map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.tab, selectedStatus === st && styles.tabActive]}
            onPress={() => setSelectedStatus(st)}
          >
            <Text style={[styles.tabText, selectedStatus === st && styles.tabTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingScreen message="Fetching B2B invoices..." />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.superadmin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="🧾" title="No Invoices Found" message="No platform subscription invoices found." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.invNumber}>{item.invoiceNumber || item.id.substring(0, 8)}</Text>
                  <Text style={styles.instName}>{item.institute?.name || "Tenant Institute"}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total Amount:</Text>
                <Text style={styles.amountValue}>₹{(item.totalAmount || item.amount || 0).toLocaleString()}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Due Date: {new Date(item.dueDate).toLocaleDateString()}</Text>
                {item.paidAt && <Text style={styles.infoText}>Paid On: {new Date(item.paidAt).toLocaleDateString()}</Text>}
              </View>

              {item.status === "PENDING" && (
                <TouchableOpacity style={styles.payBtn} onPress={() => handleRecordPaymentClick(item)}>
                  <Text style={styles.payBtnText}>💳 Record Manual Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Record Payment Modal */}
      <FormModal
        visible={modalVisible}
        title={`Record Payment for ${selectedInvoice?.invoiceNumber || ""}`}
        onClose={() => setModalVisible(false)}
        onSubmit={handleConfirmPayment}
        loading={submitting}
        submitText="Mark Paid"
      >
        <Text style={styles.modalAmountText}>
          Amount Due: ₹{(selectedInvoice?.totalAmount || selectedInvoice?.amount || 0).toLocaleString()}
        </Text>
        <SelectPicker
          label="Payment Method"
          options={[
            { label: "UPI", value: "UPI" },
            { label: "Bank Wire / NEFT", value: "BANK_TRANSFER" },
            { label: "Credit / Debit Card", value: "CARD" },
            { label: "Cheque / Cash", value: "CASH" },
          ]}
          selectedValue={paymentMethod}
          onSelect={(v) => setPaymentMethod(v)}
          required
        />
        <Input
          label="Transaction Reference / Ref #"
          placeholder="e.g. UTR123456789"
          value={transactionRef}
          onChangeText={setTransactionRef}
        />
      </FormModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  tabActive: {
    backgroundColor: Colors.superadmin.primary,
  },
  tabText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.surface,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  invNumber: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  instName: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  amountLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  amountValue: {
    ...Typography.h3,
    color: Colors.superadmin.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  payBtn: {
    backgroundColor: Colors.superadmin.light,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  payBtnText: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.superadmin.primary,
  },
  modalAmountText: {
    ...Typography.h3,
    color: Colors.superadmin.primary,
    textAlign: "center",
    marginVertical: Spacing.xs,
  },
});
