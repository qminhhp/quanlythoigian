import { createClient } from "@supabase/supabase-js";
import { format, addDays } from "date-fns";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function sendTelegramMessage(chatId, message) {
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

async function sendNotifications(hour) {
  console.log(`Processing notifications for hour: ${hour}`);

  // Send habit reminders at 6 AM
  if (hour === 6) {
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
}

// Get the current hour from command line argument or use current hour
const hour = process.argv[2]
  ? parseInt(process.argv[2])
  : new Date().getHours();

// Run notifications
sendNotifications(hour)
  .then(() => {
    console.log("Notifications sent successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error sending notifications:", error);
    process.exit(1);
  });
