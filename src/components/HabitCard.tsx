import React, { useState, useRef } from "react";
import { Habit, VerificationResult } from "../types";
import { 
  Dumbbell, 
  BookOpen, 
  Clock, 
  Brain, 
  Sparkles, 
  Flame, 
  Trophy, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  Bell,
  User2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, verificationResult?: VerificationResult, mood?: string, timeSpent?: number) => void;
  onGenerateBadge: (habitName: string, streak: number) => Promise<{ imageUrl: string; promptUsed: string }>;
  onAddBadgeToAlbum: (badge: { habitName: string; imageUrl: string; promptUsed: string; streakMilestone: number }) => void;
  onUpdateHabit?: (habitId: string, updates: Partial<Habit>) => void;
}

export default function HabitCard({ 
  habit, 
  onComplete, 
  onGenerateBadge, 
  onAddBadgeToAlbum,
  onUpdateHabit
}: HabitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Custom states for mood and time spent tracking
  const [selectedMood, setSelectedMood] = useState<"focused" | "calm" | "energetic" | "tired" | "anxious">("focused");
  const [timeSpent, setTimeSpent] = useState<number>(
    habit.difficulty === "easy" ? 10 : habit.difficulty === "medium" ? 25 : 45
  );
  
  // Badge generation state
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);
  const [generatedBadgeUrl, setGeneratedBadgeUrl] = useState<string | null>(null);
  const [badgePrompt, setBadgePrompt] = useState("");
  const [badgeSaved, setBadgeSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if completed today (based on local dates comparison)
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const isCompletedToday = habit.lastCompletedDate === todayStr;

  // Visual categorization styling
  const categoryConfig = {
    health: {
      color: "from-rose-500 to-pink-500 shadow-rose-500/10",
      bgLight: "bg-rose-500/10 border-rose-500/20",
      text: "text-rose-400",
      icon: Dumbbell,
    },
    mind: {
      color: "from-indigo-500 to-blue-500 shadow-indigo-500/10",
      bgLight: "bg-indigo-500/10 border-indigo-500/20",
      text: "text-indigo-400",
      icon: Brain,
    },
    work: {
      color: "from-fuchsia-500 to-purple-500 shadow-fuchsia-500/10",
      bgLight: "bg-fuchsia-500/10 border-fuchsia-500/20",
      text: "text-fuchsia-400",
      icon: Sparkles,
    },
    growth: {
      color: "from-amber-500 to-orange-500 shadow-amber-500/10",
      bgLight: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-400",
      icon: BookOpen,
    },
    routine: {
      color: "from-emerald-500 to-teal-500 shadow-emerald-500/10",
      bgLight: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-400",
      icon: Clock,
    },
  };

  const config = categoryConfig[habit.category] || categoryConfig.health;
  const CategoryIcon = config.icon;

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          setImageMime(file.type);
          setVerificationError(null);
          setVerificationResult(null);
          setGeneratedBadgeUrl(null);
          setBadgeSaved(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setVerificationError("Please select a valid image file (PNG, JPG, JPEG).");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Trigger server-side Gemini verification API
  const handleVerifyImage = async () => {
    if (!uploadedImage) return;

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      const response = await fetch("/api/verify-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitName: habit.name,
          habitDescription: habit.description,
          imageBase64: uploadedImage,
          mimeType: imageMime || "image/jpeg",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationResult(data);
        if (data.verified) {
          // Add a short delay to enjoy the success, then complete the habit
          onComplete(habit.id, data, selectedMood, timeSpent);
        }
      } else {
        setVerificationError(data.error || "Verification failed. Check your network or API Key.");
      }
    } catch (err: any) {
      console.error(err);
      setVerificationError("Server error verifying habit image.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Trigger local nanobanana badge generation using the image model
  const handleCreateBadge = async () => {
    setIsGeneratingBadge(true);
    try {
      const result = await onGenerateBadge(habit.name, habit.streak + 1);
      setGeneratedBadgeUrl(result.imageUrl);
      setBadgePrompt(result.promptUsed);
    } catch (err) {
      console.error(err);
      setVerificationError("Failed to generate progress artwork from nanobanana.");
    } finally {
      setIsGeneratingBadge(false);
    }
  };

  const handleSaveBadgeToAlbum = () => {
    if (!generatedBadgeUrl) return;
    onAddBadgeToAlbum({
      habitName: habit.name,
      imageUrl: generatedBadgeUrl,
      promptUsed: badgePrompt,
      streakMilestone: habit.streak + 1,
    });
    setBadgeSaved(true);
  };

  // Dynamic border accents for Artistic Flair
  const borderAccentClass = isCompletedToday
    ? "border-emerald-500 bg-zinc-900"
    : habit.category === "health"
    ? "border-rose-500 bg-zinc-900/50"
    : habit.category === "mind"
    ? "border-indigo-500 bg-zinc-900/50"
    : habit.category === "work"
    ? "border-fuchsia-500 bg-zinc-900/50"
    : habit.category === "growth"
    ? "border-amber-500 bg-zinc-900/50"
    : "border-emerald-500 bg-zinc-900/50";

  return (
    <div 
      id={`habit-${habit.id}`}
      className={`relative rounded-r-xl border-l-4 ${borderAccentClass} border-y border-r border-y-zinc-800/80 border-r-zinc-800/80 p-5 transition-all shadow-md hover:shadow-lg`}
    >
      {/* Top Main Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          {/* Theme badge icon */}
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${config.color} text-zinc-950 shadow-md font-black`}>
            <CategoryIcon className="h-5.5 w-5.5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`font-display text-base font-bold tracking-tight uppercase ${isCompletedToday ? "text-zinc-400" : "text-zinc-100"}`}>
                {habit.name}
              </h4>
              <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border border-zinc-800 bg-zinc-950 ${config.text}`}>
                {habit.category}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">
              {habit.description}
            </p>

            {/* Atomic Habits: Stacking & Identity Visual Cues */}
            {(habit.habitStackAnchor || habit.identityFocus) && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {habit.habitStackAnchor && (
                  <div className="text-[9px] font-mono leading-relaxed bg-orange-500/5 text-orange-400 px-2 py-1 rounded-lg border border-orange-500/10 inline-flex items-center gap-1 uppercase tracking-wider">
                    <span className="font-bold text-orange-500/60">STALKING CUE:</span>
                    <span>After <strong className="text-zinc-200">{habit.habitStackAnchor}</strong>, I will <strong className="text-zinc-100">{habit.name}</strong></span>
                  </div>
                )}
                {habit.identityFocus && (
                  <div className="text-[9px] font-mono leading-relaxed bg-zinc-950 text-zinc-400 px-2 py-1 rounded-lg border border-zinc-850 inline-flex items-center gap-1 uppercase tracking-wider">
                    <User2 className="h-3 w-3 text-zinc-500 shrink-0" />
                    <span>Identity: <strong className="text-zinc-200">{habit.identityFocus}</strong></span>
                  </div>
                )}
              </div>
            )}

            {!isCompletedToday && (
              <div className="mt-3.5 flex flex-wrap gap-4 items-center border-t border-zinc-850/60 pt-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Log Mood:</span>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
                    {(["focused", "calm", "energetic", "tired", "anxious"] as const).map((m) => {
                      const labelMap = { focused: "🎯", calm: "🧘", energetic: "⚡", tired: "😴", anxious: "😔" };
                      const nameMap = { focused: "Focused", calm: "Calm", energetic: "Energetic", tired: "Tired", anxious: "Anxious" };
                      const isSel = selectedMood === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMood(m)}
                          title={nameMap[m]}
                          className={`text-sm px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                            isSel ? "bg-orange-500/10 text-orange-500 border border-orange-500/30 font-bold scale-110" : "opacity-45 hover:opacity-100"
                          }`}
                        >
                          {labelMap[m]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Duration:</span>
                  <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-850">
                    <button
                      type="button"
                      onClick={() => setTimeSpent(Math.max(5, timeSpent - 5))}
                      className="text-[10px] text-zinc-500 hover:text-white cursor-pointer px-1 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-[10px] text-zinc-200 min-w-[32px] text-center">
                      {timeSpent}m
                    </span>
                    <button
                      type="button"
                      onClick={() => setTimeSpent(timeSpent + 5)}
                      className="text-[10px] text-zinc-500 hover:text-white cursor-pointer px-1 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Law 1: Daily Reminder / Cue Trigger setup */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 border-t border-zinc-850/40 pt-3 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Bell className={`h-3.5 w-3.5 ${habit.reminderEnabled ? "text-orange-500 animate-pulse" : "text-zinc-600"}`} />
                <span className="font-mono font-bold uppercase tracking-wider text-zinc-500">OBVIOUS CUE ALARM:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateHabit) {
                      onUpdateHabit(habit.id, {
                        reminderEnabled: !habit.reminderEnabled,
                        reminderTime: habit.reminderTime || "08:00"
                      });
                    }
                  }}
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase transition-all cursor-pointer ${
                    habit.reminderEnabled
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                      : "bg-zinc-950 border border-zinc-850 text-zinc-600 hover:text-zinc-450"
                  }`}
                >
                  {habit.reminderEnabled ? "Alarm ON" : "Alarm OFF"}
                </button>

                {habit.reminderEnabled && (
                  <input
                    type="time"
                    value={habit.reminderTime || "08:00"}
                    onChange={(e) => {
                      if (onUpdateHabit) {
                        onUpdateHabit(habit.id, {
                          reminderTime: e.target.value
                        });
                      }
                    }}
                    className="bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {/* Streak Badge */}
          <div className="flex items-center gap-1 rounded-xl bg-zinc-950/80 px-3 py-1.5 border border-zinc-800/80 font-mono text-xs">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />
            <span className="text-zinc-300 font-bold">{habit.streak}d streak</span>
          </div>

          {isCompletedToday ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 px-3.5 py-2 border border-emerald-500/20 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Checked In</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id={`check-in-${habit.id}`}
                onClick={() => onComplete(habit.id, undefined, selectedMood, timeSpent)}
                className="rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 px-3.5 py-2 font-display font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                id={`verify-${habit.id}`}
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 text-zinc-950 hover:bg-orange-400 font-display font-black text-xs tracking-wider uppercase px-3.5 py-2 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Verify</span>
                {isExpanded ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Photo Verification Drawers */}
      <AnimatePresence>
        {isExpanded && !isCompletedToday && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-zinc-850 flex flex-col gap-4">
              <div className="rounded-xl bg-zinc-950/50 p-4 border border-zinc-800/60">
                <h5 className="font-display font-bold text-xs text-orange-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500 fill-orange-500/10" />
                  AI Visual Witness: Multimodal Proof System
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Upload, drag-and-drop, or take a picture of your finished work (e.g. a book page, a gym water bottle, a coding editor). Gemini's computer vision will analyze the evidence, verify the completion, and grant bonus streak points!
                </p>
              </div>

              {/* Upload Drop Zone / Preview Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Upload Card */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    dragActive 
                      ? "border-orange-500 bg-orange-500/5" 
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden" 
                  />
                  
                  {uploadedImage ? (
                    <div className="relative group w-full aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-850 flex items-center justify-center">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded evidence preview" 
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-xs text-white font-medium flex items-center gap-1">
                          <Upload className="h-3.5 w-3.5" />
                          Replace Image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 mb-3">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                        Drag & Drop or Click to upload progress picture
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                        PNG, JPG or JPEG accepted
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Verification Results Panel */}
                <div className="flex flex-col justify-center rounded-xl bg-zinc-950/40 border border-zinc-800/80 p-5 min-h-[140px]">
                  {isVerifying ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 gap-3">
                      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                      <div>
                        <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Atomic Witness Analyzing...</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">Checking image evidence via Gemini 3.5-flash...</p>
                      </div>
                    </div>
                  ) : verificationError ? (
                    <div className="flex items-start gap-3 p-3 bg-rose-500/5 rounded-xl border border-rose-500/15">
                      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h6 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Analysis Error</h6>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{verificationError}</p>
                      </div>
                    </div>
                  ) : verificationResult ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                          verificationResult.verified 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}>
                          {verificationResult.verified ? "VERIFIED SUCCESS" : "VERIFICATION UNCERTAIN"}
                        </span>
                        <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                          Confidence: <span className="font-bold text-zinc-100">{verificationResult.confidence}%</span>
                        </span>
                      </div>
                      
                      <div>
                        <h6 className="font-display font-bold text-sm text-orange-500 uppercase tracking-wider">
                          ⚔️ {verificationResult.title}
                        </h6>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed italic">
                          "{verificationResult.feedback}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-zinc-600 py-6">
                      <Camera className="h-8 w-8 mb-2 opacity-40 text-orange-500" />
                      <p className="text-xs uppercase tracking-wider font-bold">Evidence camera offline</p>
                      <p className="text-[10px] mt-0.5 font-mono">UPLOAD IMAGE ABOVE AND CLICK "ANALYZE PROOF"</p>
                    </div>
                  )}

                  {uploadedImage && !isVerifying && !verificationResult && (
                    <button
                      onClick={handleVerifyImage}
                      className="mt-4 w-full rounded-xl bg-orange-500 text-zinc-950 font-display font-black text-xs py-2.5 uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-orange-500/10"
                    >
                      Analyze Proof & Check In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom nanobanana model badge reward drawer - pops up when completed successfully */}
      <AnimatePresence>
        {isCompletedToday && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-zinc-850 flex flex-col gap-4">
              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-4">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-display font-black text-sm text-zinc-100 uppercase tracking-wider">
                      Forge Dynamic Collector Badge!
                    </h5>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      You completed this habit today! Now, command the <strong className="text-orange-500">gemini-2.5-flash-image</strong> badge model to synthesize an original 3D emblem.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="shrink-0">
                    {isGeneratingBadge ? (
                      <div className="h-32 w-32 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col gap-2 items-center justify-center text-center p-2">
                        <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">Synthesizing...</span>
                      </div>
                    ) : generatedBadgeUrl ? (
                      <div className="relative group h-32 w-32 rounded-xl overflow-hidden bg-zinc-950 border border-orange-500/20">
                        <img 
                          src={generatedBadgeUrl} 
                          alt="AI generated milestone badge" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 text-center p-2">
                        <ImageIcon className="h-6 w-6 mb-1 opacity-40 text-orange-500" />
                        <span className="text-[9px] font-mono uppercase tracking-wider">Empty Slag</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-2 justify-center">
                    {!generatedBadgeUrl && !isGeneratingBadge ? (
                      <button
                        onClick={handleCreateBadge}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 text-zinc-950 font-display font-black text-xs py-2.5 px-4 shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition-all w-full uppercase tracking-wider cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Forge Collector Badge</span>
                      </button>
                    ) : generatedBadgeUrl && !badgeSaved ? (
                      <button
                        onClick={handleSaveBadgeToAlbum}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-display font-black text-xs py-2.5 px-4 shadow-lg shadow-emerald-500/15 transition-all w-full uppercase tracking-wider cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Claim & Save to Album</span>
                      </button>
                    ) : badgeSaved ? (
                      <div className="rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2.5 px-4 text-center text-xs font-bold font-mono uppercase tracking-wider">
                        ✨ CLAIMED // ADDED TO LOGS ✨
                      </div>
                    ) : null}

                    {badgePrompt && (
                      <div className="p-2 bg-zinc-950/60 rounded border border-zinc-850/60">
                        <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider">THEMATIC PROMPT:</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                          {badgePrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanding indicator at bottom of card */}
      {!isCompletedToday && (
        <div className="flex justify-center mt-3 -mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-orange-500 transition-colors py-1 cursor-pointer"
          >
            <span>Photo Proof Panel</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {isCompletedToday && (
        <div className="flex justify-center mt-3 -mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-orange-500 transition-colors py-1 cursor-pointer"
          >
            <span>Custom Streak Badge Gallery</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
