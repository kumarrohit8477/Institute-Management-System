import React from "react";
import { useRouter } from "expo-router";
import { AdminBatchesScreen } from "../../src/screens/admin/batch";

export default function BatchesRoute() {
  const router = useRouter();
  return <AdminBatchesScreen onBack={() => router.back()} />;
}
