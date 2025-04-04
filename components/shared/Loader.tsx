import React from "react";
import ThemedView from "./ThemedView";
import { Styles, THEME_COLOR } from "@/constants";
import { ActivityIndicator, StyleSheet } from "react-native";

interface LoaderProps {
  screenLoader?: boolean;
}

const Loader = ({ screenLoader }: LoaderProps) => {
  return (
    <ThemedView
      style={screenLoader ? [Styles.screen, styles.center] : undefined}
    >
      <ActivityIndicator size="large" color={THEME_COLOR} />
    </ThemedView>
  );
};

export default Loader;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
