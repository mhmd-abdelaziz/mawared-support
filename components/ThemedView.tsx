import { View, type ViewProps } from "react-native";

import { useThemeColors } from "@/hooks";

export type ThemedViewProps = ViewProps & {};

export default function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const themeColors = useThemeColors();

  return (
    <View
      style={[{ backgroundColor: themeColors.background }, style]}
      {...otherProps}
    />
  );
}
