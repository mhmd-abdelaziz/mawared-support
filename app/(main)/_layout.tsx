import { useAuth } from "@/hooks";
import { Loader } from "@/components";
import { Privileges } from "@/constants";
import { checkPrivileges } from "@/utils";
import { Redirect, Stack } from "expo-router";

export default function MainLayout() {
  const { user, token, isLoading } = useAuth();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Loader screenLoader />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!token) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  if (
    !checkPrivileges({
      user,
      privileges: [
        Privileges.BUSINESS_PARTNER_PRIVILEGES,
        Privileges.VIEW_WHATSAPP_COMPANIES_CHATS,
        Privileges.VIEW_WHATSAPP_ANONYMOUS_CHATS,
      ],
    })
  ) {
    return <Redirect href="/+not-found" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack screenOptions={{ headerShown: false }} />;
}
