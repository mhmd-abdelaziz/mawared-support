import { createUploadLink } from "apollo-upload-client";
import { from, ApolloClient, InMemoryCache } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser, Configs, TOKEN_KEY, AUTH_DATA_KEY } from "@/constants";
import { setContext } from "./../node_modules/@apollo/client/link/context";

const httpLink = createUploadLink({
  uri: Configs.appUrl + "/graphql",
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

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

/*
  Auth Token helper functions
*/

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

/*
  Auth Data helper functions
*/

export const setAuthUser = async (user: AuthUser) => {
  try {
    await AsyncStorage.setItem(AUTH_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting auth user:", error);
  }
};

export const getAuthUser = async () => {
  try {
    const user = await AsyncStorage.getItem(AUTH_DATA_KEY);
    return JSON.parse(user || "{}");
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
};

export const removeAuthUser = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_DATA_KEY);
  } catch (error) {
    console.error("Error removing auth user:", error);
  }
};

// Type for the authentication context
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser;
}
