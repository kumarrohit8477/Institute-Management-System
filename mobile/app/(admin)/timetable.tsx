import React from "react";
import { useRouter } from "expo-router";
import { AdminTimetableScreen } from "../../src/screens/admin/schedule";

export default function TimetableRoute() {
  const router = useRouter();
  return <AdminTimetableScreen onBack={() => router.back()} />;
}
