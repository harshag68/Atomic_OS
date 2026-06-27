import React, { useState } from "react";
import { Habit, HabitCategory } from "../types";
import { Plus, Sparkles, X, Brain, Dumbbell, Clock, BookOpen, AlertCircle } from "lucide-react";
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
    });

    // Reset Form
    setName("");
    setDescription("");
    setCategory("health");
    setDifficulty("easy");
    setFrequency("daily");
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
