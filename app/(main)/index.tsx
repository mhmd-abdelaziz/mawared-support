import {
  Tabs,
  ThemedText,
  ThemedView,
  SearchInput,
  ChatListItem,
  FloatingButton,
  ChatsContactsListFilters,
} from "@/components";
import {
  View,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { useQuery } from "@apollo/client";
import { checkPrivileges } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { Privileges, Styles } from "@/constants";
import { useAuth, useThemeColors } from "@/hooks";
import { GET_ANON_CHATS, GET_CHATS } from "@/apollo/queries";

type TabType = "chats" | "anonymous";

const sendFilters = (filters: any) => {
  return {
    page: 1,
    input: {
      companyIds:
        filters?.company !== "all" ? [filters?.company?.id] : undefined,
    },
  };
};
const sendAnonFilters = (filters: any) => {
  return {
    page: 1,
    input: {
      phone: filters?.anonPhone || undefined,
    },
  };
};

const Index = () => {
  const { user, signOut } = useAuth();
  const themeColors = useThemeColors();
  const canViewChats = checkPrivileges({
    user,
    privileges: [
      Privileges.BUSINESS_PARTNER_PRIVILEGES,
      Privileges.VIEW_WHATSAPP_COMPANIES_CHATS,
    ],
  });
  const canViewAnonChats = checkPrivileges({
    user,
    privileges: [
      Privileges.BUSINESS_PARTNER_PRIVILEGES,
      Privileges.VIEW_WHATSAPP_ANONYMOUS_CHATS,
    ],
  });
  const defaultValue =
    canViewAnonChats && !canViewChats ? "anonymous" : "chats";

  // Local State
  const [activeTab, setActiveTab] = React.useState<TabType>(defaultValue);
  const [filters, setFilters] = React.useState({
    company: "all",
    anonPhone: "",
  });

  // Server State
  const { data, loading, refetch } = useQuery(GET_CHATS, {
    notifyOnNetworkStatusChange: true,
    skip: activeTab === "anonymous" || !canViewChats,
    variables: {
      first: 9999,
      ...sendFilters(filters),
    },
    onError: (err) => {
      Alert.alert(
        (err?.graphQLErrors?.[0]?.extensions?.reason ||
          err?.graphQLErrors?.[0]?.message ||
          err?.message) as string
      );
    },
  });
  const {
    data: anonData,
    loading: anonLoading,
    refetch: anonRefetch,
  } = useQuery(GET_ANON_CHATS, {
    notifyOnNetworkStatusChange: true,
    skip: activeTab === "chats" || !canViewAnonChats,
    variables: {
      first: 9999,
      ...sendAnonFilters(filters),
    },
    onError: (err) => {
      Alert.alert(
        (err?.graphQLErrors?.[0]?.extensions?.reason ||
          err?.graphQLErrors?.[0]?.message ||
          err?.message) as string
      );
    },
  });

  // Constants
  const chats = data?.chats?.data || [];
  const anonChats = anonData?.chats?.data || [];

  return (
    <>
      {/* Header */}
      <View
        style={[
          Styles.appBar,
          { justifyContent: "space-between", alignItems: "center" },
        ]}
      >
        <ThemedText type="title" style={{ color: "white" }}>
          Mawared
        </ThemedText>
        <TouchableOpacity onPress={signOut} style={{ padding: 10 }}>
          <Ionicons name="log-out-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <Tabs
        defaultValue="chats"
        onValueChange={(value) => setActiveTab(value as TabType)}
        styles={{
          tabStyle: { flex: 1 },
          panelStyle: Styles.screen,
          tabsContainerStyle: { flex: 1 },
        }}
      >
        {canViewChats && canViewAnonChats ? (
          <View style={{ flexDirection: "row" }}>
            <Tabs.Tab value="chats" title="Chats" />
            <Tabs.Tab value="anonymous" title="Anonymous" />
          </View>
        ) : null}

        <Tabs.Panel value="chats">
          <ChatsContactsListFilters filters={filters} setFilters={setFilters} />
          <FlatList
            data={chats}
            onRefresh={refetch}
            refreshing={loading}
            style={{ marginTop: 10 }}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={!loading ? <EmptyListMessage /> : undefined}
            renderItem={({ item }) => (
              <ChatListItem hasUnreadCount item={item} />
            )}
          />

          <FloatingButton
            iconName="add"
            onPress={() => router.push("./startChat")}
          />
        </Tabs.Panel>
        <Tabs.Panel value="anonymous">
          <SearchInput
            value={filters.anonPhone}
            placeholder="Search by phone number"
            onChangeText={(anonPhone) =>
              setFilters((prev) => ({ ...prev, anonPhone }))
            }
          />
          <FlatList
            data={anonChats}
            onRefresh={anonRefetch}
            refreshing={anonLoading}
            style={{ marginTop: 10 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatListItem isAnon item={item} />}
            ListEmptyComponent={!anonLoading ? <EmptyListMessage /> : undefined}
          />
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

export default Index;

const EmptyListMessage = () => (
  <ThemedView style={styles.emptyContainer}>
    <ThemedText type="muted">No chats found</ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
