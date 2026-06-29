export type HabitCategory = "health" | "mind" | "work" | "growth" | "routine";

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  streak: number;
  xpReward: number; // XP gained per completion
  difficulty: "easy" | "medium" | "hard";
  frequency: "daily" | "weekly";
  lastCompletedDate: string | null; // "YYYY-MM-DD"
  history: string[]; // List of completed dates
  // --- Atomic Habits Concepts (James Clear) ---
  habitStackAnchor?: string; // Anchor cue: "After [anchor], I will..."
  identityFocus?: string; // Identity goal: "Shapes my identity as a [writer/athlete]"
  // --- Daily Reminders ---
  reminderTime?: string | null; // "HH:MM" local format
  reminderEnabled?: boolean;
}

export interface Badge {
  id: string;
  habitName: string;
  date: string;
  imageUrl: string;
  promptUsed: string;
  streakMilestone: number;
}

export interface UserStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  maxStreak: number;
  currentStreak: number;
  totalCompletions: number;
  lastActiveDate: string | null;
}

export interface DailyQuest {
  id: string;
  name: string;
  description: string;
  rewardXp: number;
  completed: boolean;
  progress: number;
  target: number;
  type: "completions" | "streak" | "category" | "verification";
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  title: string;
  feedback: string;
}
