import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MobileStudentService } from "../../services/studentService";
import { Header, Card, Badge } from "../../components/Header";

export const SubjectsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [academics, setAcademics] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAcademics().then(setAcademics).catch(console.warn);
  }, []);

  const subjects = academics?.subjects || [
    { id: "1", name: "Physics", code: "PHY-JEE", description: "Mechanics, Electrodynamics, Thermodynamics & Ray Optics." },
    { id: "2", name: "Mathematics", code: "MATH-JEE", description: "Calculus, Coordinate Geometry, Vectors & Algebra." },
    { id: "3", name: "Chemistry", code: "CHEM-JEE", description: "Organic Chemistry, Inorganic Coordination & Physical Chemistry." }
  ];

  return (
    <View style={styles.container}>
      <Header title="My Subjects" subtitle="Course curriculum disciplines" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {subjects.map((s: any) => (
          <Card key={s.id} style={styles.cardItem}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{s.name}</Text>
              <Badge label={s.code} variant="primary" />
            </View>
            <Text style={styles.subjectDesc}>{s.description}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export const TeachersScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [academics, setAcademics] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAcademics().then(setAcademics).catch(console.warn);
  }, []);

  const teachers = academics?.teachers || [
    {
      id: "1",
      firstName: "Dr. Harish",
      lastName: "Verma",
      qualification: "Ph.D. IIT Kanpur",
      specialization: "Quantum & Classical Mechanics",
      subjectName: "Physics",
      email: "h.verma@institute.local"
    },
    {
      id: "2",
      firstName: "Prof. Sunita",
      lastName: "Ramanujan",
      qualification: "M.Sc Gold Medalist",
      specialization: "Calculus & Geometry",
      subjectName: "Mathematics",
      email: "s.ramanujan@institute.local"
    },
    {
      id: "3",
      firstName: "Dr. Rajesh",
      lastName: "Bhatnagar",
      qualification: "Ph.D. Organic Chemistry",
      specialization: "Reaction Mechanisms & Spectroscopy",
      subjectName: "Chemistry",
      email: "r.bhatnagar@institute.local"
    }
  ];

  return (
    <View style={styles.container}>
      <Header title="Faculty Directory" subtitle="My Teachers & Academic Mentors" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {teachers.map((t: any) => (
          <Card key={t.id} style={styles.teacherCard}>
            <View style={styles.teacherRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{t.firstName?.[0] || "T"}</Text>
              </View>
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>
                  {t.firstName} {t.lastName}
                </Text>
                <Text style={styles.teacherSubject}>
                  {t.subjectName || "Faculty"} • {t.qualification}
                </Text>
                <Text style={styles.teacherSpec}>{t.specialization}</Text>
                {t.email ? <Text style={styles.teacherEmail}>✉ {t.email}</Text> : null}
              </View>
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
  scrollList: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  cardItem: {
    marginBottom: 4
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  subjectName: {
    fontWeight: "800",
    fontSize: 15,
    color: "#0f172a"
  },
  subjectDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18
  },
  teacherCard: {
    marginBottom: 4
  },
  teacherRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800"
  },
  teacherInfo: {
    flex: 1
  },
  teacherName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0f172a"
  },
  teacherSubject: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "700",
    marginTop: 2
  },
  teacherSpec: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3
  },
  teacherEmail: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4
  }
});
