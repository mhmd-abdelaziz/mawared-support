import React from "react";
import { Stack } from "expo-router";
import { Styles } from "@/constants";
import { FlatList } from "react-native";
import { useThemeColors } from "@/hooks";
import { useQuery } from "@apollo/client";
import { GET_CONTACTS } from "@/apollo/queries";
import { ChatListItem, ThemedView } from "@/components";

interface Contact {
  name: string;
  contactUser: { id: string };
}

interface FormattedContact {
  name: string;
  company_contact_id: string;
}

const formatData = (data: Contact[] | undefined): FormattedContact[] => {
  if (!data) return [];
  return data.map((d) => ({
    name: d.name,
    company_contact_id: d.contactUser.id,
  }));
};

export default function StartChatLayout() {
  const themeColors = useThemeColors();
  const {
    loading,
    refetch,
    data: contacts,
  } = useQuery(GET_CONTACTS, {
    notifyOnNetworkStatusChange: true,
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
        <FlatList
          onRefresh={refetch}
          refreshing={loading}
          data={formatData(contacts?.generatedContacts)}
          keyExtractor={(item) => item.company_contact_id}
          renderItem={({ item }) => <ChatListItem showIcon item={item} />}
        />
      </ThemedView>
    </>
  );
}
