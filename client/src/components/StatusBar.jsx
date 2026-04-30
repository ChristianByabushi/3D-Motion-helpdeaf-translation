import React from "react";
import styles from "./StatusBar.module.css";

const STAGE_INFO = {
  idle:      { text: "Ready",                    color: "var(--text-muted)",  dot: "var(--text-muted)" },
  asr:       { text: "ASR: Transcribing audio…", color: "var(--warning)",     dot: "#f59e0b" },
  nmt:       { text: "NMT: Translating glosses…",color: "#8b5cf6",            dot: "#8b5cf6" },
  motion:    { text: "Synthesizing animation…",  color: "#ec4899",            dot: "#ec4899" },
  streaming: { text: "Streaming at 30fps",        color: "var(--accent)",      dot: "var(--accent)" },
  done:      { text: "Translation complete",      color: "var(--success)",     dot: "var(--success)" },
  error:     { text: "Error",                     color: "var(--error)",       dot: "var(--error)" },
};

export default function StatusBar({ streamState, pipelineStage, frameProgress }) {
  const stage = pipelineStage || streamState;
  const info  = STAGE_INFO[stage] || STAGE_INFO.idle;

  return (
    <footer className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.dot} style={{ background: info.dot }} />
          <span className={styles.status} style={{ color: info.color }}>{info.text}</span>
        </div>

        <div className={styles.center}>
          <span className={styles.pipeline}>
            <span className={pipelineStage === "asr"      ? styles.stageActive : ""}>ASR</span>
            <span className={styles.arrow}>→</span>
            <span className={pipelineStage === "nmt"      ? styles.stageActive : ""}>NMT</span>
            <span className={styles.arrow}>→</span>
            <span className={pipelineStage === "motion"   ? styles.stageActive : ""}>Motion</span>
            <span className={styles.arrow}>→</span>
            <span className={pipelineStage === "streaming"|| pipelineStage === "done" ? styles.stageActive : ""}>WebSocket</span>
          </span>
        </div>

        <div className={styles.right}>
          <span className={styles.info}>HelpDeaf · 5 African Languages</span>
        </div>
      </div>
    </footer>
  );
}
