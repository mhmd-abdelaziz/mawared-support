import { useEffect } from "react";
import { Slot } from "expo-router";
import * as Updates from "expo-updates";
import { client } from "@/apollo/client";
import { ApolloProvider } from "@apollo/client";
import { AuthProvider } from "@/contexts/AuthContext";

const checkForUpdates = async () => {
  if (__DEV__) return;

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
  }
};

export default function Root() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  // Set up the auth context and render our layout inside of it.
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ApolloProvider>
  );
}
