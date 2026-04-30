import React, { useState, useCallback, useRef, useEffect } from "react";
import Header from "./components/Header.jsx";
import InputPanel from "./components/InputPanel.jsx";
import AvatarViewer from "./components/AvatarViewer.jsx";
import TranslationInfo from "./components/TranslationInfo.jsx";
import PipelineProgress from "./components/PipelineProgress.jsx";
import StatusBar from "./components/StatusBar.jsx";
import styles from "./App.module.css";

const LANGUAGES = [
  { code: "ar", name: "Arabic",  flag: "🇸🇦", region: "North Africa"    },
  { code: "sw", name: "Swahili", flag: "🇰🇪", region: "East Africa"     },
  { code: "ha", name: "Hausa",   flag: "🇳🇬", region: "West Africa"     },
  { code: "yo", name: "Yoruba",  flag: "🇳🇬", region: "West Africa"     },
  { code: "om", name: "Oromo",   flag: "🇪🇹", region: "Horn of Africa"  },
];

// Works in both dev (proxied to localhost:3001) and production (Vercel function)
const API_BASE = "";

export default function App() {
  const [theme, setTheme]               = useState("dark");
  const [language, setLanguage]         = useState("sw");
  const [pipelineStage, setPipelineStage] = useState("idle");
  const [streamState, setStreamState]   = useState("idle");
  const [streamData, setStreamData]     = useState(null);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [frameProgress, setFrameProgress] = useState(0);
  const [errorMsg, setErrorMsg]         = useState(null);
  const [isPlaying, setIsPlaying]       = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const animLoopRef   = useRef(null);   // requestAnimationFrame id
  const frameIndexRef = useRef(0);      // current frame counter
  const glossDataRef  = useRef(null);   // translation response
  const lastTimeRef   = useRef(null);   // for frame timing
  const isPlayingRef  = useRef(true);
  const speedRef      = useRef(1.0);
  const stoppedRef    = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = playbackSpeed; }, [playbackSpeed]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []); // eslint-disable-line

  // ── Client-side animation loop ──────────────────────────────────────────────
  // Replaces WebSocket streaming — runs entirely in the browser at 30fps
  const startAnimationLoop = useCallback((translationData) => {
    cancelAnimationFrame(animLoopRef.current);
    frameIndexRef.current = 0;
    lastTimeRef.current   = null;
    stoppedRef.current    = false;
    glossDataRef.current  = translationData;

    const { glosses, animation } = translationData;
    const FRAMES_PER_GLOSS = animation.frames_per_gloss || 40;
    const TOTAL_FRAMES     = animation.frame_count;
    const MS_PER_FRAME     = 1000 / 30; // 33ms at 30fps

    setStreamState("streaming");
    setPipelineStage("streaming");
    setStreamData({
      glossPairs:   glosses,                          // full [{ source_word, gloss }] objects
      glosses:      glosses.map((g) => g.gloss),      // sign names for avatar label
      transcript:   translationData.transcript,
      qualityScore: animation.quality_score,
      totalFrames:  TOTAL_FRAMES,
      inputText:    translationData.input_text,
    });

    const tick = (timestamp) => {
      if (stoppedRef.current) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;

      if (isPlayingRef.current) {
        const elapsed = (timestamp - lastTimeRef.current) * speedRef.current;

        if (elapsed >= MS_PER_FRAME) {
          lastTimeRef.current = timestamp;
          const fi = frameIndexRef.current;

          if (fi >= TOTAL_FRAMES) {
            // Animation complete
            setStreamState("done");
            setPipelineStage("done");
            setFrameProgress(1);
            return;
          }

          const glossIndex    = Math.floor(fi / FRAMES_PER_GLOSS);
          const frameInGloss  = fi % FRAMES_PER_GLOSS;
          const glossProgress = frameInGloss / FRAMES_PER_GLOSS;
          const currentGloss  = glosses[glossIndex];

          setCurrentFrame({
            frame_index:    fi,
            total_frames:   TOTAL_FRAMES,
            gloss_index:    glossIndex,
            gloss_label:    currentGloss?.gloss || "",
            source_word:    currentGloss?.source_word || "",
            gloss_progress: glossProgress,
          });
          setFrameProgress(fi / TOTAL_FRAMES);

          frameIndexRef.current = fi + 1;
        }
      } else {
        // Paused — reset timer so we don't skip frames on resume
        lastTimeRef.current = timestamp;
      }

      animLoopRef.current = requestAnimationFrame(tick);
    };

    animLoopRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Main translation flow ───────────────────────────────────────────────────
  const startTranslation = useCallback(async (text) => {
    // Stop any running animation
    stoppedRef.current = true;
    cancelAnimationFrame(animLoopRef.current);

    setStreamState("connecting");
    setStreamData(null);
    setCurrentFrame(null);
    setFrameProgress(0);
    setErrorMsg(null);
    setIsPlaying(true);
    isPlayingRef.current = true;

    // ── Simulate pipeline stages visually ──
    setPipelineStage("asr");
    await delay(600);
    setPipelineStage("nmt");
    await delay(500);
    setPipelineStage("motion");

    try {
      const res = await fetch(`${API_BASE}/v1/translate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text, source_language: language }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }

      const data = await res.json();

      await delay(300); // brief motion synthesis pause
      startAnimationLoop(data);

    } catch (err) {
      setStreamState("error");
      setPipelineStage("error");
      setErrorMsg(err.message || "Translation failed. Please try again.");
    }
  }, [language, startAnimationLoop]);

  const stopStream = useCallback(() => {
    stoppedRef.current = true;
    cancelAnimationFrame(animLoopRef.current);
    setStreamState("idle");
    setPipelineStage("idle");
    setStreamData(null);
    setCurrentFrame(null);
    setFrameProgress(0);
  }, []);

  const handleRestart = useCallback(() => {
    if (!glossDataRef.current) return;
    startAnimationLoop(glossDataRef.current);
    setIsPlaying(true);
  }, [startAnimationLoop]);

  const handleThemeChange = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const isActive = streamState === "connecting" || streamState === "streaming";

  return (
    <div className={styles.app} data-theme={theme}>
      <Header theme={theme} onThemeChange={handleThemeChange} />

      <main className={styles.main}>
        {pipelineStage !== "idle" && (
          <PipelineProgress stage={pipelineStage} streamData={streamData} />
        )}

        <div className={styles.layout}>
          <div className={styles.leftCol}>
            <InputPanel
              language={language}
              languages={LANGUAGES}
              onLanguageChange={setLanguage}
              onSubmit={startTranslation}
              onStop={stopStream}
              streamState={streamState}
              isActive={isActive}
            />

            {(streamData || errorMsg) && (
              <TranslationInfo
                streamData={streamData}
                errorMsg={errorMsg}
                language={language}
                languages={LANGUAGES}
                streamState={streamState}
                currentFrame={currentFrame}
              />
            )}
          </div>

          <div className={styles.rightCol}>
            <AvatarViewer
              currentFrame={currentFrame}
              streamState={streamState}
              frameProgress={frameProgress}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onPlayPause={() => setIsPlaying((p) => !p)}
              onSpeedChange={setPlaybackSpeed}
              onRestart={handleRestart}
              totalFrames={streamData?.totalFrames || 180}
              theme={theme}
            />
          </div>
        </div>
      </main>

      <StatusBar
        streamState={streamState}
        pipelineStage={pipelineStage}
        frameProgress={frameProgress}
      />
    </div>
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
