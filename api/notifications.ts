import { createClient } from "@supabase/supabase-js";
import { format, addDays } from "date-fns";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get current UTC hour
    const currentHour = new Date().getUTCHours();
    console.log(`Processing notifications for UTC hour: ${currentHour}`);

    // Get all users with their timezones
    const { data: userSettings } = await supabase
      .from("telegram_settings")
      .select("user_id, telegram_chat_id, notify_habits, notify_tasks")
      .not("telegram_chat_id", "is", null);

    if (!userSettings) return res.status(200).json({ success: true });

    // Get user profiles with timezones
    const { data: userProfiles } = await supabase
      .from("profiles")
      .select("id, timezone")
      .in(
        "id",
        userSettings.map((s) => s.user_id)
      );

    if (!userProfiles) return res.status(200).json({ success: true });

    // Create a map of user_id to timezone
    const userTimezones = Object.fromEntries(
      userProfiles.map((p) => [p.id, p.timezone || "Etc/GMT+0"])
    );

    // Process each user according to their local time
    for (const settings of userSettings) {
      const userTimezone = userTimezones[settings.user_id] || "Etc/GMT+0";
      const userDate = new Date(new Date().toLocaleString("en-US", { timeZone: userTimezone }));
      const userHour = userDate.getHours();

      // Send habit reminders at 6 AM user's time
      if (userHour === 6 && settings.notify_habits) {
      console.log("Sending habit reminders...");
      const { data: habitSettings } = await supabase
        .from("telegram_settings")
        .select("user_id, telegram_chat_id")
        .eq("notify_habits", true)
        .not("telegram_chat_id", "is", null);

      if (habitSettings) {
        for (const setting of habitSettings) {
          const { data: habits } = await supabase
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

      const { data: taskSettings } = await supabase
        .from("telegram_settings")
        .select("user_id, telegram_chat_id")
        .eq("notify_tasks", true)
        .not("telegram_chat_id", "is", null);

      if (taskSettings) {
        for (const setting of taskSettings) {
          const { data: tasks } = await supabase
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

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
