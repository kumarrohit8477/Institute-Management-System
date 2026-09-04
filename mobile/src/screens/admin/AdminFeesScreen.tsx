import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Badge } from "../../components/Header";
import { EmptyState } from "../../components/shared/EmptyState";
import { StatCard } from "../../components/shared/StatCard";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileAdminService } from "../../services/adminService";

export const AdminFeesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MobileAdminService.getFees();
        const list = Array.isArray(res) ? res : res?.fees || res?.data || [];
        setFees(list);
      } catch (err) {
        console.warn("Failed fetching fees:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Fee & Financial Management" subtitle="Student Fee Records" onBack={onBack} accentColor={Colors.admin.primary} />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.admin.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Summary Row */}
          <View style={styles.statsRow}>
            <StatCard icon="💰" label="Total Billing" value="₹12.5L" color={Colors.admin.primary} lightColor={Colors.admin.light} />
            <StatCard icon="✅" label="Collected" value="₹9.8L" color={Colors.success} lightColor={Colors.successLight} />
            <StatCard icon="⌛" label="Pending" value="₹2.7L" color={Colors.danger} lightColor={Colors.dangerLight} />
          </View>

          {fees.length === 0 ? (
            <EmptyState icon="💳" title="No Fee Records" subtitle="No student fee records found." />
          ) : (
            fees.map((item) => (
              <Card key={item.id} style={styles.feeCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feeTitle}>{item.title || "Tuition Fee"}</Text>
                    <Text style={styles.studentName}>
                      {item.student ? `${item.student.firstName} ${item.student.lastName}` : "Student"}
                    </Text>
                  </View>
                  <Badge
                    label={item.status || "PENDING"}
                    variant={item.status === "PAID" ? "success" : item.status === "PARTIALLY_PAID" ? "warning" : "danger"}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <Text style={styles.amountText}>₹{item.finalAmount || item.totalAmount || 0}</Text>
                  <Text style={styles.dueText}>Due: {item.dueDate ? String(item.dueDate).slice(0, 10) : "N/A"}</Text>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  feeCard: {
    marginBottom: Spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  feeTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  studentName: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  dueText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
