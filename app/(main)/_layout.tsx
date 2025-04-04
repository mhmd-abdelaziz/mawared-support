import { useAuth } from "@/hooks";
import { ThemedText } from "@/components";
import { Redirect, Stack } from "expo-router";

export default function MainLayout() {
  const { token, isLoading } = useAuth();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <ThemedText>Loading...</ThemedText>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!token) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack screenOptions={{ headerShown: false }} />;
}
