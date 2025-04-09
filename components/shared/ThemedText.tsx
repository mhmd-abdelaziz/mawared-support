import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColors } from "@/hooks";

export type ThemedTextProps = TextProps & {
  textCenter?: boolean;
  type?:
    | "link"
    | "title"
    | "muted"
    | "default"
    | "subtitle"
    | "defaultSemiBold";
};

export default function ThemedText({
  style,
  textCenter,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const themeColors = useThemeColors();

  return (
    <Text
      style={[
        { color: themeColors.text },
        textCenter ? { textAlign: "center" } : undefined,
        type === "link" ? styles.link : undefined,
        type === "title" ? styles.title : undefined,
        type === "default" ? styles.default : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "muted"
          ? [styles.muted, { color: themeColors.muted }]
          : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    fontSize: 16,
    lineHeight: 30,
    color: "#0a7ea4",
  },
  muted: {
    fontSize: 16,
  },
});
