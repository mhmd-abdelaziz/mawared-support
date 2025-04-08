import {
  ThemedView,
  ChatListItem,
  ChatsContactsListFilters,
} from "@/components";
import React from "react";
import { Stack } from "expo-router";
import { Styles } from "@/constants";
import { FlatList } from "react-native";
import { useThemeColors } from "@/hooks";
import { useQuery } from "@apollo/client";
import { GET_CONTACTS } from "@/apollo/queries";

interface Contact {
  name: string;
  contactUser: { id: string };
}

interface FormattedContact {
  name: string;
  company_contact_id: string;
}

const sendFilters = (filters: any) => {
  return {
    companyId: filters?.company?.id,
  };
};
const formatData = (data: Contact[] | undefined): FormattedContact[] => {
  if (!data) return [];
  return data.map((d) => ({
    name: d.name,
    company_contact_id: d.contactUser.id,
  }));
};

export default function StartChatLayout() {
  const themeColors = useThemeColors();
  const [filters, setFilters] = React.useState({ company: 'all' });
  const {
    loading,
    refetch,
    data: contacts,
  } = useQuery(GET_CONTACTS, {
    notifyOnNetworkStatusChange: true,
    variables: sendFilters(filters),
  });

  return (
    <>
      <Stack.Screen
        options={{
          animation: "none",
          headerShown: true,
          title: "Start a Chat",
          headerTintColor: themeColors.tint,
          headerStyle: { backgroundColor: themeColors.background },
        }}
      />
      <ThemedView style={Styles.screen}>
        <ChatsContactsListFilters filters={filters} setFilters={setFilters} />
        <FlatList
          onRefresh={refetch}
          refreshing={loading}
          style={{ marginTop: 10 }}
          data={formatData(contacts?.generatedContacts)}
          keyExtractor={(item) => item.company_contact_id}
          renderItem={({ item }) => <ChatListItem showIcon item={item} />}
        />
      </ThemedView>
    </>
  );
}
