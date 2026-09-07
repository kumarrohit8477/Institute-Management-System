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
import { MobileAdminService, TeacherItem, SubjectItem } from "../../services/adminService";

export const AdminTeachersScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Add/Edit Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeCode: "",
    qualification: "",
    specialization: "",
    password: "",
  });

  // Assign Subject State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<TeacherItem | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<TeacherItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        MobileAdminService.getTeachers({ search: search.trim() || undefined }),
        MobileAdminService.getSubjects(),
      ]);
      setTeachers(tRes || []);
      setSubjects(sRes || []);
    } catch (err) {
      console.warn("Failed loading teachers:", err);
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
    setEditingTeacher(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeCode: `EMP${Math.floor(100 + Math.random() * 900)}`,
      qualification: "M.Tech / Ph.D",
      specialization: "Computer Science",
      password: "password123",
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (t: TeacherItem) => {
    setEditingTeacher(t);
    setForm({
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phone: t.phone || "",
      employeeCode: t.employeeCode || "",
      qualification: t.qualification || "",
      specialization: t.specialization || "",
      password: "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingTeacher) {
        await MobileAdminService.updateTeacher(editingTeacher.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          qualification: form.qualification,
          specialization: form.specialization,
        });
        Alert.alert("Success", "Faculty record updated.");
      } else {
        await MobileAdminService.createTeacher(form);
        Alert.alert("Success", "Faculty member created.");
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed saving teacher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAssign = (t: TeacherItem) => {
    setSelectedTeacherForAssign(t);
    setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : "");
    setAssignModalVisible(true);
  };

  const handleAssignSubject = async () => {
    if (!selectedTeacherForAssign || !selectedSubjectId) return;
    setSubmitting(true);
    try {
      await MobileAdminService.assignTeacherSubject(selectedTeacherForAssign.id, selectedSubjectId);
      Alert.alert("Success", "Subject assigned to teacher.");
      setAssignModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed assigning subject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteTeacher(deleteTarget.id);
      Alert.alert("Success", "Teacher record deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting teacher");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Faculty & Teachers" onBack={onBack} />

      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search faculty name, email..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadData}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add Teacher</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen message="Loading faculty directory..." />
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="👨‍🏫" title="No Teachers Found" message="No faculty records match your search query." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.teacherName}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.subText}>Emp #: {item.employeeCode || "N/A"} • {item.email}</Text>
                </View>
                <StatusBadge status={item.status || "ACTIVE"} />
              </View>

              <View style={styles.infoGrid}>
                {item.qualification && <Text style={styles.infoTag}>🎓 {item.qualification}</Text>}
                {item.specialization && <Text style={styles.infoTag}>⭐ {item.specialization}</Text>}
              </View>

              {item.subjects && item.subjects.length > 0 && (
                <View style={styles.subjectsRow}>
                  <Text style={styles.subjectsLabel}>Subjects:</Text>
                  {item.subjects.map((sub: any, idx: number) => (
                    <Text key={idx} style={styles.subjectPill}>
                      {sub.subject?.name || sub.name}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenAssign(item)}>
                  <Text style={styles.actionBtnText}>📖 Assign Subject</Text>
                </TouchableOpacity>
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

      {/* Add / Edit Form Modal */}
      <FormModal
        visible={modalVisible}
        title={editingTeacher ? `Edit Faculty Record` : `Add New Teacher`}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={submitting}
        submitText={editingTeacher ? "Save Changes" : "Create Faculty"}
      >
        <Input
          label="First Name"
          placeholder="e.g. Dr. Amit"
          value={form.firstName}
          onChangeText={(v) => setForm({ ...form, firstName: v })}
          required
        />
        <Input
          label="Last Name"
          placeholder="e.g. Verma"
          value={form.lastName}
          onChangeText={(v) => setForm({ ...form, lastName: v })}
          required
        />
        <Input
          label="Email Address"
          placeholder="e.g. amit@institute.com"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          required
        />
        <Input
          label="Phone Number"
          placeholder="e.g. +91 9876543210"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => setForm({ ...form, phone: v })}
        />
        <Input
          label="Qualification"
          placeholder="e.g. Ph.D Computer Science"
          value={form.qualification}
          onChangeText={(v) => setForm({ ...form, qualification: v })}
        />
        <Input
          label="Specialization"
          placeholder="e.g. Machine Learning, Data Structures"
          value={form.specialization}
          onChangeText={(v) => setForm({ ...form, specialization: v })}
        />
        {!editingTeacher && (
          <Input
            label="Initial Password"
            placeholder="Account password"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            required
          />
        )}
      </FormModal>

      {/* Assign Subject Modal */}
      <FormModal
        visible={assignModalVisible}
        title={`Assign Subject to ${selectedTeacherForAssign?.firstName || ""}`}
        onClose={() => setAssignModalVisible(false)}
        onSubmit={handleAssignSubject}
        loading={submitting}
        submitText="Assign Subject"
      >
        <SelectPicker
          label="Select Subject to Assign"
          options={subjects.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id }))}
          selectedValue={selectedSubjectId}
          onSelect={setSelectedSubjectId}
          required
        />
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Teacher Record"
        message={`Are you sure you want to remove ${deleteTarget?.firstName} ${deleteTarget?.lastName} from the faculty list?`}
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
  teacherName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  subText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  infoTag: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  subjectsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.xs,
  },
  subjectsLabel: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  subjectPill: {
    ...Typography.caption,
    color: Colors.admin.primary,
    backgroundColor: Colors.admin.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: Colors.admin.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.admin.primary,
  },
  editBtn: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.sm,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  deleteBtnText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.error,
  },
});
