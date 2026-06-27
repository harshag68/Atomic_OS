import React, { useState } from "react";
import { Habit } from "../types";
import { 
  Sparkles, 
  Atom, 
  FlaskConical, 
  ArrowRight, 
  Plus, 
  Check, 
  Activity, 
  FlaskConicalOff,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Layers,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FusedHabit {
  name: string;
  description: string;
  category: "health" | "mind" | "work" | "growth" | "routine";
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  scienceQuote: string;
}

interface LaboratoryTabProps {
  habits: Habit[];
  onAddCustomHabit: (habit: Omit<Habit, "id" | "streak" | "lastCompletedDate" | "history">) => void;
}

export default function LaboratoryTab({ habits, onAddCustomHabit }: LaboratoryTabProps) {
  const [selectedHabitAId, setSelectedHabitAId] = useState<string>("");
  const [selectedHabitBId, setSelectedHabitBId] = useState<string>("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<FusedHabit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasInjected, setHasInjected] = useState(false);

  // Filter out any invalid selections
  const habitA = habits.find(h => h.id === selectedHabitAId);
  const habitB = habits.find(h => h.id === selectedHabitBId);

  const handleSynthesize = async () => {
    if (!habitA || !habitB) {
      setError("Please select two distinct active habits to fuse.");
      return;
    }
    if (habitA.id === habitB.id) {
      setError("Fusing a habit with itself violates the compound law. Please choose distinct formulas.");
      return;
    }

    setIsSynthesizing(true);
    setError(null);
    setSynthesisResult(null);
    setHasInjected(false);

    try {
      const response = await fetch("/api/fuse-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitAName: habitA.name,
          habitADesc: habitA.description,
          habitBName: habitB.name,
          habitBDesc: habitB.description
        })
      });

      if (!response.ok) {
        throw new Error("The compound furnace overheated. Synthesis failed.");
      }

      const data = await response.json();
      setSynthesisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish secure connection to AI compound core.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleInjectToActiveList = () => {
    if (!synthesisResult) return;

    onAddCustomHabit({
      name: synthesisResult.name,
      description: synthesisResult.description,
      category: synthesisResult.category,
      xpReward: synthesisResult.xpReward,
      difficulty: synthesisResult.difficulty,
      frequency: "daily"
    });

    setHasInjected(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction */}
      <div>
        <h4 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider flex items-center gap-2">
          <FlaskConical className="h-4.5 w-4.5 text-orange-500" />
          Synaptic Fusion Laboratory
        </h4>
        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
          Welcome to the experimental containment grid. Combine separate physical or cognitive routines to forge synergistic <strong className="text-orange-500">Atomic Super-Habit Formulation</strong> formulas calculated in real-time by the Gemini AI core.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Compound Synthesis Core (7 columns) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-5">
          
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-850">
            <Atom className="h-4.5 w-4.5 text-orange-500 animate-spin" style={{ animationDuration: "8s" }} />
            <span className="font-display font-black text-xs text-zinc-200 tracking-wider uppercase">FUSION REPLICA CHAMBER</span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs uppercase font-bold font-mono tracking-wider">
              {error}
            </div>
          )}

          {/* Fusion Inputs Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Input Habit A */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Formula Core Alpha:</label>
              <select
                value={selectedHabitAId}
                onChange={(e) => {
                  setSelectedHabitAId(e.target.value);
                  setError(null);
                }}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-3.5 text-xs font-mono text-zinc-300 uppercase tracking-wide focus:outline-none focus:border-orange-500"
              >
                <option value="">-- SELECT FORMULA --</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name.toUpperCase()}</option>
                ))}
              </select>
              {habitA && (
                <p className="text-[9px] text-zinc-500 font-sans leading-relaxed mt-1 uppercase">
                  {habitA.description}
                </p>
              )}
            </div>

            {/* Input Habit B */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Formula Core Beta:</label>
              <select
                value={selectedHabitBId}
                onChange={(e) => {
                  setSelectedHabitBId(e.target.value);
                  setError(null);
                }}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-3.5 text-xs font-mono text-zinc-300 uppercase tracking-wide focus:outline-none focus:border-orange-500"
              >
                <option value="">-- SELECT FORMULA --</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name.toUpperCase()}</option>
                ))}
              </select>
              {habitB && (
                <p className="text-[9px] text-zinc-500 font-sans leading-relaxed mt-1 uppercase">
                  {habitB.description}
                </p>
              )}
            </div>

          </div>

          {/* Trigger Synthesis Button */}
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing || !selectedHabitAId || !selectedHabitBId}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 text-zinc-950 font-display font-black text-xs py-3.5 shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            <span>FUSE FORMULAS</span>
          </button>

        </div>

        {/* RIGHT PANEL: Synthesis Chamber Output (5 columns) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            
            {/* 1. Loading active state */}
            {isSynthesizing && (
              <motion.div
                key="synthesis-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden"
              >
                {/* Visual grid sweep scanner */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent w-full h-1/2 -top-1/2 animate-[bounce_3s_infinite] pointer-events-none"></div>

                <FlaskConical className="h-10 w-10 text-orange-500 animate-bounce mb-3" />
                <h5 className="font-display font-black text-xs text-zinc-200 tracking-wider uppercase">COLLISION ENGINE ONLINE</h5>
                <p className="font-mono text-[9px] text-orange-500 uppercase tracking-widest mt-1">GENESIZING MOLECULAR FORMULA BONDS...</p>
                <p className="text-[9px] text-zinc-500 uppercase mt-4 max-w-xs leading-relaxed font-mono">
                  Synthesizing neural pathways of {habitA?.name} and {habitB?.name} with advanced performance algorithms
                </p>
              </motion.div>
            )}

            {/* 2. Finished Fused Output state */}
            {!isSynthesizing && synthesisResult && (
              <motion.div
                key="synthesis-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-orange-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.06)] space-y-5"
              >
                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-850">
                  <span className="inline-block px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-[8px] font-black uppercase text-orange-400 rounded-full">
                    SYNTHESIS SUCCESSFUL
                  </span>
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">
                    +{synthesisResult.xpReward} XP REWARD
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-wider">
                    {synthesisResult.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                    {synthesisResult.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono uppercase bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                  <p>• Category: <strong className="text-zinc-200">{synthesisResult.category}</strong></p>
                  <p>• Difficulty: <strong className="text-zinc-200">{synthesisResult.difficulty}</strong></p>
                </div>

                {/* Science Quote Block */}
                <div className="p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-[9px] text-zinc-400 space-y-1 flex gap-2 items-start">
                  <Lightbulb className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                  <p className="leading-relaxed font-mono uppercase">
                    <strong className="text-emerald-400">LAB MEMO:</strong> {synthesisResult.scienceQuote}
                  </p>
                </div>

                {/* Claim Synthesis Into Active List Button */}
                {!hasInjected ? (
                  <button
                    onClick={handleInjectToActiveList}
                    className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-display font-black text-xs py-3.5 transition-all shadow-md cursor-pointer uppercase tracking-wider"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Inject Formulation into Active Dock</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                    ✨ INJECTED INTO MAIN LIST SUCCESSFULLY ✨
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. Waiting Empty state */}
            {!isSynthesizing && !synthesisResult && (
              <motion.div
                key="synthesis-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center justify-center min-h-[260px] space-y-2"
              >
                <FlaskConicalOff className="h-10 w-10 text-zinc-600 opacity-40 mb-2" />
                <h5 className="font-display font-black text-xs text-zinc-500 tracking-wider uppercase">Reactor Stage Offline</h5>
                <p className="text-[9px] text-zinc-600 font-mono max-w-xs uppercase">
                  Select formula cores from active habits to begin compilation synthesis.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
