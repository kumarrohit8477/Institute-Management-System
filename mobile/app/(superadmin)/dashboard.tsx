import React from "react";
import { useRouter } from "expo-router";
import { SuperAdminDashboardScreen } from "../../src/screens/superadmin/SuperAdminDashboardScreen";

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <SuperAdminDashboardScreen
      onNavigate={(screen) => {
        router.push(`/(superadmin)/${screen}` as any);
      }}
    />
  );
}
