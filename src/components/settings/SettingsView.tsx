import { TelegramSettings } from "./TelegramSettings";

export default function SettingsView() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <TelegramSettings />
    </div>
  );
}
