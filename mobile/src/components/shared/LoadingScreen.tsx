import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";

interface LoadingScreenProps {
  message?: string;
  color?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  color = Colors.primary,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color + "1A" }]}>
          <ActivityIndicator size="large" color={color} />
        </View>
        <Text style={[styles.message, { color }]}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    ...Typography.h4,
    color: Colors.textSecondary,
  },
});
