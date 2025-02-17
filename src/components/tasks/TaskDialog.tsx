import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { addDays } from "date-fns";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Task>) => void;
  task?: Task;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
}: TaskDialogProps) {
  // Use hardcoded English strings
  const translations = {
    edit: "Edit Task",
    newTask: "New Task",
    title: "Title",
    description: "Description",
    dueDate: "Due Date",
    urgent: "Urgent",
    important: "Important",
    category: "Category"
  };
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id);
      setCategories(categoriesData || []);
    };

    fetchData();
  }, [user, task]);

  const { register, handleSubmit, reset, setValue } = useForm<Partial<Task>>({
    defaultValues: {
      title: "",
      description: "",
      due_date: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().slice(0, 16);
      })(),
      is_urgent: false,
      is_important: false,
      repeat_frequency: "none" as const,

      category: "uncategorized",
    },
  });

  useEffect(() => {
    if (task) {
      setValue("title", task.title);
      setValue("description", task.description || "");
      setValue("due_date", task.due_date ? task.due_date.slice(0, 16) : "");
      setValue("is_urgent", task.is_urgent);
      setValue("is_important", task.is_important);
      setValue("repeat_frequency", task.repeat_frequency);

      setValue("category", task.category || "uncategorized");
    }
  }, [task, setValue]);

  const onSubmitForm = (data: Partial<Task>) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {task ? translations.edit : translations.newTask}
          </DialogTitle>
          <DialogDescription>
            Enter the details for your task below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{translations.title}</label>
            <Input {...register("title")} placeholder="Enter task title" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {translations.description}
            </label>
            <Textarea
              {...register("description")}
              placeholder="Enter detailed description (optional)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {translations.dueDate}
              </label>
              <Input type="datetime-local" {...register("due_date")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Repeat</label>
              <Select
                onValueChange={(
                  value: "none" | "daily" | "weekly" | "monthly",
                ) => setValue("repeat_frequency", value)}
                defaultValue={task?.repeat_frequency || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("is_urgent")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label className="text-sm font-medium">
                {translations.urgent}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("is_important")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label className="text-sm font-medium">
                {translations.important}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {translations.category}
            </label>
            <Select
              onValueChange={(value) => setValue("category", value)}
              defaultValue={task?.category || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{task ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
