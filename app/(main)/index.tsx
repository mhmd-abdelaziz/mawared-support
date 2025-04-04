import {
  ThemedText,
  ThemedView,
  ChatListItem,
  FloatingButton,
} from "@/components";
import React from "react";
import { router } from "expo-router";
import { Styles } from "@/constants";
import { useQuery } from "@apollo/client";
import { GET_CHATS } from "@/apollo/queries";
import { View, FlatList } from "react-native";

const Index = () => {
  const { data, loading, refetch } = useQuery(GET_CHATS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 9999,
    },
  });

  const chats = data?.chats?.data || [];

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
          renderItem={({ item }) => <ChatListItem item={item} />}
        />
      </ThemedView>
      <FloatingButton
        iconName="add"
        onPress={() => router.push("./startChat")}
      />
    </>
  );
};

export default Index;
