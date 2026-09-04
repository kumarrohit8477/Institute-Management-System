import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";

interface ScreenWrapperProps {
  children: ReactNode;
  style?: any;
  noPadding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  noPadding = false,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={["top"]}>
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  noPadding: {
    padding: 0,
  },
});
