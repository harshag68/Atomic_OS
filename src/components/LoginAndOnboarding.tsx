import React, { useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { AvatarState } from "./AvatarShowcase";
import { 
  Sparkles, 
  User, 
  LogIn, 
  Compass, 
  Activity, 
  Cpu, 
  Flame, 
  TrendingUp, 
  Zap,
  Globe,
  MonitorCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginAndOnboardingProps {
  onOnboardComplete: (avatar: AvatarState) => void;
  onLoginSuccess: (user: any) => void;
  currentUser: any | null;
  onLogout: () => void;
}

export default function LoginAndOnboarding({
  onOnboardComplete,
  onLoginSuccess,
  currentUser,
  onLogout
}: LoginAndOnboardingProps) {
  const [avatarName, setAvatarName] = useState("");
  const [selectedPhysiology, setSelectedPhysiology] = useState<"ectomorph" | "mesomorph" | "endomorph" | "cybernetic" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  // Sign in with Google Popup
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess(result.user);
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/popup-blocked") {
        setErrorMsg("Google Sign-In popup was blocked by your browser. Please allow popups or try Guest Mode!");
      } else {
        setErrorMsg(err.message || "Authentication failed. Try Guest Mode for offline play.");
      }
    }
  };

  // Skip Login & enter Guest mode immediately
  const handleGuestSignIn = () => {
    setGuestMode(true);
    onLoginSuccess({
      uid: "guest-user-session",
      displayName: "Atomic Guest",
      email: "guest@atomic.os",
      isAnonymous: true,
      photoURL: ""
    });
  };

  // Submit Onboarding
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarName.trim()) {
      setErrorMsg("Please name your evolutionary companion avatar.");
      return;
    }
    if (!selectedPhysiology) {
      setErrorMsg("Please select an elemental physiology framework.");
      return;
    }

    setIsSubmitting(true);
    try {
      const initialAvatar: AvatarState = {
        name: avatarName.trim(),
        physiology: selectedPhysiology,
        stage: 1,
        daysProgress: 1 // Start at Day 1
      };
      onOnboardComplete(initialAvatar);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize avatar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendering 1: LOGIN PAGE
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-100">
        
        {/* Abstract background grids */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border-r border-b border-zinc-800"></div>
            ))}
          </div>
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>

        <motion.div 
          className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative z-10 shadow-2xl space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Cosmic Branding */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-orange-500/20 mb-3 animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="font-display font-black text-2xl tracking-widest text-zinc-100 uppercase">
              ATOMIC_OS v1.2
            </h1>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              Compounded Habit Bio-hacking Lab
            </p>
          </div>

          {/* Description list */}
          <div className="space-y-3 bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl text-xs text-zinc-400 font-mono tracking-tight uppercase">
            <div className="flex gap-2.5 items-start">
              <Compass className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <p>Select physiological framework avatars that evolve every 20 days of progress</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <Activity className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <p>Verify habits via multimodal AI image analysis & generate visual milestone badges</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <TrendingUp className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <p>Full secure continuous Cloud Firestore database synchronization</p>
            </div>
          </div>

          {/* Authentication Actions */}
          <div className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-xs font-mono font-bold uppercase tracking-wider leading-relaxed">
                {errorMsg}
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-100 text-zinc-950 font-display font-black text-xs py-4 px-6 hover:bg-zinc-200 transition-all shadow-md cursor-pointer uppercase tracking-wider"
            >
              {/* Google Mono Logo */}
              <svg className="h-4 w-4 mr-0.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Initialize via Google Sign-In</span>
            </button>

            {/* Offline Guest Mode */}
            <button
              onClick={handleGuestSignIn}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-mono font-bold text-[10px] py-3.5 cursor-pointer uppercase tracking-widest"
            >
              <LogIn className="h-3.5 w-3.5 text-zinc-500" />
              <span>Enter Sandbox (Local Guest Mode)</span>
            </button>
          </div>

        </motion.div>
      </div>
    );
  }

  // Rendering 2: ONBOARDING / CHOOSE AVATAR (If user logged in but has no avatar configured)
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-100">
      
      {/* Absolute background flare */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none"></div>

      <motion.div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 relative z-10 shadow-2xl space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div>
            <h2 className="font-display font-black text-xl text-zinc-100 tracking-wider uppercase">
              Avatar Synthesis Laboratory
            </h2>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Secure Registry Node // {currentUser.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 px-3 py-1.5 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-xs font-bold font-mono uppercase tracking-wider">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleOnboardSubmit} className="space-y-6">
          
          {/* Avatar Name input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Assign Evolutionary Companion Name:
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="E.g., Xenon, Nexus-9, Sparky, Aegis..."
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                maxLength={20}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl py-3 pl-11 pr-4 text-xs font-mono uppercase tracking-wide placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Physiology Selection Cards */}
          <div className="space-y-3">
            <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Select Biological/Physiological Base Core:
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  id: "ectomorph",
                  title: "Ectomorph Core",
                  elem: "Air // Agility Element",
                  desc: "Sleek, highly energetic and fast metabolisers. Spreads cognitive sparks cleanly. Perfect for speed and reading habits.",
                  themeColor: "text-cyan-400 border-cyan-500/10 hover:border-cyan-500/30",
                  bgSel: "bg-cyan-500/5 border-cyan-500/40 text-cyan-200",
                  icon: Zap,
                  label: "Cyan Glow Core"
                },
                {
                  id: "mesomorph",
                  title: "Mesomorph Core",
                  elem: "Fire // Strength Element",
                  desc: "Athletic, highly responsive physical frames. Blazes through heavy tasks. Ideal for intense workouts and routines.",
                  themeColor: "text-red-400 border-red-500/10 hover:border-red-500/30",
                  bgSel: "bg-red-500/5 border-red-500/40 text-red-200",
                  icon: Flame,
                  label: "Crimson Spark Core"
                },
                {
                  id: "endomorph",
                  title: "Endomorph Core",
                  elem: "Earth // Endurance Element",
                  desc: "Massive, highly stable grounding builds. Holds continuous energy over immense periods. Built for solid daily structures.",
                  themeColor: "text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30",
                  bgSel: "bg-emerald-500/5 border-emerald-500/40 text-emerald-200",
                  icon: Globe,
                  label: "Emerald Rock Core"
                },
                {
                  id: "cybernetic",
                  title: "Cybernetic Synth",
                  elem: "Neural // Digital Element",
                  desc: "Synthetic logic matrices constructed from raw compound algorithms. Focuses on code, microtasks and mental efficiency.",
                  themeColor: "text-purple-400 border-purple-500/10 hover:border-purple-500/30",
                  bgSel: "bg-purple-500/5 border-purple-500/40 text-purple-200",
                  icon: Cpu,
                  label: "Amethyst Quantum Core"
                }
              ].map((card) => {
                const isSelected = selectedPhysiology === card.id;
                const IconComp = card.icon;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setSelectedPhysiology(card.id as any);
                      setErrorMsg(null);
                    }}
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative overflow-hidden group/card cursor-pointer ${
                      isSelected ? card.bgSel : "bg-zinc-950/60 border-zinc-850 text-zinc-400"
                    } ${card.themeColor}`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="flex items-center gap-2">
                        <IconComp className="h-5 w-5" />
                        <span className="font-display font-black text-xs uppercase tracking-wider">{card.title}</span>
                      </div>
                      <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 group-hover/card:text-zinc-300">
                        {card.label}
                      </span>
                    </div>

                    <p className="font-mono text-[9px] text-orange-500 uppercase tracking-widest mt-1">
                      {card.elem}
                    </p>

                    <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                      {card.desc}
                    </p>

                    {/* Stage indicator preview */}
                    <div className="mt-3 text-[9px] text-zinc-500 font-mono uppercase tracking-wide pt-2 border-t border-zinc-900 w-full flex justify-between">
                      <span>Forms: Stage 1 → Stage 5</span>
                      <span className="text-[8px] text-zinc-600">Evolution every 20 Days</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 text-zinc-950 font-display font-black text-xs py-4 px-6 hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/10 cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            <MonitorCheck className="h-4 w-4" />
            <span>Forge & Sync Avatar Blueprint</span>
          </button>

        </form>

      </motion.div>
    </div>
  );
}
