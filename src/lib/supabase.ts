import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yhcamkxphejjqlvnvebl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2Fta3hwaGVqanFsdm52ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTMzMzEsImV4cCI6MjA1NTI2OTMzMX0.jFZu8_QzmljGvJYXYZwc7J9iPe7VO3xcPAh7NW3Ut-E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
