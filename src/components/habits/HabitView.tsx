import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { HabitCard } from "./HabitCard";
import { HabitDialog } from "./HabitDialog";
import { Habit } from "@/types/task";

export default function HabitView() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching habits:", error);
      return;
    }

    setHabits(data || []);
  };

  const handleCreateHabit = async (data: Partial<Habit>) => {
    if (!user) return;

    const { error } = await supabase.from("habits").insert([
      {
        user_id: user.id,
        title: data.title,
        description: data.description,
        frequency: data.frequency || "daily",
        streak: 0,
        longest_streak: 0,
      },
    ]);

    if (error) {
      console.error("Error creating habit:", error);
      return;
    }

    fetchHabits();
  };

  const addExperience = async (amount: number) => {
    if (!user) return;

    const { data: levelData } = await supabase
      .from("user_levels")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!levelData) {
      await supabase.from("user_levels").insert({
        user_id: user.id,
        level: 1,
        experience: amount,
      });
      return;
    }

    const newExperience = levelData.experience + amount;
    const newLevel = Math.floor(newExperience / 100) + 1;

    await supabase
      .from("user_levels")
      .update({
        experience: newExperience,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  };

  const handleComplete = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = new Date();
    const lastCompleted = habit.last_completed
      ? new Date(habit.last_completed)
      : null;

    // Toggle completion
    const isUndoing =
      lastCompleted && lastCompleted.toDateString() === today.toDateString();

    if (isUndoing) {
      // Undo completion
      const { error } = await supabase
        .from("habits")
        .update({
          last_completed: null,
          streak: Math.max(0, habit.streak - 1),
        })
        .eq("id", habitId);

      if (error) {
        console.error("Error undoing habit completion:", error);
        return;
      }
    } else {
      // Complete habit
      let newStreak = 1;
      if (lastCompleted) {
        const daysSinceLastCompletion = Math.floor(
          (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceLastCompletion <= 1) {
          newStreak = habit.streak + 1;
        }
      }

      const { error } = await supabase
        .from("habits")
        .update({
          last_completed: today.toISOString(),
          streak: newStreak,
          longest_streak: Math.max(newStreak, habit.longest_streak),
        })
        .eq("id", habitId);

      if (error) {
        console.error("Error completing habit:", error);
        return;
      }

      // Add experience points
      const baseXP = 10;
      const streakBonus = Math.floor(newStreak / 7) * 5; // +5 XP per week of streak
      const milestoneBonus = MILESTONES.includes(newStreak) ? 20 : 0; // +20 XP for reaching milestones
      const totalXP = baseXP + streakBonus + milestoneBonus;

      await addExperience(totalXP);
    }

    fetchHabits();
  };

  const handleArchive = async (habitId: string) => {
    const { error } = await supabase
      .from("habits")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", habitId);

    if (error) {
      console.error("Error archiving habit:", error);
      return;
    }

    fetchHabits();
  };

  const handleUnarchive = async (habitId: string) => {
    const { error } = await supabase
      .from("habits")
      .update({ archived_at: null })
      .eq("id", habitId);

    if (error) {
      console.error("Error unarchiving habit:", error);
      return;
    }

    fetchHabits();
  };

  const activeHabits = habits.filter((h) => !h.archived_at);
  const archivedHabits = habits.filter((h) => h.archived_at);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      </div>

      <div className="space-y-4">
        {(showArchived ? archivedHabits : activeHabits).map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onComplete={handleComplete}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
          />
        ))}
        {(showArchived ? archivedHabits : activeHabits).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {showArchived
              ? "No archived habits"
              : "No active habits. Create one to get started!"}
          </div>
        )}
      </div>

      <HabitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateHabit}
      />
    </div>
  );
}

const MILESTONES = [1, 3, 7, 14, 21, 30, 60, 90];
