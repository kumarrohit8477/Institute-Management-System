import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/Header";
import { Input } from "../../components/shared/Input";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingScreen } from "../../components/shared/LoadingScreen";
import { FormModal } from "../../components/shared/FormModal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileAdminService, CourseItem } from "../../services/adminService";

export const AdminCoursesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    durationMonths: "12",
    totalFees: "25000",
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<CourseItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCourses = async () => {
    try {
      const data = await MobileAdminService.getCourses({ search: search.trim() || undefined });
      setCourses(data || []);
    } catch (err) {
      console.warn("Failed loading courses:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setForm({ name: "", code: "", description: "", durationMonths: "12", totalFees: "25000" });
    setModalVisible(true);
  };

  const handleOpenEdit = (c: CourseItem) => {
    setEditingCourse(c);
    setForm({
      name: c.name,
      code: c.code,
      description: c.description || "",
      durationMonths: String(c.durationMonths || 12),
      totalFees: String(c.totalFees || 25000),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      Alert.alert("Validation Error", "Please fill in course name and code.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingCourse) {
        await MobileAdminService.updateCourse(editingCourse.id, {
          name: form.name,
          code: form.code,
          description: form.description,
          durationMonths: Number(form.durationMonths),
          totalFees: Number(form.totalFees),
        });
        Alert.alert("Success", "Course updated successfully!");
      } else {
        await MobileAdminService.createCourse({
          name: form.name,
          code: form.code,
          description: form.description,
          durationMonths: Number(form.durationMonths),
          totalFees: Number(form.totalFees),
        });
        Alert.alert("Success", "Course created successfully!");
      }
      setModalVisible(false);
      loadCourses();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed saving course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteCourse(deleteTarget.id);
      Alert.alert("Success", "Course deleted.");
      setDeleteTarget(null);
      loadCourses();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting course");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Courses Catalog" onBack={onBack} />

      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search course name or code..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadCourses}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Create Course</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen message="Loading courses..." />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="📚" title="No Courses Found" message="No course records found in the institute catalog." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.courseName}>{item.name}</Text>
                  <Text style={styles.courseCode}>Code: {item.code}</Text>
                </View>
                <StatusBadge status={item.status || "ACTIVE"} />
              </View>

              {item.description && <Text style={styles.description}>{item.description}</Text>}

              <View style={styles.infoGrid}>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoLabel}>Duration:</Text>
                  <Text style={styles.infoVal}>{item.durationMonths || 12} Months</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoLabel}>Tuition Fee:</Text>
                  <Text style={styles.infoVal}>₹{(item.totalFees || 0).toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(item)}>
                  <Text style={styles.editBtnText}>✏️ Edit Course</Text>
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
        title={editingCourse ? `Edit Course` : `Create New Course`}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={submitting}
        submitText={editingCourse ? "Save Changes" : "Create Course"}
      >
        <Input
          label="Course Name"
          placeholder="e.g. Bachelor of Computer Applications"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          required
        />
        <Input
          label="Course Code"
          placeholder="e.g. BCA-2026"
          value={form.code}
          onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
          required
        />
        <Input
          label="Description"
          placeholder="Brief course overview..."
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          multiline
        />
        <Input
          label="Duration (Months)"
          keyboardType="numeric"
          value={form.durationMonths}
          onChangeText={(v) => setForm({ ...form, durationMonths: v })}
          required
        />
        <Input
          label="Total Fees (₹)"
          keyboardType="numeric"
          value={form.totalFees}
          onChangeText={(v) => setForm({ ...form, totalFees: v })}
          required
        />
      </FormModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete course ${deleteTarget?.name}?`}
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
  courseName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  courseCode: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  infoGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  infoBadge: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.xs,
    borderRadius: Radius.md,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  infoVal: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  editBtn: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  editBtnText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.textPrimary,
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
});
