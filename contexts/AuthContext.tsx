import {
  setAuthUser,
  getAuthUser,
  getAuthToken,
  setAuthToken,
  removeAuthUser,
  removeAuthToken,
} from "@/apollo/client";
import type { AuthState } from "@/apollo/client";
import { useRouter, useSegments } from "expo-router";
import React, { createContext, useState, useEffect } from "react";

interface AuthContextType extends AuthState {
  signIn: (token: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  signOut: async () => {},
  signIn: async () => {},
  isAuthenticated: false,
  isLoading: true,
  token: null,
  user: null,
});

// This hook will protect the route access based on user authentication.
function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "sign-in";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace("/sign-in");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace("/");
    }
  }, [isAuthenticated, segments]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useProtectedRoute(state.isAuthenticated);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const token = await getAuthToken();
      const user = await getAuthUser();
      if (token) {
        setState({
          token,
          user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string, userData: any) => {
    try {
      await setAuthToken(token);
      await setAuthUser(userData);
      setState({
        token,
        user: userData,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await removeAuthToken();
      await removeAuthUser();
      setState({
        isAuthenticated: false,
        token: null,
        user: null,
      });
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
