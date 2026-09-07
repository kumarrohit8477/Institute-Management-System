import React from "react";
import { useRouter } from "expo-router";
import { DashboardScreen } from "../../src/screens/main/DashboardScreen";

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <DashboardScreen
      onNavigate={(screen, params) => {
        router.push({
          pathname: `/(student)/${screen}` as any,
          params: params || {},
        });
      }}
    />
  );
}
