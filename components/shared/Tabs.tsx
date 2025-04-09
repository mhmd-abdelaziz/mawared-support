import React, {
  FC,
  useState,
  ReactNode,
  useContext,
  createContext,
} from "react";
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { useThemeColors } from "@/hooks";

type TabValue = number | string;

interface TabsContextType {
  activeValue: TabValue;
  styles?: TabsStyleOverrides;
  setActiveValue: (value: TabValue) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: ReactNode;
  defaultValue: TabValue;
  styles?: TabsStyleOverrides;
  onValueChange?: (value: TabValue) => void;
}

interface TabsStyleOverrides {
  tabStyle?: StyleProp<ViewStyle>;
  panelStyle?: StyleProp<ViewStyle>;
  tabTextStyle?: StyleProp<TextStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  activeTabTextStyle?: StyleProp<TextStyle>;
  tabsContainerStyle?: StyleProp<ViewStyle>;
}

const Tabs: FC<TabsProps> & {
  Tab: FC<TabProps>;
  Panel: FC<PanelProps>;
} = ({ children, defaultValue, styles: customStyles, onValueChange }) => {
  const [activeValue, setActiveValue] = useState<TabValue>(defaultValue);

  const handleActiveValue = (value: TabValue) => {
    setActiveValue(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider
      value={{
        activeValue,
        styles: customStyles,
        setActiveValue: handleActiveValue,
      }}
    >
      <ThemedView
        style={[defaultStyles.tabsContainer, customStyles?.tabsContainerStyle]}
      >
        {children}
      </ThemedView>
    </TabsContext.Provider>
  );
};

export default Tabs;

/* === Tab === */

interface TabProps {
  style?: StyleProp<ViewStyle>;
  value: TabValue;
  title: string;
}

Tabs.Tab = ({ value, title, style }) => {
  const context = useContext(TabsContext);
  if (!context) return <></>;

  const { activeValue, setActiveValue, styles } = context;
  const isActive = activeValue === value;
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity
      disabled={isActive}
      onPress={() => setActiveValue(value)}
      style={[
        defaultStyles.tab,
        { backgroundColor: themeColors.surface },
        styles?.tabStyle,
        isActive && defaultStyles.activeTab,
        isActive && styles?.activeTabStyle,
        style,
      ]}
    >
      <ThemedText
        textCenter
        type={isActive ? "link" : "default"}
        style={[styles?.tabTextStyle, isActive && styles?.activeTabTextStyle]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

/* === Panel === */

interface PanelProps {
  value: TabValue;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

Tabs.Panel = ({ value, children, style }) => {
  const context = useContext(TabsContext);
  if (!context) return <></>;

  const { activeValue, styles } = context;
  if (value !== activeValue) return null;

  return (
    <ThemedView style={[styles?.panelStyle, style]}>{children}</ThemedView>
  );
};

/* === Default Styles === */

const defaultStyles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "column",
  },
  tab: {
    padding: 12,
    opacity: 0.7,
  },
  activeTab: {
    opacity: 1,
  },
});
