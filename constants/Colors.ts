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
    background: "#fff",
    secBackground: "#F7F9FA",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    secBackground: "#212121",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
