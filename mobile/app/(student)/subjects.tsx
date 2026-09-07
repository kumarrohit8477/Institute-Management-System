import React from "react";
import { useRouter } from "expo-router";
import { SubjectsScreen } from "../../src/screens/main/SubjectsScreen";

export default function SubjectsRoute() {
  const router = useRouter();
  return <SubjectsScreen onBack={() => router.back()} />;
}
