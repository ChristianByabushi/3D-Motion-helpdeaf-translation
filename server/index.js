import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = {
  ar: "Arabic",
  sw: "Swahili",
  ha: "Hausa",
  yo: "Yoruba",
  om: "Oromo",
};

// Richer gloss sets — more signs per language so animation cycles through more variety
const MOCK_GLOSSES = {
  ar: ["مرحبا", "كيف", "حال", "أنت", "اليوم", "شكرا", "نعم", "لا", "مساعدة"],
  sw: ["HABARI", "NZURI", "ASANTE", "KARIBU", "SAWA", "NDIYO", "HAPANA", "MSAADA", "SHULE"],
  ha: ["SANNU", "LAFIYA", "NAGODE", "YAUWA", "KANA", "TAIMAKO", "MAKARANTA", "ASIBITI"],
  yo: ["ẸKÁÀBỌ̀", "BÁWO", "NI", "DÁADÁA", "ÀṢẸ", "ẸẸ", "RÁRÁ", "ÌRÀNLỌ́WỌ́"],
  om: ["AKKAM", "NAGAA", "GALATOOMAA", "DHUFAA", "MAAL", "EEYYEE", "LAKKI", "GARGAARSA"],
};

const MOCK_TRANSCRIPTS = {
  ar: "مرحباً، كيف حالك اليوم؟",
  sw: "Habari yako leo? Niko vizuri sana.",
  ha: "Sannu, yaya kake? Ina lafiya.",
  yo: "Ẹ káàbọ̀, báwo ni ẹ ṣe wà?",
  om: "Akkam bultan? Nagaan jiraa?",
};

// ─── REST Endpoints ───────────────────────────────────────────────────────────

app.get("/v1/health", (_req, res) => {
  res.json({
    status: "healthy",
    components: {
      asr_service: "operational",
      nmt_service: "operational",
      motion_synthesizer: "operational",
      animation_pipeline: "operational",
      streaming_service: "operational",
    },
    timestamp: new Date().toISOString(),
  });
});

app.post("/v1/translate", (req, res) => {
  const { text, source_language } = req.body;

  if (!source_language || !SUPPORTED_LANGUAGES[source_language]) {
    return res.status(400).json({
      error_code: "UNSUPPORTED_LANGUAGE",
      message: "Supported languages: ar, sw, ha, yo, om",
      supported: Object.keys(SUPPORTED_LANGUAGES),
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      error_code: "NMT_EMPTY_INPUT",
      message: "Input text cannot be empty.",
    });
  }

  setTimeout(() => {
    const glosses = buildGlossesFromText(text, source_language);
    const animationId = `anim_${Date.now()}`;
    const framesPerGloss = 40;

    res.json({
      request_id: `req_${Date.now()}`,
      source_language,
      input_text: text,
      transcript: text,
      glosses: glosses.map((g, i) => ({
        index: i,
        gloss: g,
        fingerspelled: false,
        duration_ms: framesPerGloss * (1000 / 30),
      })),
      animation: {
        animation_id: animationId,
        asset_url: `/v1/animations/${animationId}`,
        frame_count: glosses.length * framesPerGloss,
        duration_seconds: (glosses.length * framesPerGloss) / 30,
        quality_score: 0.82 + Math.random() * 0.15,
      },
      pipeline_metadata: {
        asr_confidence: null,
        nmt_bleu: 0.73,
        motion_quality: 0.84,
        total_latency_ms: 1200 + Math.floor(Math.random() * 800),
      },
    });
  }, 800);
});

app.get("/v1/animations/:id", (req, res) => {
  res.json({
    animation_id: req.params.id,
    asset_url: `https://cdn.helpdeaf.example/animations/${req.params.id}.gltf`,
    frame_count: 180,
    duration_seconds: 6,
    quality_score: 0.85,
    created_at: new Date().toISOString(),
  });
});

app.get("/v1/models", (_req, res) => {
  res.json({
    models: [
      { name: "asr-multilingual",  version: "v1.2.0", languages: ["ar", "sw", "ha", "yo", "om"], status: "active" },
      { name: "nmt-sign-gloss",    version: "v2.0.1", languages: ["ar", "sw", "ha", "yo", "om"], status: "active" },
      { name: "motion-synthesizer",version: "v1.5.3", languages: ["all"],                         status: "active" },
    ],
  });
});

// ─── HTTP + WebSocket Server ──────────────────────────────────────────────────

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/v1/stream" });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");
  let streamInterval = null;

  ws.on("message", (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }

    if (msg.type === "START_STREAM") {
      if (streamInterval) clearInterval(streamInterval);

      const { source_language = "sw", text = "" } = msg;
      const glosses = buildGlossesFromText(text, source_language);

      // Each gloss gets FRAMES_PER_GLOSS frames so the avatar visibly changes per sign
      const FRAMES_PER_GLOSS = 40;
      const TOTAL_FRAMES = glosses.length * FRAMES_PER_GLOSS;

      ws.send(JSON.stringify({
        type: "STREAM_START",
        total_frames: TOTAL_FRAMES,
        glosses,
        frames_per_gloss: FRAMES_PER_GLOSS,
        transcript: text || MOCK_TRANSCRIPTS[source_language],
        quality_score: 0.84,
      }));

      let frameCount = 0;

      streamInterval = setInterval(() => {
        if (ws.readyState !== ws.OPEN) { clearInterval(streamInterval); return; }

        if (frameCount >= TOTAL_FRAMES) {
          clearInterval(streamInterval);
          ws.send(JSON.stringify({
            type: "STREAM_END",
            total_frames: TOTAL_FRAMES,
            quality_score: 0.84,
          }));
          return;
        }

        const glossIndex      = Math.floor(frameCount / FRAMES_PER_GLOSS);
        const frameInGloss    = frameCount % FRAMES_PER_GLOSS;
        const glossProgress   = frameInGloss / FRAMES_PER_GLOSS; // 0→1 within this gloss

        ws.send(JSON.stringify({
          type: "ANIMATION_FRAME",
          frame_index:    frameCount,
          total_frames:   TOTAL_FRAMES,
          timestamp_ms:   (frameCount / 30) * 1000,
          gloss_index:    glossIndex,
          gloss_label:    glosses[glossIndex] || "",
          gloss_progress: glossProgress,
          interpolated:   false,
        }));

        frameCount++;
      }, 33); // ~30 fps
    }

    if (msg.type === "STOP_STREAM") {
      if (streamInterval) clearInterval(streamInterval);
    }
  });

  ws.on("close", () => {
    if (streamInterval) clearInterval(streamInterval);
    console.log("[WS] Client disconnected");
  });

  // Heartbeat every 15s
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "HEARTBEAT", timestamp: Date.now() }));
    } else {
      clearInterval(heartbeat);
    }
  }, 15000);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a gloss list from the input text.
 * For the prototype we split the text into words and map each word to a gloss.
 * If the word matches a known gloss we use it; otherwise we use the word itself
 * (fingerspelling). This gives a different gloss count per input.
 */
function buildGlossesFromText(text, lang) {
  const pool = MOCK_GLOSSES[lang] || MOCK_GLOSSES.sw;

  if (!text || !text.trim()) return pool.slice(0, 5);

  // Split on whitespace / punctuation, filter empties
  const words = text
    .replace(/[،,\.!?؟]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return pool.slice(0, 5);

  // Map each word to a gloss (cycle through pool if more words than glosses)
  return words.map((w, i) => pool[i % pool.length]);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`HelpDeaf server running on http://localhost:${PORT}`);
  console.log(`WebSocket at ws://localhost:${PORT}/v1/stream`);
});
