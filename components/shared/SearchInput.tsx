import {
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
  onChangeText: (text: string) => void;
};

const SearchInput = ({ value, onChangeText, placeholder, ...props }: Props) => {
  const themesColors = useThemeColors();
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
    <ThemedView style={[styles.container, { borderColor: themesColors.text }]}>
      <Ionicons name="search" size={20} color="#687076" />
      <TextInput
        {...props}
        value={localValue}
        onChangeText={handleChange}
        placeholderTextColor="#687076"
        selectionColor={themesColors.text}
        underlineColorAndroid="transparent"
        style={[styles.input, { color: themesColors.text }]}
      />
      {localValue ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#687076" />
        </TouchableOpacity>
      ) : null}
    </ThemedView>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    height: 40,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderStyle: "solid",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 16,
    marginLeft: 8,
    borderWidth: 0,
    outline: "none",
  },
  clearButton: {
    padding: 4,
  },
});
