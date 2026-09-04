import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Badge } from "../../components/Header";
import { EmptyState } from "../../components/shared/EmptyState";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService } from "../../services/superAdminService";

export const SubscriptionPlansScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MobileSuperAdminService.getPlans();
        const list = Array.isArray(res) ? res : res?.plans || res?.data || [];
        setPlans(list);
      } catch (err) {
        console.warn("Failed fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Subscription Plans" subtitle="Platform Pricing Tiers" onBack={onBack} accentColor={Colors.superadmin.primary} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.superadmin.primary} />
        </View>
      ) : plans.length === 0 ? (
        <EmptyState icon="💎" title="No Plans Found" subtitle="No SaaS subscription plans available." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {plans.map((plan) => (
            <Card key={plan.id} style={styles.planCard}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.tierTag}>{plan.tier || "STARTER"}</Text>
                </View>
                <Text style={styles.priceText}>₹{plan.monthlyPrice || 0}/mo</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>• Max Students: {plan.maxStudents || "Unlimited"}</Text>
                <Text style={styles.featureItem}>• Max Courses: {plan.maxCourses || "Unlimited"}</Text>
                <Text style={styles.featureItem}>• CBT Examination: {plan.hasOnlineCBT ? "✅ Included" : "❌ No"}</Text>
                <Text style={styles.featureItem}>• Custom Domain: {plan.hasCustomDomain ? "✅ Included" : "❌ No"}</Text>
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
    gap: Spacing.md,
  },
  planCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.superadmin.primary,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  tierTag: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.superadmin.primary,
    marginTop: 2,
  },
  priceText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
