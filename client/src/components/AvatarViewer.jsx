import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./AvatarViewer.module.css";

// ─── Sign pose library ────────────────────────────────────────────────────────
// Each pose defines Euler rotations (x, y, z) for key joints.
// 8 distinct poses cycle through as glosses change.
const SIGN_POSES = [
  // Pose 0 — both hands raised, open
  {
    LeftArm:      [0.3,  0,    0.9],
    RightArm:     [0.3,  0,   -0.9],
    LeftForeArm:  [-0.3, 0,    0.5],
    RightForeArm: [-0.3, 0,   -0.5],
    LeftHand:     [0.2,  0.3,  0],
    RightHand:    [0.2, -0.3,  0],
  },
  // Pose 1 — right hand to chest
  {
    LeftArm:      [0.1,  0,    0.2],
    RightArm:     [0.8,  0,   -0.4],
    LeftForeArm:  [0,    0,    0.1],
    RightForeArm: [-0.9, 0,   -0.2],
    LeftHand:     [0,    0,    0],
    RightHand:    [0.3,  0.2,  0],
  },
  // Pose 2 — left hand forward, right down
  {
    LeftArm:      [0.5,  0,    0.6],
    RightArm:     [0.1,  0,   -0.2],
    LeftForeArm:  [-0.6, 0,    0.3],
    RightForeArm: [0,    0,   -0.1],
    LeftHand:     [-0.2, 0.4,  0.1],
    RightHand:    [0,    0,    0],
  },
  // Pose 3 — both hands at face level
  {
    LeftArm:      [0.6,  0,    0.7],
    RightArm:     [0.6,  0,   -0.7],
    LeftForeArm:  [-0.8, 0,    0.4],
    RightForeArm: [-0.8, 0,   -0.4],
    LeftHand:     [0.1,  0.5,  0.2],
    RightHand:    [0.1, -0.5,  0.2],
  },
  // Pose 4 — right hand sweeping out
  {
    LeftArm:      [0.2,  0,    0.3],
    RightArm:     [0.4,  0.2, -1.1],
    LeftForeArm:  [0,    0,    0.2],
    RightForeArm: [-0.4, 0.1, -0.3],
    LeftHand:     [0,    0,    0],
    RightHand:    [-0.3, 0.6,  0.1],
  },
  // Pose 5 — crossed arms
  {
    LeftArm:      [0.5,  0.3,  0.5],
    RightArm:     [0.5, -0.3, -0.5],
    LeftForeArm:  [-0.5, 0.2,  0.4],
    RightForeArm: [-0.5,-0.2, -0.4],
    LeftHand:     [0.2,  0.2,  0.3],
    RightHand:    [0.2, -0.2,  0.3],
  },
  // Pose 6 — left hand pointing up
  {
    LeftArm:      [0.9,  0,    0.5],
    RightArm:     [0.1,  0,   -0.2],
    LeftForeArm:  [-1.0, 0,    0.2],
    RightForeArm: [0,    0,   -0.1],
    LeftHand:     [-0.3, 0,    0],
    RightHand:    [0,    0,    0],
  },
  // Pose 7 — both hands low, palms out
  {
    LeftArm:      [0.1,  0,    0.4],
    RightArm:     [0.1,  0,   -0.4],
    LeftForeArm:  [0.2,  0,    0.2],
    RightForeArm: [0.2,  0,   -0.2],
    LeftHand:     [0.5,  0.3, -0.2],
    RightHand:    [0.5, -0.3, -0.2],
  },
];

// Finger curl amounts per pose (0 = open, 1 = closed)
const FINGER_CURL = [0.1, 0.7, 0.2, 0.9, 0.3, 0.6, 0.1, 0.8];

