import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { useQuery } from "@apollo/client";
import { GET_CHATS } from "@/apollo/queries";
import { Message, Styles } from "@/constants";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText as Text, ThemedText } from "@/components/ThemedText";

const Index = () => {
  const theme = useColorScheme() || "light";
  const { data, loading, refetch } = useQuery(GET_CHATS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 9999,
    },
  });

  const chats = data?.chats?.data || [];

  if (loading) {
    return (
      <ThemedView style={[Styles.screen, styles.center]}>
        <ActivityIndicator size="large" color="#6200EE" />
      </ThemedView>
    );
  }

  return (
    <>
      <View style={Styles.appBar}>
        <ThemedText type="title" style={{ color: "white" }}>
          Mawared
        </ThemedText>
      </View>
      <ThemedView style={Styles.screen}>
        <FlatList
          data={chats}
          onRefresh={refetch}
          refreshing={loading}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Item theme={theme} item={item} />}
        />
      </ThemedView>
    </>
  );
};

export default Index;

interface Item {
  theme: string;
  item: Message;
}

const Item = ({ item, theme }: Item) => {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: `/chat/[id]`,
          params: { id: item.company_contact_id, title: item?.name },
        })
      }
    >
      <ThemedView
        style={[styles.chatItem, theme === "dark" && styles.chatItemDark]}
      >
        <Text type="defaultSemiBold">{item.name}</Text>
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chatItem: {
    padding: 12,
    elevation: 2,
    shadowRadius: 3,
    borderRadius: 8,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowColor: "#000",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 2 },
  },
  chatItemDark: {
    shadowOpacity: 0.2,
    shadowColor: "#000000",
    backgroundColor: "#212121",
  },
});
