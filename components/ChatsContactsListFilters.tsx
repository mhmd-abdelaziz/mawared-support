import React from "react";
import { useThemeColors } from "@/hooks";
import { useQuery } from "@apollo/client";
import { SearchInput, Select, ThemedView } from "./shared";
import { GET_CHATS_CONTACTS_LIST_FILTERS_OPTIONS } from "@/apollo/queries";

const formatOption = (options: { id: string; name: string }[]) =>
  options ? options.map((opt) => ({ label: opt.name, value: opt.id })) : [];

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
    <ThemedView style={{ gap: 10 }}>
      <SearchInput
        value={filters.companyName}
        placeholder="Search by company name"
        onChangeText={(text) => handleFilterChange("companyName", text)}
      />

      <SearchInput
        value={filters.contactName}
        placeholder="Search by contact name"
        onChangeText={(text) => handleFilterChange("contactName", text)}
      />

      <Select
        isMulti
        hasIcon
        maxDisplayValues={2}
        selectedValues={filters.saasIds}
        placeholder="Select account managers..."
        options={formatOption(options?.accountManagers?.data)}
        onSelectionChange={(val) => handleFilterChange("saasIds", val)}
      />
    </ThemedView>
  );
};

export default ChatsContactsListFilters;
