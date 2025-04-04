import { StyleSheet } from "react-native";

export const SCREEN_PADDING = 16;
export const  THEME_COLOR = '#3F51B5';

export const Styles = StyleSheet.create({
  appBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME_COLOR,
    paddingHorizontal: SCREEN_PADDING,
  },
  screen: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: SCREEN_PADDING,
  },
});
