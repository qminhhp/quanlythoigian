import { Card } from "@/components/ui/card";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/tasks/TaskCard";

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
        className={`${bgColor} rounded-2xl overflow-hidden border-0 shadow-sm`}
      >
        <div className="flex justify-between items-center p-4 border-b border-black/5">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">
            {quadrantTasks.length} tasks
          </span>
        </div>
        <div className="p-4 min-h-[300px]">
          {quadrantTasks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No tasks yet
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
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
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

      <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium text-gray-900">Completed Tasks</h3>
          <span className="text-sm text-gray-500">
            {completedTasks.length} completed tasks
          </span>
        </div>
        <div className="p-4">
          {completedTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No completed tasks yet
            </div>
          ) : (
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
          )}
        </div>
      </Card>
    </div>
  );
}
