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

// ─── Word → Gloss dictionaries ────────────────────────────────────────────────
const WORD_TO_GLOSS = {
  sw: {
    "habari": "HABARI", "jambo": "HABARI", "hujambo": "HABARI", "mambo": "HABARI",
    "salama": "SALAMA", "karibu": "KARIBU", "karibuni": "KARIBU",
    "asante": "ASANTE", "asanteni": "ASANTE", "nashukuru": "ASANTE",
    "sawa": "SAWA", "nzuri": "NZURI", "vizuri": "NZURI",
    "ndiyo": "NDIYO", "ndio": "NDIYO", "hapana": "HAPANA", "la": "HAPANA",
    "mimi": "MIMI", "wewe": "WEWE", "yeye": "YEYE", "sisi": "SISI",
    "mtu": "MTU", "mtoto": "MTOTO", "mama": "MAMA", "baba": "BABA", "daktari": "DAKTARI",
    "shule": "SHULE", "skuli": "SHULE",
    "hospitali": "HOSPITALI", "kliniki": "HOSPITALI",
    "nyumba": "NYUMBA", "mji": "MJI", "duka": "DUKA",
    "ofisi": "OFISI", "benki": "BENKI",
    "wapi": "WAPI", "lini": "LINI", "nani": "NANI", "nini": "NINI",
    "jinsi": "JINSI", "iko": "IKO", "ipo": "IKO", "yuko": "IKO",
    "hapa": "HAPA", "pale": "PALE", "mbali": "MBALI",
    "taka": "TAKA", "nataka": "TAKA", "ninahitaji": "HITAJI", "hitaji": "HITAJI",
    "nenda": "NENDA", "kuja": "KUJA", "rudi": "RUDI",
    "soma": "SOMA", "andika": "ANDIKA", "sema": "SEMA",
    "kula": "KULA", "kunywa": "KUNYWA", "lala": "LALA",
    "saidia": "SAIDIA", "msaada": "MSAADA", "penda": "PENDA",
    "maji": "MAJI", "chakula": "CHAKULA", "dawa": "DAWA",
    "pesa": "PESA", "kazi": "KAZI", "leo": "LEO", "kesho": "KESHO", "jana": "JANA",
    "sasa": "SASA", "asubuhi": "ASUBUHI", "jioni": "JIONI",
    "kubwa": "KUBWA", "ndogo": "NDOGO", "mgonjwa": "MGONJWA", "afya": "AFYA",
  },
  ar: {
    "مرحبا": "MARHABA", "مرحباً": "MARHABA", "السلام": "SALAM",
    "أهلا": "AHLAN", "شكرا": "SHUKRAN", "شكراً": "SHUKRAN", "عفوا": "AFWAN",
    "نعم": "NAAM", "لا": "LAA",
    "أنا": "ANA", "أنت": "ANTA", "هو": "HUWA", "هي": "HIYA",
    "طفل": "TIFL", "دكتور": "DOKTOR", "معلم": "MUALLIM",
    "مدرسة": "MADRASA", "مستشفى": "MUSTASHFA",
    "بيت": "BAYT", "منزل": "MANZIL", "مسجد": "MASJID", "سوق": "SUUQ",
    "أين": "AYNA", "متى": "MATA", "من": "MAN", "ماذا": "MATHA",
    "كيف": "KAYFA", "هنا": "HUNA", "هناك": "HUNAAK",
    "أريد": "URIID", "أحتاج": "AHTAAJ",
    "ماء": "MAA", "طعام": "TAAM", "دواء": "DAWAA",
    "اليوم": "ALYAWM", "غداً": "GHADAN", "أمس": "AMS",
    "حال": "HAL", "صحة": "SIHHA",
  },
  ha: {
    "sannu": "SANNU", "barka": "BARKA", "nagode": "NAGODE",
    "yauwa": "YAUWA", "a'a": "AA",
    "yaro": "YARO", "mace": "MACE", "mutum": "MUTUM",
    "likita": "LIKITA", "malami": "MALAMI",
    "makaranta": "MAKARANTA", "asibiti": "ASIBITI",
    "gida": "GIDA", "masallaci": "MASALLACI", "kasuwa": "KASUWA",
    "yaushe": "YAUSHE", "wane": "WANE", "me": "ME", "yaya": "YAYA",
    "nan": "NAN", "can": "CAN",
    "tafi": "TAFI", "zo": "ZO", "ci": "CI", "sha": "SHA",
    "taimaka": "TAIMAKA",
    "ruwa": "RUWA", "abinci": "ABINCI", "magani": "MAGANI",
    "kudi": "KUDI", "aiki": "AIKI", "yau": "YAU", "gobe": "GOBE",
    "lafiya": "LAFIYA",
  },
  yo: {
    "kaabo": "KAAABO", "bawo": "BAWO", "daadaa": "DAADAA",
    "ee": "EE", "rara": "RARA",
    "omo": "OMO", "dokita": "DOKITA", "oluko": "OLUKO",
    "ile-iwe": "ILE-IWE", "ile-iwosan": "ILE-IWOSAN",
    "ile": "ILE", "oja": "OJA",
    "nibo": "NIBO", "ta": "TA", "ki": "KI",
    "lo": "LO", "wa": "WA", "je": "JE", "mu": "MU",
    "iranloowo": "IRANLOOWO",
    "omi": "OMI", "ounje": "OUNJE", "oogun": "OOGUN",
    "owo": "OWO", "ise": "ISE", "oni": "ONI",
  },
  om: {
    "akkam": "AKKAM", "nagaa": "NAGAA", "galatoomaa": "GALATOOMAA",
    "eeyyee": "EEYYEE", "lakki": "LAKKI",
    "namni": "NAMNI", "dokitara": "DOKITARA", "barsiisaa": "BARSIISAA",
    "barumsaa": "MANA-BARUMSAA", "mana-barumsaa": "MANA-BARUMSAA",
    "hospitaala": "HOSPITAALA", "mana": "MANA", "magaalaa": "MAGAALAA",
    "eessa": "EESSA", "yoom": "YOOM", "eenyu": "EENYU",
    "maal": "MAAL", "maaliif": "MAALIIF",
    "jira": "JIRA", "jiraa": "JIRA",
    "barbaada": "BARBAADA", "deemi": "DEEMI", "koottu": "KOOTTU",
    "gargaarsa": "GARGAARSA",
    "bishaan": "BISHAAN", "nyaata": "NYAATA", "qorichaa": "QORICHA",
    "hojii": "HOJII", "fayyaa": "FAYYAA",
  },
};

