import React from "react";
import { useRouter } from "expo-router";
import { AdminRoomsScreen } from "../../src/screens/admin/room";

export default function RoomsRoute() {
  const router = useRouter();
  return <AdminRoomsScreen onBack={() => router.back()} />;
}
