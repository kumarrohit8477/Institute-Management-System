// IMS Mobile — Admin Dashboard Screen
// Amber/golden themed portal hub for administrators

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { StatCard } from "../../components/shared/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { MobileAdminService } from "../../services/adminService";

interface Props {
  onNavigate: (screen: string, params?: any) => void;
}

interface Stats {
  students: number;
  teachers: number;
  courses: number;
  batches: number;
}

const QUICK_ACTIONS = [
  { label: "Students", icon: "🎓", screen: "adminStudents", color: Colors.info },
  { label: "Teachers", icon: "👨‍🏫", screen: "adminTeachers", color: Colors.teacher.primary },
  { label: "Courses", icon: "📚", screen: "adminCourses", color: Colors.primary },
  { label: "Batches", icon: "🏫", screen: "adminBatches", color: Colors.superadmin.primary },
  { label: "Timetable", icon: "📅", screen: "timetable", color: Colors.student.primary },
  { label: "Fees", icon: "💰", screen: "adminFees", color: Colors.admin.primary },
];

const RECENT_ACTIVITIES = [
  { id: "1", icon: "🎓", text: "New student enrolled in Batch A", time: "2h ago", color: Colors.info },
  { id: "2", icon: "💰", text: "Fee payment received ₹15,000", time: "4h ago", color: Colors.success },
  { id: "3", icon: "📅", text: "Timetable updated for Batch B", time: "Yesterday", color: Colors.admin.primary },
  { id: "4", icon: "👨‍🏫", text: "New teacher profile created", time: "2 days ago", color: Colors.teacher.primary },
  { id: "5", icon: "⚠️", text: "3 fee payments overdue", time: "2 days ago", color: Colors.danger },
];

export const AdminDashboardScreen: React.FC<Props> = ({ onNavigate }) => {
  const { user, institute } = useAuth();
  const [stats, setStats] = useState<Stats>({ students: 0, teachers: 0, courses: 0, batches: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await MobileAdminService.getStats();
      setStats({
        students: data?.students ?? data?.totalStudents ?? 0,
        teachers: data?.teachers ?? data?.totalTeachers ?? 0,
        courses: data?.courses ?? data?.totalCourses ?? 0,
        batches: data?.batches ?? data?.totalBatches ?? 0,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.admin.primary]}
            tintColor={Colors.admin.primary}
          />
        }
      >
        {/* Amber Gradient Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerInner}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerLabel}>🏛️ Admin Portal</Text>
              <Text style={styles.bannerInstitute} numberOfLines={1}>
                {institute?.name || "Institute Management System"}
              </Text>
              <Text style={styles.bannerGreeting}>
                Welcome back, {user?.name || user?.firstName || "Admin"}!
              </Text>
              <Text style={styles.bannerDate}>{dateStr}</Text>
            </View>
            <View style={styles.bannerAvatar}>
              <Text style={styles.bannerAvatarText}>
                {(user?.name || user?.firstName || "A")[0].toUpperCase()}
              </Text>
            </View>
          </View>
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>

        {/* Stats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          {loading && <ActivityIndicator size="small" color={Colors.admin.primary} />}
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadData} activeOpacity={0.7}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                icon="🎓"
                label="Total Students"
                value={stats.students}
                color={Colors.info}
                lightColor={Colors.infoLight}
                onPress={() => onNavigate("adminStudents")}
              />
              <StatCard
                icon="👨‍🏫"
                label="Total Teachers"
                value={stats.teachers}
                color={Colors.teacher.primary}
                lightColor={Colors.teacher.light}
                onPress={() => onNavigate("adminTeachers")}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="📚"
                label="Active Courses"
                value={stats.courses}
                color={Colors.primary}
                lightColor={Colors.primaryLight}
                onPress={() => onNavigate("adminCourses")}
              />
              <StatCard
                icon="🏫"
                label="Active Batches"
                value={stats.batches}
                color={Colors.admin.primary}
                lightColor={Colors.admin.light}
                onPress={() => onNavigate("adminBatches")}
              />
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={styles.quickActionItem}
              onPress={() => onNavigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconBg, { backgroundColor: action.color + "20" }]}>
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        <View style={styles.activityCard}>
          {RECENT_ACTIVITIES.map((activity, index) => (
            <View
              key={activity.id}
              style={[
                styles.activityItem,
                index < RECENT_ACTIVITIES.length - 1 && styles.activityItemBorder,
              ]}
            >
              <View style={[styles.activityIconWrap, { backgroundColor: activity.color + "18" }]}>
                <Text style={styles.activityIcon}>{activity.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Profile Quick Link */}
        <TouchableOpacity
          style={styles.profileLink}
          onPress={() => onNavigate("adminProfile")}
          activeOpacity={0.7}
        >
          <View style={styles.profileLinkLeft}>
            <View style={styles.profileLinkIcon}>
              <Text style={styles.profileLinkIconText}>⚙️</Text>
            </View>
            <View>
              <Text style={styles.profileLinkTitle}>Admin Profile & Settings</Text>
              <Text style={styles.profileLinkSub}>View institute info, subscription & logout</Text>
            </View>
          </View>
          <Text style={styles.profileLinkArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
    gap: Spacing.base,
  },
  // Banner
  banner: {
    backgroundColor: Colors.admin.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: "hidden",
    shadowColor: Colors.admin.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bannerLeft: {
    flex: 1,
    gap: 3,
  },
  bannerLabel: {
    ...Typography.labelSmall,
    color: Colors.admin.dark,
    marginBottom: 2,
  },
  bannerInstitute: {
    ...Typography.h2,
    color: Colors.surface,
    fontSize: 18,
  },
  bannerGreeting: {
    ...Typography.bodySmall,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  bannerDate: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
  },
  bannerAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  bannerAvatarText: {
    ...Typography.h2,
    color: Colors.surface,
  },
  decorCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -40,
    right: -20,
  },
  decorCircle2: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -20,
    right: 60,
  },
  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  // Stats
  statsGrid: {
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  // Error
  errorCard: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  errorIcon: {
    fontSize: 28,
  },
  errorText: {
    ...Typography.body,
    color: Colors.dangerDark,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  retryBtnText: {
    ...Typography.button,
    color: Colors.surface,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  quickActionItem: {
    width: "30.5%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIconBg: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  // Activity
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  activityTime: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  // Profile link
  profileLink: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  profileLinkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  profileLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.admin.light,
    justifyContent: "center",
    alignItems: "center",
  },
  profileLinkIconText: {
    fontSize: 22,
  },
  profileLinkTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  profileLinkSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  profileLinkArrow: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: "300",
  },
});
