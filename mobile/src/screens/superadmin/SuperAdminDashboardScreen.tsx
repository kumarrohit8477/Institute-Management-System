import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoleBanner, SectionHeader } from "../../components/Header";
import { StatCard } from "../../components/shared/StatCard";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService } from "../../services/superAdminService";

export const SuperAdminDashboardScreen: React.FC<{ onNavigate: (screen: string, params?: any) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await MobileSuperAdminService.getDashboard();
      setStats(res);
    } catch (err) {
      console.warn("Failed loading SaaS overview:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.superadmin.primary]} />}
      >
        <RoleBanner role="superadmin" title="Super Admin Dashboard" subtitle="Platform Overview & SaaS Tenant Metrics" />

        {loading ? (
          <ActivityIndicator size="large" color={Colors.superadmin.primary} style={{ marginVertical: Spacing.xl }} />
        ) : (
          <>
            <SectionHeader title="Platform Performance" />
            <View style={styles.statsGrid}>
              <StatCard
                icon="🏫"
                label="Total Institutes"
                value={stats?.totalInstitutes ?? 0}
                color={Colors.superadmin.primary}
                lightColor={Colors.superadmin.light}
              />
              <StatCard
                icon="✅"
                label="Active Tenants"
                value={stats?.activeInstitutes ?? 0}
                color={Colors.success}
                lightColor={Colors.successLight}
              />
            </View>

            <View style={[styles.statsGrid, { marginTop: Spacing.sm }]}>
              <StatCard
                icon="💵"
                label="Monthly Revenue"
                value={`₹${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                color={Colors.info}
                lightColor={Colors.infoLight}
              />
              <StatCard
                icon="💰"
                label="Total Lifetime"
                value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                color={Colors.warning}
                lightColor={Colors.warningLight}
              />
            </View>

            <SectionHeader title="Quick Management" />
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("institutes")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>🏫</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Manage Institutes</Text>
                  <Text style={styles.quickSubtitle}>View, onboard & activate tenant accounts</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("plans")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>💎</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Subscription Plans</Text>
                  <Text style={styles.quickSubtitle}>Starter, Growth & Enterprise tiers</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("billing")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>🧾</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Platform Invoices</Text>
                  <Text style={styles.quickSubtitle}>Track subscriptions & mark payments</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>
            </View>

            {stats?.recentInstitutes && stats.recentInstitutes.length > 0 && (
              <>
                <SectionHeader title="Recent Institutes" actionText="View All" onAction={() => onNavigate("institutes")} />
                {stats.recentInstitutes.slice(0, 3).map((inst: any) => (
                  <View key={inst.id} style={styles.recentItem}>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName}>{inst.name}</Text>
                      <Text style={styles.recentCode}>{inst.email} • Code: {inst.code}</Text>
                    </View>
                    <StatusBadge status={inst.status} />
                  </View>
                ))}
              </>
            )}
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  quickIcon: {
    fontSize: 28,
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
  arrow: {
    fontSize: 18,
    color: Colors.superadmin.primary,
    fontWeight: "bold",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentInfo: {
    gap: 2,
  },
  recentName: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  recentCode: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
