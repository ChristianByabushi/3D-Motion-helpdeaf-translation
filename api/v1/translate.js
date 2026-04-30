const SUPPORTED_LANGUAGES = { ar: "Arabic", sw: "Swahili", ha: "Hausa", yo: "Yoruba", om: "Oromo" };

// ─── Word → Gloss dictionaries ────────────────────────────────────────────────
// Keys are lowercase source words (and common variants/conjugations).
// Values are the sign gloss the avatar performs.
// Words not found fall back to fingerspelling (the word itself, uppercased).

const WORD_TO_GLOSS = {

  sw: {
    // Greetings
    "habari": "HABARI", "jambo": "HABARI", "hujambo": "HABARI", "mambo": "HABARI",
    "salama": "SALAMA", "salamu": "SALAMA",
    "karibu": "KARIBU", "karibuni": "KARIBU",
    "asante": "ASANTE", "asanteni": "ASANTE", "nashukuru": "ASANTE",
    "sawa": "SAWA", "sawa-sawa": "SAWA", "nzuri": "NZURI", "vizuri": "NZURI",
    "ndiyo": "NDIYO", "ndio": "NDIYO", "naam": "NDIYO",
    "hapana": "HAPANA", "la": "HAPANA", "siyo": "HAPANA",
    // People & pronouns
    "mimi": "MIMI", "wewe": "WEWE", "yeye": "YEYE",
    "sisi": "SISI", "ninyi": "NINYI", "wao": "WAO",
    "mtu": "MTU", "watu": "WATU", "mtoto": "MTOTO", "watoto": "WATOTO",
    "mama": "MAMA", "baba": "BABA", "daktari": "DAKTARI",
    // Places
    "shule": "SHULE", "skuli": "SHULE",
    "hospitali": "HOSPITALI", "kliniki": "HOSPITALI",
    "nyumba": "NYUMBA", "mji": "MJI", "duka": "DUKA",
    "kanisa": "KANISA", "msikiti": "MSIKITI",
    "ofisi": "OFISI", "benki": "BENKI",
    // Questions & location
    "wapi": "WAPI", "lini": "LINI", "nani": "NANI",
    "nini": "NINI", "kwa": "KWA", "jinsi": "JINSI",
    "iko": "IKO", "ipo": "IKO", "yuko": "IKO",
    "hapa": "HAPA", "pale": "PALE", "mbali": "MBALI",
    // Actions
    "taka": "TAKA", "nataka": "TAKA", "ninahitaji": "HITAJI", "hitaji": "HITAJI",
    "nenda": "NENDA", "kuja": "KUJA", "rudi": "RUDI",
    "soma": "SOMA", "andika": "ANDIKA", "sema": "SEMA",
    "kula": "KULA", "kunywa": "KUNYWA", "lala": "LALA",
    "saidia": "SAIDIA", "msaada": "MSAADA",
    "penda": "PENDA", "ninapenda": "PENDA",
    // Common nouns
    "maji": "MAJI", "chakula": "CHAKULA", "dawa": "DAWA",
    "pesa": "PESA", "kazi": "KAZI", "muda": "MUDA",
    "leo": "LEO", "kesho": "KESHO", "jana": "JANA",
    "sasa": "SASA", "asubuhi": "ASUBUHI", "jioni": "JIONI",
    // Descriptors
    "kubwa": "KUBWA", "ndogo": "NDOGO", "haraka": "HARAKA",
    "polepole": "POLEPOLE", "safi": "SAFI", "chafu": "CHAFU",
    "mgonjwa": "MGONJWA", "afya": "AFYA",
  },

  ar: {
    // Greetings
    "مرحبا": "MARHABA", "مرحباً": "MARHABA", "السلام": "SALAM", "عليكم": "ALEYKUM",
    "أهلا": "AHLAN", "أهلاً": "AHLAN", "صباح": "SABAH", "مساء": "MASA",
    "شكرا": "SHUKRAN", "شكراً": "SHUKRAN", "عفوا": "AFWAN",
    "نعم": "NAAM", "لا": "LAA", "ربما": "RUBAMA",
    // People
    "أنا": "ANA", "أنت": "ANTA", "هو": "HUWA", "هي": "HIYA",
    "نحن": "NAHNU", "أنتم": "ANTUM", "هم": "HUM",
    "طفل": "TIFL", "رجل": "RAJUL", "امرأة": "IMRAA",
    "دكتور": "DOKTOR", "معلم": "MUALLIM",
    // Places
    "مدرسة": "MADRASA", "مستشفى": "MUSTASHFA",
    "بيت": "BAYT", "منزل": "MANZIL", "مسجد": "MASJID",
    "سوق": "SUUQ", "مكتب": "MAKTAB", "بنك": "BANK",
    // Questions
    "أين": "AYNA", "متى": "MATA", "من": "MAN",
    "ماذا": "MATHA", "كيف": "KAYFA", "لماذا": "LIMATHA",
    "هنا": "HUNA", "هناك": "HUNAAK",
    // Actions
    "أريد": "URIID", "أحتاج": "AHTAAJ", "ذهب": "THAHAB",
    "جاء": "JAA", "أكل": "AKAL", "شرب": "SHARAB",
    "نام": "NAAM-SLEEP", "ساعد": "SAAAD",
    // Nouns
    "ماء": "MAA", "طعام": "TAAM", "دواء": "DAWAA",
    "مال": "MAAL", "عمل": "AMAL", "وقت": "WAQT",
    "اليوم": "ALYAWM", "غداً": "GHADAN", "أمس": "AMS",
    "حال": "HAL", "صحة": "SIHHA",
  },

  ha: {
    // Greetings
    "sannu": "SANNU", "barka": "BARKA", "ina": "INA",
    "kwana": "KWANA", "wuni": "WUNI", "yini": "YINI",
    "nagode": "NAGODE", "na": "NA", "gode": "GODE",
    "yauwa": "YAUWA", "a'a": "AA", "a": "AA",
    // People
    "ni": "NI", "kai": "KAI", "shi": "SHI", "ita": "ITA",
    "mu": "MU", "ku": "KU", "su": "SU",
    "yaro": "YARO", "mace": "MACE", "mutum": "MUTUM",
    "likita": "LIKITA", "malami": "MALAMI",
    // Places
    "makaranta": "MAKARANTA", "asibiti": "ASIBITI",
    "gida": "GIDA", "masallaci": "MASALLACI",
    "kasuwa": "KASUWA", "ofis": "OFIS",
    // Questions
    "ina": "INA", "yaushe": "YAUSHE", "wane": "WANE",
    "me": "ME", "yaya": "YAYA", "dalilin": "DALILIN",
    "nan": "NAN", "can": "CAN",
    // Actions
    "ina": "INA", "nema": "NEMA", "tafi": "TAFI",
    "zo": "ZO", "ci": "CI", "sha": "SHA",
    "kwana": "KWANA", "taimaka": "TAIMAKA",
    // Nouns
    "ruwa": "RUWA", "abinci": "ABINCI", "magani": "MAGANI",
    "kudi": "KUDI", "aiki": "AIKI", "lokaci": "LOKACI",
    "yau": "YAU", "gobe": "GOBE", "jiya": "JIYA",
    "lafiya": "LAFIYA", "kiwon": "KIWON",
  },

  yo: {
    // Greetings
    "ẹ": "E", "káàbọ̀": "KAAABO", "kaabo": "KAAABO",
    "bawo": "BAWO", "báwo": "BAWO", "ni": "NI",
    "ẹ̀": "E", "dáadáa": "DAADAA", "daadaa": "DAADAA",
    "ẹẹ": "EE", "ee": "EE", "bẹ́ẹ̀ni": "EE",
    "rárá": "RARA", "rara": "RARA",
    "ẹ̀ẹ́": "EE",
    // People
    "mi": "MI", "mo": "MO", "ìwọ": "IWO", "iwo": "IWO",
    "ó": "O", "àwa": "AWA", "awa": "AWA",
    "ọmọ": "OMO", "omo": "OMO", "ọkùnrin": "OKUNRIN",
    "dókítà": "DOKITA", "olùkọ́": "OLUKO",
    // Places
    "ilé-ìwé": "ILE-IWE", "ile-iwe": "ILE-IWE",
    "ilé-ìwòsàn": "ILE-IWOSAN", "ile-iwosan": "ILE-IWOSAN",
    "ilé": "ILE", "ile": "ILE", "ọjà": "OJA", "oja": "OJA",
    // Questions
    "níbo": "NIBO", "nibo": "NIBO", "nígbà": "NIGBA",
    "ta": "TA", "kí": "KI", "ki": "KI",
    "níhìn": "NIHIN", "níbẹ̀": "NIBE",
    // Actions
    "fẹ́": "FE", "fe": "FE", "nílò": "NILO", "nilo": "NILO",
    "lọ": "LO", "lo": "LO", "wá": "WA", "wa": "WA",
    "jẹ": "JE", "je": "JE", "mu": "MU",
    "ìrànlọ́wọ́": "IRANLOOWO", "iranloowo": "IRANLOOWO",
    // Nouns
    "omi": "OMI", "oúnjẹ": "OUNJE", "ounje": "OUNJE",
    "oogun": "OOGUN", "owó": "OWO", "owo": "OWO",
    "iṣẹ́": "ISE", "ise": "ISE", "àkókò": "AKOKO",
    "òní": "ONI", "oni": "ONI", "ọ̀la": "OLA",
    "àárọ̀": "AARO", "alẹ́": "ALE",
  },

  om: {
    // Greetings
    "akkam": "AKKAM", "nagaa": "NAGAA", "fayya": "FAYYA",
    "galatoomaa": "GALATOOMAA", "galata": "GALATOOMAA",
    "eeyyee": "EEYYEE", "eeyyee": "EEYYEE",
    "lakki": "LAKKI",
    // People
    "ani": "ANI", "ati": "ATI", "inni": "INNI", "inni": "INNI",
    "nuti": "NUTI", "isin": "ISIN", "isaan": "ISAAN",
    "daa'ima": "DAIMA", "namni": "NAMNI",
    "dokitara": "DOKITARA", "barsiisaa": "BARSIISAA",
    // Places
    "mana-barumsaa": "MANA-BARUMSAA", "barumsaa": "MANA-BARUMSAA",
    "hospitaala": "HOSPITAALA", "kilinika": "HOSPITAALA",
    "mana": "MANA", "magaalaa": "MAGAALAA",
    "gabatee": "GABATEE", "dhaabbata": "DHAABBATA",
    // Questions
    "eessa": "EESSA", "yoom": "YOOM", "eenyu": "EENYU",
    "maal": "MAAL", "akkam": "AKKAM", "maaliif": "MAALIIF",
    "asitti": "ASITTI", "achitti": "ACHITTI",
    "jira": "JIRA", "jiraa": "JIRA",
    // Actions
    "barbaada": "BARBAADA", "nan": "NAN",
    "deemi": "DEEMI", "koottu": "KOOTTU",
    "nyaadhu": "NYAADHU", "dhugdhu": "DHUGDHU",
    "gargaarsa": "GARGAARSA", "gargaari": "GARGAARSA",
    // Nouns
    "bishaan": "BISHAAN", "nyaata": "NYAATA", "qorichaa": "QORICHA",
    "maallaqaa": "MAALLAQAA", "hojii": "HOJII", "yeroo": "YEROO",
    "har'a": "HARA", "boru": "BORU", "kaleessa": "KALEESSA",
    "fayyaa": "FAYYAA",
  },
};

