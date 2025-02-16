import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const payload = await req.json();
    console.log("Received webhook payload:", payload);

    const message = payload.message || payload.edited_message;
    if (!message) {
      throw new Error("No message in request");
    }

    const { chat, text } = message;
    console.log("Processing message:", { chat_id: chat.id, text });

    if (text === "/start") {
      const response = await fetch(
        `https://api.telegram.org/bot8118895697:AAG3XziOOuaN-fVyvCqrTZ169ms0BsSp64Q/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat.id,
            text: `Welcome to ConquerDay Bot! 🎉\n\nTo get your chat ID, send /getchatid`,
            parse_mode: "HTML",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
    } else if (text === "/getchatid") {
      const response = await fetch(
        `https://api.telegram.org/bot8118895697:AAG3XziOOuaN-fVyvCqrTZ169ms0BsSp64Q/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat.id,
            text: `Your chat ID is: ${chat.id}\n\nCopy this number and paste it in the ConquerDay app to enable notifications.`,
            parse_mode: "HTML",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
