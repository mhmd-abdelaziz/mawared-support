import {
  View,
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
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
          renderItem={({ item }) => <ChatListItem item={item} />}
        />
      </ThemedView>
      <FloatingButton
        iconName="add"
        onPress={() => router.push("/startChat")}
      />
    </>
  );
};

export default Index;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
