import React, { useState, useEffect } from "react";
import { Habit, Badge } from "../types";
import { 
  Archive, 
  RotateCcw, 
  History, 
  Sparkles, 
  Trash2, 
  Filter, 
  Calendar,
  Smile,
  Clock,
  LayoutGrid,
  TrendingUp,
  Award
} from "lucide-react";
import { motion } from "motion/react";

interface CompletionLog {
  id: string;
  habitId: string;
  habitName: string;
  category: string;
  date: string;
  mood: string;
  timeSpent: number;
}

interface ArchiveTabProps {
  habits: Habit[];
  archivedHabits: Habit[];
  onRestoreHabit: (habitId: string) => void;
  onDeleteArchivedHabit: (habitId: string) => void;
  badges: Badge[];
}

export default function ArchiveTab({ 
  habits, 
  archivedHabits, 
  onRestoreHabit, 
  onDeleteArchivedHabit,
  badges
}: ArchiveTabProps) {
  const [logs, setLogs] = useState<CompletionLog[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const savedLogs = localStorage.getItem("atomic_completion_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, [habits]);

  const filteredLogs = filterCategory === "all" 
    ? logs 
    : logs.filter(l => l.category === filterCategory);

  const moodEmojis: Record<string, string> = {
    focused: "🎯 Focused",
    calm: "🧘 Calm",
    energetic: "⚡ Energetic",
    tired: "😴 Tired",
    anxious: "😔 Anxious"
  };

  const categoryColors: Record<string, string> = {
    health: "border-rose-500/20 text-rose-400 bg-rose-500/5",
    mind: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
    growth: "border-amber-500/20 text-amber-400 bg-amber-500/5",
    routine: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
    work: "border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-500/5"
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction */}
      <div>
        <h4 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider flex items-center gap-2">
          <Archive className="h-4.5 w-4.5 text-orange-500" />
          Atomic Repository & Archive
        </h4>
        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
          The continuous database vault. View chronological habit completion logs, manage paused configurations, and analyze historical milestones earned since registration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Chronicled Completion logs (8 columns) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-orange-500" />
              <span className="font-display font-black text-xs text-zinc-200 tracking-wider uppercase">Chronicled Completion Logs</span>
            </div>

            {/* Category selection */}
            <div className="flex gap-1.5 overflow-x-auto max-w-full">
              {["all", "health", "mind", "growth", "routine", "work"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                    filterCategory === cat
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                      : "bg-zinc-950 text-zinc-500 border-zinc-855 hover:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Logs scroll container */}
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-zinc-600 space-y-2">
              <History className="h-8 w-8 mx-auto opacity-35 text-orange-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Historical Logs Empty</p>
              <p className="text-[9px] font-mono">COMPLETE DOCK HABITS TO REPLICATE DATA HERE</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto pr-1 space-y-2">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3.5 bg-zinc-950/60 border border-zinc-850/60 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs uppercase"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[7px] font-mono border ${categoryColors[log.category] || "border-zinc-800 text-zinc-400 bg-zinc-900"}`}>
                        {log.category}
                      </span>
                      <span className="font-display font-black text-zinc-200 tracking-wide">{log.habitName}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {log.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Smile className="h-3 w-3" /> {moodEmojis[log.mood] || log.mood}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-850/80 font-mono text-[9px] text-zinc-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      {log.timeSpent} mins
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COMPONENT: Paused/Archived habits & overall statistics (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Paused Formulas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-3.5">
            <div>
              <h5 className="font-display font-black text-[10px] text-zinc-500 uppercase tracking-widest">
                PAUSED CONFIGURATIONS
              </h5>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Archived habits stored inside the database. Restoring them relocates them immediately back to your primary dock.
              </p>
            </div>

            {archivedHabits.length === 0 ? (
              <div className="text-center py-6 text-zinc-600 space-y-1">
                <Archive className="h-6 w-6 mx-auto opacity-35 text-orange-500" />
                <p className="text-[9px] font-bold uppercase tracking-wider">No paused items</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {archivedHabits.map((h) => (
                  <div 
                    key={h.id} 
                    className="p-3 bg-zinc-950 border border-zinc-850/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-zinc-200 truncate uppercase">{h.name}</p>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase">Streak: {h.streak} Days</p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onRestoreHabit(h.id)}
                        title="Restore configuration to Active Dock"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 cursor-pointer transition-colors border border-zinc-850"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteArchivedHabit(h.id)}
                        title="Delete permanently from Database"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 cursor-pointer transition-colors border border-zinc-850"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Statistics Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 rounded-3xl border border-zinc-850 space-y-3">
            <h5 className="font-display font-black text-[10px] text-zinc-500 uppercase tracking-widest">
              DATABASE GENERAL STATS
            </h5>

            <div className="space-y-2.5 font-mono text-[9px] uppercase tracking-wide">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-zinc-500">Total Check-Ins</span>
                <span className="text-zinc-200">{logs.length} Completions</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-zinc-500">Energy Accumulated</span>
                <span className="text-zinc-200">{logs.reduce((acc, curr) => acc + curr.timeSpent, 0)} Total Mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Synthesized Badges</span>
                <span className="text-zinc-200">{badges.length} Unlocked</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
