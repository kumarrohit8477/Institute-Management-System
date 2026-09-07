import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/Header";
import { Input } from "../../components/shared/Input";
import { SelectPicker } from "../../components/shared/SelectPicker";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingScreen } from "../../components/shared/LoadingScreen";
import { FormModal } from "../../components/shared/FormModal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileAdminService, SubjectItem, CourseItem } from "../../services/adminService";

export const AdminSubjectsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    courseId: "",
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<SubjectItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        MobileAdminService.getSubjects({ search: search.trim() || undefined }),
        MobileAdminService.getCourses(),
      ]);
      setSubjects(sRes || []);
      setCourses(cRes || []);
    } catch (err) {
      console.warn("Failed loading subjects:", err);
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

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setForm({
      name: "",
      code: "",
      description: "",
      courseId: courses.length > 0 ? courses[0].id : "",
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (s: SubjectItem) => {
    setEditingSubject(s);
    setForm({
      name: s.name,
      code: s.code,
      description: s.description || "",
      courseId: s.courseId || (courses.length > 0 ? courses[0].id : ""),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code || !form.courseId) {
      Alert.alert("Validation Error", "Please fill in name, code, and select a course.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingSubject) {
        await MobileAdminService.updateSubject(editingSubject.id, {
          name: form.name,
          code: form.code,
          description: form.description,
        });
        Alert.alert("Success", "Subject updated!");
      } else {
        await MobileAdminService.createSubject({
          name: form.name,
          code: form.code,
          description: form.description,
          courseId: form.courseId,
        });
        Alert.alert("Success", "Subject created!");
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed saving subject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteSubject(deleteTarget.id);
      Alert.alert("Success", "Subject deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting subject");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Academic Subjects" onBack={onBack} />

      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search subject name or code..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadData}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ New Subject</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen message="Loading subjects..." />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="📖" title="No Subjects Found" message="No academic subjects match your search." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.subjectName}>{item.name}</Text>
                  <Text style={styles.subjectCode}>Code: {item.code}</Text>
                </View>
                {item.course && (
                  <View style={styles.coursePill}>
                    <Text style={styles.courseText}>{item.course.name}</Text>
                  </View>
                )}
              </View>

              {item.description && <Text style={styles.description}>{item.description}</Text>}

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(item)}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
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
        title={editingSubject ? "Edit Subject" : "Create Academic Subject"}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={submitting}
        submitText={editingSubject ? "Save Changes" : "Create Subject"}
      >
        <Input
          label="Subject Name"
          placeholder="e.g. Data Structures & Algorithms"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          required
        />
        <Input
          label="Subject Code"
          placeholder="e.g. CS101"
          value={form.code}
          onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
          required
        />
        <Input
          label="Description"
          placeholder="Subject outline..."
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          multiline
        />
        {courses.length > 0 && !editingSubject && (
          <SelectPicker
            label="Belongs to Course"
            options={courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
            selectedValue={form.courseId}
            onSelect={(v) => setForm({ ...form, courseId: v })}
            required
          />
        )}
      </FormModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete subject ${deleteTarget?.name}?`}
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
  subjectName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  subjectCode: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  coursePill: {
    backgroundColor: Colors.admin.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  courseText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.admin.primary,
  },
  description: {
    ...Typography.bodySmall,
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
