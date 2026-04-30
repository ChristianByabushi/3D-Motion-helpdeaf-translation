import React, { useState, useCallback, useRef, useEffect } from "react";
import Header from "./components/Header.jsx";
import InputPanel from "./components/InputPanel.jsx";
import AvatarViewer from "./components/AvatarViewer.jsx";
import TranslationInfo from "./components/TranslationInfo.jsx";
import PipelineProgress from "./components/PipelineProgress.jsx";
import StatusBar from "./components/StatusBar.jsx";
import styles from "./App.module.css";

const LANGUAGES = [
  { code: "ar", name: "Arabic", flag: "🇸🇦", region: "North Africa" },
  { code: "sw", name: "Swahili", flag: "🇰🇪", region: "East Africa" },
  { code: "ha", name: "Hausa", flag: "🇳🇬", region: "West Africa" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬", region: "West Africa" },
  { code: "om", name: "Oromo", flag: "🇪🇹", region: "Horn of Africa" },
];

export default function App() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("sw");

  // Pipeline stages: idle | asr | nmt | motion | streaming | done | error
  const [pipelineStage, setPipelineStage] = useState("idle");
  const [streamState, setStreamState] = useState("idle");
  const [streamData, setStreamData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [frameProgress, setFrameProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const wsRef = useRef(null);

  // Simulate pipeline stages with delays for visual feedback
  const runPipeline = useCallback((text, lang) => {
    setPipelineStage("asr");

    // ASR stage: 600ms
    setTimeout(() => {
      setPipelineStage("nmt");

      // NMT stage: 500ms
      setTimeout(() => {
        setPipelineStage("motion");

        // Motion synthesis: 400ms, then open WS
        setTimeout(() => {
          setPipelineStage("streaming");
          openWebSocket(text, lang);
        }, 400);
      }, 500);
    }, 600);
  }, []); // eslint-disable-line

  const openWebSocket = useCallback((text, lang) => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3001/v1/stream";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "START_STREAM", source_language: lang, text }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "STREAM_START") {
        setStreamState("streaming");
        setStreamData({
          glosses: msg.glosses,
          transcript: msg.transcript,
          qualityScore: msg.quality_score,
          totalFrames: msg.total_frames,
          inputText: text,
        });
      }

      if (msg.type === "ANIMATION_FRAME") {
        setCurrentFrame(msg);
        setFrameProgress(msg.frame_index / (msg.total_frames || 180));
      }

      if (msg.type === "STREAM_END") {
        setStreamState("done");
        setPipelineStage("done");
        setFrameProgress(1);
      }
    };

    ws.onerror = () => {
      setStreamState("error");
      setPipelineStage("error");
      setErrorMsg("Connection failed. Check that the backend server is reachable.");
    };

    ws.onclose = () => {};
  }, []);

  const startTranslation = useCallback((text) => {
    if (wsRef.current) wsRef.current.close();

    setStreamState("connecting");
    setStreamData(null);
    setCurrentFrame(null);
    setFrameProgress(0);
    setErrorMsg(null);
    setIsPlaying(true);

    runPipeline(text, language);
  }, [language, runPipeline]);

  const stopStream = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "STOP_STREAM" }));
      wsRef.current.close();
    }
    setStreamState("idle");
    setPipelineStage("idle");
    setStreamData(null);
    setCurrentFrame(null);
    setFrameProgress(0);
  }, []);

  const handleThemeChange = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  };

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []); // eslint-disable-line

  const isActive = streamState === "connecting" || streamState === "streaming";

  return (
    <div className={styles.app} data-theme={theme}>
      <Header theme={theme} onThemeChange={handleThemeChange} />

      <main className={styles.main}>
        {/* Pipeline progress — always visible when not idle */}
        {pipelineStage !== "idle" && (
          <PipelineProgress stage={pipelineStage} streamData={streamData} />
        )}

        <div className={styles.layout}>
          {/* Left column */}
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

          {/* Right column: 3D avatar */}
          <div className={styles.rightCol}>
            <AvatarViewer
              currentFrame={currentFrame}
              streamState={streamState}
              frameProgress={frameProgress}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onPlayPause={() => setIsPlaying((p) => !p)}
              onSpeedChange={setPlaybackSpeed}
              onRestart={() => { setCurrentFrame(null); setFrameProgress(0); }}
              totalFrames={streamData?.totalFrames || 180}
              theme={theme}
            />
          </div>
        </div>
      </main>

      <StatusBar streamState={streamState} pipelineStage={pipelineStage} frameProgress={frameProgress} />
    </div>
  );
}
