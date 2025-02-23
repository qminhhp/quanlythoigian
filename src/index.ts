/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      // Health check endpoint
      if (url.pathname === "/api/health") {
        const result = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM nguoi_dung"
        ).first();
        
        return new Response(JSON.stringify({
          status: "ok",
          message: "Kết nối thành công với D1 Database",
          totalUsers: result.total
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // SQL query endpoint
      if (url.pathname === "/api/query" && request.method === "POST") {
        const body = await request.json() as { sql: string; params?: any[] };
        const { sql, params } = body;
        
        if (!sql) {
          throw new Error("SQL query is required");
        }

        const stmt = env.DB.prepare(sql);
        if (params && Array.isArray(params)) {
          stmt.bind(...params);
        }
        
        const result = await stmt.all();
        return new Response(JSON.stringify(result.results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Default response for unknown endpoints
      return new Response("API Quản Lý Thời Gian với D1", {
        headers: { ...corsHeaders, "Content-Type": "text/plain;charset=UTF-8" }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        status: "error",
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  },
};
