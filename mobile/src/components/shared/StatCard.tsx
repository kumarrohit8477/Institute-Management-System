import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";

interface StatCardProps {
  icon: string | React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  lightColor?: string;
  onPress?: () => void;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color = Colors.primary,
  lightColor = Colors.primaryLight,
  onPress,
  trend,
  trendUp,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconBg, { backgroundColor: lightColor }]}>
        {typeof icon === "string" ? (
          icon.length > 2 || (Ionicons.glyphMap as any)[icon] ? (
            <Ionicons name={icon as any} size={22} color={color} />
          ) : (
            <Text style={styles.icon}>{icon}</Text>
          )
        ) : (
          icon
        )}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend ? (
        <Text style={[styles.trend, { color: trendUp ? Colors.success : Colors.danger }]}>
          {trendUp ? "↑" : "↓"} {trend}
        </Text>
      ) : null}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    fontSize: 22,
  },
  value: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: "center",
  },
  trend: {
    ...Typography.caption,
    fontWeight: "600",
  },
});
