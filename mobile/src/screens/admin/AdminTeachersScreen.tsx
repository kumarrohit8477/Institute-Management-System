// IMS Mobile — Admin Teachers Screen
// Searchable list of all teachers with full profile details

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
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

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode?: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  status: string;
  subjects?: Array<{ name: string }>;
  qualifications?: string;
  designation?: string;
}

export const AdminTeachersScreen: React.FC<Props> = ({ onBack }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTeachers = useCallback(async (search = "") => {
    try {
      setError(null);
      const data = await MobileAdminService.getTeachers({ search });
      const list: Teacher[] = Array.isArray(data)
        ? data
        : data?.teachers ?? data?.data ?? data?.items ?? [];
      setTeachers(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load teachers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (!loading) loadTeachers(searchQuery);
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTeachers(searchQuery);
  }, [searchQuery, loadTeachers]);

  const getExperienceLabel = (years?: number): string => {
    if (!years) return "—";
    return years === 1 ? "1 yr exp" : `${years} yrs exp`;
  };

  const getInitials = (first: string, last: string): string => {
    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Teachers</Text>
          <Text style={styles.headerSub}>
            {teachers.length > 0 ? `${teachers.length} total` : "Loading..."}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, employee code..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary Bar */}
      {!loading && !error && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Showing <Text style={styles.summaryCount}>{teachers.length}</Text> teachers
          </Text>
          <View style={styles.activeCount}>
            <View style={styles.activeDot} />
            <Text style={styles.activeCountText}>
              {teachers.filter((t) => t.status?.toUpperCase() === "ACTIVE").length} Active
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.teacher.primary} />
          <Text style={styles.loadingText}>Loading teachers...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadTeachers(searchQuery)}
            activeOpacity={0.7}
          >
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
              colors={[Colors.teacher.primary]}
              tintColor={Colors.teacher.primary}
            />
          }
        >
          {teachers.length === 0 ? (
            <EmptyState
              icon="👨‍🏫"
              title="No teachers found"
              subtitle={
                searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No teachers have been added yet."
              }
            />
          ) : (
            teachers.map((teacher) => (
              <View key={teacher.id} style={styles.teacherCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(teacher.firstName, teacher.lastName)}
                    </Text>
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>
                      {teacher.firstName} {teacher.lastName}
                    </Text>
                    {teacher.designation ? (
                      <Text style={styles.designation}>{teacher.designation}</Text>
                    ) : null}
                    <Text style={styles.employeeCode}>
                      🪪 {teacher.employeeCode || "N/A"}
                    </Text>
                  </View>
                  <StatusBadge
                    label={teacher.status || "UNKNOWN"}
                    variant={getStatusVariant(teacher.status)}
                  />
                </View>

                {/* Specialization & Experience */}
                <View style={styles.cardChips}>
                  {teacher.specialization ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipIcon}>🎯</Text>
                      <Text style={styles.chipText} numberOfLines={1}>
                        {teacher.specialization}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.chip}>
                    <Text style={styles.chipIcon}>⏱️</Text>
                    <Text style={styles.chipText}>
                      {getExperienceLabel(teacher.experience)}
                    </Text>
                  </View>
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    <View style={[styles.chip, styles.chipHighlight]}>
                      <Text style={styles.chipIcon}>📖</Text>
                      <Text style={[styles.chipText, styles.chipTextHighlight]}>
                        {teacher.subjects.length} Subject{teacher.subjects.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Contact row */}
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>✉️</Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      {teacher.email || "—"}
                    </Text>
                  </View>
                  {teacher.phone ? (
                    <>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📞</Text>
                        <Text style={styles.metaText}>{teacher.phone}</Text>
                      </View>
                    </>
                  ) : null}
                </View>
              </View>
            ))
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
    backgroundColor: Colors.teacher.light,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 22,
    color: Colors.teacher.dark,
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
  // Search
  searchContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  // Summary bar
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  summaryCount: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  activeCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
  },
  activeCountText: {
    ...Typography.caption,
    color: Colors.successDark,
    fontWeight: "600",
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
  errorIcon: {
    fontSize: 40,
  },
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
    backgroundColor: Colors.teacher.primary,
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
  // Teacher Card
  teacherCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: Radius.full,
    backgroundColor: Colors.teacher.light,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.teacher.primary + "40",
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.teacher.dark,
  },
  teacherInfo: {
    flex: 1,
    gap: 2,
  },
  teacherName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  designation: {
    ...Typography.caption,
    color: Colors.teacher.primary,
    fontWeight: "600",
  },
  employeeCode: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  // Chips
  cardChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipHighlight: {
    backgroundColor: Colors.teacher.light,
    borderColor: Colors.teacher.primary + "40",
  },
  chipIcon: {
    fontSize: 12,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  chipTextHighlight: {
    color: Colors.teacher.dark,
    fontWeight: "700",
  },
  // Card Meta
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
});
