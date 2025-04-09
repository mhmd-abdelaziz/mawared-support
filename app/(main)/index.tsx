import {
  ThemedText,
  ThemedView,
  ChatListItem,
  FloatingButton,
  ChatsContactsListFilters,
  SearchInput,
} from "@/components";
import {
  View,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useAuth } from "@/hooks";
import { router } from "expo-router";
import { useQuery } from "@apollo/client";
import { checkPrivileges } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { Privileges, Styles } from "@/constants";
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

  // Local State
  const [filters, setFilters] = React.useState({
    company: "all",
    anonPhone: "",
  });
  const [activeTab, setActiveTab] = React.useState<TabType>(
    canViewAnonChats && !canViewChats ? "anonymous" : "chats"
  );

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

      {/* Tabs */}
      {canViewChats && canViewAnonChats ? (
        <ThemedView style={styles.tabContainer}>
          <TouchableOpacity
            disabled={activeTab === "chats"}
            onPress={() => setActiveTab("chats")}
            style={[styles.tab, activeTab === "chats" && styles.activeTab]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "chats" && styles.activeTabText,
              ]}
            >
              Chats
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={activeTab === "anonymous"}
            onPress={() => setActiveTab("anonymous")}
            style={[styles.tab, activeTab === "anonymous" && styles.activeTab]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "anonymous" && styles.activeTabText,
              ]}
            >
              Anonymous
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : null}

      {/* Companies Chats Panel */}
      {canViewChats && activeTab === "chats" ? (
        <>
          <ThemedView style={Styles.screen}>
            <ChatsContactsListFilters
              filters={filters}
              setFilters={setFilters}
            />
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
          </ThemedView>
          <FloatingButton
            iconName="add"
            onPress={() => router.push("./startChat")}
          />
        </>
      ) : null}

      {/* Anonymous Chats Panel */}
      {canViewAnonChats && activeTab === "anonymous" ? (
        <ThemedView style={Styles.screen}>
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
            renderItem={({ item }) => <ChatListItem item={item} />}
            ListEmptyComponent={!anonLoading ? <EmptyListMessage /> : undefined}
          />
        </ThemedView>
      ) : null}
    </>
  );
};

export default Index;

const EmptyListMessage = () => (
  <ThemedView style={styles.emptyContainer}>
    <ThemedText style={styles.emptyText}>No chats found</ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  tabContainer: {
    paddingBottom: 10,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeTab: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    backgroundColor: "#212121",
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    fontSize: 16,
    color: "#687076",
  },
  activeTabText: {
    color: "#0084FF",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#687076",
  },
});
