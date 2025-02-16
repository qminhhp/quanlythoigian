import { useState } from "react";
import { Habit } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Archive, RotateCcw, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onArchive: (habitId: string) => void;
  onUnarchive: (habitId: string) => void;
}

const MILESTONES = [1, 3, 7, 14, 21, 30, 60, 90];

export function HabitCard({
  habit,
  onComplete,
  onArchive,
  onUnarchive,
}: HabitCardProps) {
  const [showUndo, setShowUndo] = useState(false);
  const nextMilestone =
    MILESTONES.find((m) => habit.streak < m) ||
    MILESTONES[MILESTONES.length - 1];
  const progress = (habit.streak / nextMilestone) * 100;

  const handleComplete = () => {
    onComplete(habit.id);
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 5000); // Hide undo after 5 seconds
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 bg-white rounded-lg p-4 shadow-sm",
        habit.archived_at && "opacity-75",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{habit.title}</h3>
          {habit.streak >= 90 && <Trophy className="h-4 w-4 text-yellow-500" />}
        </div>
        {!habit.archived_at ? (
          <Button variant="ghost" size="sm" onClick={() => onArchive(habit.id)}>
            <Archive className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUnarchive(habit.id)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Current streak: {habit.streak} days</span>
        {habit.longest_streak > 0 && (
          <span>(Best: {habit.longest_streak})</span>
        )}
      </div>

      {!habit.archived_at && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Next milestone: {nextMilestone} days</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {MILESTONES.map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs",
                  habit.streak >= milestone
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-50 text-gray-400",
                )}
                title={`${milestone} days milestone`}
              >
                <Star className="h-3 w-3" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        {showUndo ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => {
              onComplete(habit.id);
              setShowUndo(false);
            }}
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Undo completion
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleComplete}
            disabled={
              !!habit.archived_at ||
              !!(
                habit.last_completed &&
                new Date(habit.last_completed).toDateString() ===
                  new Date().toDateString()
              )
            }
          >
            Complete for today
          </Button>
        )}
      </div>
    </div>
  );
}
