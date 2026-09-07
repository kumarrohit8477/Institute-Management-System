import React from "react";
import { useRouter } from "expo-router";
import { AttendanceScreen } from "../../src/screens/main/TimetableScreen";

export default function AttendanceRoute() {
  const router = useRouter();
  return <AttendanceScreen onBack={() => router.back()} />;
}
