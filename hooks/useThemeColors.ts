/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { ThemeColors } from "@/constants";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function useThemeColors(): ThemeColors {
  const theme = useColorScheme() ?? "light";
  return Colors[theme];
}
