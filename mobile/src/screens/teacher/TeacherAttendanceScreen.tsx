import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Button } from "../../components/Header";
import { EmptyState } from "../../components/shared/EmptyState";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileTeacherService } from "../../services/teacherService";

export const TeacherAttendanceScreen: React.FC<{
  onBack: () => void;
  batchId?: string;
  batchName?: string;
}> = ({ onBack, batchId, batchName }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!batchId) {
        setLoading(false);
        return;
      }
      try {
        const res = await MobileTeacherService.getBatchStudents(batchId);
        const list = Array.isArray(res) ? res : res?.students || [];
        setStudents(list);

        // Initial state all PRESENT
        const init: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
        list.forEach((s: any) => {
          init[s.id || s.studentId] = "PRESENT";
        });
        setAttendance(init);
      } catch (err) {
        console.warn("Failed fetching batch students:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [batchId]);

  const toggleStatus = (id: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSubmit = async () => {
    if (!batchId) return;
    setSubmitting(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await MobileTeacherService.markAttendance({
        batchId,
        date: selectedDate,
        records,
      });
      Alert.alert("Success", "Attendance submitted successfully!", [{ text: "OK", onPress: onBack }]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Mark Attendance" subtitle={batchName || "Batch Attendance"} onBack={onBack} accentColor={Colors.teacher.primary} />

      {/* Date Indicator */}
      <View style={styles.dateBar}>
        <Text style={styles.dateLabel}>Date: {selectedDate}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.teacher.primary} />
        </View>
      ) : !batchId || students.length === 0 ? (
        <EmptyState icon="👥" title="No Students Found" subtitle="Select a batch from the Batches tab to mark attendance." />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {students.map((student: any) => {
              const id = student.id || student.studentId;
              const currentStatus = attendance[id] || "PRESENT";
              const name = `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.name || "Student";
              const adm = student.admissionNumber || student.rollNumber || "ADM";

              return (
                <Card key={id} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{name}</Text>
                    <Text style={styles.studentAdm}>{adm}</Text>
                  </View>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      onPress={() => toggleStatus(id, "PRESENT")}
                      style={[styles.statusBtn, currentStatus === "PRESENT" && styles.presentBtn]}
                    >
                      <Text style={[styles.statusBtnText, currentStatus === "PRESENT" && styles.activeText]}>P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleStatus(id, "ABSENT")}
                      style={[styles.statusBtn, currentStatus === "ABSENT" && styles.absentBtn]}
                    >
                      <Text style={[styles.statusBtnText, currentStatus === "ABSENT" && styles.activeText]}>A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleStatus(id, "LATE")}
                      style={[styles.statusBtn, currentStatus === "LATE" && styles.lateBtn]}
                    >
                      <Text style={[styles.statusBtnText, currentStatus === "LATE" && styles.activeText]}>L</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={submitting ? "Submitting..." : "Submit Attendance"}
              onPress={handleSubmit}
              disabled={submitting}
              style={{ backgroundColor: Colors.teacher.primary, borderColor: Colors.teacher.primary }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dateBar: {
    backgroundColor: Colors.teacher.light,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: "center",
  },
  dateLabel: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.teacher.dark,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  studentAdm: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 6,
  },
  statusBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  presentBtn: {
    backgroundColor: Colors.success,
  },
  absentBtn: {
    backgroundColor: Colors.danger,
  },
  lateBtn: {
    backgroundColor: Colors.warning,
  },
  statusBtnText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  activeText: {
    color: "#fff",
  },
  footer: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
