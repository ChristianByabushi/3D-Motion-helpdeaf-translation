export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    models: [
      { name: "asr-multilingual",   version: "v1.2.0", languages: ["ar", "sw", "ha", "yo", "om"], status: "active" },
      { name: "nmt-sign-gloss",     version: "v2.0.1", languages: ["ar", "sw", "ha", "yo", "om"], status: "active" },
      { name: "motion-synthesizer", version: "v1.5.3", languages: ["all"],                         status: "active" },
    ],
  });
}
