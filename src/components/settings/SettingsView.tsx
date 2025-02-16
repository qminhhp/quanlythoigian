import { TelegramSettings } from "./TelegramSettings";
import { Header } from "@/components/ui/header";

export default function SettingsView() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <TelegramSettings />
      </div>
    </div>
  );
}
