// IMS Mobile — Admin Students Screen
// Searchable, filterable list of all enrolled students

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

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  email: string;
  phone?: string;
  status: string;
  batch?: { name: string };
  batches?: Array<{ name: string }>;
}

export const AdminStudentsScreen: React.FC<Props> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadStudents = useCallback(
    async (search = searchQuery, pg = 1, isRefresh = false) => {
      try {
        setError(null);
        if (!isRefresh && pg === 1) setLoading(true);
        const data = await MobileAdminService.getStudents({ search, page: pg });
        const list: Student[] = Array.isArray(data)
          ? data
          : data?.students ?? data?.data ?? data?.items ?? [];
        const total = data?.total ?? data?.totalCount ?? list.length;
        if (pg === 1) {
          setStudents(list);
        } else {
          setStudents((prev) => [...prev, ...list]);
        }
        setTotalCount(total);
        setPage(pg);
      } catch (err: any) {
        setError(err?.message || "Failed to load students");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadStudents(searchQuery, 1);
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    loadStudents("", 1);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudents(searchQuery, 1, true);
  }, [searchQuery, loadStudents]);

  const filteredStudents = students.filter((s) => {
    if (filterStatus === "ALL") return true;
    return s.status?.toUpperCase() === filterStatus;
  });

  const getBatchName = (student: Student): string => {
    if (student.batch?.name) return student.batch.name;
    if (student.batches && student.batches.length > 0) return student.batches[0].name;
    return "—";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Students</Text>
          <Text style={styles.headerSub}>
            {totalCount > 0 ? `${totalCount} total` : "Loading..."}
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
            placeholder="Search by name, admission no..."
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

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(["ALL", "ACTIVE", "INACTIVE"] as FilterStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filterStatus === tab && styles.filterTabActive]}
            onPress={() => setFilterStatus(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterTabText, filterStatus === tab && styles.filterTabTextActive]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{filteredStudents.length}</Text>
        </View>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.admin.primary} />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadStudents(searchQuery, 1)}
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
              colors={[Colors.admin.primary]}
              tintColor={Colors.admin.primary}
            />
          }
        >
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="No students found"
              subtitle={
                searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No students in this category yet."
              }
            />
          ) : (
            filteredStudents.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.cardTop}>
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(student.firstName?.[0] || "?").toUpperCase()}
                    </Text>
                  </View>
                  {/* Info */}
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>
                      {student.firstName} {student.lastName}
                    </Text>
                    <Text style={styles.admissionNo}>
                      📋 {student.admissionNumber || "—"}
                    </Text>
                  </View>
                  {/* Status */}
                  <StatusBadge
                    label={student.status || "UNKNOWN"}
                    variant={getStatusVariant(student.status)}
                  />
                </View>

                {/* Metadata row */}
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🏫</Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      {getBatchName(student)}
                    </Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>✉️</Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      {student.email || "—"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Load more hint */}
          {filteredStudents.length > 0 && filteredStudents.length < totalCount && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => loadStudents(searchQuery, page + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.loadMoreText}>Load more students</Text>
            </TouchableOpacity>
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
    backgroundColor: Colors.admin.light,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 22,
    color: Colors.admin.dark,
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
  // Filter tabs
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    alignItems: "center",
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.admin.primary,
    borderColor: Colors.admin.primary,
  },
  filterTabText: {
    ...Typography.label,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.surface,
  },
  countPill: {
    marginLeft: "auto",
    backgroundColor: Colors.admin.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  countPillText: {
    ...Typography.labelSmall,
    color: Colors.admin.dark,
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
    backgroundColor: Colors.admin.primary,
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
  // Student Card
  studentCard: {
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
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    backgroundColor: Colors.admin.light,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.admin.primary + "40",
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.admin.dark,
  },
  studentInfo: {
    flex: 1,
    gap: 3,
  },
  studentName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  admissionNo: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
  // Load more
  loadMoreBtn: {
    paddingVertical: Spacing.base,
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.admin.primary + "60",
    backgroundColor: Colors.admin.light,
    marginTop: Spacing.xs,
  },
  loadMoreText: {
    ...Typography.button,
    color: Colors.admin.dark,
  },
});
