import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert
} from "react-native";
import { MobileStudentService } from "../../services/studentService";
import { Header, Card, Badge } from "../../components/Header";

export const TimetableScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [schedule, setSchedule] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getSchedule().then(setSchedule).catch(console.warn);
  }, []);

  const daySlots = schedule?.scheduleByDay?.[selectedDay] || [];

  const handleOpenLink = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Cannot open link", url);
      }
    } catch {
      Alert.alert("Error opening link", url);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Class Timetable" subtitle="Weekly lecture schedule & video links" onBack={onBack} />

      {/* Weekday Switcher */}
      <View style={styles.dayPickerWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {days.map((d) => {
            const isSelected = selectedDay === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDay(d)}
                style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                  {d.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {daySlots.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No lectures scheduled for {selectedDay}.</Text>
          </Card>
        ) : (
          daySlots.map((slot: any) => (
            <Card key={slot.id} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.slotSubject}>{slot.subject?.name || "Subject"}</Text>
                  <Text style={styles.slotTeacher}>
                    👨‍🏫 {slot.teacher ? `${slot.teacher.firstName} ${slot.teacher.lastName}` : "Faculty"}
                    {slot.roomNumber ? ` • Room ${slot.roomNumber}` : ""}
                  </Text>
                </View>
                <Badge
                  label={slot.classType || "OFFLINE"}
                  variant={slot.classType === "ONLINE" ? "primary" : "gray"}
                />
              </View>

              <View style={styles.slotFooter}>
                <Text style={styles.timeText}>
                  ⏰ {slot.startTime} - {slot.endTime}
                </Text>

                {slot.meetingLink ? (
                  <TouchableOpacity
                    onPress={() => handleOpenLink(slot.meetingLink)}
                    style={styles.joinVideoBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.joinVideoText}>Join Video 🎥</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.inPersonPill}>
                    <Text style={styles.inPersonText}>🏛 In-Person</Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export const MaterialsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  useEffect(() => {
    MobileStudentService.getMaterials({ search })
      .then((res) => setMaterials(res.materials || []))
      .catch(console.warn);
  }, [search]);

  const sampleList = materials;

  const handleOpenMaterial = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Cannot open file URL", url);
    }
  };

  const filtered = sampleList.filter((m) => {
    if (selectedSubject !== "ALL" && m.subject?.name !== selectedSubject) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <Header title="Study Materials" subtitle="Lecture notes, PDFs & video lectures" onBack={onBack} />

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search documents, notes, & topics..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Subject Filter Pills */}
      <View style={styles.filterPillsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {["ALL", "Physics", "Mathematics", "Chemistry"].map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <TouchableOpacity
                key={sub}
                onPress={() => setSelectedSubject(sub)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {filtered.map((m: any) => (
          <Card key={m.id} style={styles.materialCard}>
            <View style={styles.materialHeader}>
              <Badge label={m.subject?.name || "Subject"} variant="primary" />
              <Badge label={m.fileType || "DOC"} variant="gray" />
            </View>

            <Text style={styles.materialTitle}>{m.title}</Text>

            <TouchableOpacity
              onPress={() => handleOpenMaterial(m.fileUrl)}
              style={styles.openMaterialBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.openMaterialText}>
                {m.fileType === "VIDEO" ? "▶ Watch Video Lecture" : "📥 Open Study PDF"}
              </Text>
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export const AttendanceScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [attData, setAttData] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAttendance().then(setAttData).catch(console.warn);
  }, []);

  const stats = attData?.statistics || {
    attendancePercentage: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    totalDays: 0
  };

  const records = attData?.records || [];

  const isGoodStanding = (stats.attendancePercentage ?? 0) >= 75;

  return (
    <View style={styles.container}>
      <Header title="Attendance Tracking" subtitle="Presence log & percentage" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* Overall Percentage Card */}
        <Card style={styles.attOverviewCard}>
          <Text style={styles.overviewSubtitle}>ACADEMIC ATTENDANCE STANDING</Text>
          <Text style={[styles.overviewPct, { color: isGoodStanding ? "#10b981" : "#ef4444" }]}>
            {stats.attendancePercentage}%
          </Text>
          <Text style={styles.overviewStatus}>
            {isGoodStanding
              ? "✓ Satisfies the mandatory ≥ 75% requirement"
              : "⚠ Below 75% mandatory requirement! Attend upcoming classes."}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{stats.presentCount}</Text>
              <Text style={styles.statLbl}>Present</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: "#ef4444" }]}>{stats.absentCount}</Text>
              <Text style={styles.statLbl}>Absent</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: "#f59e0b" }]}>{stats.lateCount || 0}</Text>
              <Text style={styles.statLbl}>Late</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{stats.totalDays}</Text>
              <Text style={styles.statLbl}>Total</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionHeader}>Session Attendance Logs</Text>

        {records.map((r: any) => (
          <Card key={r.id} style={styles.logCard}>
            <View style={styles.logRow}>
              <View>
                <Text style={styles.logDate}>
                  📅 {new Date(r.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </Text>
                <Text style={styles.logBatch}>{r.batch?.name || "Enrolled Batch"}</Text>
              </View>
              <Badge
                label={r.status}
                variant={r.status === "PRESENT" ? "success" : r.status === "ABSENT" ? "danger" : "warning"}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  dayPickerWrapper: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 10
  },
  dayScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9"
  },
  dayButtonActive: {
    backgroundColor: "#3b82f6"
  },
  dayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569"
  },
  dayTextActive: {
    color: "#ffffff"
  },
  scrollList: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 32
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b"
  },
  slotCard: {
    marginBottom: 4
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10
  },
  slotSubject: {
    fontWeight: "800",
    fontSize: 15,
    color: "#0f172a"
  },
  slotTeacher: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2
  },
  slotFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10
  },
  timeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6"
  },
  joinVideoBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  joinVideoText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700"
  },
  inPersonPill: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  inPersonText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "700"
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a"
  },
  filterPillsWrapper: {
    paddingVertical: 6
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  filterPillActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6"
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b"
  },
  filterPillTextActive: {
    color: "#ffffff",
    fontWeight: "700"
  },
  materialCard: {
    marginBottom: 4
  },
  materialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    lineHeight: 20
  },
  openMaterialBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center"
  },
  openMaterialText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 12
  },
  attOverviewCard: {
    alignItems: "center",
    paddingVertical: 20
  },
  overviewSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8
  },
  overviewPct: {
    fontSize: 38,
    fontWeight: "900",
    marginVertical: 4
  },
  overviewStatus: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    marginBottom: 16
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12
  },
  statCol: {
    alignItems: "center"
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a"
  },
  statLbl: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 6,
    marginBottom: 2
  },
  logCard: {
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a"
  },
  logBatch: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  }
});
