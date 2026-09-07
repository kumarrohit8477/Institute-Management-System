import React from "react";
import { useRouter } from "expo-router";
import { InstitutesScreen } from "../../src/screens/superadmin/InstitutesScreen";

export default function InstitutesRoute() {
  const router = useRouter();
  return <InstitutesScreen onBack={() => router.back()} />;
}
