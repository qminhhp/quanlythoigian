import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Task, UserProgress } from "@/types/task";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TaskDialog } from "./TaskDialog";
import MatrixView from "../matrix/MatrixView";
import CategoryView from "./CategoryView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendTelegramMessage } from "@/lib/telegram";

function TaskManager() {
  // Use hardcoded English strings
  const translations = {
    matrix: "Matrix",
    categories: "Categories",
    newTask: "New Task"
  };
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeView, setActiveView] = useState("matrix");
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    experience: 0,
    badges: [],
  });

  useEffect(() => {
    if (!user) return;
    fetchTasks();
    fetchUserProgress();
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from<Task>("tasks")
      .where("user_id", user?.id)
      .get();

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data || []);
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    const { data: levelData } = await supabase
      .from("user_levels")
      .where("user_id", user.id)
      .first();

    if (levelData) {
      setUserProgress((prev) => ({
        ...prev,
        level: levelData.level,
        experience: levelData.experience,
      }));
    }
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    if (!user) return;

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: data.title,
      description: data.description,
      due_date: data.due_date,
      repeat_frequency: data.repeat_frequency || "none",
      is_urgent: data.is_urgent || false,
      is_important: data.is_important || false,
      category: data.category || "uncategorized",
      completed: false,
    });

    if (error) {
      console.error("Error creating task:", error);
      return;
    }

    fetchTasks();
  };

  const handleEditTask = async (data: Partial<Task>) => {
    if (!editingTask) return;

    const { error } = await supabase
      .from("tasks")
      .where("id", editingTask.id)
      .update({
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        repeat_frequency: data.repeat_frequency,
        is_urgent: data.is_urgent,
        is_important: data.is_important,
        category: data.category,
      });

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    setEditingTask(undefined);
    fetchTasks();
  };

  const checkForBadges = async () => {
    if (!user) return;

    // Get all badges
    const { data: badges } = await supabase.from("badges").get();

    if (!badges) return;

    // Get user's earned badges
    const { data: userBadges } = await supabase
      .from("user_badges")
      .where("user_id", user.id)
      .get();

    const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id));

    // Get completed tasks count
    const { data: tasksCompletedData } = await supabase
      .from("tasks")
      .where("user_id", user.id)
      .where("completed", true)
      .count();

    const tasksCompleted = tasksCompletedData?.count || 0;

    // Get important tasks completed count
    const { data: importantTasksCompletedData } = await supabase
      .from("tasks")
      .where("user_id", user.id)
      .where("completed", true)
      .where("is_important", true)
      .count();

    const importantTasksCompleted = importantTasksCompletedData?.count || 0;

    // Check each badge
    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      switch (badge.requirement_type) {
        case "tasks_completed":
          shouldAward = tasksCompleted >= badge.requirement_value;
          break;
        case "important_tasks":
          shouldAward = importantTasksCompleted >= badge.requirement_value;
          break;
      }

      if (shouldAward) {
        await supabase.from("user_badges").insert({
          user_id: user.id,
          badge_id: badge.id,
        });

        // Send telegram notification for badge
        const { data: telegramSettings } = await supabase
          .from("telegram_settings")
          .where("user_id", user.id)
          .first();

        if (telegramSettings?.telegram_chat_id) {
          const message = `🏆 Congratulations! You've earned the "${badge.name}" badge!\n\n${badge.description}`;
          await sendTelegramMessage(telegramSettings.telegram_chat_id, message);
        }
      }
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompletedState = !task.completed;

    // Optimistically update UI
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: newCompletedState } : t
    ));

    // Update in background
    const { error } = await supabase
      .from("tasks")
      .where("id", taskId)
      .update({ completed: newCompletedState });

    if (error) {
      console.error("Error completing task:", error);
      // Revert optimistic update on error
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: !newCompletedState } : t
      ));
      return;
    }

    // Process rewards in background
    if (newCompletedState) {
      const baseXP = 10;
      const urgencyBonus = task.is_urgent ? 5 : 0;
      const importanceBonus = task.is_important ? 5 : 0;
      const totalXP = baseXP + urgencyBonus + importanceBonus;

      Promise.all([
        addExperience(totalXP),
        checkForBadges()
      ]).catch(console.error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .where("id", taskId)
      .delete();

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    fetchTasks();
  };

  const handleUpdateQuadrant = async (taskId: string, isUrgent: boolean, isImportant: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistically update UI
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, is_urgent: isUrgent, is_important: isImportant } : t
    ));

    // Update in background
    const { error } = await supabase
      .from("tasks")
      .where("id", taskId)
      .update({ is_urgent: isUrgent, is_important: isImportant });

    if (error) {
      console.error("Error updating task quadrant:", error);
      // Revert optimistic update on error
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, is_urgent: task.is_urgent, is_important: task.is_important } : t
      ));
    }
  };

  const addExperience = async (amount: number) => {
    if (!user) return;

    try {
      // First try to update existing record
      const { data: levelData, error: selectError } = await supabase
        .from("user_levels")
        .where("user_id", user.id)
        .first();

      if (selectError || !levelData) {
        // If no record exists, create one
        const { error: insertError } = await supabase
          .from("user_levels")
          .insert({
            user_id: user.id,
            level: 1,
            experience: amount,
          });
        if (insertError) throw insertError;

        setUserProgress((prev) => ({
          ...prev,
          level: 1,
          experience: amount,
        }));
        return;
      }

      const newExperience = levelData.experience + amount;
      const newLevel = Math.floor(newExperience / 100) + 1;

      const { error: updateError } = await supabase
        .from("user_levels")
        .where("user_id", user.id)
        .update({
          experience: newExperience,
          level: newLevel,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Check if leveled up
      if (newLevel > levelData.level) {
        // Send telegram notification for level up
        const { data: telegramSettings } = await supabase
          .from("telegram_settings")
          .where("user_id", user.id)
          .first();

        if (telegramSettings?.telegram_chat_id) {
          const message = `🎉 Level Up! You've reached level ${newLevel}!\n\nKeep up the great work! 💪`;
          await sendTelegramMessage(telegramSettings.telegram_chat_id, message);
        }
      }

      setUserProgress((prev) => ({
        ...prev,
        level: newLevel,
        experience: newExperience,
      }));

      console.log(
        `Added ${amount} XP. New total: ${newExperience} (Level ${newLevel})`,
      );
    } catch (error) {
      console.error("Error updating experience:", error);
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <Tabs
          value={activeView}
          onValueChange={setActiveView}
          className="w-full max-w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="matrix">{translations.matrix}</TabsTrigger>
            <TabsTrigger value="category">
              {translations.categories}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {translations.newTask}
        </Button>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsContent value="matrix">
          <MatrixView
            tasks={tasks}
            onTaskComplete={handleTaskComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsDialogOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onUpdateQuadrant={handleUpdateQuadrant}
          />
        </TabsContent>
        <TabsContent value="category">
          <CategoryView
            tasks={tasks}
            onTaskComplete={handleTaskComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsDialogOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTask(undefined);
        }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  );
}

export default TaskManager;
