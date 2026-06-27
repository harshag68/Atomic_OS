import React, { useState, useEffect } from "react";
import { Habit } from "../types";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Smile, 
  Award, 
  Compass, 
  HelpCircle,
  Activity,
  Sparkles
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

interface CalendarTabProps {
  habits: Habit[];
}

export default function CalendarTab({ habits }: CalendarTabProps) {
  const [logs, setLogs] = useState<CompletionLog[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toLocaleDateString("en-CA")
  );

  // Load completion logs
  useEffect(() => {
    const savedLogs = localStorage.getItem("atomic_completion_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, [habits]);

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    // 0: Sunday, 1: Monday, etc. Adjust to 0: Monday for standard clean grids or keep default
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate date array
  const dayCells: Array<{ day: number | null; dateString: string | null }> = [];
  
  // Fill empty leading padding cells
  for (let i = 0; i < firstDay; i++) {
    dayCells.push({ day: null, dateString: null });
  }

  // Fill calendar days
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(d).padStart(2, "0");
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;
    dayCells.push({ day: d, dateString });
  }

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const categoryColors: Record<string, string> = {
    health: "bg-rose-500",
    mind: "bg-indigo-500",
    growth: "bg-amber-500",
    routine: "bg-emerald-500",
    work: "bg-fuchsia-500"
  };

  const selectedDateLogs = logs.filter(l => l.date === selectedDateStr);
  const totalDuration = selectedDateLogs.reduce((acc, curr) => acc + curr.timeSpent, 0);

  // Mood statistics for selected date
  const moodEmojiMap: Record<string, string> = {
    focused: "🎯 Focused",
    calm: "🧘 Calm",
    energetic: "⚡ Energetic",
    tired: "😴 Tired",
    anxious: "😔 Anxious"
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction Banner */}
      <div>
        <h4 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-orange-500" />
          Synchronized Timeline Log
        </h4>
        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
          An interactive lunar grid visualising every compound check-in. Click any cellular node to dissect your cognitive stats, logged time durations, and mental emotional states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: The Calendar Grid (8 columns) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
          
          {/* Calendar Header Controls */}
          <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
            <span className="font-display font-black text-xs text-zinc-200 tracking-widest uppercase">
              {monthNames[month]} // {year}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 text-center text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest pb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Days Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {dayCells.map((cell, idx) => {
              if (cell.day === null || !cell.dateString) {
                return <div key={`empty-${idx}`} className="aspect-square bg-transparent"></div>;
              }

              const isSelected = selectedDateStr === cell.dateString;
              const isToday = new Date().toLocaleDateString("en-CA") === cell.dateString;
              
              // Filter logs for this specific cell date
              const dayCompletions = logs.filter(l => l.date === cell.dateString);
              const hasCompletions = dayCompletions.length > 0;

              return (
                <button
                  key={cell.dateString}
                  onClick={() => setSelectedDateStr(cell.dateString!)}
                  className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between items-start border relative transition-all group/cell cursor-pointer ${
                    isSelected 
                      ? "bg-orange-500/10 border-orange-500 shadow-md scale-102" 
                      : isToday
                      ? "bg-zinc-950 border-orange-500/35 hover:bg-zinc-900"
                      : "bg-zinc-950/60 border-zinc-850/60 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  {/* Day number */}
                  <span className={`text-[10px] font-mono font-bold ${
                    isSelected ? "text-orange-400" : isToday ? "text-orange-500" : "text-zinc-400"
                  }`}>
                    {cell.day}
                  </span>

                  {/* Tiny colored dots representing completed categories */}
                  {hasCompletions && (
                    <div className="flex flex-wrap gap-1 max-w-full">
                      {dayCompletions.slice(0, 3).map((comp, cIdx) => (
                        <span 
                          key={`${comp.id}-${cIdx}`} 
                          className={`w-1.5 h-1.5 rounded-full ${categoryColors[comp.category] || "bg-orange-500"}`}
                          title={comp.habitName}
                        />
                      ))}
                      {dayCompletions.length > 3 && (
                        <span className="text-[7px] text-zinc-500 font-bold font-mono">+{dayCompletions.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Code Legend */}
          <div className="flex flex-wrap gap-4 pt-3 border-t border-zinc-850 text-[8px] font-mono uppercase tracking-widest text-zinc-500 justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Health</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>Mind</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Growth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Routine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></span>
              <span>Work</span>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Details of Selected Day (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div>
              <h5 className="font-display font-black text-[10px] text-zinc-500 uppercase tracking-widest">
                Atomic Review Panel
              </h5>
              <p className="text-xs font-bold text-zinc-200 mt-0.5">
                {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" }).toUpperCase()}
              </p>
            </div>

            {selectedDateLogs.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 space-y-2">
                <HelpCircle className="h-8 w-8 mx-auto opacity-30 text-orange-500" />
                <p className="text-[10px] font-bold uppercase tracking-wider">No logs checked off</p>
                <p className="text-[9px] font-mono">COMPLETE DOCK ACTIONS TO HYDRATE THIS TIMELINE</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Micro Stat grid */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-850/60">
                  <div>
                    <span className="text-[8px] font-mono text-zinc-500 block uppercase">Log Count</span>
                    <span className="text-sm font-display font-black text-orange-500 uppercase">
                      {selectedDateLogs.length} Checked
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-zinc-500 block uppercase">Time Logged</span>
                    <span className="text-sm font-display font-black text-zinc-100 flex items-center gap-1 uppercase">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      {totalDuration}m
                    </span>
                  </div>
                </div>

                {/* List of actions completed */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedDateLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex justify-between items-center text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${categoryColors[log.category] || "bg-orange-500"}`}></span>
                          <span className="font-bold text-zinc-200 uppercase">{log.habitName}</span>
                        </div>
                        <p className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 uppercase">
                          <Smile className="h-3 w-3 shrink-0" /> {moodEmojiMap[log.mood] || log.mood}
                        </p>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-zinc-400">
                        {log.timeSpent} mins
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inspirational Compound Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 rounded-3xl border border-zinc-850 flex gap-3.5 items-start">
            <Award className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h6 className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-wider">Compound Streak Multiplier</h6>
              <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-mono">
                Consistency compounds. Checking off habits at least 3 days a week builds standard synaptic neural paths, but 20 consecutive days results in cellular physical evolution!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
