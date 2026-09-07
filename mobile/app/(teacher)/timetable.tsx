import React from "react";
import { useRouter } from "expo-router";
import { TeacherTimetableScreen } from "../../src/screens/teacher/TeacherTimetableScreen";

export default function TimetableRoute() {
  const router = useRouter();
  return <TeacherTimetableScreen onBack={() => router.back()} />;
}
