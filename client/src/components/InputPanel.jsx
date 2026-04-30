import React, { useState, useRef, useEffect } from "react";
import styles from "./InputPanel.module.css";

const EXAMPLE_PHRASES = {
  ar: ["مرحباً، كيف حالك؟", "أحتاج مساعدة طبية", "أين المستشفى؟"],
  sw: ["Habari yako leo?", "Ninahitaji msaada", "Shule iko wapi?"],
  ha: ["Sannu, yaya kake?", "Ina bukata taimako", "Asibiti yana ina?"],
  yo: ["Ẹ káàbọ̀, báwo ni?", "Mo nilo iranlọwọ", "Ile-iwosan wa nibo?"],
  om: ["Akkam bultan?", "Gargaarsa nan barbaada", "Hospitaalli eessa jira?"],
};

export default function InputPanel({ language, languages, onLanguageChange, onSubmit, onStop, streamState, isActive }) {
  const [text, setText] = useState("");
  const [inputMode, setInputMode] = useState("text");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [waveformBars, setWaveformBars] = useState(Array(24).fill(3));

  const mediaRef = useRef(null);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const waveAnimRef = useRef(null);
  const canvasRef = useRef(null);

  const isRTL = language === "ar";
  const langInfo = languages.find((l) => l.code === language);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(waveAnimRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      // Set up analyser for waveform
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Animate waveform
      const drawWave = () => {
        waveAnimRef.current = requestAnimationFrame(drawWave);
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const bars = Array.from({ length: 24 }, (_, i) => {
          const val = data[Math.floor(i * data.length / 24)] || 0;
          return Math.max(3, Math.round((val / 255) * 40));
        });
        setWaveformBars(bars);
      };
      drawWave();

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();
        cancelAnimationFrame(waveAnimRef.current);
        setWaveformBars(Array(24).fill(3));
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setIsRecording(false);
        clearInterval(timerRef.current);
        // Simulate transcription result
        setText(`[Recorded ${recordingTime}s of ${langInfo?.name} audio]`);
      };

      recorder.start();
      mediaRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 30) {
            recorder.stop();
            return t;
          }
          return t + 1;
        });
      }, 1000);

    } catch {
      alert("Microphone access denied. Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state === "recording") {
      mediaRef.current.stop();
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isActive) return;
    onSubmit(text.trim());
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Translate to Sign Language</h2>
        <span className={styles.panelSubtitle}>Speech Recognition · Translation · Motion Synthesis</span>
      </div>

      {/* Language selector */}
      <div className={styles.section}>
        <label className={styles.label}>Source Language</label>
        <div className={styles.langGrid}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.langBtn} ${language === lang.code ? styles.langBtnActive : ""}`}
              onClick={() => onLanguageChange(lang.code)}
              type="button"
              aria-pressed={language === lang.code}
            >
              <span className={styles.langFlag}>{lang.flag}</span>
              <span className={styles.langName}>{lang.name}</span>
              <span className={styles.langRegion}>{lang.region}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input mode toggle */}
      <div className={styles.section}>
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${inputMode === "text" ? styles.modeBtnActive : ""}`}
            onClick={() => setInputMode("text")}
            type="button"
          >
            <span>✏️</span> Text Input
          </button>
          <button
            className={`${styles.modeBtn} ${inputMode === "audio" ? styles.modeBtnActive : ""}`}
            onClick={() => setInputMode("audio")}
            type="button"
          >
            <span>🎙️</span> Audio Input
          </button>
        </div>
      </div>

      {/* ── TEXT MODE ── */}
      {inputMode === "text" && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.textareaWrapper}>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Type in ${langInfo?.name}…`}
              dir={isRTL ? "rtl" : "ltr"}
              rows={4}
              maxLength={10000}
              aria-label="Input text for translation"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
              }}
            />
            <div className={styles.textareaFooter}>
              <span className={styles.hint}>Ctrl+Enter to translate</span>
              <span className={styles.charCount}>{text.length}/10000</span>
            </div>
          </div>

          {/* Example phrases */}
          <div className={styles.examples}>
            <span className={styles.examplesLabel}>Try:</span>
            {(EXAMPLE_PHRASES[language] || []).map((phrase) => (
              <button
                key={phrase}
                type="button"
                className={styles.exampleChip}
                onClick={() => setText(phrase)}
                dir={isRTL ? "rtl" : "ltr"}
              >
                {phrase}
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            {isActive ? (
              <button type="button" className={styles.stopBtn} onClick={onStop}>
                <span>⏹</span> Stop Translation
              </button>
            ) : (
              <button type="submit" className={styles.submitBtn} disabled={!text.trim()}>
                <span>🤟</span> Translate to Sign Language
              </button>
            )}
          </div>
        </form>
      )}

      {/* ── AUDIO MODE ── */}
      {inputMode === "audio" && (
        <div className={styles.audioSection}>
          {/* Recording button */}
          <button
            className={`${styles.micBtn} ${isRecording ? styles.micBtnRecording : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            type="button"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            disabled={isActive}
          >
            <div className={styles.micInner}>
              <span className={styles.micIcon}>{isRecording ? "⏹" : "🎙️"}</span>
              <div className={styles.micText}>
                <span className={styles.micTitle}>
                  {isRecording ? "Recording…" : audioBlob ? "Re-record" : "Tap to Record"}
                </span>
                <span className={styles.micSub}>
                  {isRecording
                    ? `${formatTime(recordingTime)} / 00:30`
                    : `Speak in ${langInfo?.name}`}
                </span>
              </div>
              {isRecording && (
                <span className={styles.recIndicator}>
                  <span className={styles.recDot} />
                  REC
                </span>
              )}
            </div>
          </button>

          {/* Waveform visualizer */}
          {isRecording && (
            <div className={styles.waveform} aria-hidden="true">
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  className={styles.waveBar}
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          )}

          {/* Timer bar */}
          {isRecording && (
            <div className={styles.timerBar}>
              <div
                className={styles.timerFill}
                style={{ width: `${(recordingTime / 30) * 100}%` }}
              />
            </div>
          )}

          {/* Captured audio preview */}
          {audioBlob && !isRecording && (
            <div className={styles.audioPreview}>
              <div className={styles.audioPreviewHeader}>
                <span className={styles.audioPreviewIcon}>🎵</span>
                <div>
                  <p className={styles.audioPreviewTitle}>Audio Captured</p>
                  <p className={styles.audioPreviewSub}>{recordingTime}s · {langInfo?.name}</p>
                </div>
                <span className={styles.audioPreviewCheck}>✓</span>
              </div>
              <p className={styles.audioTranscript}>{text}</p>
              <div className={styles.actions}>
                {isActive ? (
                  <button type="button" className={styles.stopBtn} onClick={onStop}>
                    <span>⏹</span> Stop
                  </button>
                ) : (
                  <button
                    className={styles.submitBtn}
                    onClick={() => onSubmit(text)}
                    type="button"
                  >
                    <span>🤟</span> Translate to Sign Language
                  </button>
                )}
              </div>
            </div>
          )}

          <p className={styles.audioNote}>
            Audio is transcribed, then translated to sign language glosses and animated in real time.
          </p>
        </div>
      )}
    </div>
  );
}
