import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Badge } from "../../components/Header";
import { EmptyState } from "../../components/shared/EmptyState";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService } from "../../services/superAdminService";

export const PlatformBillingScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MobileSuperAdminService.getInvoices();
        const list = Array.isArray(res) ? res : res?.invoices || res?.data || [];
        setInvoices(list);
      } catch (err) {
        console.warn("Failed fetching platform invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Platform Invoices" subtitle="SaaS Tenant Invoicing & Revenue" onBack={onBack} accentColor={Colors.superadmin.primary} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.superadmin.primary} />
        </View>
      ) : invoices.length === 0 ? (
        <EmptyState icon="💰" title="No Platform Invoices" subtitle="No SaaS invoices recorded." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {invoices.map((inv) => (
            <Card key={inv.id} style={styles.invCard}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invNum}>{inv.invoiceNumber || "INV-0001"}</Text>
                  <Text style={styles.instName}>{inv.institute?.name || "Tenant Institute"}</Text>
                </View>
                <Badge
                  label={inv.status || "PENDING"}
                  variant={inv.status === "PAID" ? "success" : "warning"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.footerRow}>
                <Text style={styles.amountText}>Total: ₹{inv.totalAmount || inv.amount || 0}</Text>
                <Text style={styles.dateText}>Due: {inv.dueDate ? String(inv.dueDate).slice(0, 10) : "N/A"}</Text>
              </View>
            </Card>
          ))}
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
    gap: Spacing.sm,
  },
  invCard: {
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  invNum: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  instName: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