function wordToGloss(word, lang) {
  const dict = WORD_TO_GLOSS[lang] || {};
  const key  = word.toLowerCase().replace(/[،,\.!?؟]/g, "");
  if (dict[key]) return { sign: dict[key], fingerspelled: false };
  return { sign: word.toUpperCase(), fingerspelled: true };
}

function buildGlossesFromText(text, lang) {
  const words = text
    .replace(/[،,\.!?؟\-_]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [];
  return words.map((word) => {
    const { sign, fingerspelled } = wordToGloss(word, lang);
    return { source_word: word, sign, fingerspelled };
  });
}

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
        index:         i,
        source_word:   g.source_word,
        gloss:         g.sign,
        fingerspelled: g.fingerspelled,
        duration_ms:   framesPerGloss * (1000 / 30),
      })),
      animation: {
        animation_id:     animationId,
        asset_url:        `/v1/animations/${animationId}`,
        frame_count:      glosses.length * framesPerGloss,
        frames_per_gloss: framesPerGloss,
        duration_seconds: (glosses.length * framesPerGloss) / 30,
        quality_score:    0.82 + Math.random() * 0.15,
      },
      pipeline_metadata: {
        asr_confidence:   null,
        nmt_bleu:         0.73,
        motion_quality:   0.84,
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
      const FRAMES_PER_GLOSS = 40;
      const TOTAL_FRAMES = glosses.length * FRAMES_PER_GLOSS;

      ws.send(JSON.stringify({
        type:             "STREAM_START",
        total_frames:     TOTAL_FRAMES,
        glosses:          glosses.map((g) => g.sign),
        frames_per_gloss: FRAMES_PER_GLOSS,
        transcript:       text || MOCK_TRANSCRIPTS[source_language],
        quality_score:    0.84,
      }));

      let frameCount = 0;

      streamInterval = setInterval(() => {
        if (ws.readyState !== ws.OPEN) { clearInterval(streamInterval); return; }

        if (frameCount >= TOTAL_FRAMES) {
          clearInterval(streamInterval);
          ws.send(JSON.stringify({ type: "STREAM_END", total_frames: TOTAL_FRAMES, quality_score: 0.84 }));
          return;
        }

        const glossIndex    = Math.floor(frameCount / FRAMES_PER_GLOSS);
        const frameInGloss  = frameCount % FRAMES_PER_GLOSS;
        const glossProgress = frameInGloss / FRAMES_PER_GLOSS;
        const g             = glosses[glossIndex] || { source_word: "", sign: "" };

        ws.send(JSON.stringify({
          type:           "ANIMATION_FRAME",
          frame_index:    frameCount,
          total_frames:   TOTAL_FRAMES,
          timestamp_ms:   (frameCount / 30) * 1000,
          gloss_index:    glossIndex,
          gloss_label:    g.sign,
          source_word:    g.source_word,
          gloss_progress: glossProgress,
          interpolated:   false,
        }));

        frameCount++;
      }, 33);
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`HelpDeaf server running on http://localhost:${PORT}`);
  console.log(`WebSocket at ws://localhost:${PORT}/v1/stream`);
});
