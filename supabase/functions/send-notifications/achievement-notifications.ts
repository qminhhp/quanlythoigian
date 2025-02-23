import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

interface Badge {
  id: string;
  name: string;
  description: string;
}

interface UserBadge {
  badge_id: string;
  user_id: string;
}

interface UserLevel {
  user_id: string;
  level: number;
  experience: number;
}

interface TelegramSettings {
  user_id: string;
  telegram_chat_id: string;
  notify_achievements: boolean;
}

export async function handleBadgeEarned(supabaseClient: any, userBadge: UserBadge) {
  try {
    // Get user's telegram settings
    const { data: settings } = await supabaseClient
      .from("telegram_settings")
      .select("*")
      .eq("user_id", userBadge.user_id)
      .single();

    // Only proceed if user has telegram notifications enabled for achievements
    if (!settings?.notify_achievements || !settings.telegram_chat_id) {
      return;
    }

    // Get badge details
    const { data: badge } = await supabaseClient
      .from("badges")
      .select("*")
      .eq("id", userBadge.badge_id)
      .single();

    if (!badge) return;

    // Send notification
    await sendTelegramMessage(
      settings.telegram_chat_id,
      `🏆 Congratulations! You've earned the "${badge.name}" badge!\n\n${badge.description}`
    );
  } catch (error) {
    console.error("Error handling badge notification:", error);
  }
}

export async function handleLevelUp(supabaseClient: any, userLevel: UserLevel) {
  try {
    // Get user's telegram settings
    const { data: settings } = await supabaseClient
      .from("telegram_settings")
      .select("*")
      .eq("user_id", userLevel.user_id)
      .single();

    // Only proceed if user has telegram notifications enabled for achievements
    if (!settings?.notify_achievements || !settings.telegram_chat_id) {
      return;
    }

    // Send notification
    await sendTelegramMessage(
      settings.telegram_chat_id,
      `⭐ Level Up! You've reached level ${userLevel.level}!\n\nKeep up the great work!`
    );
  } catch (error) {
    console.error("Error handling level up notification:", error);
  }
}

async function sendTelegramMessage(chatId: string, message: string) {
  const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN not set");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send Telegram message: ${response.statusText}`);
  }

  return response.ok;
}
