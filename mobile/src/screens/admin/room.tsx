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
import { MobileAdminService, RoomItem } from "../../services/adminService";

export const AdminRoomsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    capacity: "60",
    type: "CLASSROOM" as "CLASSROOM" | "LAB" | "ONLINE" | "OTHER",
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<RoomItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRooms = async () => {
    try {
      const data = await MobileAdminService.getRooms({ search: search.trim() || undefined });
      setRooms(data || []);
    } catch (err) {
      console.warn("Failed loading rooms:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setForm({ name: "", code: "", capacity: "60", type: "CLASSROOM" });
    setModalVisible(true);
  };

  const handleOpenEdit = (r: RoomItem) => {
    setEditingRoom(r);
    setForm({
      name: r.name,
      code: r.code,
      capacity: String(r.capacity || 60),
      type: r.type || "CLASSROOM",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      Alert.alert("Validation Error", "Please fill in room name and room code.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingRoom) {
        await MobileAdminService.updateRoom(editingRoom.id, {
          name: form.name,
          code: form.code,
          capacity: Number(form.capacity),
          type: form.type,
        });
        Alert.alert("Success", "Room updated successfully!");
      } else {
        await MobileAdminService.createRoom({
          name: form.name,
          code: form.code,
          capacity: Number(form.capacity),
          type: form.type,
        });
        Alert.alert("Success", "Room created successfully!");
      }
      setModalVisible(false);
      loadRooms();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed saving room");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteRoom(deleteTarget.id);
      Alert.alert("Success", "Room deleted.");
      setDeleteTarget(null);
      loadRooms();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting room");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Classrooms & Labs" onBack={onBack} />

      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search room name or code..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadRooms}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add Room</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen message="Loading campus rooms..." />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="🏛️" title="No Rooms Found" message="No campus classrooms or labs found." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.roomName}>{item.name}</Text>
                  <Text style={styles.roomCode}>Code: {item.code} • Type: {item.type}</Text>
                </View>
                <StatusBadge status={item.status || "ACTIVE"} />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Seating Capacity: {item.capacity} Students</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(item)}>
                  <Text style={styles.editBtnText}>✏️ Edit Room</Text>
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
        title={editingRoom ? "Edit Room Record" : "Add New Room"}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={submitting}
        submitText={editingRoom ? "Save Changes" : "Create Room"}
      >
        <Input
          label="Room Name / Label"
          placeholder="e.g. Hall 101 / Computer Lab A"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          required
        />
        <Input
          label="Room Code"
          placeholder="e.g. R-101"
          value={form.code}
          onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
          required
        />
        <Input
          label="Seating Capacity"
          keyboardType="numeric"
          value={form.capacity}
          onChangeText={(v) => setForm({ ...form, capacity: v })}
          required
        />
        <SelectPicker
          label="Facility Type"
          options={[
            { label: "Classroom", value: "CLASSROOM" },
            { label: "Computer / Science Lab", value: "LAB" },
            { label: "Virtual / Online Link", value: "ONLINE" },
            { label: "Auditorium / Other", value: "OTHER" },
          ]}
          selectedValue={form.type}
          onSelect={(v: any) => setForm({ ...form, type: v })}
          required
        />
      </FormModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Room"
        message={`Are you sure you want to delete room ${deleteTarget?.name}?`}
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
  roomName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  roomCode: {
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
