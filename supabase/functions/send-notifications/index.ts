import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { format, addDays } from "https://esm.sh/date-fns@2.30.0";

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
    const { hour } = await req.json();
    console.log(`Processing notifications for hour: ${hour}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Send habit reminders at 6 AM
    if (hour === 6) {
      console.log("Sending habit reminders...");
      const { data: habitSettings } = await supabaseClient
        .from("telegram_settings")
        .select("user_id, telegram_chat_id")
        .eq("notify_habits", true)
        .not("telegram_chat_id", "is", null);

      if (habitSettings) {
        for (const setting of habitSettings) {
          const { data: habits } = await supabaseClient
            .from("habits")
            .select("title")
            .eq("user_id", setting.user_id)
            .is("archived_at", null);

          if (habits?.length) {
            const message = `🌅 Good morning! Here are your habits for today:\n\n${habits
              .map((h) => `• ${h.title}`)
              .join("\n")}`;
            await sendTelegramMessage(setting.telegram_chat_id, message);
          }
        }
      }
    }

    // Send task reminders at 22:00 (10 PM)
    if (hour === 22) {
      console.log("Sending task reminders...");
      const tomorrow = addDays(new Date(), 1);
      const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

      const { data: taskSettings } = await supabaseClient
        .from("telegram_settings")
        .select("user_id, telegram_chat_id")
        .eq("notify_tasks", true)
        .not("telegram_chat_id", "is", null);

      if (taskSettings) {
        for (const setting of taskSettings) {
          const { data: tasks } = await supabaseClient
            .from("tasks")
            .select("title, is_urgent, is_important")
            .eq("user_id", setting.user_id)
            .eq("completed", false)
            .like("due_date", `${tomorrowStr}%`);

          if (tasks?.length) {
            const message = `🌙 Here are your tasks due tomorrow:\n\n${tasks
              .map((t) => {
                const priority = [];
                if (t.is_urgent) priority.push("⚡ Urgent");
                if (t.is_important) priority.push("⭐ Important");
                return `• ${t.title}${priority.length ? ` (${priority.join(", ")})` : ""}`;
              })
              .join("\n")}`;
            await sendTelegramMessage(setting.telegram_chat_id, message);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendTelegramMessage(chatId: string, message: string) {
  const telegramBotToken = "8118895697:AAG3XziOOuaN-fVyvCqrTZ169ms0BsSp64Q";
  const response = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    },
  );
  return response.ok;
}
