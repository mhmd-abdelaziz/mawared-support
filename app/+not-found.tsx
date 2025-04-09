import { useAuth } from "@/hooks";
import { Styles } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText, ThemedView } from "@/components";
import { View, StyleSheet, TouchableOpacity } from "react-native";

export default function NotFoundScreen() {
  const { signOut } = useAuth();

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

      {/* Body */}
      <ThemedView style={[Styles.screen, styles.container]}>
        <ThemedText textCenter type="title">
          This screen doesn't exist or don't have a privilege to access.
        </ThemedText>
        {/* <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link> */}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
