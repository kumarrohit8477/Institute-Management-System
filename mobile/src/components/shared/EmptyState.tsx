import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = "folder-open-outline", title, subtitle, message }) => {
  const sub = subtitle || message;
  const isVector = icon && (icon.includes("-") || (Ionicons.glyphMap as any)[icon]);
  return (
    <View style={styles.container}>
      {isVector ? (
        <Ionicons name={icon as any} size={48} color={Colors.textMuted} style={{ marginBottom: 16 }} />
      ) : (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text style={styles.title}>{title}</Text>
      {sub ? <Text style={styles.subtitle}>{sub}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
