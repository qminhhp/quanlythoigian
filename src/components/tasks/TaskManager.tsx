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

function TaskManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
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
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id);

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
      .select("*")
      .eq("user_id", user.id)
      .single();

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

    const { error } = await supabase.from("tasks").insert([
      {
        user_id: user.id,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        repeat_frequency: data.repeat_frequency || "none",
        is_urgent: data.is_urgent || false,
        is_important: data.is_important || false,
        category: data.category || "uncategorized",
        completed: false,
      },
    ]);

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
      .update({
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        repeat_frequency: data.repeat_frequency,
        is_urgent: data.is_urgent,
        is_important: data.is_important,
        category: data.category,
      })
      .eq("id", editingTask.id);

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    setEditingTask(undefined);
    fetchTasks();
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", taskId);

    if (error) {
      console.error("Error completing task:", error);
      return;
    }

    // Add experience points when completing a task
    if (!task.completed) {
      const baseXP = 10;
      const urgencyBonus = task.is_urgent ? 5 : 0;
      const importanceBonus = task.is_important ? 5 : 0;
      const totalXP = baseXP + urgencyBonus + importanceBonus;

      await addExperience(totalXP);
    }

    fetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    fetchTasks();
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

    setUserProgress((prev) => ({
      ...prev,
      level: newLevel,
      experience: newExperience,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="matrix" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="category">Categories</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Tabs defaultValue="matrix">
        <TabsContent value="matrix">
          <MatrixView
            tasks={tasks}
            onTaskComplete={handleTaskComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsDialogOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
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
