import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth, UserMetadata } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Header } from "@/components/ui/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
  { value: "Etc/GMT+12", label: "UTC -12 Baker Island, Howland Island" },
  { value: "Etc/GMT+11", label: "UTC -11 American Samoa, Niue" },
  { value: "Etc/GMT+10", label: "UTC -10 Hawaii, French Polynesia" },
  { value: "Etc/GMT+9", label: "UTC -9 Alaska" },
  { value: "Etc/GMT+8", label: "UTC -8 Pacific Time (US & Canada)" },
  { value: "Etc/GMT+7", label: "UTC -7 Mountain Time (US & Canada)" },
  { value: "Etc/GMT+6", label: "UTC -6 Central Time (US & Canada)" },
  { value: "Etc/GMT+5", label: "UTC -5 Eastern Time (US & Canada)" },
  { value: "Etc/GMT+4", label: "UTC -4 Atlantic Time (Canada)" },
  { value: "Etc/GMT+3", label: "UTC -3 Buenos Aires, Sao Paulo" },
  { value: "Etc/GMT+2", label: "UTC -2 Fernando de Noronha" },
  { value: "Etc/GMT+1", label: "UTC -1 Cape Verde Islands" },
  { value: "Etc/GMT+0", label: "UTC +0 London, Dublin, Lisbon" },
  { value: "Etc/GMT-1", label: "UTC +1 Berlin, Paris, Rome" },
  { value: "Etc/GMT-2", label: "UTC +2 Cairo, Jerusalem, Athens" },
  { value: "Etc/GMT-3", label: "UTC +3 Moscow, Baghdad, Kuwait" },
  { value: "Etc/GMT-4", label: "UTC +4 Dubai, Baku, Tbilisi" },
  { value: "Etc/GMT-5", label: "UTC +5 Karachi, Tashkent" },
  { value: "Etc/GMT-6", label: "UTC +6 Dhaka, Almaty" },
  { value: "Etc/GMT-7", label: "UTC +7 Bangkok, Hanoi, Jakarta" },
  { value: "Etc/GMT-8", label: "UTC +8 Singapore, Hong Kong, Taipei" },
  { value: "Etc/GMT-9", label: "UTC +9 Tokyo, Seoul, Osaka" },
  { value: "Etc/GMT-10", label: "UTC +10 Sydney, Melbourne, Brisbane" },
  { value: "Etc/GMT-11", label: "UTC +11 Solomon Islands, New Caledonia" },
  { value: "Etc/GMT-12", label: "UTC +12 Auckland, Wellington, Fiji" },
];

interface Profile {
  id: string;
  display_name: string;
  phone: string;
  timezone: string;
}

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<UserMetadata>();

  useEffect(() => {
    if (!user) return;

    // Load initial data from user metadata
    if (user.user_metadata) {
      setValue("username", user.user_metadata.username);
      setValue("displayName", user.user_metadata.displayName);
      setValue("phone", user.user_metadata.phone);
      setValue("timezone", user.user_metadata.timezone);
    }

    // Load data from profiles table
    const loadProfile = async () => {
      const { data } = await supabase
        .from<Profile>("profiles")
        .where("id", user.id)
        .first();

      if (data) {
        setValue("username", data.display_name);
        setValue("displayName", data.display_name);
        setValue("phone", data.phone);
        setValue("timezone", data.timezone);
      }
    };

    loadProfile();
  }, [user, setValue]);

  useEffect(() => {
    if (!user) return;

    const fetchAssignedTasks = async () => {
      const { data } = await supabase
        .from<Task>("tasks")
        .where("assignee_id", user.id)
        .where("completed", false)
        .get();

      setAssignedTasks(data || []);
    };

    fetchAssignedTasks();

    // Subscribe to changes
    const channel = supabase.channel("tasks");
    channel.subscribe((payload) => {
      if (payload.new?.assignee_id === user.id) {
        fetchAssignedTasks();
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const onSubmit = async (data: UserMetadata) => {
    try {
      await updateProfile({
        displayName: data.displayName,
        phone: data.phone,
        timezone: data.timezone,
      });
      // Update the profile table as well
      if (user) {
        const { error } = await supabase.from<Profile>("profiles").insert({
          id: user.id,
          display_name: data.displayName,
          phone: data.phone,
          timezone: data.timezone,
        });
        if (error) throw error;

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            displayName: data.displayName,
            phone: data.phone,
            timezone: data.timezone,
          },
        });
        if (updateError) throw updateError;

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Group tasks by category
  const tasksByCategory = assignedTasks.reduce<Record<string, Task[]>>(
    (acc, task) => {
      const category = task.category || "uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    },
    {},
  );

  const handleTaskComplete = async (taskId: string) => {
    const { error } = await supabase
      .from<Task>("tasks")
      .where("id", taskId)
      .update({ completed: true });

    if (error) {
      console.error("Error completing task:", error);
      return;
    }

    setAssignedTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Personal Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                {...register("username")}
                disabled
                className="bg-gray-100 cursor-not-allowed text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input {...register("displayName")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input {...register("phone")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Select
                onValueChange={(value) => setValue("timezone", value)}
                defaultValue={user?.user_metadata?.timezone}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              Update Profile
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Assigned Tasks</h2>
          {Object.entries(tasksByCategory).map(([category, tasks]) => (
            <Card key={category} className={`p-4 ${getBgColor(category)}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {category === "uncategorized" ? "Uncategorized" : category}
                </h3>
                <span className="text-sm text-gray-500">
                  {tasks.length} tasks
                </span>
              </div>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleTaskComplete}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </Card>
          ))}
          {assignedTasks.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No tasks assigned yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getBgColor(categoryName: string): string {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "bg-[#fff1f1]", // Light red
    "bg-[#f1f6ff]", // Light blue
    "bg-[#fffbf1]", // Light yellow
    "bg-[#f1fff6]", // Light green
    "bg-[#fff1fb]", // Light pink
    "bg-[#f1fcff]", // Light cyan
    "bg-[#f7f1ff]", // Light purple
    "bg-[#fff4f1]", // Light orange
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