// ─── Build humanoid avatar ────────────────────────────────────────────────────
function buildAvatar(scene, bodyColor, skinColor) {
  const root = new THREE.Group();
  const bones = {};

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.45, metalness: 0.05 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6,  metalness: 0.0  });

  function seg(name, parent, offset, radius, height, mat = bodyMat) {
    const group = new THREE.Group();
    group.position.set(...offset);

    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.8, radius, height, 10, 1),
      mat
    );
    cyl.position.y = height / 2;
    cyl.castShadow = true;
    group.add(cyl);

    const joint = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 10, 8),
      mat
    );
    joint.castShadow = true;
    group.add(joint);

    parent.add(group);
    bones[name] = group;
    return group;
  }

  // Torso
  const hips   = seg("Hips",   root,  [0, 0, 0],       0.14, 0.22);
  const spine  = seg("Spine",  hips,  [0, 0.22, 0],    0.12, 0.20);
  const spine1 = seg("Spine1", spine, [0, 0.20, 0],    0.13, 0.18);
  const spine2 = seg("Spine2", spine1,[0, 0.18, 0],    0.12, 0.14);
  const neck   = seg("Neck",   spine2,[0, 0.14, 0],    0.055,0.10, skinMat);
  const head   = seg("Head",   neck,  [0, 0.10, 0],    0.13, 0.16, skinMat);

  // Head sphere
  const headSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.145, 14, 10), skinMat
  );
  headSphere.position.y = 0.14;
  headSphere.castShadow = true;
  head.add(headSphere);

  // Left arm
  const lShoulder = seg("LeftShoulder", spine2,    [-0.16, 0.10, 0],  0.055, 0.08);
  const lArm      = seg("LeftArm",      lShoulder, [-0.10, 0,    0],  0.055, 0.24, skinMat);
  const lForeArm  = seg("LeftForeArm",  lArm,      [0, -0.24, 0],     0.045, 0.22, skinMat);
  const lHand     = seg("LeftHand",     lForeArm,  [0, -0.22, 0],     0.04,  0.10, skinMat);

  const lFingerX = [-0.035, -0.012, 0.012, 0.035];
  const lFingerNames = ["LeftHandIndex", "LeftHandMiddle", "LeftHandRing", "LeftHandPinky"];
  lFingerX.forEach((x, i) => {
    const f1 = seg(`${lFingerNames[i]}1`, lHand, [x, -0.10, 0], 0.012, 0.038, skinMat);
    seg(`${lFingerNames[i]}2`, f1, [0, -0.038, 0], 0.010, 0.030, skinMat);
  });
  const lThumb1 = seg("LeftHandThumb1", lHand, [-0.045, -0.06, 0.02], 0.013, 0.032, skinMat);
  seg("LeftHandThumb2", lThumb1, [0, -0.032, 0], 0.011, 0.026, skinMat);

  // Right arm
  const rShoulder = seg("RightShoulder", spine2,    [0.16, 0.10, 0],   0.055, 0.08);
  const rArm      = seg("RightArm",      rShoulder, [0.10, 0,    0],   0.055, 0.24, skinMat);
  const rForeArm  = seg("RightForeArm",  rArm,      [0, -0.24, 0],     0.045, 0.22, skinMat);
  const rHand     = seg("RightHand",     rForeArm,  [0, -0.22, 0],     0.04,  0.10, skinMat);

  const rFingerX = [0.035, 0.012, -0.012, -0.035];
  const rFingerNames = ["RightHandIndex", "RightHandMiddle", "RightHandRing", "RightHandPinky"];
  rFingerX.forEach((x, i) => {
    const f1 = seg(`${rFingerNames[i]}1`, rHand, [x, -0.10, 0], 0.012, 0.038, skinMat);
    seg(`${rFingerNames[i]}2`, f1, [0, -0.038, 0], 0.010, 0.030, skinMat);
  });
  const rThumb1 = seg("RightHandThumb1", rHand, [0.045, -0.06, 0.02], 0.013, 0.032, skinMat);
  seg("RightHandThumb2", rThumb1, [0, -0.032, 0], 0.011, 0.026, skinMat);

  // Legs
  const lUpLeg = seg("LeftUpLeg",  hips,    [-0.10, -0.05, 0], 0.075, 0.30);
  const lLeg   = seg("LeftLeg",    lUpLeg,  [0, -0.30, 0],     0.060, 0.28);
  seg("LeftFoot",   lLeg,    [0, -0.28, 0],     0.055, 0.10);

  const rUpLeg = seg("RightUpLeg", hips,    [0.10, -0.05, 0],  0.075, 0.30);
  const rLeg   = seg("RightLeg",   rUpLeg,  [0, -0.30, 0],     0.060, 0.28);
  seg("RightFoot",  rLeg,    [0, -0.28, 0],     0.055, 0.10);

  root.position.y = 0.55;
  scene.add(root);
  return { avatar: root, bones };
}

