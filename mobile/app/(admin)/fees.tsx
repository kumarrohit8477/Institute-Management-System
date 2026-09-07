import React from "react";
import { useRouter } from "expo-router";
import { AdminFeesScreen } from "../../src/screens/admin/fees";

export default function FeesRoute() {
  const router = useRouter();
  return <AdminFeesScreen onBack={() => router.back()} />;
}
