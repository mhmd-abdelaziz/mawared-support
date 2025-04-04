import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { ThemedView, ThemedText } from "@/components";

type Item = {
  name: string;
  company_contact_id: string;
};
interface ChatListItemProps {
  item: Item;
  showIcon?: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ item, showIcon }) => {
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
});
