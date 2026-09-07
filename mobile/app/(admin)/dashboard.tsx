import React from "react";
import { useRouter } from "expo-router";
import { AdminDashboardScreen } from "../../src/screens/admin/dashboard";

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <AdminDashboardScreen
      onNavigate={(screen) => {
        router.push(`/(admin)/${screen}` as any);
      }}
    />
  );
}