// ─── Lerp helpers ─────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t) { return t * t * (3 - 2 * t); }

// Apply a pose to bones, lerping from current rotation
function applyPose(bones, pose, alpha) {
  for (const [boneName, target] of Object.entries(pose)) {
    const bone = bones[boneName];
    if (!bone) continue;
    bone.rotation.x = lerp(bone.rotation.x, target[0], alpha);
    bone.rotation.y = lerp(bone.rotation.y, target[1], alpha);
    bone.rotation.z = lerp(bone.rotation.z, target[2], alpha);
  }
}

// Idle pose — arms relaxed at sides
const IDLE_POSE = {
  LeftArm:      [0.05, 0,  0.18],
  RightArm:     [0.05, 0, -0.18],
  LeftForeArm:  [0.05, 0,  0.08],
  RightForeArm: [0.05, 0, -0.08],
  LeftHand:     [0,    0,  0],
  RightHand:    [0,    0,  0],
  Spine:        [0,    0,  0],
  Spine1:       [0,    0,  0],
  Spine2:       [0,    0,  0],
  Head:         [0,    0,  0],
};

export default function AvatarViewer({
  currentFrame,
  streamState,
  frameProgress,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onSpeedChange,
  onRestart,
  totalFrames,
  theme,
}) {
  const canvasRef  = useRef(null);
  const sceneRef   = useRef(null);
  const bonesRef   = useRef({});
  const rafRef     = useRef(null);
  const tRef       = useRef(0);
  const frameRef   = useRef(null);
  const stateRef   = useRef(streamState);

  useEffect(() => { stateRef.current = streamState; }, [streamState]);
  useEffect(() => { frameRef.current = currentFrame; }, [currentFrame]);

  // ── Init Three.js scene ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 1.1, 3.2);
    camera.lookAt(0, 0.9, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xaaccff, 2.5);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xcc99ff, 1.0);
    fill.position.set(-3, 2, -1);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x66ccff, 0.6);
    rim.position.set(0, 4, -3);
    scene.add(rim);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 64),
      new THREE.MeshStandardMaterial({ color: 0x1a2540, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Glow ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.55, 64),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.49;
    scene.add(ring);

    const { avatar, bones } = buildAvatar(scene, 0x3b82f6, 0xd4956a);
    bonesRef.current = bones;
    sceneRef.current = { renderer, scene, camera, avatar, ring };

    // Resize observer
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Render loop
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      tRef.current += 0.016;
      const t     = tRef.current;
      const state = stateRef.current;
      const frame = frameRef.current;
      const b     = bonesRef.current;

      if (state === "streaming" && frame) {
        // ── Gloss-driven pose ──
        const glossIdx      = frame.gloss_index ?? 0;
        const glossProgress = frame.gloss_progress ?? 0;

        // Pick the target pose for this gloss (cycle through SIGN_POSES)
        const poseIdx  = glossIdx % SIGN_POSES.length;
        const pose     = SIGN_POSES[poseIdx];

        // Smooth transition: fast at start of gloss, hold in middle, fast at end
        // Use smoothstep on the first 30% and last 30% of the gloss
        let alpha;
        if (glossProgress < 0.3) {
          alpha = smoothstep(glossProgress / 0.3) * 0.25;
        } else if (glossProgress > 0.7) {
          alpha = 0.08;
        } else {
          alpha = 0.12; // hold
        }

        applyPose(b, pose, alpha);

        // Finger curl based on pose
        const curl = FINGER_CURL[poseIdx];
        const fingerJoints = [
          "LeftHandIndex1","LeftHandMiddle1","LeftHandRing1","LeftHandPinky1",
          "RightHandIndex1","RightHandMiddle1","RightHandRing1","RightHandPinky1",
        ];
        fingerJoints.forEach((name) => {
          if (b[name]) b[name].rotation.x = lerp(b[name].rotation.x, curl * 1.2, 0.1);
        });

        // Subtle breathing on top
        const breathe = Math.sin(t * 1.1) * 0.008;
        if (b.Spine)  b.Spine.rotation.z  = lerp(b.Spine.rotation.z,  breathe, 0.05);
        if (b.Head)   b.Head.rotation.y   = lerp(b.Head.rotation.y,   Math.sin(t * 0.3) * 0.06, 0.03);

      } else {
        // ── Idle breathing ──
        const breathe = Math.sin(t * 1.1) * 0.012;
        const sway    = Math.sin(t * 0.7) * 0.03;
        applyPose(b, IDLE_POSE, 0.04);
        if (b.Spine)  b.Spine.rotation.z  = lerp(b.Spine.rotation.z,  breathe, 0.05);
        if (b.Spine2) b.Spine2.rotation.z = lerp(b.Spine2.rotation.z, sway * 0.3, 0.03);
        if (b.Head)   b.Head.rotation.y   = lerp(b.Head.rotation.y,   Math.sin(t * 0.4) * 0.07, 0.03);
      }

      // Ring pulse
      if (ring) {
        ring.material.opacity = state === "streaming"
          ? 0.35 + Math.sin(t * 5) * 0.15
          : 0.12 + Math.sin(t * 1.5) * 0.06;
      }

      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
    };
  }, []); // eslint-disable-line

  // Update avatar + scene colors when theme changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const colorMap = {
      "dark":      { body: 0x4fc3f7, bg: 0x1a1a1a, ring: 0x4fc3f7 },
      "dark-blue": { body: 0x3b82f6, bg: 0x0a1628, ring: 0x3b82f6 },
      "purple":    { body: 0xa855f7, bg: 0x0e0a1e, ring: 0xa855f7 },
      "teal":      { body: 0x14b8a6, bg: 0x051418, ring: 0x14b8a6 },
      "light":     { body: 0x2563eb, bg: 0xe8eef5, ring: 0x2563eb },
    };
    const c = colorMap[theme] || colorMap["dark-blue"];
    const { scene, ring } = sceneRef.current;

    scene.background = new THREE.Color(c.bg);
    if (ring) ring.material.color.set(c.ring);

    scene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const col = obj.material.color;
      // Skip skin-toned meshes
      if (col.r > 0.7 && col.g > 0.5 && col.b < 0.5) return;
      // Skip very dark meshes (ground)
      if (col.r < 0.15 && col.g < 0.2 && col.b < 0.25) return;
      obj.material.color.set(c.body);
    });
  }, [theme]);

  const isStreaming  = streamState === "streaming";
  const isDone       = streamState === "done";
  const isIdle       = streamState === "idle";
  const isConnecting = streamState === "connecting";

  return (
    <div className={styles.viewer}>
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {isIdle && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <span className={styles.overlayIcon}>🤟</span>
              <p className={styles.overlayTitle}>Ready to Translate</p>
              <p className={styles.overlayText}>Enter text or record audio to see the 3D avatar sign</p>
            </div>
          </div>
        )}

        {isConnecting && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <div className={styles.spinner} />
              <p className={styles.overlayTitle}>Preparing Animation…</p>
              <p className={styles.overlayText}>Running translation pipeline</p>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE
          </div>
        )}

        {/* Active gloss label — bottom of canvas */}
        {isStreaming && currentFrame?.gloss_label && (
          <div className={styles.glossLabel}>
            {currentFrame.source_word && (
              <>
                <span className={styles.glossLabelSource}>{currentFrame.source_word}</span>
                <span className={styles.glossLabelArrow}>→</span>
              </>
            )}
            <span className={styles.glossLabelIndex}>#{(currentFrame.gloss_index ?? 0) + 1}</span>
            <span className={styles.glossLabelText}>{currentFrame.gloss_label}</span>
          </div>
        )}

        {isDone && <div className={styles.doneBadge}>✓ Complete</div>}
      </div>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${frameProgress * 100}%` }} />
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={onRestart} title="Restart" aria-label="Restart">⏮</button>
        <button className={`${styles.ctrlBtn} ${styles.playBtn}`} onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? "⏸" : "▶"}
        </button>

        <div className={styles.speedGroup}>
          {[0.5, 1.0, 1.5].map((s) => (
            <button
              key={s}
              className={`${styles.speedBtn} ${playbackSpeed === s ? styles.speedBtnActive : ""}`}
              onClick={() => onSpeedChange(s)}
              aria-pressed={playbackSpeed === s}
            >
              {s}×
            </button>
          ))}
        </div>

        <span className={styles.frameCounter}>
          {currentFrame ? currentFrame.frame_index + 1 : 0}/{totalFrames}
        </span>
      </div>
    </div>
  );
}
