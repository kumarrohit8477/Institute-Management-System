import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";

type StatusVariant = "success" | "warning" | "danger" | "info" | "gray" | "primary";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<StatusVariant, { bg: string; text: string }> = {
  success: { bg: Colors.successLight, text: Colors.successDark },
  warning: { bg: Colors.warningLight, text: Colors.warningDark },
  danger: { bg: Colors.dangerLight, text: Colors.dangerDark },
  info: { bg: Colors.infoLight, text: Colors.infoDark },
  primary: { bg: Colors.primaryLight, text: Colors.primaryDark },
  gray: { bg: Colors.surfaceElevated, text: Colors.textSecondary },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = "gray",
  size = "sm",
}) => {
  const { bg, text } = variantStyles[variant] || variantStyles.gray;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }, size === "md" && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
};

export const getStatusVariant = (status: string): StatusVariant => {
  const s = status?.toLowerCase();
  if (["active", "paid", "present", "passed", "live"].includes(s)) return "success";
  if (["pending", "scheduled", "upcoming", "trial"].includes(s)) return "warning";
  if (["overdue", "blocked", "cancelled", "failed", "absent", "suspended"].includes(s)) return "danger";
  if (["partially_paid", "in_progress", "late"].includes(s)) return "info";
  return "gray";
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  text: {
    ...Typography.labelSmall,
  },
  textMd: {
    fontSize: 11,
  },
});
