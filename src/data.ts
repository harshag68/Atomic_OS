import { Habit, UserStats, DailyQuest } from "./types";

export const INITIAL_HABITS: Habit[] = [
  {
    id: "habit-1",
    name: "Hydration Ritual",
    description: "Drink a full glass of water immediately after waking up to activate organs.",
    category: "health",
    streak: 3,
    xpReward: 10,
    difficulty: "easy",
    frequency: "daily",
    lastCompletedDate: "2026-06-25", // Yesterday
    history: ["2026-06-23", "2026-06-24", "2026-06-25"],
  },
  {
    id: "habit-2",
    name: "The Golden Page",
    description: "Read exactly one page of a non-fiction book every day to build a reading identity.",
    category: "growth",
    streak: 5,
    xpReward: 15,
    difficulty: "medium",
    frequency: "daily",
    lastCompletedDate: "2026-06-25", // Yesterday
    history: ["2026-06-21", "2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25"],
  },
  {
    id: "habit-3",
    name: "The 5-Minute Clear",
    description: "Clear and organize my desk environment before starting my primary work session.",
    category: "routine",
    streak: 0,
    xpReward: 15,
    difficulty: "easy",
    frequency: "daily",
    lastCompletedDate: null,
    history: [],
  },
  {
    id: "habit-4",
    name: "Iron Pump",
    description: "Perform 20 clean, focused pushups or standard bodyweight squats.",
    category: "health",
    streak: 1,
    xpReward: 20,
    difficulty: "medium",
    frequency: "daily",
    lastCompletedDate: "2026-06-25",
    history: ["2026-06-25"],
  },
  {
    id: "habit-5",
    name: "Mindful Breathing",
    description: "Close my eyes and focus solely on 10 deep diaphragmatic breaths to reset nervous system.",
    category: "mind",
    streak: 0,
    xpReward: 10,
    difficulty: "easy",
    frequency: "daily",
    lastCompletedDate: null,
    history: [],
  }
];

export const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 130,
  nextLevelXp: 300,
  maxStreak: 5,
  currentStreak: 5,
  totalCompletions: 9,
  lastActiveDate: "2026-06-25",
};

export const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: "quest-1",
    name: "Triple Threat",
    description: "Complete any 3 atomic habits today",
    rewardXp: 40,
    completed: false,
    progress: 1,
    target: 3,
    type: "completions",
  },
  {
    id: "quest-2",
    name: "Eye of the Inspector",
    description: "Verify any habit completion using an AI progress photo upload",
    rewardXp: 60,
    completed: false,
    progress: 0,
    target: 1,
    type: "verification",
  },
  {
    id: "quest-3",
    name: "The Scholar",
    description: "Complete at least one Mind or Growth category habit today",
    rewardXp: 30,
    completed: false,
    progress: 1,
    target: 1,
    type: "category",
  }
];
