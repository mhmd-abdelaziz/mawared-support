import {
  ViewStyle,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import React from "react";
import ThemedView from "./ThemedView";
import { useThemeColors } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";

type Props = TextInputProps & {
  value: string;
  containerStyles?: ViewStyle;
  onChangeText: (text: string) => void;
};

const SearchInput = ({
  value,
  onChangeText,
  containerStyles,
  ...props
}: Props) => {
  const themeColors = useThemeColors();
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (text.length >= 2 || text.length === 0) {
      timeoutRef.current = setTimeout(() => {
        onChangeText(text);
      }, 500);
    }
  };

  const handleClear = () => {
    onChangeText("");
    setLocalValue("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { borderColor: themeColors.muted },
        containerStyles,
      ]}
    >
      <Ionicons name="search" size={20} color={themeColors.icon} />
      <TextInput
        {...props}
        value={localValue}
        onChangeText={handleChange}
        selectionColor={themeColors.text}
        underlineColorAndroid="transparent"
        placeholderTextColor={themeColors.muted}
        style={[styles.input, { color: themeColors.text }]}
      />
      {localValue ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={themeColors.icon} />
        </TouchableOpacity>
      ) : null}
    </ThemedView>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderStyle: "solid",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 14,
    marginLeft: 8,
    borderWidth: 0,
  },
  clearButton: {
    padding: 4,
  },
});
