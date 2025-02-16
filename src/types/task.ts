export type RepeatFrequency = "none" | "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  user_id: string;
  assignee_id?: string;
  due_date?: string;
  repeat_frequency: RepeatFrequency;
  is_urgent: boolean;
  is_important: boolean;
  category?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  created_at: string;
  archived_at?: string;
  category?: string;
  streak: number;
  longest_streak: number;
  last_completed?: string;
}

export interface UserProgress {
  level: number;
  experience: number;
  badges: string[];
}
