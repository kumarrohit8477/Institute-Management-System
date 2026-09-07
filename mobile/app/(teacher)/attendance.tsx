import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { TeacherAttendanceScreen } from "../../src/screens/teacher/TeacherAttendanceScreen";

export default function AttendanceRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ batchId?: string; batchName?: string }>();

  return (
    <TeacherAttendanceScreen
      onBack={() => router.back()}
      batchId={params.batchId}
      batchName={params.batchName}
    />
  );
}
