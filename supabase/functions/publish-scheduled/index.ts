import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get all scheduled posts that should be published
    const { data: posts } = await supabaseClient
      .from("blog_posts")
      .select("id")
      .eq("status", "draft")
      .lte("scheduled_for", new Date().toISOString());

    if (posts?.length) {
      // Update posts to published status
      const { error } = await supabaseClient
        .from("blog_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          scheduled_for: null,
        })
        .in(
          "id",
          posts.map((p) => p.id),
        );

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          published: posts.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        published: 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
