import { StyleSheet } from "react-native";

export const SCREEN_PADDING = 16;

export const Styles = StyleSheet.create({
  appBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3F51B5",
    paddingHorizontal: SCREEN_PADDING,
  },
  screen: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: SCREEN_PADDING,
  },
});
