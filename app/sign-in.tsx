import {
  View,
  Alert,
  Image,
  Platform,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { router } from "expo-router";
import { useMutation } from "@apollo/client";
import { SIGN_IN } from "@/apollo/mutations";
import { ThemedText as Text } from "@/components";

export default function SignIn() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading: isLoading }] = useMutation(SIGN_IN);

  const handleSignIn = async () => {
    login({
      variables: {
        password,
        username,
        device_token: "",
        device_type: Platform.OS,
      },
      onCompleted: (res) => {
        router.replace("/");
        signIn(res?.login?.access_token, res?.login?.user);
      },
      onError: (error) => {
        const reason = error?.graphQLErrors?.[0]?.extensions?.reason;
        if (reason === "phone_verification") {
          return Alert.alert("This Phone Number is not verified.");
        }
        if (reason === "email_verification") {
          return Alert.alert("This Email Address is not verified.");
        }
        Alert.alert(
          (reason ||
            error?.graphQLErrors?.[0]?.message ||
            error?.message) as string
        );
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.headerImage}
          source={{
            uri: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
          }}
        />
      </View>

      <View style={styles.form}>
        <Text type="title" style={styles.title}>
          Welcome Back
        </Text>
        <Text type="defaultSemiBold" style={styles.subtitle}>
          Sign in to continue
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email or Phone"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          // keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 240,
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  form: {
    flex: 1,
    padding: 24,
    marginTop: -24,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    color: "#666",
    marginBottom: 32,
  },
  input: {
    height: 56,
    fontSize: 16,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
