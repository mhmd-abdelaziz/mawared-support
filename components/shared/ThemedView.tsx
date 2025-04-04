import {
  View,
  ViewStyle,
  StyleProp,
  useColorScheme,
  type ViewProps,
} from "react-native";
import { useThemeColors } from "@/hooks";

export type ThemedViewProps = ViewProps & {
  darkStyles?: StyleProp<ViewStyle>;
  lightStyles?: StyleProp<ViewStyle>;
};

export default function ThemedView({
  style,
  darkStyles,
  lightStyles,
  ...otherProps
}: ThemedViewProps) {
  const themeColors = useThemeColors();
  const theme = useColorScheme() || "light";

  return (
    <View
      style={[
        { backgroundColor: themeColors.background },
        style,
        ...(theme === "dark" && darkStyles ? [darkStyles] : []),
        ...(theme === "light" && lightStyles ? [lightStyles] : []),
      ]}
      {...otherProps}
    />
  );
}
