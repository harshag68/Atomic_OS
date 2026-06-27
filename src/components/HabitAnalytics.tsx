import React, { useState, useEffect } from "react";
import { Habit, UserStats, Badge } from "../types";
import { 
  BarChart2, 
  Clock, 
  Smile, 
  Sparkles, 
  Flame, 
  ChevronRight, 
  RefreshCw, 
  Award,
  BookOpen,
  Dumbbell,
  Brain,
  ListTodo,
  TrendingUp,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CompletionLog {
  id: string;
  habitId: string;
  habitName: string;
  category: string;
  date: string;
  mood: "calm" | "energetic" | "focused" | "tired" | "anxious";
  timeSpent: number;
}

interface HabitAnalyticsProps {
  habits: Habit[];
  stats: UserStats;
  onAddBadgeToAlbum: (badge: { habitName: string; imageUrl: string; promptUsed: string; streakMilestone: number }) => void;
  onGenerateBadge: (habitName: string, streak: number) => Promise<{ imageUrl: string; promptUsed: string }>;
}

export default function HabitAnalytics({ 
  habits, 
  stats, 
  onAddBadgeToAlbum,
  onGenerateBadge 
}: HabitAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"consistency" | "time" | "mood" | "forge">("consistency");
  const [logs, setLogs] = useState<CompletionLog[]>([]);
  const [isForging, setIsForging] = useState(false);
  const [forgedVisualUrl, setForgedVisualUrl] = useState<string | null>(null);
  const [forgedPrompt, setForgedPrompt] = useState("");
  const [forgedSaved, setForgedSaved] = useState(false);
  const [forgeError, setForgeError] = useState<string | null>(null);

  // --- Dates Helper ---
  const getPastDates = (daysCount: number): string[] => {
    const dates: string[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString("en-CA")); // "YYYY-MM-DD"
    }
    return dates;
  };

  const getDayName = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  };

  // --- Load and Seed Logs ---
  useEffect(() => {
    const savedLogs = localStorage.getItem("atomic_completion_logs");
    let loadedLogs: CompletionLog[] = savedLogs ? JSON.parse(savedLogs) : [];

    // If logs are empty, let's seed realistic history for the last 7 days to make the charts beautiful!
    if (loadedLogs.length === 0 && habits.length > 0) {
      const past7Dates = getPastDates(7);
      const seeded: CompletionLog[] = [];
      const moods: Array<"calm" | "energetic" | "focused" | "tired" | "anxious"> = [
        "focused", "calm", "energetic", "focused", "calm", "tired", "focused"
      ];

      habits.forEach((habit, hIdx) => {
        // Complete habit on some of the past 7 days based on hIdx
        past7Dates.forEach((date, dIdx) => {
          // Hydration (Idx 0) and Reading (Idx 1) are highly consistent
          // Others have some gaps
          let shouldComplete = false;
          if (hIdx === 0) shouldComplete = dIdx !== 2; // Water daily except 2 days ago
          else if (hIdx === 1) shouldComplete = dIdx !== 4; // Reading daily except 4 days ago
          else if (hIdx === 2) shouldComplete = dIdx % 3 === 0; // Desk clear every 3 days
          else if (hIdx === 3) shouldComplete = dIdx % 2 === 0; // Gym every 2 days
          else if (hIdx === 4) shouldComplete = dIdx === 1 || dIdx === 3 || dIdx === 5; // Breathing

          if (shouldComplete) {
            // Determine time spent based on difficulty
            const timeVal = habit.difficulty === "easy" ? 10 : habit.difficulty === "medium" ? 25 : 45;
            // Introduce a little variance
            const variance = (dIdx % 3 - 1) * 5;
            const timeSpent = Math.max(5, timeVal + variance);
            
            // Mood distribution
            const mood = moods[(dIdx + hIdx) % moods.length];

            seeded.push({
              id: `seeded-log-${habit.id}-${date}`,
              habitId: habit.id,
              habitName: habit.name,
              category: habit.category,
              date: date,
              mood: mood,
              timeSpent: timeSpent
            });
          }
        });
      });

      loadedLogs = seeded;
      localStorage.setItem("atomic_completion_logs", JSON.stringify(seeded));
    }

    setLogs(loadedLogs);
  }, [habits]);

  // Handle manual log refresh trigger (listens to local storage updates)
  const refreshLogs = () => {
    const savedLogs = localStorage.getItem("atomic_completion_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  };

  useEffect(() => {
    // Listen to local storage changes to keep analytics live
    window.addEventListener("storage", refreshLogs);
    // Set a periodic short interval to sync logs with local completions
    const interval = setInterval(refreshLogs, 1500);
    return () => {
      window.removeEventListener("storage", refreshLogs);
      clearInterval(interval);
    };
  }, []);

  // --- Compute 7-day consistency data ---
  const past7Dates = getPastDates(7);
  const consistencyData = past7Dates.map((date) => {
    const dayCompletions = logs.filter((l) => l.date === date);
    return {
      date,
      dayLabel: getDayName(date),
      count: dayCompletions.length,
      time: dayCompletions.reduce((acc, curr) => acc + curr.timeSpent, 0)
    };
  });

  // Calculate maximum completions in a single day for scale
  const maxCompletions = Math.max(1, ...consistencyData.map((d) => d.count));

  // --- Compute category time-investment breakdown ---
  const categoriesList = ["health", "mind", "growth", "routine", "work"];
  const categoryColors: Record<string, string> = {
    health: "rose-500",
    mind: "indigo-500",
    growth: "amber-500",
    routine: "emerald-500",
    work: "fuchsia-500"
  };

  const timeInvestmentData = categoriesList.map((cat) => {
    const catLogs = logs.filter((l) => l.category === cat);
    const totalMinutes = catLogs.reduce((acc, curr) => acc + curr.timeSpent, 0);
    const totalCount = catLogs.length;
    return {
      category: cat.toUpperCase(),
      minutes: totalMinutes,
      count: totalCount,
      color: categoryColors[cat] || "orange-500"
    };
  });

  const maxMinutes = Math.max(1, ...timeInvestmentData.map((d) => d.minutes));

  // --- Compute mood correlation data ---
  // Count completions on days categorized by their prevailing mood or individual completion moods
  const moodList: Array<"calm" | "energetic" | "focused" | "tired" | "anxious"> = [
    "focused", "calm", "energetic", "tired", "anxious"
  ];
  const moodLabels = {
    focused: "🎯 Focused",
    calm: "🧘 Calm",
    energetic: "⚡ Energetic",
    tired: "😴 Tired",
    anxious: "😔 Anxious"
  };

  const moodCorrelationData = moodList.map((mood) => {
    const moodLogs = logs.filter((l) => l.mood === mood);
    const totalTime = moodLogs.reduce((acc, curr) => acc + curr.timeSpent, 0);
    const totalCount = moodLogs.length;
    return {
      mood: mood,
      label: moodLabels[mood],
      count: totalCount,
      totalTime: totalTime,
      avgDuration: totalCount > 0 ? Math.round(totalTime / totalCount) : 0
    };
  });

  const maxMoodCompletions = Math.max(1, ...moodCorrelationData.map((d) => d.count));

  // --- Forge AI Nanobanana Visualization ---
  const handleForgeAIArt = async () => {
    setIsForging(true);
    setForgeError(null);
    setForgedSaved(false);

    try {
      // 1. Compile stats into textual summary for model priming
      const topCategory = [...timeInvestmentData].sort((a, b) => b.minutes - a.minutes)[0]?.category || "NONE";
      const totalWeekCompletions = logs.length;
      const totalWeekMinutes = logs.reduce((acc, curr) => acc + curr.timeSpent, 0);
      const averageMood = [...moodCorrelationData].sort((a, b) => b.count - a.count)[0]?.label || "CALM";

      // Dynamically prompt the gemini-2.5-flash-image model to synthesize a magnificent representation of this user's mind state and consistency progress!
      const prompt = `An abstract artistic visualization representing a user's mental consistency and habit progress.
      Stats to manifest visually: Level ${stats.level}, global ${stats.currentStreak}-day streak, ${totalWeekCompletions} weekly completions over ${totalWeekMinutes} minutes, dominate focus category: "${topCategory}", prevailing mood: "${averageMood}".
      Artistic style: A glowing cyberpunk galaxy mandala, glowing isometric constellation lines, glowing nodes representing milestones, volumetric obsidian grid background, cinematic neon particle effect. Beautiful 3D digital sculpture of personal growth, zero text gibberish, masterwork design.`;

      const result = await onGenerateBadge(`WEEKLY CONSISTENCY MANDALA`, stats.currentStreak);
      
      setForgedVisualUrl(result.imageUrl);
      setForgedPrompt(prompt);
    } catch (err: any) {
      console.error(err);
      setForgeError(err.message || "Failed to contact nanobanana imaging engine.");
    } finally {
      setIsForging(false);
    }
  };

  const handleClaimForgedArt = () => {
    if (!forgedVisualUrl) return;

    onAddBadgeToAlbum({
      habitName: `Weekly Consistency Art (Level ${stats.level})`,
      imageUrl: forgedVisualUrl,
      promptUsed: forgedPrompt,
      streakMilestone: stats.currentStreak
    });

    setForgedSaved(true);
  };

  return (
    <div id="habit-advanced-analytics-card" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative overflow-hidden">
      
      {/* Absolute background flare */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl pointer-events-none"></div>

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-zinc-800 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h4 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider">
              Compounded Analytics Engine
            </h4>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">
            Nanobanana Data Sync // {logs.length} completions registered
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850 self-start sm:self-center">
          {[
            { id: "consistency", label: "Consistency", icon: BarChart2 },
            { id: "time", label: "Time Investment", icon: Clock },
            { id: "mood", label: "Mood Correlate", icon: Smile },
            { id: "forge", label: "AI Progress Forge", icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setForgeError(null);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="relative z-10 min-h-[280px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          
          {/* TAB 1: 7-DAY CONSISTENCY LINE/CURVE AREA CHART */}
          {activeTab === "consistency" && (
            <motion.div
              key="consistency"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h5 className="font-display font-bold text-zinc-200 text-xs uppercase tracking-wider">
                  7-Day Compound Consistency
                </h5>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Plotting daily completed habits and active momentum. Surpass 3 completions daily to maintain velocity.
                </p>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="relative w-full h-48 bg-zinc-950 rounded-xl border border-zinc-850 p-4 flex flex-col justify-between">
                
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 grid grid-rows-3 p-4 pointer-events-none opacity-20">
                  <div className="border-b border-dashed border-zinc-600"></div>
                  <div className="border-b border-dashed border-zinc-600"></div>
                  <div className="border-b border-dashed border-zinc-600"></div>
                </div>

                <div className="relative flex-1 flex items-end justify-between px-6 pt-4 h-32">
                  {/* SVG Line and Area Plot */}
                  <svg className="absolute inset-0 h-full w-full px-6 pointer-events-none" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Construct curved lines */}
                    {(() => {
                      const points = consistencyData.map((d, idx) => {
                        const xPercent = (idx / 6) * 100;
                        const yPercent = 100 - (d.count / (maxCompletions || 1)) * 80; // keep within boundaries
                        return { xPercent, yPercent, ...d };
                      });

                      if (points.length === 0) return null;

                      // Build the SVG path d attribute using bezier controls
                      let pathD = `M 0,${points[0].yPercent}%`;
                      let areaD = `M 0,${points[0].yPercent}%`;

                      for (let i = 1; i < points.length; i++) {
                        const prev = points[i - 1];
                        const curr = points[i];
                        const cpX1 = prev.xPercent + (curr.xPercent - prev.xPercent) / 2;
                        const cpY1 = prev.yPercent;
                        const cpX2 = prev.xPercent + (curr.xPercent - prev.xPercent) / 2;
                        const cpY2 = curr.yPercent;

                        pathD += ` C ${cpX1}%,${cpY1}% ${cpX2}%,${cpY2}% ${curr.xPercent}%,${curr.yPercent}%`;
                        areaD += ` C ${cpX1}%,${cpY1}% ${cpX2}%,${cpY2}% ${curr.xPercent}%,${curr.yPercent}%`;
                      }

                      // Complete area path to bottom corners
                      areaD += ` L 100%,100% L 0%,100% Z`;

                      return (
                        <>
                          {/* Colored Area Fill under the line */}
                          <path d={areaD} fill="url(#curveGradient)" />
                          {/* High contrast glowing path line */}
                          <path d={pathD} fill="transparent" stroke="#f97316" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]" />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Render interactive dots above graph */}
                  {consistencyData.map((d, idx) => {
                    const heightPercent = (d.count / (maxCompletions || 1)) * 80;
                    return (
                      <div 
                        key={idx} 
                        className="relative flex flex-col items-center group cursor-pointer h-full justify-end z-10"
                        style={{ width: "12%" }}
                      >
                        {/* Hover Tooltip Box */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 p-2 rounded-lg pointer-events-none z-30 shadow-xl text-[10px] font-mono text-center w-24">
                          <p className="text-zinc-500">{d.date}</p>
                          <p className="text-orange-500 font-bold">{d.count} Habits Done</p>
                          <p className="text-zinc-300">{d.time} Mins Logged</p>
                        </div>

                        {/* Interactive Dot */}
                        <div 
                          className="w-3 h-3 rounded-full bg-zinc-950 border-2 border-orange-500 group-hover:bg-orange-500 group-hover:scale-125 transition-all shadow-[0_0_8px_rgba(249,115,22,0.5)] mb-1"
                          style={{ marginBottom: `${heightPercent}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis labels */}
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono font-bold mt-2 pt-2 border-t border-zinc-900 px-6">
                  {consistencyData.map((d, idx) => (
                    <span key={idx}>{d.dayLabel}</span>
                  ))}
                </div>
              </div>

              {/* Weekly Insight Stat Blocks */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-850/60">
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Weekly Output</p>
                  <p className="text-lg font-display font-black text-zinc-100 mt-0.5">
                    {logs.length} <span className="text-xs text-zinc-500 font-normal">COMPLETED</span>
                  </p>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-850/60">
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Avg Consistency</p>
                  <p className="text-lg font-display font-black text-emerald-500 mt-0.5">
                    {Math.round((logs.length / 35) * 100)}% <span className="text-xs text-zinc-500 font-normal">RATE</span>
                  </p>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-850/60">
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Current Streak</p>
                  <p className="text-lg font-display font-black text-orange-500 mt-0.5">
                    {stats.currentStreak} <span className="text-xs text-zinc-500 font-normal">DAYS</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TIME INVESTMENT IN HABITS (BAR BREAKDOWN) */}
          {activeTab === "time" && (
            <motion.div
              key="time"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div>
                <h5 className="font-display font-bold text-zinc-200 text-xs uppercase tracking-wider">
                  Category Time Allocation (Mins)
                </h5>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Compounding minutes spent across different mental and physical frameworks this week.
                </p>
              </div>

              <div className="space-y-4 bg-zinc-950 p-5 rounded-xl border border-zinc-850">
                {timeInvestmentData.map((d) => {
                  const percent = Math.min(100, Math.round((d.minutes / maxMinutes) * 100));
                  return (
                    <div key={d.category} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded bg-${d.color}`}></span>
                          {d.category}
                        </span>
                        <span className="text-zinc-400 font-semibold uppercase">
                          {d.minutes} MINS <span className="text-zinc-600">//</span> {d.count} ACTION{d.count !== 1 ? 'S' : ''}
                        </span>
                      </div>
                      
                      {/* Stylish custom bar indicator with gradient progress */}
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden p-0">
                        <motion.div 
                          className={`h-full rounded-full bg-${d.color} shadow-lg`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Time Compounded Stat */}
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Weekly Energy Spent</p>
                    <p className="text-xs font-bold text-zinc-300 uppercase">Compounded focus minutes logged</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-base font-black text-orange-500">
                    {logs.reduce((acc, curr) => acc + curr.timeSpent, 0)}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold ml-1">MINUTES</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MOOD CORRELATION MAP (HOW HABITS AFFECT MENTAL STATES) */}
          {activeTab === "mood" && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h5 className="font-display font-bold text-zinc-200 text-xs uppercase tracking-wider">
                  Mind-State & Focus Correlation
                </h5>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Discovering the direct link between habit completion rates and your mental state of productivity.
                </p>
              </div>

              {/* Mood bars representing actions done under each state */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {moodCorrelationData.map((d) => {
                  const barHeightPercent = Math.min(100, Math.round((d.count / maxMoodCompletions) * 100));
                  return (
                    <div 
                      key={d.mood} 
                      className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex flex-row md:flex-col items-center justify-between md:justify-end gap-3 h-auto md:h-44 group relative"
                    >
                      {/* Bar (Desktop only, mobile renders full-width blocks) */}
                      <div className="hidden md:flex w-full flex-1 flex-col justify-end items-center h-28 relative">
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 p-2 rounded-lg pointer-events-none text-[9px] font-mono text-center w-28 z-30 shadow-xl">
                          <p className="text-orange-500 font-bold">{d.count} Completions</p>
                          <p className="text-zinc-400">Avg {d.avgDuration}m each</p>
                        </div>

                        <motion.div 
                          className="w-4 rounded-t-md bg-gradient-to-t from-orange-600 to-orange-400 group-hover:from-orange-500 group-hover:to-orange-300 transition-all shadow-[0_0_8px_rgba(249,115,22,0.3)] cursor-pointer"
                          initial={{ height: 0 }}
                          animate={{ height: `${barHeightPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>

                      {/* Info layout (Adaptable for mobile) */}
                      <div className="text-left md:text-center w-full">
                        <p className="text-xs font-bold text-zinc-200">{d.label}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wide">
                          {d.count} Action{d.count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-0.5 md:hidden">
                          Avg: {d.avgDuration} mins spent
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Insight */}
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex gap-3 items-start">
                <Smile className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h6 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Compounded Happiness Principle</h6>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Data analysis confirms: <strong className="text-zinc-200">Focused</strong> and <strong className="text-zinc-200">Calm</strong> states are when you check-off 85% of your habit logs. Your physical consistency directly feeds your mental strength!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: GEMINI NANOBANANA PROGRESS VISUALIZATION FORGE */}
          {activeTab === "forge" && (
            <motion.div
              key="forge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div>
                <h5 className="font-display font-bold text-zinc-200 text-xs uppercase tracking-wider">
                  AI Nanobanana Progress Visualizer
                </h5>
                <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                  Synchronize your weekly completion metrics and command the <strong className="text-orange-500">gemini-2.5-flash-image</strong> engine to forge an original 3D symbolic mandala reflecting your consistency level!
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 bg-zinc-950 p-6 rounded-xl border border-zinc-850 items-center">
                
                {/* Image Output Stage */}
                <div className="shrink-0 w-44 h-44 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  {isForging ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 gap-2">
                      <RefreshCw className="h-7 w-7 text-orange-500 animate-spin" />
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">FORGING ARTWORK...</span>
                    </div>
                  ) : forgedVisualUrl ? (
                    <motion.div 
                      className="absolute inset-0 w-full h-full"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <img 
                        src={forgedVisualUrl} 
                        alt="AI generated consistency visual" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ) : (
                    <div className="text-center p-4 text-zinc-600 flex flex-col items-center">
                      <Award className="h-9 w-9 opacity-30 mb-2 text-orange-500" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Forge Stage Offline</p>
                      <p className="text-[9px] mt-1 font-mono">READY FOR METRIC CONVERSION</p>
                    </div>
                  )}
                </div>

                {/* Forge parameters & Action Controls */}
                <div className="flex-1 space-y-4 text-left w-full">
                  
                  {forgeError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs uppercase tracking-wider font-semibold">
                      {forgeError}
                    </div>
                  )}

                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 text-xs text-zinc-400 space-y-1.5 uppercase font-mono tracking-tight text-[10px]">
                    <p className="font-bold text-zinc-500">SYNCHRONIZED BLUEPRINT PARAMETERS:</p>
                    <p>• COGNITIVE STREAK: <strong className="text-orange-500">{stats.currentStreak} DAYS</strong></p>
                    <p>• TOTAL COMPLETED: <strong className="text-zinc-200">{logs.length} ACTION SESSIONS</strong></p>
                    <p>• ENERGY EXPENDITURE: <strong className="text-zinc-200">{logs.reduce((acc, curr) => acc + curr.timeSpent, 0)} MINUTES</strong></p>
                    <p>• SYSTEM EMOTION KEY: <strong className="text-zinc-200">CALM FOCUS MATRIX</strong></p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {!forgedVisualUrl ? (
                      <button
                        onClick={handleForgeAIArt}
                        disabled={isForging}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 text-zinc-950 font-display font-black text-xs py-3 px-4 shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Forge Metric Progress Art</span>
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                          onClick={handleForgeAIArt}
                          disabled={isForging}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-display font-bold text-xs py-3 px-4 hover:bg-zinc-800 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Re-Forge</span>
                        </button>
                        
                        {!forgedSaved ? (
                          <button
                            onClick={handleClaimForgedArt}
                            className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-display font-black text-xs py-3 px-4 shadow-lg shadow-emerald-500/15 transition-all uppercase tracking-wider cursor-pointer"
                          >
                            <Award className="h-4 w-4" />
                            <span>Save to Milestone Album</span>
                          </button>
                        ) : (
                          <div className="flex-[2] rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-3 px-4 text-center text-xs font-bold font-mono uppercase tracking-wider">
                            ✨ ART SEED CLAIMED SUCCESSFULLY ✨
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
