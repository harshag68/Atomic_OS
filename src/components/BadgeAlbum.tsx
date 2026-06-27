import React, { useState } from "react";
import { Badge } from "../types";
import { Award, Calendar, Sparkles, X, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BadgeAlbumProps {
  badges: Badge[];
}

export default function BadgeAlbum({ badges }: BadgeAlbumProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  return (
    <div id="badge-album" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Award className="h-5.5 w-5.5 text-orange-500 fill-orange-500/10" />
          <h4 className="font-display font-bold text-zinc-100 text-sm uppercase tracking-wider">Hall of Milestones</h4>
        </div>
        <span className="font-mono text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
          {badges.length} COLLECTIBLES
        </span>
      </div>

      {badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800">
          <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800 mb-4">
            <Award className="h-6 w-6 text-orange-500" />
          </div>
          <h5 className="font-display font-bold text-xs text-zinc-300 uppercase tracking-wider">Milestone album is empty</h5>
          <p className="text-[11px] text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
            Verify any daily habit using an image, and unlock the Gemini badge forge to synthesize your first collectible.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBadge(badge)}
              className="group relative cursor-pointer aspect-square rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-md shadow-black/30"
            >
              <img
                src={badge.imageUrl}
                alt={badge.habitName}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2.5 transition-opacity">
                <span className="text-[8px] font-mono text-orange-500 uppercase font-bold tracking-wider">
                  MILESTONE
                </span>
                <p className="text-[10px] font-display font-bold text-zinc-100 truncate uppercase tracking-tight">
                  {badge.habitName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame className="h-2.5 w-2.5 text-orange-500 fill-orange-500/10" />
                  <span className="text-[9px] font-mono text-orange-400 font-bold">{badge.streakMilestone}d</span>
                </div>
              </div>
              
              {/* Simple corner badge for quick identification */}
              <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950/90 border border-orange-500/30 text-[9px] font-mono text-orange-500 font-bold">
                {badge.streakMilestone}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Badge Detail Dialog Drawer */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Large visual showcase */}
                <div className="relative h-48 w-48 rounded-2xl overflow-hidden border-2 border-orange-500/30 shadow-xl bg-zinc-950 mb-5">
                  <img
                    src={selectedBadge.imageUrl}
                    alt={selectedBadge.habitName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-zinc-950/90 border border-orange-500/40 px-2.5 py-1 font-mono text-[9px] text-orange-500 font-bold uppercase tracking-wider">
                    <Flame className="h-3 w-3 fill-orange-500/10" />
                    <span>{selectedBadge.streakMilestone} Day Streak</span>
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold text-zinc-100 uppercase tracking-wider">
                  Streak Milestone Forge
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Habit Blueprint: <strong className="text-zinc-200 uppercase">{selectedBadge.habitName}</strong>
                </p>

                {/* Info blocks */}
                <div className="mt-5 w-full grid grid-cols-2 gap-2 border-t border-b border-zinc-800 py-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <div>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">EARNED DATE</p>
                      <p className="text-xs text-zinc-300 font-bold uppercase">{selectedBadge.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-zinc-500" />
                    <div>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">AI ENGINE</p>
                      <p className="text-xs text-orange-500 font-bold uppercase">GEMINI FLUSH</p>
                    </div>
                  </div>
                </div>

                {/* Prompt display */}
                <div className="mt-4 w-full text-left">
                  <p className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                    Generative Badge Blueprint
                  </p>
                  <div className="mt-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-850/60 text-[11px] font-mono text-zinc-400 leading-relaxed max-h-[85px] overflow-y-auto">
                    {selectedBadge.promptUsed}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBadge(null)}
                  className="mt-6 w-full rounded-xl bg-orange-500 text-zinc-950 font-display font-black text-xs py-2.5 uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-orange-500/10"
                >
                  Return to Milestones
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
