import React from "react";
import { motion } from "motion/react";
import { Award, ShieldAlert, Sparkles, ChevronRight, Zap, RefreshCw, Layers } from "lucide-react";

export interface AvatarState {
  name: string;
  physiology: "ectomorph" | "mesomorph" | "endomorph" | "cybernetic";
  stage: number; // 1 to 5
  daysProgress: number; // Cumulative days active/progress
}

interface AvatarShowcaseProps {
  avatar: AvatarState;
  showDetails?: boolean;
  onCheatDaysProgress?: () => void; // A neat dev easter egg or interactive way to demonstrate evolution in the preview!
}

export default function AvatarShowcase({ avatar, showDetails = true, onCheatDaysProgress }: AvatarShowcaseProps) {
  const { name, physiology, stage, daysProgress } = avatar;

  // Evolution thresholds info
  const stageNames: Record<string, string[]> = {
    ectomorph: [
      "Aero Seed (Lv. 1)",
      "Wind Scout (Lv. 2)",
      "Aura Sylph (Lv. 3)",
      "Storm Archon (Lv. 4)",
      "Cosmic Zephyr (Lv. 5)"
    ],
    mesomorph: [
      "Pyro Ember (Lv. 1)",
      "Blaze Guard (Lv. 2)",
      "Combustion Drake (Lv. 3)",
      "Solar Titan (Lv. 4)",
      "Supernova Phoenix (Lv. 5)"
    ],
    endomorph: [
      "Pebble Seed (Lv. 1)",
      "Stone Core (Lv. 2)",
      "Obsidian Monolith (Lv. 3)",
      "Terra Sentinel (Lv. 4)",
      "Planet Engine (Lv. 5)"
    ],
    cybernetic: [
      "Byte Node (Lv. 1)",
      "Logic Core (Lv. 2)",
      "Vector Quantum (Lv. 3)",
      "Neural Overlord (Lv. 4)",
      "Singularity AI (Lv. 5)"
    ]
  };

  const physiologyLabel = {
    ectomorph: "Ectomorph // Air Element // Agility",
    mesomorph: "Mesomorph // Fire Element // Strength",
    endomorph: "Endomorph // Earth Element // Endurance",
    cybernetic: "Cybernetic // Synth Element // Intelligence"
  };

  const currentStageName = stageNames[physiology]?.[stage - 1] || "Unknown Form";
  const daysUntilNextEvolution = Math.max(0, 20 - (daysProgress % 20));
  const progressPercent = Math.min(100, ((daysProgress % 20) / 20) * 100);

  // SVG Renderer matching the visual style
  const renderAvatarSVG = () => {
    const primaryColors: Record<string, string> = {
      ectomorph: "#06b6d4", // Cyan
      mesomorph: "#ef4444", // Red/Orange
      endomorph: "#10b981", // Emerald/Green
      cybernetic: "#a855f7" // Purple
    };

    const color = primaryColors[physiology] || "#f97316";

    // Standard outer wrapper with ambient glows
    return (
      <div className="relative w-40 h-40 flex items-center justify-center bg-zinc-950/40 rounded-full border border-zinc-850/60 shadow-inner group">
        
        {/* Holographic scanner grid lines */}
        <div className="absolute inset-0 rounded-full overflow-hidden opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_8px] animate-pulse"></div>
        </div>

        {/* Ambient spinning ring */}
        <motion.div
          className="absolute w-32 h-32 rounded-full border-2 border-dashed opacity-25"
          style={{ borderColor: color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Outer orbital markers (grows with stage) */}
        {stage >= 2 && (
          <motion.div
            className="absolute w-[142px] h-[142px] rounded-full border border-double opacity-40"
            style={{ borderColor: color, borderWidth: "1.5px" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Core animated graphic */}
        <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10">
          <defs>
            <radialGradient id={`glow-${physiology}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Radial soft glow behind core */}
          <circle cx="50" cy="50" r="38" fill={`url(#glow-${physiology})`} />

          {/* PHYSIOLOGY 1: ECTOMORPH (Sleek aerodynamic structures, rings, agility) */}
          {physiology === "ectomorph" && (
            <g>
              {/* Core seed */}
              <motion.polygon
                points="50,28 65,50 50,72 35,50"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Stage-based enhancements */}
              {stage >= 2 && (
                <motion.circle
                  cx="50"
                  cy="50"
                  r="26"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="4, 8"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Stage 3+: Wings of light */}
              {stage >= 3 && (
                <g opacity="0.8">
                  <path d="M 46 50 C 30 38, 20 42, 22 50 C 24 58, 32 54, 46 50 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="1" />
                  <path d="M 54 50 C 70 38, 80 42, 78 50 C 76 58, 68 54, 54 50 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="1" />
                </g>
              )}

              {/* Stage 4+: High-speed energy arrows */}
              {stage >= 4 && (
                <g>
                  <line x1="50" y1="12" x2="50" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                  <line x1="50" y1="88" x2="50" y2="76" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                </g>
              )}

              {/* Stage 5: Cosmic Zephyr Hyper-dimension matrix */}
              {stage === 5 && (
                <motion.polygon
                  points="50,15 75,50 50,85 25,50"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.4"
                  animate={{
                    scale: [0.95, 1.15, 0.95],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </g>
          )}

          {/* PHYSIOLOGY 2: MESOMORPH (Blazing, kinetic, sharp physical power) */}
          {physiology === "mesomorph" && (
            <g>
              {/* Core Star */}
              <motion.path
                d="M 50 20 L 58 42 L 80 50 L 58 58 L 50 80 L 42 58 L 20 50 L 42 42 Z"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              {/* Stage 2+: Inner flaming rings */}
              {stage >= 2 && (
                <motion.circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeDasharray="6, 6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Stage 3+: Dual thermal flame blades */}
              {stage >= 3 && (
                <g opacity="0.8">
                  <path d="M 50 35 C 38 25, 25 35, 32 50" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                  <path d="M 50 65 C 62 75, 75 65, 68 50" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                </g>
              )}

              {/* Stage 4+: Solar spikes & thermal aura */}
              {stage >= 4 && (
                <g>
                  <circle cx="50" cy="50" r="10" fill="none" stroke={color} strokeWidth="2" />
                  <circle cx="50" cy="50" r="4" fill={color} />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.75"
                    strokeDasharray="2, 15"
                    animate={{ rotate: -180 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              )}

              {/* Stage 5: Supernova Phoenix expanding wings */}
              {stage === 5 && (
                <g opacity="0.6">
                  <path d="M 50 50 Q 15 20 15 65" fill="none" stroke={color} strokeWidth="2.5" />
                  <path d="M 50 50 Q 85 20 85 65" fill="none" stroke={color} strokeWidth="2.5" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </g>
              )}
            </g>
          )}

          {/* PHYSIOLOGY 3: ENDOMORPH (Earthy, monolithic cube, stability, monolith) */}
          {physiology === "endomorph" && (
            <g>
              {/* Monolithic center square */}
              <motion.rect
                x="34"
                y="34"
                width="32"
                height="32"
                rx="3"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                animate={{
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 1.04, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Stage 2+: Orbiting gravitational shields */}
              {stage >= 2 && (
                <g>
                  <motion.rect
                    x="24"
                    y="24"
                    width="52"
                    height="52"
                    rx="6"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="10, 25"
                    animate={{ rotate: -45 }}
                  />
                </g>
              )}

              {/* Stage 3+: Heavy floating shards */}
              {stage >= 3 && (
                <g opacity="0.8">
                  <rect x="47" y="16" width="6" height="6" fill={color} />
                  <rect x="47" y="78" width="6" height="6" fill={color} />
                  <rect x="16" y="47" width="6" height="6" fill={color} />
                  <rect x="78" y="47" width="6" height="6" fill={color} />
                </g>
              )}

              {/* Stage 4+: Concentric lattice containment lines */}
              {stage >= 4 && (
                <motion.rect
                  x="12"
                  y="12"
                  width="76"
                  height="76"
                  rx="10"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  strokeDasharray="4, 12"
                  animate={{ rotate: 180 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Stage 5: Core Planet Engine gravity waves */}
              {stage === 5 && (
                <g>
                  <circle cx="50" cy="50" r="14" fill="none" stroke={color} strokeWidth="3" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray="15, 3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              )}
            </g>
          )}

          {/* PHYSIOLOGY 4: CYBERNETIC (Neural grid core, technical scanner nodes, futuristic data streams) */}
          {physiology === "cybernetic" && (
            <g>
              {/* Tech Hexagon */}
              <motion.polygon
                points="50,22 75,36 75,64 50,78 25,64 25,36"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                animate={{
                  scale: [1, 1.06, 1],
                  rotate: [0, 60, 120, 180, 240, 300, 360]
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Stage 2+: Laser matrix scanner */}
              {stage >= 2 && (
                <motion.line
                  x1="20"
                  y1="50"
                  x2="80"
                  y2="50"
                  stroke={color}
                  strokeWidth="1.5"
                  opacity="0.8"
                  animate={{
                    y1: [32, 68, 32],
                    y2: [32, 68, 32]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Stage 3+: Cybernetic data particles */}
              {stage >= 3 && (
                <g>
                  <circle cx="50" cy="50" r="6" fill={color} />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="28"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="2, 6"
                    animate={{ rotate: 120 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              )}

              {/* Stage 4+: Quantum neural linkage grid */}
              {stage >= 4 && (
                <g opacity="0.9">
                  <line x1="25" y1="36" x2="50" y2="50" stroke={color} strokeWidth="0.75" />
                  <line x1="75" y1="36" x2="50" y2="50" stroke={color} strokeWidth="0.75" />
                  <line x1="75" y1="64" x2="50" y2="50" stroke={color} strokeWidth="0.75" />
                  <line x1="25" y1="64" x2="50" y2="50" stroke={color} strokeWidth="0.75" />
                  <line x1="50" y1="22" x2="50" y2="50" stroke={color} strokeWidth="0.75" />
                  <line x1="50" y1="78" x2="50" y2="50" stroke={color} strokeWidth="0.75" />
                </g>
              )}

              {/* Stage 5: Cybernetic Holographic Singularity Gateway */}
              {stage === 5 && (
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="40, 10, 5, 10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                />
              )}
            </g>
          )}
        </svg>

        {/* Center label (absolute) on group hover */}
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/90 border border-zinc-800 rounded-lg py-1 px-2 text-[9px] font-mono text-center z-20 pointer-events-none uppercase tracking-wider">
          <p className="text-zinc-400">STAGE {stage}</p>
          <p className="font-bold mt-0.5" style={{ color }}>{physiology}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      
      {/* Visual core stage */}
      {renderAvatarSVG()}

      {showDetails && (
        <div className="w-full text-center mt-4 space-y-2">
          
          {/* Avatar Name & Level */}
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-display font-black text-base text-zinc-100 uppercase tracking-wide">
                {name || "UNNAMED"}
              </span>
              <Sparkles className="h-4 w-4 text-orange-500 shrink-0" />
            </div>
            <p className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest mt-0.5">
              {currentStageName}
            </p>
          </div>

          {/* Physiology Subtitle */}
          <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
            {physiologyLabel[physiology] || "Standard Athlete"}
          </div>

          {/* Evolution Countdown Tracker */}
          <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-850/60 max-w-xs mx-auto text-left space-y-2">
            
            <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider">
              <span className="text-zinc-500">Form Evolution</span>
              <span className="text-zinc-300">{daysProgress} / 100 PROGRESS DAYS</span>
            </div>

            {/* Micro progress bar */}
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden p-0 relative">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressPercent}%`, 
                  backgroundColor: physiology === "ectomorph" ? "#06b6d4" : physiology === "mesomorph" ? "#ef4444" : physiology === "endomorph" ? "#10b981" : "#a855f7" 
                }}
              ></div>
            </div>

            {/* Countdown message */}
            <div className="flex justify-between items-center">
              <p className="text-[9px] text-zinc-400 font-sans uppercase">
                {stage === 5 ? (
                  <span className="text-orange-500 font-bold">🌟 ASCENDED COSMIC SINGULARITY</span>
                ) : (
                  <span>Next transformation in <strong>{daysUntilNextEvolution}</strong> active days</span>
                )}
              </p>
              
              {onCheatDaysProgress && (
                <button
                  onClick={onCheatDaysProgress}
                  title="Force simulated progress (Compounds calendar record day logs for instant live preview)"
                  className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-orange-500 cursor-pointer transition-colors"
                >
                  <RefreshCw className="h-3 w-3 animate-pulse" />
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
