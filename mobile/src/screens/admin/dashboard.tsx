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
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import {
  Menu,
  GraduationCap,
  Bell,
  Users,
  UserCheck,
  BookOpen,
  Layers,
  IndianRupee,
  Clock,
  UserPlus,
  CreditCard,
  CalendarCheck,
  Megaphone,
  Settings,
  BarChart3,
  ChevronRight,
  Home,
  Grid,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";

import { Colors } from "../../theme/colors";
import { Spacing, Radius } from "../../theme/typography";
import { useAuth } from "../../hooks/useAuth";
import { MobileAdminService } from "../../services/adminService";

// ── Donut Chart Component ──
const DonutChart: React.FC<{
  present?: number;
  absent?: number;
  late?: number;
}> = ({ present = 86, absent = 10, late = 4 }) => {
  const size = 92;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segment stroke dash offsets & lengths
  const presentLen = (present / 100) * circumference;
  const absentLen = (absent / 100) * circumference;
  const lateLen = (late / 100) * circumference;

  const gap = 3; // Gap between segments

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Base Background Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Present Segment (Green) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${presentLen - gap} ${circumference - (presentLen - gap)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            fill="transparent"
          />
          {/* Absent Segment (Red) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${absentLen - gap} ${circumference - (absentLen - gap)}`}
            strokeDashoffset={-presentLen}
            strokeLinecap="round"
            fill="transparent"
          />
          {/* Late Segment (Yellow) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${lateLen - gap} ${circumference - (lateLen - gap)}`}
            strokeDashoffset={-(presentLen + absentLen)}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      <View style={styles.donutCenterOverlay}>
        <Text style={styles.donutVal}>{present}%</Text>
        <Text style={styles.donutSub}>Present</Text>
      </View>
    </View>
  );
};

export const AdminDashboardScreen: React.FC<{
  onNavigate: (screen: string, params?: any) => void;
}> = ({ onNavigate }) => {
  const { user, institute } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

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

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "students") onNavigate("students");
    else if (tabId === "teachers") onNavigate("teachers");
    else if (tabId === "fees") onNavigate("fees");
    else if (tabId === "more") onNavigate("profile");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Top App Bar ── */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Menu size={22} color="#1E293B" strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.brandTitleContainer}>
          <View style={styles.brandLogoBox}>
            <GraduationCap size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <View style={styles.brandTextCol}>
            <Text style={styles.brandName} numberOfLines={1}>
              {institute?.name || "Bright Future Institute"}
            </Text>
            <Text style={styles.brandTagline} numberOfLines={1}>
              Learn Today, Lead Tomorrow
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Bell size={20} color="#334155" strokeWidth={2} />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userAvatarContainer}
            onPress={() => onNavigate("profile")}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
              }}
              style={styles.avatarImg}
            />
            <View style={styles.onlineDot} />
          </TouchableOpacity>
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
        {/* ── Greeting Hero Banner Card ── */}
        <View style={styles.greetingBanner}>
          {/* Subtle architectural building graphic watermark */}
          <View style={styles.bannerWatermark}>
            <Svg width="120" height="100" viewBox="0 0 120 100" fill="none">
              <Path
                d="M10 90V40L60 15L110 40V90H10Z"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3"
              />
              <Path
                d="M30 90V55H50V90M70 90V55H90V90"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
              />
              <Rect
                x="40"
                y="30"
                width="40"
                height="12"
                rx="2"
                fill="rgba(255,255,255,0.08)"
              />
            </Svg>
          </View>

          <View style={styles.greetingTextCol}>
            <Text style={styles.greetingSub}>Good Morning,</Text>
            <Text style={styles.greetingTitle}>Admin</Text>
            <Text style={styles.greetingDesc}>
              Here's what's happening at your institute today.
            </Text>
          </View>

          <View style={styles.dateTagContainer}>
            <Text style={styles.dateTagText}>Sun, 7 Sep 2025</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={{ marginVertical: Spacing.xl }}
          />
        ) : (
          <>
            {/* ── Key Metrics Cards (2x3 Grid) ── */}
            <View style={styles.metricsGrid}>
              {/* Total Students */}
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => onNavigate("students")}
                activeOpacity={0.85}
              >
                <View style={[styles.metricIconBox, { backgroundColor: "#EFF6FF" }]}>
                  <Users size={20} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.metricLabel}>Total Students</Text>
                <Text style={styles.metricValue}>
                  {(stats?.students ?? 1248).toLocaleString()}
                </Text>
                <View style={styles.trendRow}>
                  <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.trendUp}>+12 this month</Text>
                </View>
              </TouchableOpacity>

              {/* Total Teachers */}
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => onNavigate("teachers")}
                activeOpacity={0.85}
              >
                <View style={[styles.metricIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <UserCheck size={20} color="#10B981" strokeWidth={2.2} />
                </View>
                <Text style={styles.metricLabel}>Total Teachers</Text>
                <Text style={styles.metricValue}>
                  {(stats?.teachers ?? 56).toLocaleString()}
                </Text>
                <View style={styles.trendRow}>
                  <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.trendUp}>+3 this month</Text>
                </View>
              </TouchableOpacity>

              {/* Total Courses */}
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => onNavigate("courses")}
                activeOpacity={0.85}
              >
                <View style={[styles.metricIconBox, { backgroundColor: "#F5F3FF" }]}>
                  <BookOpen size={20} color="#8B5CF6" strokeWidth={2.2} />
                </View>
                <Text style={styles.metricLabel}>Total Courses</Text>
                <Text style={styles.metricValue}>
                  {(stats?.courses ?? 24).toLocaleString()}
                </Text>
                <View style={styles.trendRow}>
                  <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.trendUp}>+2 this month</Text>
                </View>
              </TouchableOpacity>

              {/* Total Batches */}
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => onNavigate("batches")}
                activeOpacity={0.85}
              >
                <View style={[styles.metricIconBox, { backgroundColor: "#FFFBEB" }]}>
                  <Layers size={20} color="#F59E0B" strokeWidth={2.2} />
                </View>
                <Text style={styles.metricLabel}>Total Batches</Text>
                <Text style={styles.metricValue}>
                  {(stats?.batches ?? 48).toLocaleString()}
                </Text>
                <View style={styles.trendRow}>
                  <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.trendUp}>+4 this month</Text>
                </View>
              </TouchableOpacity>

              {/* Collected Fees */}
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => onNavigate("fees")}
                activeOpacity={0.85}
              >
                <View style={[styles.metricIconBox, { backgroundColor: "#FEF2F2" }]}>
                  <IndianRupee size={20} color="#EF4444" strokeWidth={2.2} />
                </View>
                <Text style={styles.metricLabel}>Collected Fees</Text>
                <Text style={styles.metricValue}>₹2,45,000</Text>
                <View style={styles.trendRow}>
                  <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.trendUp}>+18% this month</Text>
                </View>
              </TouchableOpacity>

              {/* Pending Fees */}
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => onNavigate("fees")}
                activeOpacity={0.85}
              >
                <View style={[styles.metricIconBox, { backgroundColor: "#FFF7ED" }]}>
                  <Clock size={20} color="#F97316" strokeWidth={2.2} />
                </View>
                <Text style={styles.metricLabel}>Pending Fees</Text>
                <Text style={styles.metricValue}>₹38,500</Text>
                <View style={styles.trendRow}>
                  <TrendingDown size={12} color="#EF4444" strokeWidth={2.5} />
                  <Text style={styles.trendDown}>-5% this month</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Quick Actions Section ── */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => onNavigate("students")}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color="#2563EB" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("students")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <UserPlus size={20} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Add Student</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("teachers")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <UserPlus size={20} color="#10B981" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Add Teacher</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("courses")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#F5F3FF" }]}>
                  <BookOpen size={20} color="#8B5CF6" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Add Course</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("batches")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#FFFBEB" }]}>
                  <Layers size={20} color="#F59E0B" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Add Batch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("fees")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#FEF2F2" }]}>
                  <CreditCard size={20} color="#EF4444" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Record Fee</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("timetable")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <CalendarCheck size={20} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Mark Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("materials")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <Megaphone size={20} color="#10B981" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Create Notice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => onNavigate("teachers")}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: "#F1F5F9" }]}>
                  <Settings size={20} color="#1E3A8A" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>Manage Users</Text>
              </TouchableOpacity>
            </View>

            {/* ── Today's Attendance & Fees Overview Split ── */}
            <View style={styles.splitRow}>
              {/* Today's Attendance Card */}
              <View style={styles.splitCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeaderTitle}>Today's Attendance</Text>
                  <TouchableOpacity
                    onPress={() => onNavigate("timetable")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>View Details</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.attendanceBody}>
                  <DonutChart present={86} absent={10} late={4} />

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
                  <TouchableOpacity
                    onPress={() => onNavigate("fees")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>View Details</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.feesPillContainer}>
                  <TouchableOpacity
                    style={[styles.feePillBox, { backgroundColor: "#ECFDF5" }]}
                    onPress={() => onNavigate("fees")}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.feeIconCircle, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
                      <BarChart3 size={20} color="#10B981" strokeWidth={2.2} />
                    </View>
                    <View style={styles.feeTextCol}>
                      <Text style={[styles.feePillVal, { color: "#059669" }]}>
                        ₹2,45,000
                      </Text>
                      <Text style={styles.feePillSub}>Collected</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.feePillBox, { backgroundColor: "#FEF2F2" }]}
                    onPress={() => onNavigate("fees")}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.feeIconCircle, { backgroundColor: "rgba(239, 68, 68, 0.12)" }]}>
                      <Clock size={20} color="#EF4444" strokeWidth={2.2} />
                    </View>
                    <View style={styles.feeTextCol}>
                      <Text style={[styles.feePillVal, { color: "#DC2626" }]}>
                        ₹38,500
                      </Text>
                      <Text style={styles.feePillSub}>Pending</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ── Recent Activity Section ── */}
            <View style={styles.recentActivityCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderTitle}>Recent Activity</Text>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => onNavigate("students")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={14} color="#2563EB" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.activityList}>
                {/* Item 1 */}
                <TouchableOpacity
                  style={styles.activityItem}
                  onPress={() => onNavigate("students")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actIconBg, { backgroundColor: "#EFF6FF" }]}>
                    <UserPlus size={18} color="#2563EB" strokeWidth={2.2} />
                  </View>
                  <View style={styles.actContentCol}>
                    <Text style={styles.actTitle} numberOfLines={1}>
                      Rahul Sharma joined Batch B
                    </Text>
                    <Text style={styles.actTime}>10 minutes ago</Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" strokeWidth={2} />
                </TouchableOpacity>

                {/* Item 2 */}
                <TouchableOpacity
                  style={styles.activityItem}
                  onPress={() => onNavigate("fees")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actIconBg, { backgroundColor: "#FEF2F2" }]}>
                    <IndianRupee size={18} color="#EF4444" strokeWidth={2.2} />
                  </View>
                  <View style={styles.actContentCol}>
                    <Text style={styles.actTitle} numberOfLines={1}>
                      Fee payment received from Priya Singh
                    </Text>
                    <Text style={styles.actTime}>32 minutes ago</Text>
                  </View>
                  <Text style={styles.actAmount}>₹12,000</Text>
                </TouchableOpacity>

                {/* Item 3 */}
                <TouchableOpacity
                  style={styles.activityItem}
                  onPress={() => onNavigate("courses")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actIconBg, { backgroundColor: "#F5F3FF" }]}>
                    <BookOpen size={18} color="#8B5CF6" strokeWidth={2.2} />
                  </View>
                  <View style={styles.actContentCol}>
                    <Text style={styles.actTitle} numberOfLines={1}>
                      New course "Advanced Java" created
                    </Text>
                    <Text style={styles.actTime}>1 hour ago</Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" strokeWidth={2} />
                </TouchableOpacity>

                {/* Item 4 */}
                <TouchableOpacity
                  style={styles.activityItem}
                  onPress={() => onNavigate("teachers")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actIconBg, { backgroundColor: "#ECFDF5" }]}>
                    <UserCheck size={18} color="#10B981" strokeWidth={2.2} />
                  </View>
                  <View style={styles.actContentCol}>
                    <Text style={styles.actTitle} numberOfLines={1}>
                      Ankit Verma added as a teacher
                    </Text>
                    <Text style={styles.actTime}>2 hours ago</Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" strokeWidth={2} />
                </TouchableOpacity>
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

  /* ── Top Header ── */
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  brandTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingHorizontal: 8,
  },
  brandLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextCol: {
    flex: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  brandTagline: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notifBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  userAvatarContainer: {
    position: "relative",
    marginLeft: 4,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  /* ── Main Scroll ── */
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },

  /* ── Greeting Banner ── */
  greetingBanner: {
    backgroundColor: "#1E3A8A",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
    overflow: "hidden",
  },
  bannerWatermark: {
    position: "absolute",
    right: -10,
    bottom: -10,
    opacity: 0.8,
  },
  greetingTextCol: {
    flex: 1,
    zIndex: 1,
  },
  greetingSub: {
    fontSize: 13,
    color: "#93C5FD",
    fontWeight: "500",
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 2,
  },
  greetingDesc: {
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 2,
    maxWidth: "85%",
  },
  dateTagContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 1,
  },
  dateTagText: {
    fontSize: 11,
    color: "#93C5FD",
    fontWeight: "600",
  },

  /* ── Metric Cards Grid ── */
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  trendUp: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
  trendDown: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },

  /* ── Section Headers ── */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  /* ── Quick Actions Grid ── */
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionBtn: {
    width: "22.8%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    marginTop: 6,
  },

  /* ── Split Row ── */
  splitRow: {
    flexDirection: "column",
    gap: 14,
  },
  splitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
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
    fontWeight: "600",
    color: "#2563EB",
  },

  /* Attendance */
  attendanceBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  donutContainer: {
    position: "relative",
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenterOverlay: {
    position: "absolute",
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
    fontWeight: "500",
  },
  legendCol: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontWeight: "500",
  },
  legendVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  /* Fees Overview */
  feesPillContainer: {
    gap: 10,
  },
  feePillBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  feeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  feeTextCol: {
    flex: 1,
  },
  feePillVal: {
    fontSize: 18,
    fontWeight: "800",
  },
  feePillSub: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },

  /* Recent Activity */
  recentActivityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  activityList: {
    gap: 14,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actContentCol: {
    flex: 1,
  },
  actTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  actTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  actAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },

  /* ── Bottom Navigation Bar ── */
  bottomNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 3,
  },
  navLabelActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
