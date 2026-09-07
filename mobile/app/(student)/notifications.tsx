import React from "react";
import { useRouter } from "expo-router";
import { NotificationsScreen } from "../../src/screens/main/FeesScreen";

export default function NotificationsRoute() {
  const router = useRouter();
  return <NotificationsScreen onBack={() => router.back()} />;
}
