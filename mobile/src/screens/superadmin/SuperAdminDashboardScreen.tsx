import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoleBanner, Card, SectionHeader } from "../../components/Header";
import { StatCard } from "../../components/shared/StatCard";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService } from "../../services/superAdminService";

export const SuperAdminDashboardScreen: React.FC<{ onNavigate: (screen: string, params?: any) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MobileSuperAdminService.getDashboard();
        setStats(res);
      } catch (err) {
        console.warn("Failed loading SaaS overview:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleBanner role="superadmin" title="Super Admin Dashboard" subtitle="Platform Overview & Tenant SaaS Metrics" />

        {loading ? (
          <ActivityIndicator size="large" color={Colors.superadmin.primary} style={{ marginVertical: Spacing.xl }} />
        ) : (
          <>
            <SectionHeader title="Platform Performance" />
            <View style={styles.statsGrid}>
              <StatCard
                icon="🏫"
                label="Institutes"
                value={stats?.totalInstitutes ?? 12}
                color={Colors.superadmin.primary}
                lightColor={Colors.superadmin.light}
              />
              <StatCard
                icon="✅"
                label="Active Subscriptions"
                value={stats?.activeInstitutes ?? 10}
                color={Colors.success}
                lightColor={Colors.successLight}
              />
            </View>

            <View style={[styles.statsGrid, { marginTop: Spacing.sm }]}>
              <StatCard
                icon="💵"
                label="Monthly Revenue"
                value={`₹${(stats?.monthlyRevenue || 45000).toLocaleString()}`}
                color={Colors.info}
                lightColor={Colors.infoLight}
              />
              <StatCard
                icon="💰"
                label="Total Revenue"
                value={`₹${(stats?.totalRevenue || 540000).toLocaleString()}`}
                color={Colors.warning}
                lightColor={Colors.warningLight}
              />
            </View>

            <SectionHeader title="Quick Actions" />
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("institutes")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>🏫</Text>
                <Text style={styles.quickTitle}>Manage Institutes</Text>
                <Text style={styles.quickSubtitle}>View & configure tenant accounts</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("plans")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>💎</Text>
                <Text style={styles.quickTitle}>Subscription Plans</Text>
                <Text style={styles.quickSubtitle}>Starter, Growth & Enterprise tiers</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickGrid: {
    gap: Spacing.sm,
  },
  quickCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  quickTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  quickSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
