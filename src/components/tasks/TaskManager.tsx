import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Task } from "@/types/task";
import BadgeView from "../badges/BadgeView";
import HabitView from "../habits/HabitView";
import MatrixView from "@/components/matrix/MatrixView";
import { Button } from "@/components/ui/button";
import CategoryView from "./CategoryView";
import { Dialog } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { NavTabs } from "@/components/ui/nav-tabs";
import { TaskDialog } from "./TaskDialog";

const TABS = [
  { id: "priority", label: "Priority Matrix" },
  { id: "category", label: "Categories" },
  { id: "habits", label: "Habits" },
  { id: "badges", label: "Badges" },
];

export default function TaskManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("priority");
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .or(`user_id.eq.${user.id},assignee_id.eq.${user.id}`);

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      setTasks(data);
    };

    fetchTasks();

    const subscription = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        fetchTasks,
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    experience: 0,
    badges: [],
  });

  const handleAddEditTask = async (data: Partial<Task>) => {
    if (!user) return;

    const taskData = {
      title: data.title || "",
      description: data.description || "",
      is_urgent: Boolean(data.is_urgent),
      is_important: Boolean(data.is_important),
      assignee_id: data.assignee_id || undefined,
      user_id: user.id,
      due_date: data.due_date || null,
      repeat_frequency: data.repeat_frequency || "none",
      category: data.category || "uncategorized",
      completed: false,
    };
    if (editingTask) {
      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", editingTask.id);

      if (error) {
        console.error("Error updating task:", error);
        return;
      }
      setEditingTask(undefined);
    } else {
      const { error } = await supabase.from("tasks").insert([taskData]);

      if (error) {
        console.error("Error creating task:", error);
        return;
      }
    }
  };

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const checkAndAwardBadges = async (userId: string, taskId: string) => {
    const { data: stats } = await supabase
      .from("tasks")
      .select("count(*)")
      .eq("user_id", userId)
      .eq("completed", true);

    const completedCount = stats?.[0]?.count || 0;

    // Check for completion badges
    const { data: badges } = await supabase
      .from("badges")
      .select("*")
      .eq("category", "tasks")
      .lte("requirement_value", completedCount);

    // Award new badges
    if (badges) {
      for (const badge of badges) {
        const { data: existing } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", userId)
          .eq("badge_id", badge.id)
          .single();

        if (!existing) {
          await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
          });

          // Show toast for new badge
          toast({
            title: `🎉 New Badge Unlocked!`,
            description: `${badge.name} - ${badge.description}`,
            duration: 5000,
          });
        }
      }
    }
  };

  const handleTaskXPAndBadges = async (taskId: string): Promise<void> => {
    if (!user) return;

    const taskToUpdate = tasks.find((t) => t.id === taskId);
    if (!taskToUpdate) return;

    let xp = 10; // Base XP
    if (taskToUpdate.is_urgent) xp += 5;
    if (taskToUpdate.is_important) xp += 5;
    if (taskToUpdate.description) xp += 2; // Bonus for detailed tasks
    if (taskToUpdate.category && taskToUpdate.category !== "uncategorized")
      xp += 3;

    // Add streak bonus
    const now = new Date();
    const hour = now.getHours();
    if (hour < 7) xp += 5; // Early bird bonus
    if (hour >= 22) xp += 5; // Night owl bonus
    if (now.getDay() === 0 || now.getDay() === 6) xp += 3; // Weekend bonus

    try {
      // Update user level
      const { data: levelData } = await supabase
        .from("user_levels")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!levelData) {
        await supabase.from("user_levels").insert({
          user_id: user.id,
          level: 1,
          experience: xp,
        });
      } else {
        const newExperience = levelData.experience + xp;
        const newLevel = Math.floor(newExperience / 100) + 1;

        await supabase
          .from("user_levels")
          .update({
            experience: newExperience,
            level: newLevel,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (newLevel > levelData.level) {
          toast({
            title: "🎉 Level Up!",
            description: `You've reached level ${newLevel}!`,
            duration: 5000,
          });
        }
      }

      // Check and award badges
      await checkAndAwardBadges(user.id, taskId);
    } catch (error) {
      console.error("Error updating user progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const newCompletedState = !taskToUpdate.completed;

    // Update in Supabase
    const { error } = await supabase
      .from("tasks")
      .update({ completed: newCompletedState })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    // Update local state immediately for UI responsiveness
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: newCompletedState };
        }
        return task;
      }),
    );

    // Handle XP and badges in a separate async function
    if (newCompletedState && user) {
      try {
        await handleTaskXPAndBadges(taskId);
      } catch (error) {
        console.error("Error handling XP and badges:", error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Organize tasks by priority</h1>
        <Button
          className="bg-[#0f172a] text-white hover:bg-[#1e293b]"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <NavTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "priority" && (
          <MatrixView
            tasks={tasks}
            onTaskComplete={handleTaskComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {activeTab === "category" && (
          <CategoryView
            tasks={tasks}
            onTaskComplete={handleTaskComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {activeTab === "habits" && <HabitView />}
        {activeTab === "badges" && <BadgeView />}

        <TaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleAddEditTask}
          task={editingTask}
        />
      </div>
    </div>
  );
}
