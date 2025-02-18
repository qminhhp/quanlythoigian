import { Card } from "@/components/ui/card";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/tasks/TaskCard";

interface MatrixViewProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateQuadrant?: (taskId: string, isUrgent: boolean, isImportant: boolean) => void;
}

export default function MatrixView({
  tasks = [],
  onTaskComplete,
  onEditTask,
  onDeleteTask,
  onUpdateQuadrant,
}: MatrixViewProps) {
  // Use hardcoded strings
  const translations = {
    noTasks: "No tasks",
    completed: "Completed"
  };

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
      <Card 
        className={`${bgColor} rounded-lg overflow-hidden border-0`}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.opacity = '0.7';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.opacity = '1';
          const taskId = e.dataTransfer.getData('taskId');
          if (taskId && onUpdateQuadrant) {
            onUpdateQuadrant(taskId, isUrgent, isImportant);
          }
        }}
      >
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
              {translations.noTasks}
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
                  onDragEnd={onUpdateQuadrant ? (task, isUrgent, isImportant) => 
                    onUpdateQuadrant(task.id, isUrgent, isImportant)
                  : undefined}
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
        {renderQuadrant("Quan trọng & Khẩn cấp", true, true, "bg-[#fff1f1]")}
        {renderQuadrant(
          "Quan trọng & Không khẩn cấp",
          false,
          true,
          "bg-[#f1f6ff]",
        )}
        {renderQuadrant(
          "Không quan trọng & Khẩn cấp",
          true,
          false,
          "bg-[#fffbf1]",
        )}
        {renderQuadrant(
          "Không quan trọng & Không khẩn cấp",
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
                {translations.completed}
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
