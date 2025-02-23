import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types/task";

interface Category {
  id: string;
  name: string;
  user_id: string;
}

interface CategoryViewProps {
  tasks?: Task[];
  onTaskComplete?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export default function CategoryView({
  tasks = [],
  onTaskComplete = () => {},
  onEditTask = () => {},
  onDeleteTask = () => {},
}: CategoryViewProps) {
  // Use hardcoded English strings
  const translations = {
    enterCategoryName: "Enter category name",
    addCategory: "Add Category",
    noTasks: "No tasks yet",
    uncategorized: "Uncategorized"
  };
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;

    // First check if we have any categories
    const { data, error } = await supabase
      .from<Category>("categories")
      .select("id, name")
      .where("user_id", user.id)
      .get();

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    // If no categories exist yet, create some default ones
    if (!data || data.length === 0) {
      const defaultCategories = [
        "Work",
        "Personal",
        "Shopping",
        "Health",
        "Home",
      ];

      const { error: insertError } = await supabase.from("categories").insert(
        defaultCategories.map((name) => ({
          user_id: user.id,
          name,
        }))
      );

      if (insertError) {
        console.error("Error creating default categories:", insertError);
        return;
      }

      // Fetch again after creating defaults
      const { data: newData } = await supabase
        .from<Category>("categories")
        .select("id, name")
        .where("user_id", user.id)
        .get();

      setCategories(newData || []);
    } else {
      setCategories(data);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;

    // First update all tasks in this category to be uncategorized
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .where("user_id", user.id)
      .where("category", category.name)
      .update({ category: "uncategorized" });

    if (taskUpdateError) {
      console.error("Error updating tasks:", taskUpdateError);
      return;
    }

    // Then delete the category
    const { error } = await supabase
      .from("categories")
      .where("id", categoryId)
      .delete();

    if (error) {
      console.error("Error deleting category:", error);
      return;
    }

    fetchCategories();
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !user) return;

    const { error } = await supabase.from("categories").insert({
      name: newCategory,
      user_id: user.id
    });

    if (!error) {
      setNewCategory("");
      fetchCategories();
    }
  };

  const getTasksByCategory = (categoryName: string) => {
    return tasks.filter(
      (task) => task.category === categoryName && !task.completed,
    );
  };

  const uncategorizedTasks = tasks.filter(
    (task) =>
      (!task.category || task.category === "uncategorized") && !task.completed,
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder={translations.enterCategoryName}
          className="flex-1"
        />
        <Button
          onClick={handleAddCategory}
          className="bg-[#0f172a] text-white hover:bg-[#1e293b]"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {translations.addCategory}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categories.map((category) => {
          const categoryTasks = getTasksByCategory(category.name);
          return (
            <Card
              key={category.id}
              className={`p-4 ${getBgColor(category.name)}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{category.name}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {categoryTasks.length} tasks
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {categoryTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onTaskComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
                {categoryTasks.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    {translations.noTasks}
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        <Card className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {translations.uncategorized}
            </h3>
            <span className="text-sm text-gray-500">
              {uncategorizedTasks.length} tasks
            </span>
          </div>
          <div className="space-y-2">
            {uncategorizedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onTaskComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {uncategorizedTasks.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                {translations.noTasks}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getBgColor(categoryName: string): string {
  // Create a deterministic but seemingly random color based on the category name
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use predefined pastel colors
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

  // Use the hash to select a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
