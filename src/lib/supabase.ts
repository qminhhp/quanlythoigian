import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl ? "defined" : "undefined");
console.log("Supabase Anon Key:", supabaseAnonKey ? "defined" : "undefined");

// Fallback to hardcoded values if env vars are not available
const finalSupabaseUrl =
  supabaseUrl || "https://yhcamkxphejjqlvnvebl.supabase.co";
const finalSupabaseAnonKey =
  supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2Fta3hwaGVqanFsdm52ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTMzMzEsImV4cCI6MjA1NTI2OTMzMX0.jFZu8_QzmljGvJYXYZwc7J9iPe7VO3xcPAh7NW3Ut-E";

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey);
console.log("Supabase client initialized");
