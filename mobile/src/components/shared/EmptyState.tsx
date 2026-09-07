import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = "📭", title, subtitle, message }) => {
  const sub = subtitle || message;
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
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
