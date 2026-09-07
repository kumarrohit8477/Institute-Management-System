import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { useAuth } from "../../hooks/useAuth";
import { MobileAdminService } from "../../services/adminService";

export const AdminDashboardScreen: React.FC<{ onNavigate: (screen: string, params?: any) => void }> = ({
  onNavigate,
}) => {
  const { user, institute } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await MobileAdminService.getDashboardStats();
      setStats(res);
    } catch (err) {
      console.warn("Failed loading admin stats:", err);
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

  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Top Header ── */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.brandTitleContainer}>
          <View style={styles.brandLogoBox}>
            <Text style={styles.brandLogoIcon}>🎓</Text>
          </View>
          <View>
            <Text style={styles.brandName} numberOfLines={1}>
              {institute?.name || "Bright Future Institute"}
            </Text>
            <Text style={styles.brandTagline} numberOfLines={1}>
              Learn Today, Lead Tomorrow
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.userAvatarBox}>
            <Text style={styles.userAvatarText}>👨‍💼</Text>
            <View style={styles.onlineDot} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
      >
        {/* ── Greeting Banner ── */}
        <View style={styles.greetingBanner}>
          <View style={styles.greetingTextCol}>
            <Text style={styles.greetingSub}>Good Morning,</Text>
            <Text style={styles.greetingTitle}>Admin</Text>
            <Text style={styles.greetingDesc}>Here's what's happening at your institute today.</Text>
          </View>
          <Text style={styles.dateTag}>{todayDateFormatted}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: Spacing.xl }} />
        ) : (
          <>
            {/* ── Metric Cards 2x3 Grid ── */}
            <View style={styles.metricsGrid}>
              {/* Total Students */}
              <TouchableOpacity style={styles.metricCard} onPress={() => onNavigate("students")} activeOpacity={0.8}>
                <View style={[styles.metricIconBox, { backgroundColor: "#EFF6FF" }]}>
                  <Text style={{ fontSize: 20 }}>👥</Text>
                </View>
                <Text style={styles.metricLabel}>Total Students</Text>
                <Text style={styles.metricValue}>
                  {(stats?.students ?? 1248).toLocaleString()}
                </Text>
                <Text style={styles.trendUp}>↑ +12 this month</Text>
              </TouchableOpacity>

              {/* Total Teachers */}
              <TouchableOpacity style={styles.metricCard} onPress={() => onNavigate("teachers")} activeOpacity={0.8}>
                <View style={[styles.metricIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </View>
                <Text style={styles.metricLabel}>Total Teachers</Text>
                <Text style={styles.metricValue}>
                  {(stats?.teachers ?? 56).toLocaleString()}
                </Text>
                <Text style={styles.trendUp}>↑ +3 this month</Text>
              </TouchableOpacity>

              {/* Total Courses */}
              <TouchableOpacity style={styles.metricCard} onPress={() => onNavigate("courses")} activeOpacity={0.8}>
                <View style={[styles.metricIconBox, { backgroundColor: "#F5F3FF" }]}>
                  <Text style={{ fontSize: 20 }}>📖</Text>
                </View>
                <Text style={styles.metricLabel}>Total Courses</Text>
                <Text style={styles.metricValue}>
                  {(stats?.courses ?? 24).toLocaleString()}
                </Text>
                <Text style={styles.trendUp}>↑ +2 this month</Text>
              </TouchableOpacity>

              {/* Total Batches */}
              <TouchableOpacity style={styles.metricCard} onPress={() => onNavigate("batches")} activeOpacity={0.8}>
                <View style={[styles.metricIconBox, { backgroundColor: "#FFFBEB" }]}>
                  <Text style={{ fontSize: 20 }}>🥞</Text>
                </View>
                <Text style={styles.metricLabel}>Total Batches</Text>
                <Text style={styles.metricValue}>
                  {(stats?.batches ?? 48).toLocaleString()}
                </Text>
                <Text style={styles.trendUp}>↑ +4 this month</Text>
              </TouchableOpacity>

              {/* Collected Fees */}
              <TouchableOpacity style={styles.metricCard} onPress={() => onNavigate("fees")} activeOpacity={0.8}>
                <View style={[styles.metricIconBox, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={{ fontSize: 20 }}>₹</Text>
                </View>
                <Text style={styles.metricLabel}>Collected Fees</Text>
                <Text style={styles.metricValue}>₹2,45,000</Text>
                <Text style={styles.trendUp}>↑ +18% this month</Text>
              </TouchableOpacity>

              {/* Pending Fees */}
              <TouchableOpacity style={styles.metricCard} onPress={() => onNavigate("fees")} activeOpacity={0.8}>
                <View style={[styles.metricIconBox, { backgroundColor: "#FFF7ED" }]}>
                  <Text style={{ fontSize: 20 }}>🕒</Text>
                </View>
                <Text style={styles.metricLabel}>Pending Fees</Text>
                <Text style={styles.metricValue}>₹38,500</Text>
                <Text style={styles.trendDown}>↓ -5% this month</Text>
              </TouchableOpacity>
            </View>

            {/* ── Quick Actions ── */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity onPress={() => onNavigate("students")}>
                <Text style={styles.viewAllText}>View All ➔</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("students")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <Text style={{ fontSize: 22 }}>👤+</Text>
                </View>
                <Text style={styles.quickActionLabel}>Add Student</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("teachers")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <Text style={{ fontSize: 22 }}>👨‍🏫+</Text>
                </View>
                <Text style={styles.quickActionLabel}>Add Teacher</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("courses")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#F5F3FF" }]}>
                  <Text style={{ fontSize: 22 }}>📖</Text>
                </View>
                <Text style={styles.quickActionLabel}>Add Course</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("batches")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#FFFBEB" }]}>
                  <Text style={{ fontSize: 22 }}>🥞</Text>
                </View>
                <Text style={styles.quickActionLabel}>Add Batch</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("fees")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={{ fontSize: 22 }}>💳</Text>
                </View>
                <Text style={styles.quickActionLabel}>Record Fee</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("timetable")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <Text style={{ fontSize: 22 }}>📅</Text>
                </View>
                <Text style={styles.quickActionLabel}>Mark Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("materials")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <Text style={{ fontSize: 22 }}>📢</Text>
                </View>
                <Text style={styles.quickActionLabel}>Create Notice</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={() => onNavigate("teachers")}>
                <View style={[styles.quickIconCircle, { backgroundColor: "#F5F3FF" }]}>
                  <Text style={{ fontSize: 22 }}>⚙️</Text>
                </View>
                <Text style={styles.quickActionLabel}>Manage Users</Text>
              </TouchableOpacity>
            </View>

            {/* ── Attendance & Fees Overview Row ── */}
            <View style={styles.splitRow}>
              {/* Today's Attendance Card */}
              <View style={styles.splitCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeaderTitle}>Today's Attendance</Text>
                  <TouchableOpacity onPress={() => onNavigate("timetable")}>
                    <Text style={styles.linkText}>View Details</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.attendanceBody}>
                  <View style={styles.donutPlaceholder}>
                    <Text style={styles.donutVal}>86%</Text>
                    <Text style={styles.donutSub}>Present</Text>
                  </View>
                  <View style={styles.legendCol}>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
                      <Text style={styles.legendText}>Present</Text>
                      <Text style={styles.legendVal}>86%</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
                      <Text style={styles.legendText}>Absent</Text>
                      <Text style={styles.legendVal}>10%</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
                      <Text style={styles.legendText}>Late</Text>
                      <Text style={styles.legendVal}>4%</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Fees Overview Card */}
              <View style={styles.splitCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeaderTitle}>Fees Overview</Text>
                  <TouchableOpacity onPress={() => onNavigate("fees")}>
                    <Text style={styles.linkText}>View Details</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.feesPillContainer}>
                  <View style={[styles.feePillBox, { backgroundColor: "#ECFDF5" }]}>
                    <Text style={styles.feePillIcon}>📊</Text>
                    <View>
                      <Text style={[styles.feePillVal, { color: "#059669" }]}>₹2,45,000</Text>
                      <Text style={styles.feePillSub}>Collected</Text>
                    </View>
                  </View>
                  <View style={[styles.feePillBox, { backgroundColor: "#FEF2F2" }]}>
                    <Text style={styles.feePillIcon}>🕒</Text>
                    <View>
                      <Text style={[styles.feePillVal, { color: "#DC2626" }]}>₹38,500</Text>
                      <Text style={styles.feePillSub}>Pending</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Recent Activity Section ── */}
            <View style={styles.recentActivityCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => onNavigate("students")}>
                  <Text style={styles.linkText}>View All ➔</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <View style={[styles.actIconBg, { backgroundColor: "#EFF6FF" }]}>
                    <Text style={{ fontSize: 16 }}>👤+</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actTitle}>Rahul Sharma joined Batch B</Text>
                    <Text style={styles.actTime}>10 minutes ago</Text>
                  </View>
                  <Text style={styles.actArrow}>➔</Text>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.actIconBg, { backgroundColor: "#FEF2F2" }]}>
                    <Text style={{ fontSize: 16 }}>₹</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actTitle}>Fee payment received from Priya Singh</Text>
                    <Text style={styles.actTime}>32 minutes ago</Text>
                  </View>
                  <Text style={[styles.actAmount, { color: "#059669" }]}>+₹12,000</Text>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.actIconBg, { backgroundColor: "#F5F3FF" }]}>
                    <Text style={{ fontSize: 16 }}>📖</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actTitle}>New course "Advanced Java" created</Text>
                    <Text style={styles.actTime}>1 hour ago</Text>
                  </View>
                  <Text style={styles.actArrow}>➔</Text>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.actIconBg, { backgroundColor: "#ECFDF5" }]}>
                    <Text style={{ fontSize: 16 }}>👨‍🏫</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actTitle}>Ankit Verma added as a teacher</Text>
                    <Text style={styles.actTime}>2 hours ago</Text>
                  </View>
                  <Text style={styles.actArrow}>➔</Text>
                </View>
              </View>
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
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 22,
    color: "#0F172A",
  },
  brandTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  brandLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogoIcon: {
    fontSize: 22,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  brandTagline: {
    fontSize: 10,
    color: "#64748B",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  bellIcon: {
    fontSize: 20,
  },
  notifBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  userAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  userAvatarText: {
    fontSize: 18,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  greetingBanner: {
    backgroundColor: "#1E3A8A",
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetingTextCol: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 13,
    color: "#93C5FD",
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 2,
  },
  greetingDesc: {
    fontSize: 12,
    color: "#CBD5E1",
  },
  dateTag: {
    fontSize: 11,
    color: "#93C5FD",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 4,
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  trendUp: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  trendDown: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  quickActionBtn: {
    width: "23%",
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: Spacing.xs,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  splitRow: {
    flexDirection: "column",
    gap: Spacing.base,
  },
  splitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  attendanceBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  donutPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  donutVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  donutSub: {
    fontSize: 10,
    color: "#64748B",
  },
  legendCol: {
    flex: 1,
    gap: Spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
  },
  legendVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  feesPillContainer: {
    gap: Spacing.sm,
  },
  feePillBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  feePillIcon: {
    fontSize: 24,
  },
  feePillVal: {
    fontSize: 18,
    fontWeight: "800",
  },
  feePillSub: {
    fontSize: 11,
    color: "#64748B",
  },
  recentActivityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: Spacing.md,
  },
  activityList: {
    gap: Spacing.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  actIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  actTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  actArrow: {
    fontSize: 14,
    color: "#94A3B8",
  },
  actAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
});
