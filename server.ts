import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "500kb" }));

// Lazy initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Basic in-memory rate limiting (max 40 requests per minute per IP)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return next();
  }

  if (entry.count >= 40) {
    return res.status(429).json({
      success: false,
      error: "Too many AI requests. Please wait a moment before trying again.",
    });
  }

  entry.count += 1;
  next();
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Sentence Explanation Endpoint
app.post("/api/explain", rateLimitMiddleware, async (req, res) => {
  try {
    const { sentence, translation, sourceLang, targetLang, level, query } = req.body;

    if (!sentence || !translation || typeof sentence !== "string" || typeof translation !== "string") {
      return res.status(400).json({ error: "Missing or invalid sentence/translation parameters." });
    }

    // Guard against excessively large inputs
    if (sentence.length > 500 || translation.length > 500) {
      return res.status(400).json({ error: "Input exceeds maximum character limit." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        success: false,
        fallback: true,
        message: "Gemini API key not configured. Using pre-curated native linguistic breakdown.",
      });
    }

    const cefrLevel = level || "B1";
    const levelGuidance =
      cefrLevel === "A1" || cefrLevel === "A2"
        ? "The learner is at beginner/elementary level (A1-A2). Keep grammatical terms very simple, intuitive, and concise."
        : cefrLevel === "C1"
        ? "The learner is advanced (C1). Provide precise linguistic terminology (e.g. Nominalstil, Funktionsverbgefüge, genitive rection) without fluff."
        : "The learner is intermediate (B1-B2). Focus on sentence bracket (Satzklammer), connector usage (weil/obwohl/wenn), and natural idiomatic collocations.";

    const prompt = `You are a succinct, world-class linguist explaining a sentence for a language learner.
${levelGuidance}

Sentence (${sourceLang || "German"}): "${sentence}"
Reference translation (${targetLang || "English"}): "${translation}"
Learner CEFR Level: ${cefrLevel}
${query ? `Learner Question: "${query}"` : ""}

Provide a crisp, structured explanation in markdown. Avoid conversational pleasantries:
### Core Nuance
1-2 direct sentences on what makes this phrasing natural.

### Key Grammar & Word Order
- Bullet points on verb position (V2 rule, subordinate verb-final, separable prefix) and case mechanics (Dativ/Akkusativ/Genitiv).

### Vocabulary & Register
- Key words, idioms, or formal/informal register notes.

### Natural Alternatives
- 1-2 everyday alternative ways native speakers express the same thought.`;

    // Timeout safety race: max 7 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timed out")), 7000)
    );

    const apiPromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.25,
      },
    });

    const response: any = await Promise.race([apiPromise, timeoutPromise]);
    const explanation = response.text || "No explanation could be generated.";

    return res.json({ success: true, explanation });
  } catch (error: any) {
    console.error("AI Explain Error:", error?.message || error);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: "AI service temporarily unavailable. Refer to native linguistic breakdown.",
    });
  }
});

// AI Typing Feedback Endpoint
app.post("/api/evaluate", rateLimitMiddleware, async (req, res) => {
  try {
    const { userAttempt, targetExpected, sourceSentence, sourceLang, targetLang } = req.body;

    if (!userAttempt || !targetExpected) {
      return res.status(400).json({ error: "Missing userAttempt or targetExpected" });
    }

    if (userAttempt.length > 500) {
      return res.status(400).json({ error: "Attempt text too long" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Deterministic fallback response
      const normalizedUser = userAttempt.trim().toLowerCase().replace(/[.,!?;:]/g, "");
      const normalizedTarget = targetExpected.trim().toLowerCase().replace(/[.,!?;:]/g, "");
      const isExact = normalizedUser === normalizedTarget;

      return res.json({
        success: true,
        fallback: true,
        isCorrect: isExact,
        verdict: isExact ? "exact" : "incorrect",
        shortFeedback: isExact ? "Exact match!" : `Expected: "${targetExpected}"`,
      });
    }

    const prompt = `You are an expert evaluator for translation practice.
Prompt (${sourceLang || "source"}): "${sourceSentence || ""}"
Expected Reference (${targetLang || "target"}): "${targetExpected}"
Learner's Typed Translation: "${userAttempt}"

Classify the learner's attempt into one of:
1. "exact": Essentially identical to expected reference (minor punctuation difference is acceptable).
2. "alternative": Different wording or synonyms, but completely valid, natural, and grammatically sound.
3. "minor_typo": Small spelling mistake or missing German noun capitalization, but meaning and grammar are solid.
4. "grammar_error": Correct vocabulary concept, but incorrect case ending, wrong preposition, or broken word order.
5. "incorrect": Substantially wrong meaning or incomprehensible.

Return strict JSON:
{
  "isCorrect": boolean (true if exact, alternative, or minor_typo; false if grammar_error or incorrect),
  "verdict": "exact" | "alternative" | "minor_typo" | "grammar_error" | "incorrect",
  "shortFeedback": "Single crisp sentence explaining the verdict constructively.",
  "breakdown": "Brief note on specific grammar or spelling point if applicable."
}`;

    // 6 second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI evaluation timed out")), 6000)
    );

    const apiPromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.15,
      },
    });

    const response: any = await Promise.race([apiPromise, timeoutPromise]);
    const parsed = JSON.parse(response.text || "{}");

    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("AI Evaluate Error:", error?.message || error);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: "AI evaluation unavailable.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
