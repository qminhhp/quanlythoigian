import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContext, UserMetadata, checkIsAdmin } from "@/lib/auth";

interface UserLevel {
  user_id: string;
  level: number;
  experience: number;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("AuthProvider rendering");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata: UserMetadata,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          displayName: metadata.displayName || metadata.username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;

    // Initialize user_levels record
    if (data.user) {
      const { error: levelsError } = await supabase.from("user_levels").insert({
        user_id: data.user.id,
        level: 1,
        experience: 0,
      });
      if (levelsError) {
        console.error("Error creating user levels:", levelsError);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign in");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }
    console.log("Sign in successful:", data);

    // Ensure user_levels record exists
    if (data.user) {
      const { data: levelData } = await supabase
        .from<UserLevel>("user_levels")
        .where("user_id", data.user.id)
        .first();

      if (!levelData) {
        const { error: levelsError } = await supabase
          .from("user_levels")
          .insert({
            user_id: data.user.id,
            level: 1,
            experience: 0,
          });
        if (levelsError) {
          console.error("Error creating user levels:", levelsError);
        }
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (metadata: UserMetadata) => {
    if (!user) throw new Error("No user");

    const { error } = await supabase.auth.updateUser({
      data: {
        raw_user_meta_data: metadata,
      },
    });

    if (error) throw error;
  };

  const isAdmin = async () => {
    if (!user) return false;
    return checkIsAdmin(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, updateProfile, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
