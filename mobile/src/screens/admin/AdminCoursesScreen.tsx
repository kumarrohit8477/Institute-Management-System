// IMS Mobile — Admin Courses Screen
// Full list of institute courses with details and status

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
import { StatusBadge, getStatusVariant } from "../../components/shared/StatusBadge";
import { EmptyState } from "../../components/shared/EmptyState";
import { MobileAdminService } from "../../services/adminService";

interface Props {
  onBack: () => void;
}

interface Course {
  id: string;
  name: string;
  code?: string;
  status: string;
  totalFees?: number;
  duration?: string | number;
  durationUnit?: string;
  description?: string;
  subjects?: Array<{ id: string; name: string }>;
  subjectCount?: number;
  batches?: Array<{ id: string }>;
  batchCount?: number;
}

const formatFees = (amount?: number): string => {
  if (!amount && amount !== 0) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDuration = (duration?: string | number, unit?: string): string => {
  if (!duration) return "—";
  const u = unit || "months";
  return `${duration} ${u}`;
};

export const AdminCoursesScreen: React.FC<Props> = ({ onBack }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    try {
      setError(null);
      const data = await MobileAdminService.getCourses();
      const list: Course[] = Array.isArray(data)
        ? data
        : data?.courses ?? data?.data ?? data?.items ?? [];
      setCourses(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load courses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  const getSubjectCount = (course: Course): number => {
    if (course.subjectCount !== undefined) return course.subjectCount;
    if (course.subjects) return course.subjects.length;
    return 0;
  };

  const getBatchCount = (course: Course): number => {
    if (course.batchCount !== undefined) return course.batchCount;
    if (course.batches) return course.batches.length;
    return 0;
  };

  const activeCourses = courses.filter((c) => c.status?.toUpperCase() === "ACTIVE").length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Courses</Text>
          <Text style={styles.headerSub}>
            {courses.length > 0 ? `${courses.length} total` : "Loading..."}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Summary strip */}
      {!loading && !error && courses.length > 0 && (
        <View style={styles.summaryStrip}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryChipIcon}>📚</Text>
            <Text style={styles.summaryChipText}>{courses.length} Courses</Text>
          </View>
          <View style={[styles.summaryChip, styles.summaryChipSuccess]}>
            <Text style={styles.summaryChipIcon}>✅</Text>
            <Text style={[styles.summaryChipText, { color: Colors.successDark }]}>
              {activeCourses} Active
            </Text>
          </View>
          <View style={[styles.summaryChip, styles.summaryChipMuted]}>
            <Text style={styles.summaryChipIcon}>⏸️</Text>
            <Text style={[styles.summaryChipText, { color: Colors.textSecondary }]}>
              {courses.length - activeCourses} Inactive
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadCourses} activeOpacity={0.7}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {courses.length === 0 ? (
            <EmptyState
              icon="📚"
              title="No courses found"
              subtitle="No courses have been created yet."
            />
          ) : (
            courses.map((course) => {
              const subjectCount = getSubjectCount(course);
              const batchCount = getBatchCount(course);
              return (
                <View key={course.id} style={styles.courseCard}>
                  {/* Top section */}
                  <View style={styles.cardTop}>
                    <View style={styles.courseIconBg}>
                      <Text style={styles.courseIcon}>📚</Text>
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseName} numberOfLines={2}>
                        {course.name}
                      </Text>
                      {course.code ? (
                        <View style={styles.codeTag}>
                          <Text style={styles.codeTagText}>{course.code}</Text>
                        </View>
                      ) : null}
                    </View>
                    <StatusBadge
                      label={course.status || "UNKNOWN"}
                      variant={getStatusVariant(course.status)}
                    />
                  </View>

                  {/* Description */}
                  {course.description ? (
                    <View style={styles.descRow}>
                      <Text style={styles.descText} numberOfLines={2}>
                        {course.description}
                      </Text>
                    </View>
                  ) : null}

                  {/* Stats Row */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{formatFees(course.totalFees)}</Text>
                      <Text style={styles.statLabel}>Total Fees</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {formatDuration(course.duration, course.durationUnit)}
                      </Text>
                      <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: Colors.primary }]}>
                        {subjectCount}
                      </Text>
                      <Text style={styles.statLabel}>Subjects</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: Colors.admin.primary }]}>
                        {batchCount}
                      </Text>
                      <Text style={styles.statLabel}>Batches</Text>
                    </View>
                  </View>

                  {/* Subject count badge */}
                  {subjectCount > 0 && (
                    <View style={styles.subjectBadgeRow}>
                      <View style={styles.subjectBadge}>
                        <Text style={styles.subjectBadgeIcon}>📖</Text>
                        <Text style={styles.subjectBadgeText}>
                          {subjectCount} subject{subjectCount !== 1 ? "s" : ""} in curriculum
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 22,
    color: Colors.primaryDark,
    fontWeight: "700",
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  headerSub: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  headerRight: {
    width: 36,
  },
  // Summary Strip
  summaryStrip: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    alignItems: "center",
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  summaryChipSuccess: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success + "30",
  },
  summaryChipMuted: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
  },
  summaryChipIcon: {
    fontSize: 12,
  },
  summaryChipText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  // Loading / Error
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing["3xl"],
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  errorIcon: { fontSize: 40 },
  errorTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  errorSub: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryBtnText: {
    ...Typography.button,
    color: Colors.surface,
  },
  // List
  listContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing["3xl"],
  },
  // Course Card
  courseCard: {
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
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  courseIconBg: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  courseIcon: {
    fontSize: 24,
  },
  courseInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  courseName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  codeTag: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeTagText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    fontSize: 9,
  },
  descRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  descText: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  // Subject badge
  subjectBadgeRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  subjectBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.md,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primary + "25",
  },
  subjectBadgeIcon: {
    fontSize: 12,
  },
  subjectBadgeText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    fontWeight: "600",
  },
});
