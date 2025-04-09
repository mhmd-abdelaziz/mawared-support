import React from "react";
import { useRouter } from "expo-router";
import { THEME_COLOR } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { formatToRelativeTime } from "@/utils";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedView, ThemedText } from "@/components/shared";

type Item = {
  name: string;
  content: string;
  unreadCount: number;
  created_time: string;
  company_contact_id: string;
};
interface ChatListItemProps {
  item: Item;
  isAnon?: boolean;
  showIcon?: boolean;
  hasUnreadCount?: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  item,
  isAnon,
  showIcon,
  hasUnreadCount,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (isAnon) return;
    router.push({
      pathname: `/chat/[id]`,
      params: { id: item.company_contact_id, title: item?.name },
    });
  };

  return (
    <Pressable disabled={isAnon} onPress={handlePress}>
      <ThemedView style={styles.chatItem} darkStyles={styles.chatItemDark}>
        <View style={styles.chatContainer}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          {showIcon ? (
            <Ionicons name="chevron-forward" size={20} color="#687076" />
          ) : null}
          {hasUnreadCount && item?.unreadCount ? (
            <ThemedView style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                {item.unreadCount}
              </ThemedText>
            </ThemedView>
          ) : null}
        </View>
        {item?.content ? (
          <View style={styles.chatContainer}>
            <ThemedText numberOfLines={1} style={{ color: "#687076", flex: 1 }}>
              {item.content}
            </ThemedText>
            <ThemedText style={{ color: "#687076", minWidth: 40 }}>
              {formatToRelativeTime(item.created_time)}
            </ThemedText>
          </View>
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
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 2 },
  },
  chatItemDark: {
    shadowOpacity: 0.2,
    shadowColor: "#000000",
    backgroundColor: "#212121",
  },
  chatContainer: {
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "inherit",
    justifyContent: "space-between",
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
