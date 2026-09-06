import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { StatusBadge, getStatusVariant } from "../../components/shared/StatusBadge";
import { EmptyState } from "../../components/shared/EmptyState";
import { MobileTeacherService } from "../../services/teacherService";

interface Props {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export const TeacherBatchesScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    try {
      setError(null);
      const data = await MobileTeacherService.getBatches();
      const list = Array.isArray(data?.batches) ? data.batches : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setBatches(list);
      setFiltered(list);
    } catch {
      setBatches([]);
      setFiltered([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBatches();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const q = text.toLowerCase();
    if (!q) {
      setFiltered(batches);
      return;
    }
    setFiltered(
      batches.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.course?.toLowerCase().includes(q) ||
          b.subject?.toLowerCase().includes(q)
      )
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.teacher.primary} />
        <Text style={styles.loaderText}>Loading batches…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Batches</Text>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length}</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search batches, courses…"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")} activeOpacity={0.7}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.teacher.primary}
          />
        }
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={fetchBatches}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No batches found"
            subtitle={
              searchQuery
                ? `No results for "${searchQuery}"`
                : "You haven't been assigned to any batch yet."
            }
          />
        ) : (
          filtered.map((batch) => (
            <BatchCard
              key={batch._id}
              batch={batch}
              onMarkAttendance={() =>
                onNavigate("TeacherAttendance", {
                  batchId: batch._id,
                  batchName: batch.name,
                })
              }
              onViewStudents={() =>
                onNavigate("TeacherBatchStudents", {
                  batchId: batch._id,
                  batchName: batch.name,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

interface BatchCardProps {
  batch: any;
  onMarkAttendance: () => void;
  onViewStudents: () => void;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, onMarkAttendance, onViewStudents }) => {
  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.cardTop}>
        <View style={styles.batchIconWrap}>
          <Text style={styles.batchIcon}>🎓</Text>
        </View>
        <View style={styles.batchInfo}>
          <Text style={styles.batchName}>{batch.name}</Text>
          <Text style={styles.courseName}>{batch.course || batch.courseName}</Text>
        </View>
        <StatusBadge
          label={batch.status || "Active"}
          variant={getStatusVariant(batch.status || "active")}
        />
      </View>

      {/* Meta Row */}
      <View style={styles.metaRow}>
        <MetaChip icon="👥" label={`${batch.studentCount ?? 0} Students`} />
        {batch.subject ? <MetaChip icon="📚" label={batch.subject} /> : null}
        {batch.schedule ? <MetaChip icon="📅" label={batch.schedule} /> : null}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          activeOpacity={0.7}
          onPress={onMarkAttendance}
        >
          <Text style={styles.actionBtnTextPrimary}>✅ Mark Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          activeOpacity={0.7}
          onPress={onViewStudents}
        >
          <Text style={styles.actionBtnTextSecondary}>👥 View Students</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MetaChip: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipIcon}>{icon}</Text>
    <Text style={styles.chipLabel} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 12,
  },
  loaderText: { ...Typography.body, color: Colors.textMuted },

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
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 24, color: Colors.textPrimary, marginTop: -2 },
  headerTitle: { ...Typography.h3, color: Colors.textPrimary, flex: 1, marginLeft: Spacing.sm },
  headerRight: { alignItems: "flex-end" },
  countBadge: {
    backgroundColor: Colors.teacher.light,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: { ...Typography.label, color: Colors.teacher.dark },

  // Search
  searchWrap: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearBtn: { fontSize: 14, color: Colors.textMuted },

  // Scroll
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: 40, gap: Spacing.md },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginBottom: Spacing.sm,
  },
  errorText: { ...Typography.bodySmall, color: Colors.dangerDark, flex: 1 },
  retryText: { ...Typography.button, color: Colors.danger },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  batchIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.teacher.light,
    justifyContent: "center",
    alignItems: "center",
  },
  batchIcon: { fontSize: 24 },
  batchInfo: { flex: 1 },
  batchName: { ...Typography.h4, color: Colors.textPrimary },
  courseName: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },

  // Meta
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  chipIcon: { fontSize: 12 },
  chipLabel: { ...Typography.caption, color: Colors.textSecondary, maxWidth: 120 },

  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.base },

  // Card actions
  cardActions: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnPrimary: {
    backgroundColor: Colors.teacher.primary,
  },
  actionBtnSecondary: {
    backgroundColor: Colors.teacher.light,
    borderWidth: 1,
    borderColor: Colors.teacher.primary,
  },
  actionBtnTextPrimary: {
    ...Typography.button,
    color: Colors.textOnDark,
  },
  actionBtnTextSecondary: {
    ...Typography.button,
    color: Colors.teacher.dark,
  },
});
