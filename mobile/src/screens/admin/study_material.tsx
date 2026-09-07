import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Linking } from "react-native";
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
import { MobileAdminService, MaterialItem, BatchItem, SubjectItem } from "../../services/adminService";

export const AdminMaterialsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "PDF",
    batchId: "",
    subjectId: "",
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<MaterialItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [mRes, bRes, sRes] = await Promise.all([
        MobileAdminService.getMaterials(),
        MobileAdminService.getBatches(),
        MobileAdminService.getSubjects(),
      ]);
      setMaterials(mRes || []);
      setBatches(bRes || []);
      setSubjects(sRes || []);
    } catch (err) {
      console.warn("Failed loading materials:", err);
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
    setForm({
      title: "",
      description: "",
      fileUrl: "https://example.com/material.pdf",
      fileType: "PDF",
      batchId: batches.length > 0 ? batches[0].id : "",
      subjectId: subjects.length > 0 ? subjects[0].id : "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.fileUrl || !form.batchId || !form.subjectId) {
      Alert.alert("Validation Error", "Please fill in title, file URL, batch, and subject.");
      return;
    }
    setSubmitting(true);
    try {
      await MobileAdminService.createMaterial(form);
      Alert.alert("Success", "Study material uploaded!");
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed uploading material");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteMaterial(deleteTarget.id);
      Alert.alert("Success", "Material deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting material");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Study Materials & Notes" onBack={onBack} />

      <View style={styles.topBar}>
        <Text style={styles.sectionHeader}>All Uploaded Documents</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add Material</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen message="Loading study materials..." />
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="📁" title="No Study Materials" message="No study materials or PDFs uploaded yet." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matTitle}>{item.title}</Text>
                  <Text style={styles.matSub}>
                    Batch: {item.batch?.name || "N/A"} • Subject: {item.subject?.name || "N/A"}
                  </Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.fileType || "PDF"}</Text>
                </View>
              </View>

              {item.description && <Text style={styles.description}>{item.description}</Text>}

              <View style={styles.actionsRow}>
                {item.fileUrl && (
                  <TouchableOpacity
                    style={styles.openBtn}
                    onPress={() => Linking.openURL(item.fileUrl).catch(() => Alert.alert("Error", "Cannot open URL"))}
                  >
                    <Text style={styles.openBtnText}>🔗 Open File</Text>
                  </TouchableOpacity>
                )}
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
        title="Upload Study Material"
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={submitting}
        submitText="Publish Material"
      >
        <Input
          label="Material Title"
          placeholder="e.g. Unit 1 Lecture Notes"
          value={form.title}
          onChangeText={(v) => setForm({ ...form, title: v })}
          required
        />
        <Input
          label="Description"
          placeholder="Optional notes or instructions..."
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          multiline
        />
        <Input
          label="File URL / PDF Link"
          placeholder="e.g. https://domain.com/notes.pdf"
          value={form.fileUrl}
          onChangeText={(v) => setForm({ ...form, fileUrl: v })}
          required
        />
        {batches.length > 0 && (
          <SelectPicker
            label="Target Batch"
            options={batches.map((b) => ({ label: `${b.name} (${b.code})`, value: b.id }))}
            selectedValue={form.batchId}
            onSelect={(v) => setForm({ ...form, batchId: v })}
            required
          />
        )}
        {subjects.length > 0 && (
          <SelectPicker
            label="Target Subject"
            options={subjects.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id }))}
            selectedValue={form.subjectId}
            onSelect={(v) => setForm({ ...form, subjectId: v })}
            required
          />
        )}
      </FormModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Material"
        message={`Are you sure you want to delete material ${deleteTarget?.title}?`}
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeader: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.admin.primary,
    paddingHorizontal: Spacing.base,
    height: 40,
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
  matTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  matSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: Colors.admin.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  typeText: {
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
  openBtn: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  openBtnText: {
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
