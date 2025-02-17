import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export interface UserMetadata {
  username?: string;
  displayName?: string;
  phone?: string;
  country?: string;
  timezone?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata: UserMetadata,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (metadata: UserMetadata) => Promise<void>;
}

// Provide default values for the context
const defaultAuthState: AuthState = {
  user: null,
  loading: true,
  signUp: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signIn: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signOut: async () => {
    throw new Error("AuthProvider not initialized");
  },
  updateProfile: async () => {
    throw new Error("AuthProvider not initialized");
  },
};

export const AuthContext = createContext<AuthState>(defaultAuthState);

export function useAuth() {
  return useContext(AuthContext);
}
