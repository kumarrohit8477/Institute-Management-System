import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectPickerProps {
  label?: string;
  options: SelectOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const SelectPicker: React.FC<SelectPickerProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  required,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={styles.pickerBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.pickerValue, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{label || "Select Option"}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionSelected]}
                    onPress={() => {
                      onSelect(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionSelectedText]}>
                      {item.label}
                    </Text>
                    {isSelected && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  pickerBtn: {
    height: 48,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  arrow: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    maxHeight: "70%",
    paddingVertical: Spacing.base,
    elevation: 10,
  },
  modalHeader: {
    ...Typography.h4,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  optionSelectedText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  check: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
