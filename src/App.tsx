import React, { useState, useEffect } from "react";
import { Habit, UserStats, DailyQuest, Badge, VerificationResult } from "./types";
import { INITIAL_HABITS, INITIAL_STATS, INITIAL_QUESTS } from "./data";
import LevelProgressBar from "./components/LevelProgressBar";
import DailyQuestsList from "./components/DailyQuestsList";
import HabitCard from "./components/HabitCard";
import BadgeAlbum from "./components/BadgeAlbum";
import HabitCreator from "./components/HabitCreator";
import HabitAnalytics from "./components/HabitAnalytics";
import LoginAndOnboarding from "./components/LoginAndOnboarding";
import AvatarShowcase, { AvatarState } from "./components/AvatarShowcase";
import CalendarTab from "./components/CalendarTab";
import LaboratoryTab from "./components/LaboratoryTab";
import ArchiveTab from "./components/ArchiveTab";

import { 
  Sparkles, 
  Trophy, 
  Trash2, 
  RotateCcw, 
  Award, 
  Star, 
  Flame, 
  LogOut, 
  User, 
  Layers, 
  History, 
  Activity,
  Archive,
  Menu,
  X,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Firebase imports
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  writeBatch 
} from "firebase/firestore";

export default function App() {
  // --- Auth & Onboarding States ---
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [avatar, setAvatar] = useState<AvatarState | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- Core Habit Tracker States ---
  const [habits, setHabits] = useState<Habit[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [quests, setQuests] = useState<DailyQuest[]>(INITIAL_QUESTS);
  const [badges, setBadges] = useState<Badge[]>([]);
  
  // --- Navigation & Interactive States ---
  const [currentTab, setCurrentTab] = useState<"dashboard" | "calendar" | "laboratory" | "archive">("dashboard");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // --- Modals States ---
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);
  const [showAvatarEvolutionModal, setShowAvatarEvolutionModal] = useState(false);
  const [prevAvatarStage, setPrevAvatarStage] = useState(1);

  // --- Auth state change listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(true);
      if (firebaseUser) {
        // Logged in with Google
        setCurrentUser(firebaseUser);
        await syncUserDataFromCloud(firebaseUser.uid);
      } else {
        // Fallback checks for Guest Session or logged out
        const savedGuestSession = localStorage.getItem("atomic_guest_user");
        if (savedGuestSession) {
          const parsedGuest = JSON.parse(savedGuestSession);
          setCurrentUser(parsedGuest);
          await syncUserDataFromLocal();
        } else {
          setCurrentUser(null);
          setAvatar(null);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Local Sync for Guest Users ---
  const syncUserDataFromLocal = () => {
    const savedHabits = localStorage.getItem("atomic_habits");
    const savedStats = localStorage.getItem("atomic_stats");
    const savedQuests = localStorage.getItem("atomic_quests");
    const savedBadges = localStorage.getItem("atomic_badges");
    const savedAvatar = localStorage.getItem("atomic_avatar");
    const savedArchived = localStorage.getItem("atomic_archived_habits");

    let loadedHabits = savedHabits ? JSON.parse(savedHabits) : INITIAL_HABITS;
    let loadedStats = savedStats ? JSON.parse(savedStats) : INITIAL_STATS;
    let loadedQuests = savedQuests ? JSON.parse(savedQuests) : INITIAL_QUESTS;
    let loadedBadges = savedBadges ? JSON.parse(savedBadges) : [];
    let loadedArchived = savedArchived ? JSON.parse(savedArchived) : [];
    let loadedAvatar = savedAvatar ? JSON.parse(savedAvatar) : null;

    // Daily checking/reset calculations
    const result = calculateDailyResets(loadedHabits, loadedStats, loadedQuests);
    
    setHabits(result.updatedHabits);
    setStats(result.updatedStats);
    setQuests(result.updatedQuests);
    setBadges(loadedBadges);
    setArchivedHabits(loadedArchived);
    setAvatar(loadedAvatar);
    setPrevLevel(result.updatedStats.level);
  };

  // --- Firestore Cloud Sync ---
  const syncUserDataFromCloud = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      let userDocSnap;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      }

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // Load stats, avatar
        let loadedStats = userData.stats || INITIAL_STATS;
        let loadedAvatar = userData.avatar || null;

        // Load Habits from cloud subcollection
        const habitsColRef = collection(db, "users", uid, "habits");
        let habitsSnap;
        try {
          habitsSnap = await getDocs(habitsColRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${uid}/habits`);
        }
        const loadedHabits: Habit[] = [];
        const loadedArchived: Habit[] = [];
        
        habitsSnap.forEach((doc) => {
          const h = doc.data() as Habit;
          if ((h as any).archived) {
            loadedArchived.push(h);
          } else {
            loadedHabits.push(h);
          }
        });

        // Load Badges from cloud subcollection
        const badgesColRef = collection(db, "users", uid, "badges");
        let badgesSnap;
        try {
          badgesSnap = await getDocs(badgesColRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${uid}/badges`);
        }
        const loadedBadges: Badge[] = [];
        badgesSnap.forEach((doc) => {
          loadedBadges.push(doc.data() as Badge);
        });

        // Load Quests from cloud subcollection
        const questsColRef = collection(db, "users", uid, "quests");
        let questsSnap;
        try {
          questsSnap = await getDocs(questsColRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${uid}/quests`);
        }
        let loadedQuests: DailyQuest[] = [];
        questsSnap.forEach((doc) => {
          loadedQuests.push(doc.data() as DailyQuest);
        });

        // If habits or stats are missing in firestore, fallback to seed values
        const finalHabits = loadedHabits.length > 0 ? loadedHabits : INITIAL_HABITS;
        const finalQuests = loadedQuests.length > 0 ? loadedQuests : INITIAL_QUESTS;

        // Perform standard calendar daily checking
        const result = calculateDailyResets(finalHabits, loadedStats, finalQuests);

        // Save locally as instantaneous backup
        localStorage.setItem("atomic_habits", JSON.stringify(result.updatedHabits));
        localStorage.setItem("atomic_stats", JSON.stringify(result.updatedStats));
        localStorage.setItem("atomic_quests", JSON.stringify(result.updatedQuests));
        localStorage.setItem("atomic_badges", JSON.stringify(loadedBadges));
        localStorage.setItem("atomic_archived_habits", JSON.stringify(loadedArchived));
        if (loadedAvatar) {
          localStorage.setItem("atomic_avatar", JSON.stringify(loadedAvatar));
        }

        setHabits(result.updatedHabits);
        setStats(result.updatedStats);
        setQuests(result.updatedQuests);
        setBadges(loadedBadges);
        setArchivedHabits(loadedArchived);
        setAvatar(loadedAvatar);
        setPrevLevel(result.updatedStats.level);

        // Fetch logs
        const logsColRef = collection(db, "users", uid, "logs");
        let logsSnap;
        try {
          logsSnap = await getDocs(logsColRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${uid}/logs`);
        }
        const loadedLogs: any[] = [];
        logsSnap.forEach((doc) => {
          loadedLogs.push(doc.data());
        });
        if (loadedLogs.length > 0) {
          localStorage.setItem("atomic_completion_logs", JSON.stringify(loadedLogs));
        }
      } else {
        // If they have existing guest/offline data, let's offer to sync it up immediately!
        const localAvatar = localStorage.getItem("atomic_avatar");
        if (localAvatar) {
          const parsedAvatar = JSON.parse(localAvatar);
          setAvatar(parsedAvatar);
          await pushGuestDataToFirestore(uid, parsedAvatar);
        } else {
          // Trigger onboarding state
          setAvatar(null);
        }
      }
    } catch (err) {
      console.error("Failed to sync from Firestore cloud. Operating in local sandbox mode.", err);
      if (err instanceof Error && err.message.startsWith('{')) {
        throw err;
      }
      syncUserDataFromLocal();
    }
  };

  // --- Push existing sandbox data into Firestore ---
  const pushGuestDataToFirestore = async (uid: string, newAvatar: AvatarState) => {
    try {
      const userDocRef = doc(db, "users", uid);
      try {
        await setDoc(userDocRef, {
          email: auth.currentUser?.email || "",
          displayName: auth.currentUser?.displayName || "",
          photoURL: auth.currentUser?.photoURL || "",
          createdAt: new Date().toISOString(),
          avatar: newAvatar,
          stats: stats
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }

      const batch = writeBatch(db);
      habits.forEach((h) => {
        const hRef = doc(db, "users", uid, "habits", h.id);
        batch.set(hRef, h);
      });
      archivedHabits.forEach((h) => {
        const hRef = doc(db, "users", uid, "habits", h.id);
        batch.set(hRef, h);
      });
      badges.forEach((b) => {
        const bRef = doc(db, "users", uid, "badges", b.id);
        batch.set(bRef, b);
      });
      quests.forEach((q) => {
        const qRef = doc(db, "users", uid, "quests", q.id);
        batch.set(qRef, q);
      });

      const savedLogs = localStorage.getItem("atomic_completion_logs");
      if (savedLogs) {
        const loadedLogs = JSON.parse(savedLogs);
        loadedLogs.forEach((l: any) => {
          const lRef = doc(db, "users", uid, "logs", l.id);
          batch.set(lRef, l);
        });
      }

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid} (batch)`);
      }
    } catch (err) {
      console.error("First-time batch sync error:", err);
      if (err instanceof Error && err.message.startsWith('{')) {
        throw err;
      }
    }
  };

  // --- Helper: Daily checking and streak breaker math ---
  const calculateDailyResets = (loadedHabits: Habit[], loadedStats: UserStats, loadedQuests: DailyQuest[]) => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    let updatedHabits = [...loadedHabits];
    let updatedStats = { ...loadedStats };
    let updatedQuests = [...loadedQuests];

    if (loadedStats.lastActiveDate !== todayStr) {
      if (loadedStats.lastActiveDate !== yesterdayStr && loadedStats.lastActiveDate !== null) {
        updatedStats.currentStreak = 0;
      }

      updatedHabits = loadedHabits.map((h: Habit) => {
        if (h.frequency === "daily" && h.lastCompletedDate !== todayStr && h.lastCompletedDate !== yesterdayStr && h.lastCompletedDate !== null) {
          return { ...h, streak: 0 };
        }
        return h;
      });

      updatedQuests = INITIAL_QUESTS.map((q) => ({
        ...q,
        completed: false,
        progress: q.type === "streak" ? updatedStats.currentStreak : 0,
      }));

      updatedStats.lastActiveDate = todayStr;
    }

    return { updatedHabits, updatedStats, updatedQuests };
  };

  // --- Unified Multi-State Saving ---
  const saveAll = async (
    newHabits: Habit[], 
    newStats: UserStats, 
    newQuests: DailyQuest[], 
    newBadges: Badge[],
    newAvatar: AvatarState | null = avatar,
    newArchived: Habit[] = archivedHabits
  ) => {
    setHabits(newHabits);
    setStats(newStats);
    setQuests(newQuests);
    setBadges(newBadges);
    setAvatar(newAvatar);
    setArchivedHabits(newArchived);

    // Store in localStorage
    localStorage.setItem("atomic_habits", JSON.stringify(newHabits));
    localStorage.setItem("atomic_stats", JSON.stringify(newStats));
    localStorage.setItem("atomic_quests", JSON.stringify(newQuests));
    localStorage.setItem("atomic_badges", JSON.stringify(newBadges));
    localStorage.setItem("atomic_archived_habits", JSON.stringify(newArchived));
    if (newAvatar) {
      localStorage.setItem("atomic_avatar", JSON.stringify(newAvatar));
    }

    // Backup to cloud Firestore if authenticated user
    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        const uid = currentUser.uid;
        await setDoc(doc(db, "users", uid), {
          stats: newStats,
          avatar: newAvatar
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      }
    }
  };

  // --- Login Success handler ---
  const handleLoginSuccess = async (user: any) => {
    setCurrentUser(user);
    if (user.uid === "guest-user-session") {
      localStorage.setItem("atomic_guest_user", JSON.stringify(user));
      syncUserDataFromLocal();
    } else {
      await syncUserDataFromCloud(user.uid);
    }
  };

  // --- Logout Handler ---
  const handleLogout = async () => {
    if (currentUser?.uid === "guest-user-session") {
      localStorage.removeItem("atomic_guest_user");
      localStorage.removeItem("atomic_avatar");
      setCurrentUser(null);
      setAvatar(null);
    } else {
      await signOut(auth);
      localStorage.removeItem("atomic_avatar");
      setCurrentUser(null);
      setAvatar(null);
    }
    setCurrentTab("dashboard");
  };

  // --- Onboarding Completion ---
  const handleOnboardComplete = async (initialAvatar: AvatarState) => {
    setAvatar(initialAvatar);
    localStorage.setItem("atomic_avatar", JSON.stringify(initialAvatar));

    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        const uid = currentUser.uid;
        await setDoc(doc(db, "users", uid), {
          email: currentUser.email || "",
          displayName: currentUser.displayName || "",
          photoURL: currentUser.photoURL || "",
          createdAt: new Date().toISOString(),
          avatar: initialAvatar,
          stats: stats
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      }
    }
  };

  // --- Update Existing Habit Settings (Reminders, Stacking, Cues) ---
  const handleUpdateHabit = async (habitId: string, updates: Partial<Habit>) => {
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        return { ...h, ...updates };
      }
      return h;
    });
    setHabits(updatedHabits);
    await saveAll(updatedHabits, stats, quests, badges, avatar, archivedHabits);

    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        const targetHabit = updatedHabits.find((h) => h.id === habitId);
        if (targetHabit) {
          await setDoc(doc(db, "users", currentUser.uid, "habits", habitId), targetHabit);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/habits/${habitId}`);
      }
    }
  };

  // --- Daily Reminders Alert System (Law 1: Make It Obvious) ---
  const [reminderToasts, setReminderToasts] = useState<Array<{ id: string; habitId: string; habitName: string; time: string }>>([]);

  const handleCompleteFromReminder = (habitId: string) => {
    // Dismiss active toast
    setReminderToasts((prev) => prev.filter((t) => t.habitId !== habitId));
    // Complete habit with standard handlers
    handleCompleteHabit(habitId);
  };

  useEffect(() => {
    const playCueSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        // Tone 1: Obvious starting chime
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain1.gain.setValueAtTime(0.08, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        osc1.start();
        osc1.stop(ctx.currentTime + 0.35);

        // Tone 2: Satisfying secondary chime shortly after
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
          gain2.gain.setValueAtTime(0.08, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          
          osc2.start();
          osc2.stop(ctx.currentTime + 0.5);
        }, 150);
        
      } catch (err) {
        console.warn("Web Audio API not allowed yet by browser interaction policy.", err);
      }
    };

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toLocaleDateString("en-CA"); // "YYYY-MM-DD"
      
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${hrs}:${mins}`;

      const triggeredJson = localStorage.getItem("atomic_triggered_alarms");
      const triggered: Record<string, string> = triggeredJson ? JSON.parse(triggeredJson) : {};
      let updated = false;

      habits.forEach((habit) => {
        if (habit.reminderEnabled && habit.reminderTime === timeStr) {
          const isCompletedToday = habit.lastCompletedDate === todayStr;
          const isTriggeredToday = triggered[habit.id] === todayStr;

          if (!isCompletedToday && !isTriggeredToday) {
            triggered[habit.id] = todayStr;
            updated = true;

            setReminderToasts((prev) => [
              ...prev.filter((t) => t.habitId !== habit.id),
              {
                id: `reminder-${habit.id}-${Date.now()}`,
                habitId: habit.id,
                habitName: habit.name,
                time: habit.reminderTime || "08:00"
              }
            ]);

            playCueSound();

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("⚡ Atomic OS Cue Triggered", {
                body: `It's time to execute your atomic habit: "${habit.name}"!`,
              });
            }
          }
        }
      });

      if (updated) {
        localStorage.setItem("atomic_triggered_alarms", JSON.stringify(triggered));
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [habits]);

  // --- Quest Progress Evaluator ---
  const updateQuestMetrics = (
    currentQuests: DailyQuest[], 
    actionType: string, 
    value: number = 1, 
    category?: string
  ): DailyQuest[] => {
    return currentQuests.map((quest) => {
      if (quest.completed) return quest;

      let newProgress = quest.progress;

      if (quest.type === "completions" && actionType === "complete") {
        newProgress = Math.min(quest.target, quest.progress + value);
      } else if (quest.type === "verification" && actionType === "verify") {
        newProgress = Math.min(quest.target, quest.progress + value);
      } else if (quest.type === "category" && actionType === "complete" && category) {
        if (category === "mind" || category === "growth") {
          newProgress = Math.min(quest.target, quest.progress + value);
        }
      }

      const isCompletedNow = newProgress >= quest.target;
      return {
        ...quest,
        progress: newProgress,
        completed: isCompletedNow,
      };
    });
  };

  // --- Habit Completion Handler ---
  const handleCompleteHabit = async (habitId: string, verificationResult?: VerificationResult, mood?: string, timeSpent?: number) => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit || targetHabit.lastCompletedDate === todayStr) return;

    let xpAward = targetHabit.xpReward;
    if (verificationResult?.verified) {
      xpAward += 15; // Bonus +15 XP for verified image uploads!
    }

    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        const isConsecutive = h.lastCompletedDate === new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
        const newStreak = isConsecutive || h.streak === 0 ? h.streak + 1 : h.streak;
        return {
          ...h,
          streak: newStreak,
          lastCompletedDate: todayStr,
          history: [...h.history, todayStr],
        };
      }
      return h;
    });

    const refreshedHabit = updatedHabits.find((h) => h.id === habitId)!;

    // Log check-in with mood and duration for rich timeline analytics
    const logId = `log-${Date.now()}`;
    const cleanMood = mood || "focused";
    const cleanTimeSpent = timeSpent || (targetHabit.difficulty === "easy" ? 10 : targetHabit.difficulty === "medium" ? 25 : 45);
    
    const newLog = {
      id: logId,
      habitId,
      habitName: targetHabit.name,
      category: targetHabit.category,
      date: todayStr,
      mood: cleanMood,
      timeSpent: cleanTimeSpent,
    };
    
    const savedLogs = localStorage.getItem("atomic_completion_logs");
    const loadedLogs = savedLogs ? JSON.parse(savedLogs) : [];
    const updatedLogs = [newLog, ...loadedLogs.filter((l: any) => !(l.habitId === habitId && l.date === todayStr))];
    localStorage.setItem("atomic_completion_logs", JSON.stringify(updatedLogs));

    // Stats level calculations
    let newXp = stats.xp + xpAward;
    let newLevel = stats.level;
    let newNextLevelXp = stats.nextLevelXp;
    let triggeredLevelUp = false;

    while (newXp >= newNextLevelXp) {
      newXp = newXp - newNextLevelXp;
      newLevel += 1;
      newNextLevelXp = Math.floor(newLevel * 300);
      triggeredLevelUp = true;
    }

    const isGlobalStreakYesterday = stats.lastActiveDate === new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
    let newGlobalStreak = stats.currentStreak;
    if (stats.currentStreak === 0 || isGlobalStreakYesterday) {
      const completedTodayCount = habits.filter((h) => h.lastCompletedDate === todayStr).length;
      if (completedTodayCount === 0) {
        newGlobalStreak += 1;
      }
    }

    const updatedStats: UserStats = {
      ...stats,
      xp: newXp,
      level: newLevel,
      nextLevelXp: newNextLevelXp,
      totalCompletions: stats.totalCompletions + 1,
      currentStreak: newGlobalStreak,
      maxStreak: Math.max(stats.maxStreak, newGlobalStreak),
      lastActiveDate: todayStr,
    };

    // Calculate Avatar Progress (form changes every 20 days)
    let updatedAvatar = avatar ? { ...avatar } : null;
    let triggeredAvatarEvolution = false;
    let oldStage = avatar ? avatar.stage : 1;

    if (updatedAvatar) {
      // If they haven't logged any check-ins today, increment avatar active day counter
      if ((updatedAvatar as any).lastProgressDate !== todayStr) {
        updatedAvatar.daysProgress += 1;
        (updatedAvatar as any).lastProgressDate = todayStr;
        
        // Form changes every 20 days
        const newStage = Math.min(5, Math.floor(updatedAvatar.daysProgress / 20) + 1);
        if (newStage > updatedAvatar.stage) {
          updatedAvatar.stage = newStage;
          triggeredAvatarEvolution = true;
          setPrevAvatarStage(oldStage);
        }
      }
    }

    // Evaluate Quests progress
    let updatedQuests = updateQuestMetrics(quests, "complete", 1, targetHabit.category);
    if (verificationResult?.verified) {
      updatedQuests = updateQuestMetrics(updatedQuests, "verify", 1);
    }

    updatedQuests.forEach((q, index) => {
      const originalQuest = quests[index];
      if (q.completed && !originalQuest.completed) {
        let questXp = updatedStats.xp + q.rewardXp;
        while (questXp >= updatedStats.nextLevelXp) {
          questXp = questXp - updatedStats.nextLevelXp;
          updatedStats.level += 1;
          updatedStats.nextLevelXp = Math.floor(updatedStats.level * 300);
          triggeredLevelUp = true;
        }
        updatedStats.xp = questXp;
      }
    });

    // Save state globally
    await saveAll(updatedHabits, updatedStats, updatedQuests, badges, updatedAvatar, archivedHabits);

    // Save specific changes in Firestore immediately if authenticated
    if (currentUser && currentUser.uid !== "guest-user-session") {
      const uid = currentUser.uid;
      try {
        await setDoc(doc(db, "users", uid, "habits", habitId), refreshedHabit);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}/habits/${habitId}`);
      }
      try {
        await setDoc(doc(db, "users", uid, "logs", logId), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}/logs/${logId}`);
      }
      
      // Push quests subcollection
      const batch = writeBatch(db);
      updatedQuests.forEach((q) => {
        batch.set(doc(db, "users", uid, "quests", q.id), q);
      });
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid} (batch quests)`);
      }
    }

    // Celebration modal triggers
    if (triggeredLevelUp) {
      setPrevLevel(stats.level);
      setShowLevelUpModal(true);
    }
    if (triggeredAvatarEvolution) {
      setShowAvatarEvolutionModal(true);
    }
  };

  // --- Badge Generation Handler ---
  const handleGenerateBadge = async (habitName: string, streak: number) => {
    const response = await fetch("/api/generate-badge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habitName,
        streakDays: streak,
        totalXp: stats.xp,
        stylePreference: "glowing holographic cyberpunk achievement emblem, centered isometric design, dark glassy vector elements",
      }),
    });

    if (!response.ok) {
      throw new Error("Badge generation endpoint returned error.");
    }

    return await response.json();
  };

  const handleAddBadgeToAlbum = async (newBadgeData: { habitName: string; imageUrl: string; promptUsed: string; streakMilestone: number }) => {
    const newBadge: Badge = {
      id: `badge-${Date.now()}`,
      habitName: newBadgeData.habitName,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      imageUrl: newBadgeData.imageUrl,
      promptUsed: newBadgeData.promptUsed,
      streakMilestone: newBadgeData.streakMilestone,
    };

    const updatedBadges = [newBadge, ...badges];
    await saveAll(habits, stats, quests, updatedBadges, avatar, archivedHabits);

    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "badges", newBadge.id), newBadge);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/badges/${newBadge.id}`);
      }
    }
  };

  // --- Add Habit ---
  const handleAddHabit = async (newHabitData: Omit<Habit, "id" | "streak" | "lastCompletedDate" | "history">) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      streak: 0,
      lastCompletedDate: null,
      history: [],
    };

    const updatedHabits = [...habits, newHabit];
    await saveAll(updatedHabits, stats, quests, badges, avatar, archivedHabits);

    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "habits", newHabit.id), newHabit);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/habits/${newHabit.id}`);
      }
    }
  };

  // --- Add Custom compounding super habit from Lab ---
  const handleAddCustomHabitFromLab = async (newHabitData: any) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      streak: 0,
      lastCompletedDate: null,
      history: [],
    };

    const updatedHabits = [...habits, newHabit];
    await saveAll(updatedHabits, stats, quests, badges, avatar, archivedHabits);

    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "habits", newHabit.id), newHabit);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/habits/${newHabit.id}`);
      }
    }
  };

  // --- Move to Archive (Archive / Paused formula instead of pure delete) ---
  const handleArchiveHabit = async (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;

    const updatedHabits = habits.filter((h) => h.id !== habitId);
    const updatedArchived = [...archivedHabits, { ...target, archived: true } as any];

    await saveAll(updatedHabits, stats, quests, badges, avatar, updatedArchived);

    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "habits", habitId), { ...target, archived: true }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/habits/${habitId}`);
      }
    }
  };

  // --- Restore habit from Archive ---
  const handleRestoreHabit = async (habitId: string) => {
    const target = archivedHabits.find((h) => h.id === habitId);
    if (!target) return;

    const updatedArchived = archivedHabits.filter((h) => h.id !== habitId);
    const restoredHabit = { ...target, archived: false } as any;
    delete restoredHabit.archived;
    const updatedHabits = [...habits, restoredHabit];

    await saveAll(updatedHabits, stats, quests, badges, avatar, updatedArchived);

    if (currentUser && currentUser.uid !== "guest-user-session") {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "habits", habitId), restoredHabit);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/habits/${habitId}`);
      }
    }
  };

  // --- Delete Archived Habit permanently ---
  const handleDeleteArchivedHabit = async (habitId: string) => {
    if (window.confirm("Permanently delete this habit formula from the database?")) {
      const updatedArchived = archivedHabits.filter((h) => h.id !== habitId);
      await saveAll(habits, stats, quests, badges, avatar, updatedArchived);

      if (currentUser && currentUser.uid !== "guest-user-session") {
        try {
          await deleteDoc(doc(db, "users", currentUser.uid, "habits", habitId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/habits/${habitId}`);
        }
      }
    }
  };

  // --- Fast-Forward Avatar Days cheat option to demonstrate evolution in live preview ---
  const handleCheatDaysProgress = async () => {
    if (!avatar) return;
    const nextDays = avatar.daysProgress + 20;
    const nextStage = Math.min(5, Math.floor(nextDays / 20) + 1);

    const updatedAvatar = {
      ...avatar,
      daysProgress: nextDays,
      stage: nextStage
    };

    setAvatar(updatedAvatar);
    if (nextStage > avatar.stage) {
      setPrevAvatarStage(avatar.stage);
      setShowAvatarEvolutionModal(true);
    }

    await saveAll(habits, stats, quests, badges, updatedAvatar, archivedHabits);
  };

  // --- Clear Progress ---
  const handleResetApp = async () => {
    if (window.confirm("Are you sure you want to reset all habits, streaks, levels and collected badges? This cannot be undone.")) {
      localStorage.clear();
      setHabits(INITIAL_HABITS);
      setStats(INITIAL_STATS);
      setQuests(INITIAL_QUESTS);
      setBadges([]);
      setArchivedHabits([]);
      setCategoryFilter("all");
      setShowLevelUpModal(false);

      if (currentUser && currentUser.uid !== "guest-user-session") {
        const uid = currentUser.uid;
        // Clear subcollections
        const batch = writeBatch(db);
        habits.forEach((h) => batch.delete(doc(db, "users", uid, "habits", h.id)));
        archivedHabits.forEach((h) => batch.delete(doc(db, "users", uid, "habits", h.id)));
        badges.forEach((b) => batch.delete(doc(db, "users", uid, "badges", b.id)));
        quests.forEach((q) => batch.delete(doc(db, "users", uid, "quests", q.id)));
        try {
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${uid} (batch reset)`);
        }

        try {
          await setDoc(doc(db, "users", uid), {
            stats: INITIAL_STATS,
            avatar: avatar ? { ...avatar, daysProgress: 1, stage: 1 } : null
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }

        if (avatar) {
          setAvatar({ ...avatar, daysProgress: 1, stage: 1 });
        }
      }
    }
  };

  const filteredHabits = categoryFilter === "all" 
    ? habits 
    : habits.filter((h) => h.category === categoryFilter);

  // Loading Screen spinner
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500/25 border-t-orange-500 animate-spin"></div>
        <span>Hydrating Atomic Connection...</span>
      </div>
    );
  }

  // Auth Guard / Onboarding trigger
  if (!currentUser || !avatar) {
    return (
      <LoginAndOnboarding
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onOnboardComplete={handleOnboardComplete}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-200 blueprint-grid-bg">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-3xl glowing-bg-effect animate-pulse"></div>
      </div>

      {/* Synchronized Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab("dashboard")}
              className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <div className="w-4 h-4 bg-zinc-950 rounded-full animate-pulse"></div>
            </button>
            <div className="text-left">
              <h1 className="font-display text-xl font-bold tracking-tight uppercase text-zinc-100">
                Atomic OS Tracker
              </h1>
              <p className="text-[9px] text-zinc-500 font-mono font-bold tracking-widest uppercase">
                LEVEL {stats.level} // DB_SYNCED_ONLINE // USER: {currentUser.displayName || "GUEST"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 justify-center">
            
            {/* Quick Stats Banner */}
            <div className="flex items-center gap-3 rounded-full bg-zinc-900/80 px-4 py-1.5 border border-zinc-850">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />
                <span className="font-mono text-xs font-bold text-zinc-300">{stats.currentStreak}d Streak</span>
              </div>
              <div className="h-3 w-px bg-zinc-800"></div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-orange-500 fill-orange-500/10" />
                <span className="font-mono text-xs font-bold text-zinc-300">{stats.xp} XP</span>
              </div>
            </div>

            {/* Logout control */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Logout Profile Account"
            >
              <LogOut className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Primary content node */}
      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Banner Level Progress */}
        <div className="mb-6">
          <LevelProgressBar stats={stats} />
        </div>

        {/* Tab View Switcher Panel */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Main Habiteer Dashboard */}
          {currentTab === "dashboard" && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* LEFT COLUMN: Actions logging & forging (7 columns) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Title Log Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-left">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold">MISSION DOCK / TODAY</p>
                    <h2 className="font-display text-base font-bold text-zinc-100 uppercase tracking-wider">
                      Daily Atomic Actions
                    </h2>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                    {["all", "health", "mind", "growth", "routine"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-lg px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          categoryFilter === cat
                            ? "bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/10"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Habit Cards Map */}
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredHabits.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center text-center p-12 rounded-3xl bg-zinc-900/30 border border-dashed border-zinc-800"
                      >
                        <Trophy className="h-8 w-8 text-zinc-700 mb-3" />
                        <h4 className="font-display font-bold text-xs text-zinc-400 uppercase tracking-wider">No habits forged in this category</h4>
                        <p className="text-[11px] text-zinc-600 mt-1 max-w-xs leading-relaxed uppercase tracking-tight font-mono">
                          Forge a new atomic action using the editor below to begin your daily consistency journey.
                        </p>
                      </motion.div>
                    ) : (
                      filteredHabits.map((habit) => (
                        <motion.div
                          key={habit.id}
                          layout
                          className="relative group"
                        >
                          {/* Pause/Archive action button */}
                          <button
                            onClick={() => handleArchiveHabit(habit.id)}
                            className="absolute top-5 right-5 z-20 h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-500 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Pause & Archive Formula"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>

                          <HabitCard
                            habit={habit}
                            onComplete={handleCompleteHabit}
                            onGenerateBadge={handleGenerateBadge}
                            onAddBadgeToAlbum={handleAddBadgeToAlbum}
                            onUpdateHabit={handleUpdateHabit}
                          />
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Habits synthesis creator */}
                <div>
                  <HabitCreator onAddHabit={handleAddHabit} />
                </div>

              </div>

              {/* RIGHT COLUMN: Daily Quests, Avatar Companion, Album (5 columns) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* 1. Evolutionary Avatar Showcase (THE CORE PIECE) */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-2xl flex flex-col items-center">
                  <div className="flex justify-between w-full border-b border-zinc-850 pb-2.5 mb-4 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    <span>COGNITIVE COMPANION</span>
                    <span className="text-orange-500">SECURE LINK</span>
                  </div>
                  <AvatarShowcase 
                    avatar={avatar} 
                    onCheatDaysProgress={handleCheatDaysProgress} 
                  />
                </div>

                {/* 2. Giant Streak Indicator */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="grid grid-cols-10 h-full w-full">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-white"></div>
                      ))}
                    </div>
                  </div>
                  <div className="z-10">
                    <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-full mb-2 border border-orange-500/20">
                      CURRENT STREAK
                    </div>
                    <h4 className="text-[100px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                      {stats.currentStreak}
                    </h4>
                    <p className="text-xs font-light text-zinc-400 uppercase tracking-widest font-mono">Consecutive Days</p>
                  </div>
                </div>

                {/* Quests list */}
                <DailyQuestsList quests={quests} />

                {/* Badge album */}
                <BadgeAlbum badges={badges} />

              </div>
            </motion.div>
          )}

          {/* TAB 2: Dynamic Calendar Timeline */}
          {currentTab === "calendar" && (
            <motion.div
              key="tab-calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarTab habits={habits} />
            </motion.div>
          )}

          {/* TAB 3: Dynamic Laboratory synthesis */}
          {currentTab === "laboratory" && (
            <motion.div
              key="tab-laboratory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <LaboratoryTab 
                habits={habits} 
                onAddCustomHabit={handleAddCustomHabitFromLab} 
              />
            </motion.div>
          )}

          {/* TAB 4: Dynamic Repository Archives */}
          {currentTab === "archive" && (
            <motion.div
              key="tab-archive"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ArchiveTab 
                habits={habits}
                archivedHabits={archivedHabits}
                onRestoreHabit={handleRestoreHabit}
                onDeleteArchivedHabit={handleDeleteArchivedHabit}
                badges={badges}
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* Global Analytics Dashboard Panel, shown only on Dashboard */}
        {currentTab === "dashboard" && (
          <div className="mt-8">
            <HabitAnalytics 
              habits={habits}
              stats={stats}
              onAddBadgeToAlbum={handleAddBadgeToAlbum}
              onGenerateBadge={handleGenerateBadge}
            />
          </div>
        )}

      </main>

      {/* Dynamic Nav Bar Footer */}
      <footer className="mt-8 py-8 border-t border-zinc-900 bg-zinc-950/60 flex flex-col sm:flex-row justify-between items-center text-zinc-600 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 gap-4 relative z-10">
        <div className="flex gap-6 text-[9px] uppercase tracking-[0.2em] font-black">
          <button 
            onClick={() => setCurrentTab("dashboard")} 
            className={`cursor-pointer transition-colors ${currentTab === "dashboard" ? "text-orange-500" : "text-zinc-500 hover:text-zinc-350"}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab("calendar")} 
            className={`cursor-pointer transition-colors ${currentTab === "calendar" ? "text-orange-500" : "text-zinc-500 hover:text-zinc-350"}`}
          >
            Calendar
          </button>
          <button 
            onClick={() => setCurrentTab("laboratory")} 
            className={`cursor-pointer transition-colors ${currentTab === "laboratory" ? "text-orange-500" : "text-zinc-500 hover:text-zinc-350"}`}
          >
            Laboratory
          </button>
          <button 
            onClick={() => setCurrentTab("archive")} 
            className={`cursor-pointer transition-colors ${currentTab === "archive" ? "text-orange-500" : "text-zinc-500 hover:text-zinc-350"}`}
          >
            Archive
          </button>
        </div>
        <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">
          SYSTEM_STABLE // 2026.06.26 // ATOMIC_OS_v1.2
        </div>
      </footer>

      {/* LEVEL UP CELEBRATION MODAL */}
      <AnimatePresence>
        {showLevelUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-orange-500/30 bg-zinc-900 p-8 text-center shadow-[0_0_50px_rgba(249,115,22,0.15)]"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-orange-500 opacity-10 blur-3xl animate-pulse"></div>
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-zinc-950 shadow-xl shadow-orange-500/25 mb-5 relative z-10">
                <Award className="h-9 w-9 animate-bounce" />
              </div>

              <h2 className="font-display text-2xl font-black text-zinc-100 tracking-wider relative z-10 uppercase">
                LEVEL UP ACHIEVED!
              </h2>
              <p className="font-mono text-xs text-orange-500 font-bold uppercase mt-1 relative z-10">
                You reached Level {stats.level}!
              </p>

              <div className="my-6 rounded-xl bg-zinc-950/80 p-4 border border-zinc-850 text-zinc-300 text-xs leading-relaxed relative z-10 text-left uppercase font-mono tracking-tight">
                <p>Your atomic actions are compounding. You successfully surpassed the {prevLevel * 300} XP threshold!</p>
                <p className="mt-2 text-[10px] text-zinc-500 font-bold">
                  Daily streak multiplier maintained. Focus on forging more tiny habits to fuel your avatar further.
                </p>
              </div>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full rounded-xl bg-orange-500 text-zinc-950 font-display font-black text-xs py-3 shadow-md shadow-orange-500/15 transition-all relative z-10 cursor-pointer uppercase tracking-wider hover:bg-orange-400"
              >
                Claim Level Rewards & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AVATAR EVOLUTION CELEBRATION MODAL */}
      <AnimatePresence>
        {showAvatarEvolutionModal && avatar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-purple-500/30 bg-zinc-900 p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.15)]"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500 text-zinc-950 shadow-xl shadow-purple-500/25 mb-5 relative z-10">
                <Sparkles className="h-9 w-9 animate-bounce" />
              </div>

              <h2 className="font-display text-2xl font-black text-zinc-100 tracking-wider relative z-10 uppercase">
                COMPANION EVOLVED!
              </h2>
              <p className="font-mono text-xs text-purple-400 font-bold uppercase mt-1 relative z-10">
                {avatar.name} HAS ASCENDED TO STAGE {avatar.stage}!
              </p>

              {/* Render showcase inside modal */}
              <div className="my-6 flex justify-center scale-90 relative z-10">
                <AvatarShowcase avatar={avatar} showDetails={false} />
              </div>

              <div className="my-6 rounded-xl bg-zinc-950/80 p-4 border border-zinc-850 text-zinc-300 text-xs leading-relaxed relative z-10 text-left uppercase font-mono tracking-tight">
                <p>Consistency compounds! After completing habit formulas for {avatar.daysProgress} days, your {avatar.physiology} companion avatar has morphed forms from Stage {prevAvatarStage} to Stage {avatar.stage}.</p>
                <p className="mt-2 text-[10px] text-purple-400 font-bold">
                  NEW CELLULAR BIO-ABILITIES AND ENHANCED HOLOGRAPHIC EMISSIONS ARE NOW FULLY ACTIVE.
                </p>
              </div>

              <button
                onClick={() => setShowAvatarEvolutionModal(false)}
                className="w-full rounded-xl bg-purple-500 text-zinc-950 font-display font-black text-xs py-3 shadow-md shadow-purple-500/15 transition-all relative z-10 cursor-pointer uppercase tracking-wider hover:bg-purple-400"
              >
                Accept Evolution & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Obvious Cue Daily Reminder Alarms Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {reminderToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="pointer-events-auto flex flex-col p-4 rounded-xl border border-orange-500/80 bg-zinc-950 shadow-[0_0_20px_rgba(249,115,22,0.15)] text-zinc-100 relative overflow-hidden"
            >
              {/* Decorative scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(249,115,22,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
              
              <div className="flex items-start gap-2.5 relative z-10">
                <Bell className="h-5 w-5 text-orange-500 animate-bounce shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400">
                      ⚡ Cue Triggered
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">{toast.time}</span>
                  </div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-zinc-100 mt-1">
                    {toast.habitName}
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1 leading-normal uppercase">
                    James Clear says: "Make it obvious!" Your daily cue is active. Complete it now.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3.5 relative z-10">
                <button
                  type="button"
                  onClick={() => setReminderToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="rounded-lg border border-zinc-850 bg-zinc-900 px-2.5 py-1 text-[9px] font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Postpone
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteFromReminder(toast.habitId)}
                  className="rounded-lg bg-orange-500 text-zinc-950 px-3 py-1 text-[9px] font-display font-black transition-all hover:bg-orange-400 cursor-pointer uppercase tracking-wider shadow-sm shadow-orange-500/20"
                >
                  Execute Habit
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
