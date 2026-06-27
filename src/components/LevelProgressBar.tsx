import React from "react";
import { UserStats } from "../types";
import { Award, Zap, Flame, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface LevelProgressBarProps {
  stats: UserStats;
}

export default function LevelProgressBar({ stats }: LevelProgressBarProps) {
  const percent = Math.min(100, Math.floor((stats.xp / stats.nextLevelXp) * 100));

  // Determine character titles based on level
  const getLevelTitle = (level: number) => {
    if (level === 1) return "Novice Habit-Builder";
    if (level === 2) return "Atomic Apprentice";
    if (level === 3) return "Streak Gladiator";
    if (level === 4) return "Consistency Virtuoso";
    return "Legendary Habit Sage";
  };

  return (
    <div id="stats-level-card" className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-orange-500/5 blur-3xl"></div>
      
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20 font-black">
            <span className="text-xl font-mono">{stats.level}</span>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">Current Status</p>
            <h3 className="font-display text-lg font-bold tracking-tight text-zinc-100 sm:text-xl uppercase">
              LEVEL {stats.level}: {getLevelTitle(stats.level)}
            </h3>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-zinc-950/60 p-3 sm:flex sm:items-center sm:gap-6 sm:bg-transparent sm:p-0">
          <div className="flex flex-col items-center px-2 sm:items-end">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Streak</span>
            <div className="flex items-center gap-1 text-orange-500 mt-0.5">
              <Flame className="h-4 w-4 fill-orange-500/20" />
              <span className="font-display font-black text-base sm:text-lg">{stats.currentStreak}d</span>
            </div>
          </div>
          <div className="flex flex-col items-center border-x border-zinc-800 px-2 sm:items-end sm:border-x-0 sm:border-l sm:pl-6">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Max Record</span>
            <div className="flex items-center gap-1 text-amber-500 mt-0.5">
              <Trophy className="h-4 w-4" />
              <span className="font-display font-black text-base sm:text-lg">{stats.maxStreak}d</span>
            </div>
          </div>
          <div className="flex flex-col items-center px-2 sm:items-end sm:border-l sm:border-zinc-800 sm:pl-6">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Completed</span>
            <div className="flex items-center gap-1 text-emerald-500 mt-0.5">
              <Zap className="h-4 w-4 fill-emerald-500/20" />
              <span className="font-display font-black text-base sm:text-lg">{stats.totalCompletions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 relative z-10">
        <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-2 uppercase tracking-wider">
          <span>XP EVOLUTION // {stats.xp} / {stats.nextLevelXp} XP</span>
          <span className="text-orange-500 font-bold">{percent}% COMPLETE</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden p-0">
          <motion.div
            className="h-full rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
