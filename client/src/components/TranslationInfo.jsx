import React from "react";
import styles from "./TranslationInfo.module.css";

export default function TranslationInfo({ streamData, errorMsg, language, languages, streamState, currentFrame }) {
  if (errorMsg) {
    return (
      <div className={`${styles.panel} ${styles.errorPanel}`}>
        <div className={styles.errorIcon}>⚠️</div>
        <div>
          <p className={styles.errorTitle}>Connection Error</p>
          <p className={styles.errorMsg}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!streamData) return null;

  const { glossPairs, transcript, qualityScore, totalFrames } = streamData;
  const langInfo    = languages.find((l) => l.code === language);
  const qualityPct  = Math.round((qualityScore || 0) * 100);
  const qualityColor = qualityPct >= 80 ? "var(--success)" : qualityPct >= 60 ? "var(--warning)" : "var(--error)";
  const activeIdx   = currentFrame?.gloss_index ?? -1;

  return (
    <div className={styles.panel}>
      {/* Transcript */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📝</span>
          <span className={styles.sectionTitle}>Transcript</span>
          {langInfo && (
            <span className={styles.langTag}>{langInfo.flag} {langInfo.name}</span>
          )}
        </div>
        <p className={styles.transcript} dir={language === "ar" ? "rtl" : "ltr"}>
          {transcript}
        </p>
      </div>

      {/* Gloss pairs — word → SIGN */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤟</span>
          <span className={styles.sectionTitle}>Sign Language Glosses</span>
          <span className={styles.glossCount}>{glossPairs?.length || 0} signs</span>
        </div>
        <div className={styles.glossList}>
          {(glossPairs || []).map((g, i) => (
            <div
              key={i}
              className={`${styles.glossChip} ${i === activeIdx ? styles.glossChipActive : ""}`}
            >
              <span className={styles.glossIndex}>{i + 1}</span>
              <span className={styles.sourceWord} dir={language === "ar" ? "rtl" : "ltr"}>
                {g.source_word}
              </span>
              <span className={styles.glossArrow}>→</span>
              <span className={styles.glossSign}>{g.gloss}</span>
              {g.fingerspelled && <span className={styles.fingerTag}>FS</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Quality Score</span>
          <span className={styles.metaValue} style={{ color: qualityColor }}>{qualityPct}%</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Total Frames</span>
          <span className={styles.metaValue}>{totalFrames}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Frame Rate</span>
          <span className={styles.metaValue}>30 fps</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status</span>
          <span className={`${styles.metaValue} ${styles[`status_${streamState}`]}`}>
            {streamState === "streaming" ? "● Signing" :
             streamState === "done"      ? "✓ Complete" :
             streamState === "connecting"? "⟳ Processing" : streamState}
          </span>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className={styles.pipeline}>
        <div className={styles.pipelineLabel}>Pipeline</div>
        <div className={styles.pipelineStages}>
          {[
            { name: "ASR",    icon: "🎙️", desc: "Speech Recognition" },
            { name: "NMT",    icon: "🔄", desc: "Text → Gloss"       },
            { name: "Motion", icon: "🦾", desc: "Animation Synthesis" },
          ].map((stage, i) => (
            <React.Fragment key={stage.name}>
              <div className={`${styles.stage} ${streamState !== "idle" ? styles.stageActive : ""}`}>
                <span className={styles.stageIcon}>{stage.icon}</span>
                <span className={styles.stageName}>{stage.name}</span>
                <span className={styles.stageDesc}>{stage.desc}</span>
              </div>
              {i < 2 && <div className={styles.stageArrow}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
