import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint: Verify Habit completion using an uploaded photo (Multimodal analysis with gemini-3.5-flash)
app.post("/api/verify-habit", async (req, res) => {
  try {
    const { habitName, habitDescription, imageBase64, mimeType } = req.body;

    if (!habitName || !imageBase64 || !mimeType) {
      res.status(400).json({ error: "Missing required parameters: habitName, imageBase64, or mimeType" });
      return;
    }

    const ai = getAiClient();

    // Clean base64 string if it contains the data:image/... header
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Analyze this uploaded image and determine if it represents reasonable proof of completion or progress for the habit named "${habitName}".
      Habit description: "${habitDescription || 'No description provided'}"
      
      Requirements for your review:
      1. Be permissive but authentic: if the picture shows a book, a laptop screen, a water glass, a gym selfie, running shoes, a healthy meal, or clean desk, it qualifies as habit completion.
      2. Provide a super positive, gamified, encouraging response. Address the user like an epic adventurer on a personal growth journey.
      3. Return a structured JSON response.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verified: {
              type: Type.BOOLEAN,
              description: "True if the image serves as satisfactory proof or symbol of completing the habit, otherwise false.",
            },
            confidence: {
              type: Type.INTEGER,
              description: "Confidence percentage of verification (integer 0-100).",
            },
            title: {
              type: Type.STRING,
              description: "An epic, gamified quest title celebrating this achievement (e.g. 'The Iron Crusader', 'Apex Reader', 'Hydration Overlord').",
            },
            feedback: {
              type: Type.STRING,
              description: "A rich, enthusiastic, highly engaging and fun critique/celebration of their photo, motivating them to maintain their streak.",
            },
          },
          required: ["verified", "confidence", "title", "feedback"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from verification model.");
    }

    const parsedResult = JSON.parse(resultText.trim());
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error verifying habit:", error);
    res.status(500).json({
      error: "Failed to verify habit image with AI.",
      details: error.message || String(error),
    });
  }
});

// Endpoint: Generate customized milestone/progress graphics (using gemini-2.5-flash-image)
app.post("/api/generate-badge", async (req, res) => {
  try {
    const { habitName, streakDays, totalXp, stylePreference } = req.body;

    if (!habitName) {
      res.status(400).json({ error: "Missing required parameter: habitName" });
      return;
    }

    const ai = getAiClient();

    const streakText = streakDays ? `${streakDays}-day streak` : "Habit Master";
    const xpText = totalXp ? `${totalXp} XP` : "Elite Growth";
    const style = stylePreference || "futuristic glowing 3D hologram";

    const promptText = `A premium, stunning gamified achievement badge for completed habit: "${habitName}".
    Theme elements: ${streakText}, ${xpText}.
    Style: ${style}, clean isometric view, centered design, glowing vibrant colors, dark slate or obsidian background, volumetric lighting, epic gaming vector concept. 
    Make it highly motivational, professional, and visually breathtaking. Ensure it contains no text gibberish, just purely beautiful graphic symbols of consistency and power.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: promptText }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let base64Image = "";
    
    // Scan candidate parts to locate the generated image
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image was returned from the image generation model.");
    }

    res.json({
      imageUrl: `data:image/png;base64,${base64Image}`,
      promptUsed: promptText,
    });
  } catch (error: any) {
    console.error("Error generating badge:", error);
    res.status(500).json({
      error: "Failed to generate achievement badge.",
      details: error.message || String(error),
    });
  }
});

// Endpoint: Compound Synthesis Laboratory (using gemini-3.5-flash)
app.post("/api/fuse-habits", async (req, res) => {
  try {
    const { habitAName, habitADesc, habitBName, habitBDesc } = req.body;

    if (!habitAName || !habitBName) {
      res.status(400).json({ error: "Missing required parameters: habitAName and habitBName" });
      return;
    }

    const ai = getAiClient();

    const promptText = `You are a legendary atomic habit synthesis scientist and performance bio-hacker working in the Compound Synthesis Laboratory.
    Your mission is to take two standard habits and merge them into a single, cohesive, synergistic "Super-Habit Formulation" that a user can perform in one action sequence.
    
    Habit A: "${habitAName}" (${habitADesc || "no description"})
    Habit B: "${habitBName}" (${habitBDesc || "no description"})
    
    Synthesize an epic, compounded version of these habits. Keep the description highly actionable, clear, and scientific. Provide a custom motivational science quote validating the synthesis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [{ text: promptText }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "A highly stylized, epic cybernetic-styled name for the fused super-habit (e.g. 'Hydro-Zen Breathing Core', 'Deep Focus Cardio Ignition').",
            },
            description: {
              type: Type.STRING,
              description: "A clean, science-backed 2-sentence description of how to perform this fused routine simultaneously or in a tight single micro-action sequence.",
            },
            category: {
              type: Type.STRING,
              description: "The primary category. Must be one of: 'health', 'mind', 'work', 'growth', 'routine'.",
            },
            difficulty: {
              type: Type.STRING,
              description: "Difficulty of the compound routine. Must be one of: 'easy', 'medium', 'hard'.",
            },
            xpReward: {
              type: Type.INTEGER,
              description: "XP reward for completing. Range 30 to 75.",
            },
            scienceQuote: {
              type: Type.STRING,
              description: "A highly stylized, epic, motivational quote from the AI Laboratory Specialist explaining the cognitive or physiological benefits of combining these two practices.",
            },
          },
          required: ["name", "description", "category", "difficulty", "xpReward", "scienceQuote"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from synthesis engine.");
    }

    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Error synthesizing habits in laboratory:", error);
    res.status(500).json({
      error: "Failed to fuse habits in the compound laboratory.",
      details: error.message || String(error),
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
