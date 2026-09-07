import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/Header";
import { Input } from "../../components/shared/Input";
import { SelectPicker } from "../../components/shared/SelectPicker";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingScreen } from "../../components/shared/LoadingScreen";
import { FormModal } from "../../components/shared/FormModal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileAdminService, BatchItem, CourseItem } from "../../services/adminService";

export const AdminBatchesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Create Batch Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    courseId: "",
    startDate: new Date().toISOString().split("T")[0],
    maxCapacity: "60",
  });

  // Batch Details Sheet State
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<BatchItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        MobileAdminService.getBatches({
          search: search.trim() || undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        }),
        MobileAdminService.getCourses(),
      ]);
      setBatches(bRes || []);
      setCourses(cRes || []);
    } catch (err) {
      console.warn("Failed loading batches:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setForm({
      name: "",
      code: "",
      courseId: courses.length > 0 ? courses[0].id : "",
      startDate: new Date().toISOString().split("T")[0],
      maxCapacity: "60",
    });
    setModalVisible(true);
  };

  const handleSaveBatch = async () => {
    if (!form.name || !form.code || !form.courseId) {
      Alert.alert("Validation Error", "Please fill in batch name, code, and select a course.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingBatch) {
        await MobileAdminService.updateBatch(editingBatch.id, {
          name: form.name,
          code: form.code,
          maxCapacity: Number(form.maxCapacity),
        });
        Alert.alert("Success", "Batch updated successfully!");
      } else {
        await MobileAdminService.createBatch({
          name: form.name,
          code: form.code,
          courseId: form.courseId,
          startDate: form.startDate,
          maxCapacity: Number(form.maxCapacity),
        });
        Alert.alert("Success", "Batch created successfully!");
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed saving batch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (batch: BatchItem) => {
    setDetailsLoading(true);
    try {
      const details = await MobileAdminService.getBatchById(batch.id);
      setSelectedBatchDetails(details);
    } catch (err: any) {
      Alert.alert("Error", "Could not load batch details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteBatch(deleteTarget.id);
      Alert.alert("Success", "Batch deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting batch");
    } finally {
      setDeleting(false);
    }
  };

  const STATUS_TABS = ["ALL", "ACTIVE", "COMPLETED", "UPCOMING"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Student Batches" onBack={onBack} />

      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search batch name or code..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadData}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Create Batch</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {STATUS_TABS.map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.tab, selectedStatus === st && styles.tabActive]}
            onPress={() => setSelectedStatus(st)}
          >
            <Text style={[styles.tabText, selectedStatus === st && styles.tabTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingScreen message="Loading student batches..." />
      ) : (
        <FlatList
          data={batches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="👥" title="No Batches Found" message="No student batches found matching criteria." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.batchName}>{item.name}</Text>
                  <Text style={styles.batchCode}>Code: {item.code} • Course: {item.course?.name || "N/A"}</Text>
                </View>
                <StatusBadge status={item.status || "ACTIVE"} />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Enrolled: {item._count?.students || 0} / {item.maxCapacity || 60} Students</Text>
                <Text style={styles.infoText}>Start Date: {new Date(item.startDate).toLocaleDateString()}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleViewDetails(item)}>
                  <Text style={styles.actionBtnText}>👁️ View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
                  <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Form Modal */}
      <FormModal
        visible={modalVisible}
        title={editingBatch ? "Edit Batch" : "Create Student Batch"}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSaveBatch}
        loading={submitting}
        submitText={editingBatch ? "Save Changes" : "Create Batch"}
      >
        <Input
          label="Batch Name"
          placeholder="e.g. Batch 2026-A"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          required
        />
        <Input
          label="Batch Code"
          placeholder="e.g. BATCH-2026A"
          value={form.code}
          onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
          required
        />
        {courses.length > 0 && !editingBatch && (
          <SelectPicker
            label="Belongs to Course"
            options={courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
            selectedValue={form.courseId}
            onSelect={(v) => setForm({ ...form, courseId: v })}
            required
          />
        )}
        <Input
          label="Max Capacity (Students)"
          keyboardType="numeric"
          value={form.maxCapacity}
          onChangeText={(v) => setForm({ ...form, maxCapacity: v })}
          required
        />
      </FormModal>

      {/* Batch Details Modal */}
      <FormModal
        visible={!!selectedBatchDetails}
        title={`Batch: ${selectedBatchDetails?.name || ""}`}
        onClose={() => setSelectedBatchDetails(null)}
        onSubmit={() => setSelectedBatchDetails(null)}
        submitText="Close"
      >
        <View style={styles.detailsBox}>
          <Text style={styles.detailTitle}>Batch Code: {selectedBatchDetails?.code}</Text>
          <Text style={styles.detailSub}>Course: {selectedBatchDetails?.course?.name}</Text>
          <Text style={styles.detailSub}>Enrolled Students: {selectedBatchDetails?.students?.length || 0}</Text>

          {selectedBatchDetails?.students && selectedBatchDetails.students.length > 0 && (
            <View style={{ marginTop: Spacing.sm }}>
              <Text style={styles.sectionHeader}>Enrolled Student Roster:</Text>
              {selectedBatchDetails.students.slice(0, 10).map((st: any, idx: number) => (
                <Text key={idx} style={styles.studentItemText}>
                  • {st.student?.firstName} {st.student?.lastName} ({st.student?.admissionNumber})
                </Text>
              ))}
            </View>
          )}
        </View>
      </FormModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Batch"
        message={`Are you sure you want to delete batch ${deleteTarget?.name}?`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: Colors.admin.primary,
    paddingHorizontal: Spacing.base,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    ...Typography.button,
    color: Colors.surface,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  tabActive: {
    backgroundColor: Colors.admin.primary,
  },
  tabText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.surface,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  batchName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  batchCode: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: Colors.admin.light,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.admin.primary,
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  deleteBtnText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.error,
  },
  detailsBox: {
    gap: Spacing.xs,
  },
  detailTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  detailSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  studentItemText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
