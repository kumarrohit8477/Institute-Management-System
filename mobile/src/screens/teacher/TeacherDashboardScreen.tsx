import React, { useEffect, useState, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { StatCard } from "../../components/shared/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { MobileTeacherService } from "../../services/teacherService";

interface Props {
  onNavigate: (screen: string, params?: any) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const QUICK_ACTIONS = [
  {
    id: "batches",
    label: "My Batches",
    icon: "people-outline",
    screen: "TeacherBatches",
    color: Colors.teacher.primary,
    light: Colors.teacher.light,
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: "checkmark-done-circle-outline",
    screen: "TeacherAttendance",
    color: Colors.info,
    light: Colors.infoLight,
  },
  {
    id: "timetable",
    label: "Timetable",
    icon: "calendar-outline",
    screen: "TeacherTimetable",
    color: Colors.warning,
    light: Colors.warningLight,
  },
  {
    id: "profile",
    label: "Profile",
    icon: "person-outline",
    screen: "TeacherProfile",
    color: Colors.primary,
    light: Colors.primaryLight,
  },
];

export const TeacherDashboardScreen: React.FC<Props> = ({ onNavigate }) => {
  const { teacher, institute, user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayLabel = DAYS[new Date().getDay()];

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [dash, timetable] = await Promise.allSettled([
        MobileTeacherService.getDashboard(),
        MobileTeacherService.getTimetable(),
      ]);

      if (dash.status === "fulfilled" && dash.value) {
        setDashboard(dash.value);
      }

      if (timetable.status === "fulfilled" && timetable.value) {
        const todayIdx = new Date().getDay();
        const dayMap: Record<number, string> = {
          0: "sunday",
          1: "monday",
          2: "tuesday",
          3: "wednesday",
          4: "thursday",
          5: "friday",
          6: "saturday",
        };
        const dayKey = dayMap[todayIdx];
        const todayClasses =
          timetable.value?.schedule?.[dayKey] ||
          timetable.value?.[dayKey] ||
          timetable.value?.today ||
          [];
        setSchedule(todayClasses);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const teacherName =
    teacher?.name ||
    teacher?.fullName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Teacher";
  const instituteName = institute?.name || "Institute";
  const empCode = teacher?.employeeCode || teacher?.empCode || "EMP001";

  const stats = {
    batches: dashboard?.batchCount ?? dashboard?.batches ?? 4,
    subjects: dashboard?.subjectCount ?? dashboard?.subjects ?? 3,
    todayClasses: schedule.length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.teacher.primary} />
        <Text style={styles.loaderText}>Loading dashboard…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.teacher.primary}
          />
        }
      >
        {/* ── Banner ── */}
        <View style={styles.banner}>
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👨‍🏫</Text>
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.greeting}>Good {getGreeting()}</Text>
              <Text style={styles.teacherName} numberOfLines={1}>
                {teacherName}
              </Text>
              <Text style={styles.instituteName} numberOfLines={1}>
                {instituteName}
              </Text>
              <View style={styles.empBadge}>
                <Text style={styles.empCode}>ID: {empCode}</Text>
              </View>
            </View>
          </View>
          <View style={styles.bannerMeta}>
            <Text style={styles.bannerDate}>{getTodayFormatted()}</Text>
            <Text style={styles.bannerDay}>📅 {todayLabel}</Text>
          </View>
        </View>

        {/* ── Error ── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={fetchData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Stats ── */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="people-outline"
            label="Batches"
            value={stats.batches}
            color={Colors.teacher.primary}
            lightColor={Colors.teacher.light}
            onPress={() => onNavigate("TeacherBatches")}
          />
          <StatCard
            icon="book-outline"
            label="Subjects"
            value={stats.subjects}
            color={Colors.info}
            lightColor={Colors.infoLight}
          />
          <StatCard
            icon="time-outline"
            label="Today"
            value={stats.todayClasses}
            color={Colors.warning}
            lightColor={Colors.warningLight}
            onPress={() => onNavigate("TeacherTimetable")}
          />
        </View>

        {/* ── Today's Schedule ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity onPress={() => onNavigate("TeacherTimetable")}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {schedule.length === 0 ? (
          <View style={styles.noScheduleCard}>
            <Ionicons name="sparkles-outline" size={32} color={Colors.teacher.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.noScheduleText}>No classes today. Enjoy your day!</Text>
          </View>
        ) : (
          schedule.map((cls, idx) => (
            <View key={cls.id ?? idx} style={styles.classCard}>
              <View style={[styles.classAccent, cls.isOnline && styles.classAccentOnline]} />
              <View style={styles.classInfo}>
                <Text style={styles.className}>{cls.subject || cls.subjectName}</Text>
                <Text style={styles.classBatch}>{cls.batch || cls.batchName}</Text>
                <View style={styles.classMeta}>
                  <Text style={styles.classTime}>
                    {cls.startTime} – {cls.endTime}
                  </Text>
                  <View style={[styles.roomTag, cls.isOnline && styles.roomTagOnline]}>
                    <Text style={[styles.roomText, cls.isOnline && styles.roomTextOnline]}>
                      {cls.isOnline ? "Online" : `Room ${cls.room || ""}`}
                    </Text>
                  </View>
                </View>
              </View>
              {cls.isOnline && cls.meetingLink ? (
                <TouchableOpacity
                  style={styles.meetBtn}
                  activeOpacity={0.7}
                  onPress={() => {/* open meeting link */}}
                >
                  <Text style={styles.meetBtnText}>Join</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.attBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    onNavigate("TeacherAttendance", {
                      batchId: cls.batchId,
                      batchName: cls.batch || cls.batchName,
                    })
                  }
                >
                  <Text style={styles.attBtnText}>Attend</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* ── Quick Actions ── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: action.light }]}
              activeOpacity={0.7}
              onPress={() => onNavigate(action.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning,";
  if (h < 17) return "Afternoon,";
  return "Evening,";
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 12,
  },
  loaderText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Banner
  banner: {
    backgroundColor: Colors.teacher.primary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    position: "relative",
    overflow: "hidden",
  },
  bannerOverlay: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarEmoji: {
    fontSize: 30,
  },
  bannerText: {
    flex: 1,
  },
  greeting: {
    ...Typography.bodySmall,
    color: "rgba(255,255,255,0.8)",
  },
  teacherName: {
    ...Typography.h2,
    color: Colors.textOnDark,
    marginTop: 2,
  },
  instituteName: {
    ...Typography.bodySmall,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  empBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  empCode: {
    ...Typography.labelSmall,
    color: Colors.textOnDark,
  },
  bannerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  bannerDate: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
  },
  bannerDay: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.dangerDark,
    flex: 1,
  },
  retryText: {
    ...Typography.button,
    color: Colors.danger,
    marginLeft: Spacing.sm,
  },

  // Sections
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  seeAll: {
    ...Typography.button,
    color: Colors.teacher.primary,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },

  // Schedule cards
  noScheduleCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noScheduleIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  noScheduleText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  classAccent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: Colors.teacher.primary,
  },
  classAccentOnline: {
    backgroundColor: Colors.info,
  },
  classInfo: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  className: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  classBatch: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  classMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  classTime: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  roomTag: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roomTagOnline: {
    backgroundColor: Colors.infoLight,
  },
  roomText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  roomTextOnline: {
    color: Colors.infoDark,
  },
  meetBtn: {
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginRight: Spacing.md,
  },
  meetBtnText: {
    ...Typography.button,
    color: Colors.textOnDark,
  },
  attBtn: {
    backgroundColor: Colors.teacher.light,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginRight: Spacing.md,
  },
  attBtnText: {
    ...Typography.button,
    color: Colors.teacher.dark,
  },

  // Quick actions
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  actionCard: {
    width: "47%",
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    ...Typography.h4,
    textAlign: "center",
  },
});
