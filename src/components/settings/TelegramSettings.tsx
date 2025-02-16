import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { verifyTelegramChat } from "@/lib/telegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle } from "lucide-react";

interface TelegramSettings {
  telegram_chat_id: string | null;
  notify_habits: boolean;
  notify_tasks: boolean;
}

export function TelegramSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<TelegramSettings>({
    telegram_chat_id: null,
    notify_habits: true,
    notify_tasks: true,
  });
  const [chatId, setChatId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("telegram_settings")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (data) {
      setSettings(data);
      setChatId(data.telegram_chat_id || "");
    }
  };

  const handleVerify = async () => {
    if (!chatId) return;
    setIsVerifying(true);

    const isValid = await verifyTelegramChat(chatId);

    if (isValid) {
      const { error } = await supabase.from("telegram_settings").upsert({
        user_id: user?.id,
        telegram_chat_id: chatId,
        notify_habits: settings.notify_habits,
        notify_tasks: settings.notify_tasks,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Telegram notifications configured successfully!",
        });
        loadSettings();
      }
    } else {
      toast({
        title: "Error",
        description:
          "Invalid chat ID. Please make sure you started a chat with the bot.",
        variant: "destructive",
      });
    }

    setIsVerifying(false);
  };

  const handleToggle = async (field: "notify_habits" | "notify_tasks") => {
    const newSettings = {
      ...settings,
      [field]: !settings[field],
    };

    const { error } = await supabase.from("telegram_settings").upsert({
      user_id: user?.id,
      telegram_chat_id: settings.telegram_chat_id,
      notify_habits: newSettings.notify_habits,
      notify_tasks: newSettings.notify_tasks,
    });

    if (!error) {
      setSettings(newSettings);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-[#0088cc]" />
        <h2 className="text-xl font-semibold">Telegram Notifications</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            1. Start a chat with{" "}
            <a
              href="https://t.me/conquerday_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @conquerday_bot
            </a>
          </p>
          <p className="text-sm text-gray-500">
            2. Send{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">/getchatid</code> to
            the bot
          </p>
          <p className="text-sm text-gray-500">
            3. The bot will reply with your chat ID. Copy and paste it below:
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Enter your Telegram chat ID"
            className="flex-1"
          />
          <Button onClick={handleVerify} disabled={!chatId || isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>

        {settings.telegram_chat_id && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Daily Habit Reminders</div>
                <div className="text-sm text-gray-500">
                  Receive reminders at 6:00 AM daily
                </div>
              </div>
              <Switch
                checked={settings.notify_habits}
                onCheckedChange={() => handleToggle("notify_habits")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Task Due Reminders</div>
                <div className="text-sm text-gray-500">
                  Receive reminders at 10:00 PM the day before due date
                </div>
              </div>
              <Switch
                checked={settings.notify_tasks}
                onCheckedChange={() => handleToggle("notify_tasks")}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
