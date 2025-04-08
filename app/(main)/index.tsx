import {
  ThemedText,
  ThemedView,
  ChatListItem,
  FloatingButton,
  ChatsContactsListFilters,
} from "@/components";
import React from "react";
import { useAuth } from "@/hooks";
import { router } from "expo-router";
import { Styles } from "@/constants";
import { useQuery } from "@apollo/client";
import { GET_CHATS } from "@/apollo/queries";
import { Ionicons } from "@expo/vector-icons";
import { View, FlatList, TouchableOpacity } from "react-native";

const sendFilters = (filters: any) => {
  return {
    page: 1,
    input: {
      companyIds:
        filters?.company !== "all" ? [filters?.company?.id] : undefined,
    },
  };
};

const Index = () => {
  const { signOut } = useAuth();
  const [filters, setFilters] = React.useState({ company: 'all' });
  const { data, loading, refetch } = useQuery(GET_CHATS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 9999,
      ...sendFilters(filters),
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
        <ChatsContactsListFilters filters={filters} setFilters={setFilters} />
        <FlatList
          data={chats}
          onRefresh={refetch}
          refreshing={loading}
          style={{ marginTop: 10 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatListItem hasUnreadCount item={item} />}
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
