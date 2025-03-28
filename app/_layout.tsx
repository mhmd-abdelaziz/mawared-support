import { Slot } from "expo-router";
import { client } from "@/apollo/client";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApolloProvider } from "@apollo/client";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ApolloProvider>
  );
}
