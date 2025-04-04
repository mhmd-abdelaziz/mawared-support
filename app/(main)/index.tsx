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
import { ThemedText } from "@/components";
import { ThemedView } from "@/components";
import { GET_CHATS } from "@/apollo/queries";
import { Message, Styles } from "@/constants";

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
      <FloatingButton iconName="add" onPress={() => router.push("/startChat")} />
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
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
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
