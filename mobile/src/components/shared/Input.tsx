import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={Colors.textMuted}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    width: "100%",
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  required: {
    color: Colors.error,
  },
  input: {
    ...Typography.body,
    height: 48,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
