const TELEGRAM_BOT_TOKEN = "8118895697:AAG3XziOOuaN-fVyvCqrTZ169ms0BsSp64Q";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(chatId: string, message: string) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

export async function verifyTelegramChat(chatId: string): Promise<boolean> {
  try {
    // First try to send a test message
    const response = await sendTelegramMessage(
      chatId,
      "✅ Successfully connected to ConquerDay!\n\nYou will now receive:\n• Daily habit reminders at 6:00 AM\n• Task due reminders at 10:00 PM",
    );
    return response;
  } catch {
    return false;
  }
}
