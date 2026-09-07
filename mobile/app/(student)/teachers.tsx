import React from "react";
import { useRouter } from "expo-router";
import { TeachersScreen } from "../../src/screens/main/SubjectsScreen";

export default function TeachersRoute() {
  const router = useRouter();
  return <TeachersScreen onBack={() => router.back()} />;
}
