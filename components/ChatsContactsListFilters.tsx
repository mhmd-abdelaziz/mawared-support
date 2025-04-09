import React from "react";
import { ThemedView } from "./shared";
import { useThemeColors } from "@/hooks";
import { useQuery } from "@apollo/client";
import { StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { GET_CHATS_CONTACTS_LIST_FILTERS_OPTIONS } from "@/apollo/queries";

interface ChatsContactsListFiltersProps {
  filters: any;
  setFilters: (val: any) => void;
}

const ChatsContactsListFilters: React.FC<ChatsContactsListFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const themeColors = useThemeColors();
  const { data: options, loading: optionsLoading } = useQuery(
    GET_CHATS_CONTACTS_LIST_FILTERS_OPTIONS
  );

  const handleFilterChange = (name: string, val: any) => {
    setFilters({ ...filters, [name]: val });
  };

  return (
    <ThemedView>
      <Picker
        selectedValue={filters.company}
        style={[styles.picker, { color: themeColors.text }]}
        onValueChange={(value) => handleFilterChange("company", value)}
      >
        <Picker.Item label="Select a company..." value="all" />
        {(options?.companies || []).map((opt: { id: string; name: string }) => (
          <Picker.Item key={opt.id} label={opt.name} value={opt} />
        ))}
      </Picker>
    </ThemedView>
  );
};

export default ChatsContactsListFilters;

const styles = StyleSheet.create({
  picker: {
    padding: 10,
    width: "100%",
    borderRadius: 8,
    paddingHorizontal: 6,
    backgroundColor: "inherit",
  },
});
