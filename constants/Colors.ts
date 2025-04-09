/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { ThemeColors } from "./Types";

const tintColorDark = "#fff";
const tintColorLight = "#0a7ea4";
interface ColorsType {
  light: ThemeColors;
  dark: ThemeColors;
}

export const Colors: ColorsType = {
  light: {
    text: "#11181C",
    icon: "#687076",
    muted: "#687076",
    background: "#fff",
    surface: "#F7F9FA",
    tint: tintColorLight,
    tabIconSelected: tintColorLight,
  },
  dark: {
    icon: "#9BA1A6",
    text: "#ECEDEE",
    muted: "#9BA1A6",
    surface: "#212121",
    tint: tintColorDark,
    background: "#151718",
    tabIconSelected: tintColorDark,
  },
};
