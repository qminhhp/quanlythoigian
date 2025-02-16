import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreVertical, Eye, Edit, Trash2, Undo2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const { t } = useLanguage();
  const [isViewOpen, setIsViewOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2 bg-white rounded-lg p-3 shadow-sm group">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onComplete(task.id)}
            className="h-4 w-4 rounded border-gray-300"
          />
          {task.completed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => onComplete(task.id)}
            >
              <Undo2 className="h-3 w-3 mr-1" />
              {t("tasks", "undo")}
            </Button>
          )}
        </div>
        <div className="flex flex-col">
          <span
            className={
              task.completed ? "line-through text-gray-500" : "text-gray-900"
            }
          >
            {task.title}
          </span>
          {task.category && task.category !== "uncategorized" && (
            <span className="text-xs text-gray-500">{task.category}</span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            {t("tasks", "viewDetails")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4 mr-2" />
            {t("tasks", "edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("tasks", "delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("tasks", "description")}
              </h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {task.description?.split("\n").map((line, i) => (
                  <div key={i}>
                    {line.split(/\s+/).map((word, j) => {
                      if (word.startsWith("http")) {
                        return (
                          <a
                            key={j}
                            href={word}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {word}
                          </a>
                        );
                      }
                      return word + " ";
                    })}
                  </div>
                )) || "No description"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">
                  {t("tasks", "created")}
                </h4>
                <p className="text-gray-600">
                  {new Date(task.created_at).toLocaleDateString()}
                </p>
              </div>
              {task.due_date && (
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    {t("tasks", "dueDate")}
                  </h4>
                  <p className="text-gray-600">
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {task.category && (
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    {t("tasks", "category")}
                  </h4>
                  <p className="text-gray-600">{task.category}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
