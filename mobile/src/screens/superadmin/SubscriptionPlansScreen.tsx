import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/Header";
import { Input } from "../../components/shared/Input";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingScreen } from "../../components/shared/LoadingScreen";
import { FormModal } from "../../components/shared/FormModal";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService, SubscriptionPlanItem } from "../../services/superAdminService";

export const SubscriptionPlansScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    monthlyPrice: "",
    annualPrice: "",
    maxStudents: "",
    maxCourses: "",
  });

  const loadPlans = async () => {
    try {
      const data = await MobileSuperAdminService.getPlans();
      setPlans(data || []);
    } catch (err) {
      console.warn("Failed loading plans:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPlans();
  };

  const handleEditClick = (plan: SubscriptionPlanItem) => {
    setSelectedPlan(plan);
    setForm({
      monthlyPrice: String(plan.monthlyPrice || 0),
      annualPrice: String(plan.annualPrice || 0),
      maxStudents: String(plan.maxStudents || 100),
      maxCourses: String(plan.maxCourses || 10),
    });
    setModalVisible(true);
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      await MobileSuperAdminService.updatePlan(selectedPlan.id, {
        monthlyPrice: Number(form.monthlyPrice),
        annualPrice: Number(form.annualPrice),
        maxStudents: Number(form.maxStudents),
        maxCourses: Number(form.maxCourses),
      });
      Alert.alert("Success", `Plan '${selectedPlan.name}' updated successfully!`);
      setModalVisible(false);
      loadPlans();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Subscription Plans" onBack={onBack} />

      {loading ? (
        <LoadingScreen message="Fetching subscription plans..." />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.superadmin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="💎" title="No Plans Configured" message="No subscription plans found in the SaaS catalog." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.planName}>{item.name}</Text>
                  <Text style={styles.planTier}>Tier: {item.tier}</Text>
                </View>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>₹{item.monthlyPrice}/mo</Text>
                </View>
              </View>

              {item.description && <Text style={styles.description}>{item.description}</Text>}

              <View style={styles.limitsGrid}>
                <View style={styles.limitItem}>
                  <Text style={styles.limitValue}>{item.maxStudents}</Text>
                  <Text style={styles.limitLabel}>Max Students</Text>
                </View>
                <View style={styles.limitItem}>
                  <Text style={styles.limitValue}>{item.maxCourses}</Text>
                  <Text style={styles.limitLabel}>Max Courses</Text>
                </View>
                <View style={styles.limitItem}>
                  <Text style={styles.limitValue}>{item.maxBatches}</Text>
                  <Text style={styles.limitLabel}>Max Batches</Text>
                </View>
              </View>

              <View style={styles.featuresRow}>
                <Text style={styles.featureItem}>{item.hasOnlineCBT ? "✅ CBT Exams" : "❌ No CBT"}</Text>
                <Text style={styles.featureItem}>{item.hasCustomDomain ? "✅ Custom Domain" : "❌ Subdomain Only"}</Text>
              </View>

              <TouchableOpacity style={styles.editBtn} onPress={() => handleEditClick(item)}>
                <Text style={styles.editBtnText}>✏️ Edit Pricing & Limits</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <FormModal
        visible={modalVisible}
        title={`Edit Plan: ${selectedPlan?.name || ""}`}
        onClose={() => setModalVisible(false)}
        onSubmit={handleUpdatePlan}
        loading={submitting}
        submitText="Save Changes"
      >
        <Input
          label="Monthly Price (₹)"
          keyboardType="numeric"
          value={form.monthlyPrice}
          onChangeText={(v) => setForm({ ...form, monthlyPrice: v })}
          required
        />
        <Input
          label="Annual Price (₹)"
          keyboardType="numeric"
          value={form.annualPrice}
          onChangeText={(v) => setForm({ ...form, annualPrice: v })}
          required
        />
        <Input
          label="Max Students"
          keyboardType="numeric"
          value={form.maxStudents}
          onChangeText={(v) => setForm({ ...form, maxStudents: v })}
          required
        />
        <Input
          label="Max Courses"
          keyboardType="numeric"
          value={form.maxCourses}
          onChangeText={(v) => setForm({ ...form, maxCourses: v })}
          required
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
    alignItems: "center",
  },
  planName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  planTier: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  priceBadge: {
    backgroundColor: Colors.superadmin.light,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  priceText: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.superadmin.primary,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  limitsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  limitItem: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  limitValue: {
    ...Typography.body,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  limitLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  featureItem: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  editBtn: {
    backgroundColor: Colors.surfaceVariant,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});
