import React from "react";
import { useRouter } from "expo-router";
import { AdminTeachersScreen } from "../../src/screens/admin/faculty";

export default function TeachersRoute() {
  const router = useRouter();
  return <AdminTeachersScreen onBack={() => router.back()} />;
}
