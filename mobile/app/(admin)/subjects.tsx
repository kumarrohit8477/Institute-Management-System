import React from "react";
import { useRouter } from "expo-router";
import { AdminSubjectsScreen } from "../../src/screens/admin/subjects";

export default function SubjectsRoute() {
  const router = useRouter();
  return <AdminSubjectsScreen onBack={() => router.back()} />;
}
