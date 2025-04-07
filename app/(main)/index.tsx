import {
  ThemedText,
  ThemedView,
  ChatListItem,
  FloatingButton,
} from "@/components";
import React from "react";
import { useAuth } from "@/hooks";
import { router } from "expo-router";
import { Styles } from "@/constants";
import { useQuery } from "@apollo/client";
import { GET_CHATS } from "@/apollo/queries";
import { Ionicons } from "@expo/vector-icons";
import { View, FlatList, TouchableOpacity } from "react-native";

const Index = () => {
  const { signOut } = useAuth();
  const { data, loading, refetch } = useQuery(GET_CHATS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 9999,
    },
  });

  const chats = data?.chats?.data || [];

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <View
        style={[
          Styles.appBar,
          { justifyContent: "space-between", alignItems: "center" },
        ]}
      >
        <ThemedText type="title" style={{ color: "white" }}>
          Mawared
        </ThemedText>
        <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
          <Ionicons name="log-out-outline" size={30} color="white" />
        </TouchableOpacity>
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
