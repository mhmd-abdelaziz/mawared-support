import {
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface FloatingButton extends TouchableOpacityProps {
  style?: ViewStyle;
  icon?: React.ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const FloatingButton: React.FC<FloatingButton> = ({
  icon,
  style,
  iconName,
  ...props
}) => {
  return (
    <TouchableOpacity style={[styles.floatingButton, style]} {...props}>
      {icon || <Ionicons name={iconName} size={24} color="white" />}
    </TouchableOpacity>
  );
};

export default FloatingButton;

const styles = StyleSheet.create({
  floatingButton: {
    right: 16,
    width: 56,
    bottom: 16,
    height: 56,
    elevation: 5,
    shadowRadius: 3,
    borderRadius: 28,
    shadowOpacity: 0.3,
    shadowColor: "#000",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3F51B5",
    shadowOffset: { width: 0, height: 2 },
  },
});
