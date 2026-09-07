import React from "react";
import { useRouter } from "expo-router";
import { AdminMaterialsScreen } from "../../src/screens/admin/study_material";

export default function MaterialsRoute() {
  const router = useRouter();
  return <AdminMaterialsScreen onBack={() => router.back()} />;
}
