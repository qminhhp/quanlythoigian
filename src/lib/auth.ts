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

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
