import { TOKEN_KEY } from "@/constants";
import { createUploadLink } from "apollo-upload-client";
import { from, ApolloClient, InMemoryCache } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "./../node_modules/@apollo/client/link/context";

const httpLink = createUploadLink({
  uri: process.env.EXPO_PUBLIC_API_URL + "/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  // return the headers to the context so httpLink can read them
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  };
});

// const abortController = new AbortController();
// const uploadLink = createUploadLink({
// uri: process.env.EXPO_PUBLIC_API_URL + "/graphql",
// fetchOptions: {
//   signal: abortController.signal, // overwrite the default abort signal
// },
// credentials: "include",
// });

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

// Auth helper functions
export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

// Type for the authentication context
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
}
