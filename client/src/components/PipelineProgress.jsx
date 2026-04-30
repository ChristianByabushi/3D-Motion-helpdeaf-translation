import React from "react";
import styles from "./PipelineProgress.module.css";

const STAGES = [
  {
    id: "asr",
    icon: "🎙️",
    label: "Speech Recognition",
    sublabel: "ASR",
    desc: "Transcribing audio to text",
    color: "#f59e0b",
  },
  {
    id: "nmt",
    icon: "🔄",
    label: "Neural Translation",
    sublabel: "NMT",
    desc: "Mapping text → sign glosses",
    color: "#8b5cf6",
  },
  {
    id: "motion",
    icon: "🦾",
    label: "Motion Synthesis",
    sublabel: "3D",
    desc: "Generating 3D joint animations",
    color: "#ec4899",
  },
  {
    id: "streaming",
    icon: "📡",
    label: "WebSocket Stream",
    sublabel: "WS",
    desc: "Delivering frames at 30fps",
    color: "#3b82f6",
  },
];

const STAGE_ORDER = ["asr", "nmt", "motion", "streaming", "done"];

function getStageStatus(stageId, currentStage) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const stageIdx = STAGE_ORDER.indexOf(stageId);

  if (currentStage === "done") return "done";
  if (currentStage === "error") return stageIdx <= currentIdx ? "error" : "pending";
  if (stageIdx < currentIdx) return "done";
  if (stageIdx === currentIdx) return "active";
  return "pending";
}

export default function PipelineProgress({ stage, streamData }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>⚡</span>
        <span className={styles.headerTitle}>Translation Pipeline</span>
        {stage === "done" && (
          <span className={styles.doneTag}>✓ Complete</span>
        )}
        {stage === "error" && (
          <span className={styles.errorTag}>✗ Error</span>
        )}
      </div>

      <div className={styles.stages}>
        {STAGES.map((s, i) => {
          const status = getStageStatus(s.id, stage);
          return (
            <React.Fragment key={s.id}>
              <div className={`${styles.stage} ${styles[`stage_${status}`]}`}>
                <div className={styles.stageIconWrap} style={{ "--stage-color": s.color }}>
                  {status === "active" ? (
                    <div className={styles.spinner} style={{ borderTopColor: s.color }} />
                  ) : status === "done" ? (
                    <span className={styles.checkIcon}>✓</span>
                  ) : (
                    <span className={styles.stageEmoji}>{s.icon}</span>
                  )}
                </div>
                <div className={styles.stageInfo}>
                  <div className={styles.stageTop}>
                    <span className={styles.stageSublabel} style={{ color: status === "pending" ? "var(--text-muted)" : s.color }}>
                      {s.sublabel}
                    </span>
                    <span className={styles.stageLabel}>{s.label}</span>
                  </div>
                  <span className={styles.stageDesc}>{s.desc}</span>
                  {status === "active" && (
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ background: s.color }} />
                    </div>
                  )}
                  {status === "done" && s.id === "nmt" && streamData?.glosses && (
                    <span className={styles.stageMeta}>{streamData.glosses.length} glosses</span>
                  )}
                  {status === "done" && s.id === "streaming" && streamData?.totalFrames && (
                    <span className={styles.stageMeta}>{streamData.totalFrames} frames</span>
                  )}
                </div>
              </div>

              {i < STAGES.length - 1 && (
                <div className={`${styles.connector} ${
                  getStageStatus(STAGES[i + 1].id, stage) !== "pending" ? styles.connectorActive : ""
                }`}>
                  <div className={styles.connectorLine} />
                  <span className={styles.connectorArrow}>›</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
