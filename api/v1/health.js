export default function handler(req, res) {
  res.status(200).json({
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
}
