import React from "react";
import { useRouter } from "expo-router";
import { AdminStudentsScreen } from "../../src/screens/admin/student";

export default function StudentsRoute() {
  const router = useRouter();
  return <AdminStudentsScreen onBack={() => router.back()} />;
}
