# ⚡ Atomic OS Habit Tracker

A gamified, high-fidelity full-stack habit tracking system that turns personal consistency into an immersive progression game. Built on the core philosophy of atomic compounding, the application integrates responsive client-side interactions, durable Google Firebase synchronization, and server-side AI-powered experiences.

---

## 🚀 Key Features

### 👤 Identity & Cloud Synchronization
* **Google Sign-In**: Authenticate securely using Google Accounts or operate in a sandboxed Guest mode.
* **Firestore Sync**: Automatic, secure synchronization of habits, quests, badges, history, and profile statistics to Google Cloud Firestore.
* **Automatic Recovery**: If you transition from Guest to Google, your sandbox data is seamlessly migrated to your cloud profile.

### 🧬 Evolutionary Companion Avatar
* **Adaptive Organisms**: Choose from multiple custom bio-types (Biomechanical, Cybernetic, etc.) during onboarding.
* **Form Evolution**: Your companion tracks your persistent active days and undergoes physical transformations (Stage 1 to Stage 5) every 20 completed tracking milestones.
* **Demonstration Control**: Includes an integrated developer fast-forward control to preview advanced stages.

### 🤖 AI Laboratory & Badge Forge
* **AI Habit Verification**: Upload real-world photo check-ins analyzed via AI to unlock bonus completion XP (+15 XP).
* **Gemini Badge Forge**: Compounding streaks allow you to forge highly detailed, glowing holographic cyberpunk achievement emblems generated specifically for your achievement milestones.
* **Compound Formula Builder**: Synthesize multi-tier compounding habit sequences with custom reward values and difficulty curves.

### 📊 Analytics, 1% Compounding & Interactive Timelines
* **Interactive Grid Calendar**: Visualize historical completions across a unified global grid matching classic GitHub-style contribution tracking.
* **1% Better Every Day Chart**: A visual compounding gains simulator representing James Clear's mathematical formula `(1.01)³⁶⁵ = 37.78` vs `(0.99)³⁶⁵ = 0.03` with an interactive, glowing tiny gains bar graph.
* **7-Day Consistency Curve**: A custom-drawn SVG Bezier path chart showcasing daily habit completion frequency and duration logs over the last 7 days.
* **Activity Logs & Mood Timeline**: Analyze focus logs, historical completion frequencies, and category metrics.
* **Daily Missions**: Dynamic daily quests with scaling experience payouts.

### 🔔 "Make It Obvious" Daily Cue Alarms
* **Browser-Based Reminders**: Configure customizable, time-based cue alerts for each active habit.
* **Retro Synth Sound Generator**: Triggers a unique audio check-in chime generated in real-time using the browser's standard Web Audio API (no external asset dependencies).
* **HTML5 Desktop Notifications**: Direct desktop popups when cue alarms fire (if user permission is granted).
* **Instant Actionable Toasts**: Active alarms display glowing overlay banners in the corner of the application screen with direct "Execute Habit" completion handshakes.

### 📔 James Clear Philosophy Integration
* **Habit Stacking Formula**: Incorporate the classic Clear structural format `After [anchor cue], I will [atomic habit]` directly below habit descriptions as obvious cue reminders.
* **Identity-Shift Anchoring**: Link each habit to an identity statement `I am a/an [identity focus]` to prioritize who you wish to become rather than just what you want to achieve.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Install Dependencies
Clone the repository and install the project packages:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and populate it with your credentials (see `.env.example` as a template):
```env
# Google Gemini API Connection
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration Parameters
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
```

### 4. Run the Development Server
Launch the development server running on Express + Vite:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Production Compilations
To bundle and compile both the React client SPA and the Express server for production:
```bash
npm run build
npm start
```

---

## 📁 Technical Architecture & Project Structure

* **Frontend**: React 18 with Vite, custom responsive layouts styled with **Tailwind CSS**, and fluid vector micro-animations powered by **Motion** (`motion/react`).
* **Backend**: Express.js server in `server.ts` managing Vite development middleware, serving static production builds, and executing secure, server-side API requests to the Gemini SDK.
* **Database & Auth**: Google Firebase Auth (Authentication) and Firestore (NoSQL Document Store) structured with nested user-specific subcollections (`habits`, `badges`, `quests`, `logs`).
* **Icons**: [Lucide-React](https://lucide.dev/) icon bundle.

```
├── .env.example             # Example environment setup
├── firestore.rules          # Firestore security validation definitions
├── firebase-blueprint.json  # Project blueprint schemas
├── metadata.json            # Application permissions and workspace capabilities
├── package.json             # Build commands and dependency declarations
├── server.ts                # Express backend & API proxy controller
└── src/
    ├── App.tsx              # Main system shell, state routers, and UI controller
    ├── data.ts              # System defaults, seeds, and initial categories
    ├── types.ts             # Strong TypeScript definitions and structures
    ├── main.tsx             # React SPA entry point
    ├── index.css            # Tailwind directive inputs and custom utility variables
    ├── components/          # Modularized visual blocks
    │   ├── AvatarShowcase.tsx
    │   ├── HabitCard.tsx
    │   ├── DailyQuestsList.tsx
    │   ├── LevelProgressBar.tsx
    │   ├── BadgeAlbum.tsx
    │   ├── HabitCreator.tsx
    │   ├── HabitAnalytics.tsx
    │   ├── CalendarTab.tsx
    │   ├── LaboratoryTab.tsx
    │   ├── ArchiveTab.tsx
    │   └── LoginAndOnboarding.tsx
    └── lib/
        └── firebase.ts      # Cloud connection bootstraps & SDK configurations
```

---

## 🎯 How to Use Atomic OS

1. **Onboarding**: Select your display avatar and customize their naming and bio-profile.
2. **Forge Habits**: Create daily or weekly habits across categories (`Mind`, `Health`, `Routine`, `Growth`).
3. **Commit & Complete**: Check in on your habits daily to compound your streaks. Click the action button to complete, or click the Camera icon to submit visual proof for additional XP.
4. **Quest Progress**: Complete daily quests to reach level milestones and evolve your companion avatar.
5. **Laboratories**: Combine active habits to craft compounded habit sequences, and forge dynamic holographic badge items upon completing high-level consistency challenges.
6. **Timeline Auditing**: Switch to the **Calendar** tab to audit your historical consistency grid or browse **Archive** to pause/restore previous habit formulas.
