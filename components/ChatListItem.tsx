import React from "react";
import { useRouter } from "expo-router";
import { THEME_COLOR } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { ThemedView, ThemedText } from "@/components/shared";

type Item = {
  name: string;
  unreadCount: number;
  company_contact_id: string;
};
interface ChatListItemProps {
  item: Item;
  showIcon?: boolean;
  hasUnreadCount?: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  item,
  showIcon,
  hasUnreadCount,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: `/chat/[id]`,
      params: { id: item.company_contact_id, title: item?.name },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView style={styles.chatItem} darkStyles={styles.chatItemDark}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        {showIcon ? (
          <Ionicons name="chevron-forward" size={20} color="#687076" />
        ) : null}
        {hasUnreadCount ? (
          <ThemedView style={styles.badge}>
            <ThemedText style={styles.badgeText}>{item.unreadCount}</ThemedText>
          </ThemedView>
        ) : null}
      </ThemedView>
    </Pressable>
  );
};

export default ChatListItem;

const styles = StyleSheet.create({
  chatItem: {
    padding: 12,
    elevation: 2,
    shadowRadius: 3,
    borderRadius: 8,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 2 },
  },
  chatItemDark: {
    shadowOpacity: 0.2,
    shadowColor: "#000000",
    backgroundColor: "#212121",
  },
  badge: {
    height: 25,
    minWidth: 25,
    borderRadius: 25 / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME_COLOR,
  },
  badgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
