import React from "react";
import { Ionicons } from "@expo/vector-icons";
import useThemeColors from "@/hooks/useThemeColors";
import { Picker } from "@react-native-picker/picker";
import { ThemedText, ThemedView } from "@/components";
import { View, Modal, StyleSheet, TouchableOpacity } from "react-native";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  setSass: (val: any) => void;
  sass: { name: string; id: string };
  sassOptions: { name: string; id: string }[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  sass,
  visible,
  onClose,
  setSass,
  sassOptions,
}) => {
  const themeColors = useThemeColors();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText type="title">Settings</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <ThemedText type="defaultSemiBold" style={{ paddingStart: 14 }}>
            Reply on behalf of
          </ThemedText>
          <Picker
            style={{
              marginTop: 10,
              width: "100%",
              color: themeColors.text,
              backgroundColor: "inherit",
            }}
            selectedValue={sass}
            onValueChange={(value) => setSass(value)}
          >
            {sassOptions.map((opt: { id: string; name: string }) => (
              <Picker.Item value={opt} key={opt.id} label={opt.name} />
            ))}
          </Picker>
        </ThemedView>
      </TouchableOpacity>
    </Modal>
  );
};

export default SettingsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    height: 200,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
});
