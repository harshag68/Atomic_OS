import React from "react";
import { DailyQuest } from "../types";
import { CheckCircle2, Circle, Target, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DailyQuestsListProps {
  quests: DailyQuest[];
}

export default function DailyQuestsList({ quests }: DailyQuestsListProps) {
  return (
    <div id="daily-quests-card" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-500 fill-orange-500/10" />
          <h4 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider">Active Daily Quests</h4>
        </div>
        <span className="font-mono text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
          RESETS DAILY
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {quests.map((quest) => {
            const isCompleted = quest.completed || quest.progress >= quest.target;
            const progressPercent = Math.min(100, Math.floor((quest.progress / quest.target) * 100));

            return (
              <motion.div
                key={quest.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex flex-col gap-2 rounded-xl p-3.5 border transition-all ${
                  isCompleted
                    ? "bg-zinc-950/30 border-zinc-800/40 text-zinc-500"
                    : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-zinc-700 hover:text-orange-500 cursor-help" />
                      )}
                    </div>
                    <div>
                      <h5 className={`text-xs font-semibold font-display tracking-tight uppercase ${isCompleted ? "line-through text-zinc-500" : "text-zinc-100"}`}>
                        {quest.name}
                      </h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-mono text-xs font-bold text-orange-500">
                      +{quest.rewardXp} XP
                    </span>
                  </div>
                </div>

                {/* Progress bar for ongoing quest */}
                <div className="mt-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
                    <span className="flex items-center gap-1 uppercase tracking-wider">
                      <Target className="h-3 w-3" />
                      PROGRESS
                    </span>
                    <span>
                      {quest.progress} / {quest.target}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        isCompleted
                          ? "bg-emerald-500/60"
                          : "bg-orange-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
