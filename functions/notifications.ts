import { createClient } from "@supabase/supabase-js";
import { format, addDays } from "date-fns";
import type { ScheduledEvent, ExecutionContext } from "@cloudflare/workers-types";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
}

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
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

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    try {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

      // Get current UTC hour
      const currentHour = new Date().getUTCHours();
      console.log(`Processing notifications for UTC hour: ${currentHour}`);

      // Get all users with their timezones
      const { data: userSettings } = await supabase
        .from("telegram_settings")
        .select("user_id, telegram_chat_id, notify_habits, notify_tasks")
        .not("telegram_chat_id", "is", null);

      if (!userSettings) return;

      // Get user profiles with timezones
      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("id, timezone")
        .in(
          "id",
          userSettings.map((s: { user_id: string }) => s.user_id)
        );

      if (!userProfiles) return;

      // Create a map of user_id to timezone
      const userTimezones = Object.fromEntries(
        userProfiles.map((p: { id: string; timezone: string | null }) => [p.id, p.timezone || "Etc/GMT+0"])
      );

      // Process each user according to their local time
      for (const settings of userSettings) {
        const userTimezone = userTimezones[settings.user_id] || "Etc/GMT+0";
        const userDate = new Date(new Date().toLocaleString("en-US", { timeZone: userTimezone }));
        const userHour = userDate.getHours();

        // Send habit reminders at 6 AM user's time
        if (userHour === 6 && settings.notify_habits) {
          console.log(`Sending habit reminders for user ${settings.user_id}...`);
          const { data: habits } = await supabase
            .from("habits")
            .select("title")
            .eq("user_id", settings.user_id)
            .is("archived_at", null);

          if (habits?.length) {
            const message = `🌅 Good morning! Here are your habits for today:\n\n${habits
              .map((h: { title: string }) => `• ${h.title}`)
              .join("\n")}`;
            await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, settings.telegram_chat_id, message);
          }
        }

        // Send task reminders at 22:00 (10 PM)
        if (userHour === 22 && settings.notify_tasks) {
          console.log(`Sending task reminders for user ${settings.user_id}...`);
          const tomorrow = addDays(new Date(), 1);
          const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

          const { data: tasks } = await supabase
            .from("tasks")
            .select("title, is_urgent, is_important")
            .eq("user_id", settings.user_id)
            .eq("completed", false)
            .like("due_date", `${tomorrowStr}%`);

          if (tasks?.length) {
            const message = `🌙 Here are your tasks due tomorrow:\n\n${tasks
              .map((t: { title: string; is_urgent: boolean; is_important: boolean }) => {
                const priority: string[] = [];
                if (t.is_urgent) priority.push("⚡ Urgent");
                if (t.is_important) priority.push("⭐ Important");
                return `• ${t.title}${priority.length ? ` (${priority.join(", ")})` : ""}`;
              })
              .join("\n")}`;
            await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, settings.telegram_chat_id, message);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },
};