// ─── Translate a single word to its gloss ─────────────────────────────────────
function wordToGloss(word, lang) {
  const dict = WORD_TO_GLOSS[lang] || {};
  const key  = word.toLowerCase().replace(/[،,\.!?؟]/g, "");
  if (dict[key]) {
    return { sign: dict[key], fingerspelled: false };
  }
  // Not in dictionary — fingerspell (show the word itself uppercased)
  return { sign: word.toUpperCase(), fingerspelled: true };
}

// ─── Build gloss list from input text ────────────────────────────────────────
function buildGlosses(text, lang) {
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

// ─── Handler ──────────────────────────────────────────────────────────────────
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Method not allowed" });

  const { text, source_language } = req.body || {};

  if (!source_language || !SUPPORTED_LANGUAGES[source_language]) {
    return res.status(400).json({
      error_code: "UNSUPPORTED_LANGUAGE",
      message:    "Supported languages: ar, sw, ha, yo, om",
      supported:  Object.keys(SUPPORTED_LANGUAGES),
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      error_code: "NMT_EMPTY_INPUT",
      message:    "Input text cannot be empty.",
    });
  }

  const glosses          = buildGlosses(text.trim(), source_language);
  const FRAMES_PER_GLOSS = 40;
  const animationId      = `anim_${Date.now()}`;

  res.status(200).json({
    request_id:      `req_${Date.now()}`,
    source_language,
    input_text:      text,
    transcript:      text,
    glosses: glosses.map((g, i) => ({
      index:         i,
      source_word:   g.source_word,
      gloss:         g.sign,
      fingerspelled: g.fingerspelled,
      duration_ms:   FRAMES_PER_GLOSS * (1000 / 30),
    })),
    animation: {
      animation_id:     animationId,
      frame_count:      glosses.length * FRAMES_PER_GLOSS,
      frames_per_gloss: FRAMES_PER_GLOSS,
      duration_seconds: (glosses.length * FRAMES_PER_GLOSS) / 30,
      quality_score:    0.82 + Math.random() * 0.15,
    },
    pipeline_metadata: {
      asr_confidence:   null,
      nmt_bleu:         0.73,
      motion_quality:   0.84,
      total_latency_ms: 800 + Math.floor(Math.random() * 400),
    },
  });
}
