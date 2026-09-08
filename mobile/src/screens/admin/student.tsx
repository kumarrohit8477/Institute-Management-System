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
import { MobileAdminService, StudentItem, BatchItem } from "../../services/adminService";

export const AdminStudentsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    admissionNumber: "",
    password: "",
    batchId: "",
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<StudentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [stRes, btRes] = await Promise.all([
        MobileAdminService.getStudents({ search: search.trim() || undefined }),
        MobileAdminService.getBatches(),
      ]);
      setStudents(stRes || []);
      setBatches(btRes || []);
    } catch (err) {
      console.warn("Failed loading students:", err);
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
    setEditingStudent(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      admissionNumber: `STU${Math.floor(1000 + Math.random() * 9000)}`,
      password: "password123",
      batchId: batches.length > 0 ? batches[0].id : "",
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (st: StudentItem) => {
    setEditingStudent(st);
    setForm({
      firstName: st.firstName,
      lastName: st.lastName,
      email: st.email,
      phone: st.phone || "",
      admissionNumber: st.admissionNumber,
      password: "",
      batchId: st.batch?.id || "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.admissionNumber) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }
    if (!editingStudent && form.password && form.password.length < 6) {
      Alert.alert("Validation Error", "Initial password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingStudent) {
        await MobileAdminService.updateStudent(editingStudent.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        });
        Alert.alert("Success", "Student updated successfully!");
      } else {
        await MobileAdminService.createStudent(form);
        Alert.alert("Success", "Student created successfully!");
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed saving student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteStudent(deleteTarget.id);
      Alert.alert("Success", "Student deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting student");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Students Directory" onBack={onBack} />

      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search student name, email, admission #..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadData}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add Student</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen message="Loading student records..." />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="👨‍🎓" title="No Students Found" message="No student records match your search query." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.subText}>Adm #: {item.admissionNumber} • {item.email}</Text>
                </View>
                <StatusBadge status={item.status || "ACTIVE"} />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.batchBadge}>Batch: {item.batch?.name || "Unassigned"}</Text>
                {item.phone && <Text style={styles.phoneText}>📞 {item.phone}</Text>}
              </View>

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

      {/* Add / Edit Student Form Modal */}
      <FormModal
        visible={modalVisible}
        title={editingStudent ? `Edit Student` : `Register New Student`}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={submitting}
        submitText={editingStudent ? "Update Record" : "Register Student"}
      >
        <Input
          label="First Name"
          placeholder="e.g. Rahul"
          value={form.firstName}
          onChangeText={(v) => setForm({ ...form, firstName: v })}
          required
        />
        <Input
          label="Last Name"
          placeholder="e.g. Sharma"
          value={form.lastName}
          onChangeText={(v) => setForm({ ...form, lastName: v })}
          required
        />
        <Input
          label="Email Address"
          placeholder="e.g. rahul@gmail.com"
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
          label="Admission Number"
          placeholder="e.g. STU1001"
          value={form.admissionNumber}
          onChangeText={(v) => setForm({ ...form, admissionNumber: v })}
          required
          editable={!editingStudent}
        />
        {!editingStudent && (
          <Input
            label="Initial Password"
            placeholder="Account password"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            required
          />
        )}
        {batches.length > 0 && !editingStudent && (
          <SelectPicker
            label="Assign Initial Batch"
            options={batches.map((b) => ({ label: `${b.name} (${b.code})`, value: b.id }))}
            selectedValue={form.batchId}
            onSelect={(v) => setForm({ ...form, batchId: v })}
          />
        )}
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
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
  studentName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  subText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  batchBadge: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.admin.primary,
    backgroundColor: Colors.admin.light,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  phoneText: {
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
