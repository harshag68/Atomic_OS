import React, { useState } from "react";
import { Habit, HabitCategory } from "../types";
import { Plus, Sparkles, X, Brain, Dumbbell, Clock, BookOpen, AlertCircle, Bell, User2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HabitCreatorProps {
  onAddHabit: (habit: Omit<Habit, "id" | "streak" | "lastCompletedDate" | "history">) => void;
}

export default function HabitCreator({ onAddHabit }: HabitCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HabitCategory>("health");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [habitStackAnchor, setHabitStackAnchor] = useState("");
  const [identityFocus, setIdentityFocus] = useState("");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Habit name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a brief description of your habit.");
      return;
    }

    // Determine XP based on difficulty
    let xpReward = 10;
    if (difficulty === "medium") xpReward = 15;
    if (difficulty === "hard") xpReward = 25;

    onAddHabit({
      name: name.trim(),
      description: description.trim(),
      category,
      xpReward,
      difficulty,
      frequency,
      habitStackAnchor: habitStackAnchor.trim() || undefined,
      identityFocus: identityFocus.trim() || undefined,
      reminderTime: reminderEnabled ? reminderTime : null,
      reminderEnabled,
    });

    // Reset Form
    setName("");
    setDescription("");
    setCategory("health");
    setDifficulty("easy");
    setFrequency("daily");
    setHabitStackAnchor("");
    setIdentityFocus("");
    setReminderTime("08:00");
    setReminderEnabled(false);
    setError(null);
    setIsOpen(false);
  };

  const categories: { value: HabitCategory; label: string; icon: any }[] = [
    { value: "health", label: "Health", icon: Dumbbell },
    { value: "mind", label: "Mind", icon: Brain },
    { value: "growth", label: "Growth", icon: BookOpen },
    { value: "routine", label: "Routine", icon: Clock },
  ];

  return (
    <div id="habit-creator-module">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            id="forge-habit-button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 p-5 text-zinc-500 hover:text-orange-500 transition-all text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 text-orange-500" />
            <span>+ Add New Habit Blueprint</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500 fill-orange-500/10" />
                <h4 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider">Atomic Habit Forge</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs mb-4 uppercase tracking-wider font-semibold">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Habit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEEP WORK SESSION, ZONE 2 CARDIO"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Micro-Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 90 min focus / No notifications"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Select */}
                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Category Ident
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => {
                      const CatIcon = cat.icon;
                      const isSelected = category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500/50 text-orange-500 font-bold"
                              : "bg-zinc-950/40 border-zinc-800/80 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <CatIcon className="h-4.5 w-4.5 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level / Reward stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                    >
                      <option value="easy">Easy (10 XP)</option>
                      <option value="medium">Medium (15 XP)</option>
                      <option value="hard">Hard (25 XP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                      Schedule Rate
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                    >
                      <option value="daily">Daily Habit</option>
                      <option value="weekly">Weekly Habit</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* --- James Clear's Atomic Habits Integration Section --- */}
              <div className="border-t border-zinc-850 pt-4 mt-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                    Atomic Formula & Cue Configuration
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Habit Stacking */}
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1">
                      Law 1: Make It Obvious (Habit Stacking Cue)
                    </label>
                    <div className="flex items-center gap-1.5 bg-zinc-950 rounded-xl border border-zinc-850 px-3 py-2">
                      <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase shrink-0">After</span>
                      <input
                        type="text"
                        placeholder="e.g. pouring my morning coffee"
                        value={habitStackAnchor}
                        onChange={(e) => setHabitStackAnchor(e.target.value)}
                        className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none placeholder-zinc-750"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase shrink-0">, I will</span>
                    </div>
                  </div>

                  {/* Identity Focus */}
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1">
                      Identity Shift (Who do you wish to become?)
                    </label>
                    <div className="flex items-center gap-1.5 bg-zinc-950 rounded-xl border border-zinc-850 px-3 py-2">
                      <User2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase shrink-0">I am a/an</span>
                      <input
                        type="text"
                        placeholder="e.g. focused programmer / clean athlete"
                        value={identityFocus}
                        onChange={(e) => setIdentityFocus(e.target.value)}
                        className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none placeholder-zinc-750"
                      />
                    </div>
                  </div>
                </div>

                {/* Daily Reminders */}
                <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-850/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Bell className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-300">Daily Browser Cue Alarm</p>
                      <p className="text-[10px] text-zinc-500 font-mono leading-tight uppercase tracking-wider mt-0.5">
                        Triggers in-app synth chime & browser alert notifications
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-400 select-none">
                      <input
                        type="checkbox"
                        checked={reminderEnabled}
                        onChange={(e) => setReminderEnabled(e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-900 text-orange-500 focus:ring-0 cursor-pointer"
                      />
                      <span>Enable Alarm</span>
                    </label>

                    {reminderEnabled && (
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-orange-500 cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-950 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 text-zinc-950 font-display font-black text-xs px-5 py-2.5 shadow-md shadow-orange-500/10 hover:bg-orange-400 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Forge Habit Blueprint
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
