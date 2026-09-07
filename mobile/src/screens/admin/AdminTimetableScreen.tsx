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
import {
  MobileAdminService,
  TimetableSlotItem,
  BatchItem,
  SubjectItem,
  TeacherItem,
  RoomItem,
} from "../../services/adminService";

export const AdminTimetableScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [timetables, setTimetables] = useState<TimetableSlotItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState("MONDAY");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    batchId: "",
    subjectId: "",
    teacherId: "",
    roomId: "",
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "10:00",
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<TimetableSlotItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [tRes, bRes, sRes, teRes, rRes] = await Promise.all([
        MobileAdminService.getTimetables({ dayOfWeek: selectedDay }),
        MobileAdminService.getBatches(),
        MobileAdminService.getSubjects(),
        MobileAdminService.getTeachers(),
        MobileAdminService.getRooms(),
      ]);
      setTimetables(tRes || []);
      setBatches(bRes || []);
      setSubjects(sRes || []);
      setTeachers(teRes || []);
      setRooms(rRes || []);
    } catch (err) {
      console.warn("Failed loading timetables:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDay]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenAdd = () => {
    setForm({
      batchId: batches.length > 0 ? batches[0].id : "",
      subjectId: subjects.length > 0 ? subjects[0].id : "",
      teacherId: teachers.length > 0 ? teachers[0].id : "",
      roomId: rooms.length > 0 ? rooms[0].id : "",
      dayOfWeek: selectedDay,
      startTime: "09:00",
      endTime: "10:00",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.batchId || !form.subjectId || !form.teacherId || !form.startTime || !form.endTime) {
      Alert.alert("Validation Error", "Please select batch, subject, teacher, start & end times.");
      return;
    }
    setSubmitting(true);
    try {
      await MobileAdminService.createTimetableSlot(form);
      Alert.alert("Success", "Timetable slot added successfully!");
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed creating schedule slot");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MobileAdminService.deleteTimetableSlot(deleteTarget.id);
      Alert.alert("Success", "Schedule slot deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed deleting slot");
    } finally {
      setDeleting(false);
    }
  };

  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Timetable Master" onBack={onBack} />

      <View style={styles.topBar}>
        <Text style={styles.sectionHeader}>Schedule for {selectedDay}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add Class Slot</Text>
        </TouchableOpacity>
      </View>

      {/* Days Tabs */}
      <View style={styles.tabContainer}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.tab, selectedDay === d && styles.tabActive]}
            onPress={() => setSelectedDay(d)}
          >
            <Text style={[styles.tabText, selectedDay === d && styles.tabTextActive]}>{d.substring(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingScreen message="Loading schedule slots..." />
      ) : (
        <FlatList
          data={timetables}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="📅" title="No Classes Scheduled" message={`No class slots scheduled for ${selectedDay}.`} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>⏰ {item.startTime} - {item.endTime}</Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.subjectName}>{item.subject?.name || "Subject"}</Text>
                <Text style={styles.subText}>Batch: {item.batch?.name || "N/A"}</Text>
                <Text style={styles.subText}>Faculty: {item.teacher?.firstName} {item.teacher?.lastName}</Text>
                {item.room && <Text style={styles.subText}>Room: {item.room.name}</Text>}
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Form Modal */}
      <FormModal
        visible={modalVisible}
        title="Schedule New Class Slot"
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={submitting}
        submitText="Add Slot"
      >
        {batches.length > 0 && (
          <SelectPicker
            label="Select Batch"
            options={batches.map((b) => ({ label: `${b.name} (${b.code})`, value: b.id }))}
            selectedValue={form.batchId}
            onSelect={(v) => setForm({ ...form, batchId: v })}
            required
          />
        )}
        {subjects.length > 0 && (
          <SelectPicker
            label="Select Subject"
            options={subjects.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id }))}
            selectedValue={form.subjectId}
            onSelect={(v) => setForm({ ...form, subjectId: v })}
            required
          />
        )}
        {teachers.length > 0 && (
          <SelectPicker
            label="Select Faculty Teacher"
            options={teachers.map((t) => ({ label: `${t.firstName} ${t.lastName}`, value: t.id }))}
            selectedValue={form.teacherId}
            onSelect={(v) => setForm({ ...form, teacherId: v })}
            required
          />
        )}
        {rooms.length > 0 && (
          <SelectPicker
            label="Select Room"
            options={rooms.map((r) => ({ label: `${r.name} (${r.code})`, value: r.id }))}
            selectedValue={form.roomId}
            onSelect={(v) => setForm({ ...form, roomId: v })}
          />
        )}
        <SelectPicker
          label="Day of Week"
          options={DAYS.map((d) => ({ label: d, value: d }))}
          selectedValue={form.dayOfWeek}
          onSelect={(v) => setForm({ ...form, dayOfWeek: v })}
          required
        />
        <Input
          label="Start Time (HH:MM)"
          placeholder="09:00"
          value={form.startTime}
          onChangeText={(v) => setForm({ ...form, startTime: v })}
          required
        />
        <Input
          label="End Time (HH:MM)"
          placeholder="10:00"
          value={form.endTime}
          onChangeText={(v) => setForm({ ...form, endTime: v })}
          required
        />
      </FormModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Schedule Slot"
        message={`Are you sure you want to delete this class slot?`}
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  timeBadge: {
    backgroundColor: Colors.admin.light,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  timeText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.admin.primary,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  subjectName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  subText: {
    ...Typography.caption,
    color: Colors.textMuted,
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
