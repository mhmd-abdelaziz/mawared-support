import {
  View,
  Text,
  Modal,
  ViewStyle,
  TextStyle,
  Pressable,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { useThemeColors } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";

// Define option type
export interface SelectOption {
  label: string;
  value: string | number;
}

// Define component props
export interface SelectProps {
  hasIcon?: boolean;
  options: SelectOption[];
  selectedValues: (string | number)[];
  onSelectionChange: (selected: (string | number)[]) => void;
  placeholder?: string;
  maxDisplayValues?: number;
  isMulti?: boolean; // Control whether multi-select is enabled
  // Optional styling props
  containerStyle?: ViewStyle;
  selectButtonStyle?: ViewStyle;
  selectedItemStyle?: ViewStyle;
  selectedItemTextStyle?: TextStyle;
  placeholderTextStyle?: TextStyle;
  modalTitleStyle?: TextStyle;
  optionTextStyle?: TextStyle;
}

const Select: React.FC<SelectProps> = ({
  hasIcon,
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = "Select an item",
  maxDisplayValues = 2,
  isMulti = false,
  containerStyle,
  selectButtonStyle,
  selectedItemStyle,
  selectedItemTextStyle,
  placeholderTextStyle,
  modalTitleStyle,
  optionTextStyle,
}) => {
  const themeColors = useThemeColors();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [tempSelectedValues, setTempSelectedValues] = useState<
    (string | number)[]
  >([]);

  // Initialize temporary selection when modal opens
  useEffect(() => {
    if (modalVisible) {
      setTempSelectedValues([...selectedValues]);
    }
  }, [modalVisible]);

  const selectItem = (item: SelectOption): void => {
    if (isMulti) {
      // Multi-select behavior: toggle the item
      if (tempSelectedValues.includes(item.value)) {
        setTempSelectedValues(
          tempSelectedValues.filter((value) => value !== item.value)
        );
      } else {
        setTempSelectedValues([...tempSelectedValues, item.value]);
      }
    } else {
      // Single-select behavior: select only this item
      setTempSelectedValues([item.value]);

      // Optional: automatically close modal after selection in single-select mode
      // Uncomment the next line if you want this behavior
      // setTimeout(() => handleDone(), 150);
    }
  };

  const clearTempSelection = (): void => {
    setTempSelectedValues([]);
  };

  const clearSelection = (): void => {
    onSelectionChange([]);
    setModalVisible(false);
  };

  const handleDone = (): void => {
    onSelectionChange(tempSelectedValues);
    setModalVisible(false);
  };

  const handleClose = (): void => {
    setModalVisible(false);
  };

  const renderSelectedItems = (): React.ReactNode => {
    if (selectedValues.length === 0) {
      return (
        <Text style={[styles.placeholderText, placeholderTextStyle]}>
          {placeholder}
        </Text>
      );
    }

    const selectedOptions = options.filter((option) =>
      selectedValues.includes(option.value)
    );

    if (!isMulti || selectedOptions.length === 1) {
      // Single item display
      return (
        <Text style={styles.selectedText}>
          {selectedOptions[0]?.label || ""}
        </Text>
      );
    }

    // Multiple items display with overflow
    const displayOptions = selectedOptions.slice(0, maxDisplayValues);
    const remainingCount = selectedOptions.length - maxDisplayValues;

    return (
      <View style={styles.selectedItemsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {displayOptions.map((option) => (
            <View
              key={`${option.value}`}
              style={[styles.selectedItem, selectedItemStyle]}
            >
              <Text style={[styles.selectedItemText, selectedItemTextStyle]}>
                {option.label}
              </Text>
            </View>
          ))}
          {remainingCount > 0 && (
            <View style={[styles.selectedItem, selectedItemStyle]}>
              <Text style={[styles.selectedItemText, selectedItemTextStyle]}>
                +{remainingCount} more
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.selectButton,
          { borderColor: themeColors.muted },
          selectButtonStyle,
        ]}
      >
        {hasIcon && (
          <Ionicons name="search" size={20} color={themeColors.icon} />
        )}
        <View style={styles.selectWrapper}>
          {renderSelectedItems()}
          <View style={styles.buttonRight}>
            {selectedValues.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable onPress={handleClose} style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, modalTitleStyle]}>
                {isMulti ? "Select Items" : "Select an Item"}
              </ThemedText>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.clearButtonText}>x</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((item) => (
                <TouchableOpacity
                  key={`${item.value}`}
                  onPress={() => selectItem(item)}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: themeColors.surface },
                  ]}
                >
                  {isMulti ? (
                    // Checkbox for multi-select
                    <View
                      style={[
                        styles.checkbox,
                        tempSelectedValues.includes(item.value) &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {tempSelectedValues.includes(item.value) && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                      )}
                    </View>
                  ) : (
                    // Radio button for single-select
                    <View
                      style={[
                        styles.radioButton,
                        tempSelectedValues.includes(item.value) &&
                          styles.radioButtonSelected,
                      ]}
                    >
                      {tempSelectedValues.includes(item.value) && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  )}
                  <ThemedText style={[styles.optionText, optionTextStyle]}>
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              {tempSelectedValues.length > 0 && (
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={clearTempSelection}
                >
                  <Text style={styles.clearAllText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </Pressable>
      </Modal>
    </ThemedView>
  );
};

export default Select;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  selectWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginInlineStart: 8,
    justifyContent: "space-between",
  },
  buttonRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 20,
    color: "#999",
    fontWeight: "bold",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#666",
  },
  selectedText: {
    fontSize: 14,
    color: "#333",
  },
  selectedItemsContainer: {
    flex: 1,
    flexDirection: "row",
  },
  placeholderText: {
    color: "#999",
  },
  selectedItem: {
    marginRight: 6,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: "#e0e0e0",
  },
  selectedItemText: {
    fontSize: 14,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 16,
    color: "#2196F3",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#2196F3",
    backgroundColor: "#2196F3",
  },
  checkmark: {
    fontSize: 14,
    color: "white",
  },
  // Radio button styles for single select
  radioButton: {
    width: 22,
    height: 22,
    borderWidth: 2,
    marginRight: 12,
    borderRadius: 11,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#2196F3",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2196F3",
  },
  optionText: {
    fontSize: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    borderTopColor: "#e0e0e0",
    justifyContent: "flex-end",
  },
  clearAllButton: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearAllText: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "500",
  },
  doneButton: {
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: "#2196F3",
  },
  doneButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
