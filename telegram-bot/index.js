const { Telegraf } = require("telegraf");

// Initialize bot with token
const bot = new Telegraf("8118895697:AAG3XziOOuaN-fVyvCqrTZ169ms0BsSp64Q");

// Handle /start command
bot.command("start", (ctx) => {
  ctx.reply(
    "Welcome to ConquerDay Bot! 🎉\n\nTo get your chat ID, send /getchatid",
  );
});

// Handle /getchatid command
bot.command("getchatid", (ctx) => {
  const chatId = ctx.chat.id;
  ctx.reply(
    `Your chat ID is: ${chatId}\n\nCopy this number and paste it in the ConquerDay app to enable notifications.`,
  );
});

// Launch bot
bot
  .launch()
  .then(() => {
    console.log("Bot is running!");
  })
  .catch((err) => {
    console.error("Bot launch failed:", err);
  });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
