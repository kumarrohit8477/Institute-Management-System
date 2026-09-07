import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/Header";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingScreen } from "../../components/shared/LoadingScreen";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileAdminService } from "../../services/adminService";

export const AdminFeesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFees = async () => {
    try {
      const res = await MobileAdminService.getFees();
      setFees(Array.isArray(res) ? res : res.fees || res.invoices || []);
    } catch (err) {
      console.warn("Failed loading fees:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFees();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Fees & Student Invoices" onBack={onBack} />

      {loading ? (
        <LoadingScreen message="Fetching student fee invoices..." />
      ) : (
        <FlatList
          data={fees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="💳" title="No Fee Records" message="No student fee invoices recorded in the system yet." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.title}>{item.title || item.feeTitle || "Tuition Fee Invoice"}</Text>
                  <Text style={styles.subText}>Student: {item.student?.firstName || item.student?.name || "Student"} • Adm: {item.student?.admissionNumber || "N/A"}</Text>
                </View>
                <StatusBadge status={item.status || "PENDING"} />
              </View>

              <View style={styles.amountGrid}>
                <View style={styles.amountBox}>
                  <Text style={styles.label}>Billed</Text>
                  <Text style={styles.val}>₹{(item.finalAmount || item.totalAmount || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.label}>Paid</Text>
                  <Text style={[styles.val, { color: Colors.success }]}>₹{(item.paidAmount || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.label}>Due</Text>
                  <Text style={[styles.val, { color: Colors.error }]}>
                    ₹{((item.finalAmount || item.totalAmount || 0) - (item.paidAmount || 0)).toLocaleString()}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>Due Date: {new Date(item.dueDate || Date.now()).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  subText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amountGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  amountBox: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  val: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: "right",
  },
});
