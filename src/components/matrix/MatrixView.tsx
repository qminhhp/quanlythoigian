import { Card } from "@/components/ui/card";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MatrixViewProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function MatrixView({
  tasks = [],
  onTaskComplete,
  onEditTask,
  onDeleteTask,
}: MatrixViewProps) {
  const { t } = useLanguage();

  const getTasksByQuadrant = (isUrgent: boolean, isImportant: boolean) => {
    return tasks.filter(
      (task) =>
        task.is_urgent === isUrgent &&
        task.is_important === isImportant &&
        !task.completed,
    );
  };

  const completedTasks = tasks.filter((task) => task.completed);

  const renderQuadrant = (
    title: string,
    isUrgent: boolean,
    isImportant: boolean,
    bgColor: string,
  ) => {
    const quadrantTasks = getTasksByQuadrant(isUrgent, isImportant);
    return (
      <Card className={`${bgColor} rounded-lg overflow-hidden border-0`}>
        <div className="flex justify-between items-center p-3 border-b border-black/5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <span className="text-xs text-gray-500">
              {quadrantTasks.length}{" "}
              {quadrantTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>
        <div className="p-3 min-h-[100px]">
          {quadrantTasks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {t("tasks", "noTasks")}
            </div>
          ) : (
            <div className="space-y-2">
              {quadrantTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onTaskComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderQuadrant("Important & Urgent", true, true, "bg-[#fff1f1]")}
        {renderQuadrant("Important & Not Urgent", false, true, "bg-[#f1f6ff]")}
        {renderQuadrant("Not Important & Urgent", true, false, "bg-[#fffbf1]")}
        {renderQuadrant(
          "Not Important & Not Urgent",
          false,
          false,
          "bg-[#f1fff6]",
        )}
      </div>

      {completedTasks.length > 0 && (
        <Card className="rounded-lg border-0 overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900">
                {t("tasks", "completed")}
              </h3>
              <span className="text-xs text-gray-500">
                {completedTasks.length}{" "}
                {completedTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onTaskComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
