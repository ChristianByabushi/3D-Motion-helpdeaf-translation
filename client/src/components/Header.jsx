import React from "react";
import styles from "./Header.module.css";

const THEMES = [
  { id: "dark",      label: "Dark",  swatch: ["#4fc3f7", "#1e1e1e"] },
  { id: "dark-blue", label: "Ocean", swatch: ["#3b82f6", "#0f1c30"] },
  { id: "purple",    label: "Night", swatch: ["#a855f7", "#130d22"] },
  { id: "teal",      label: "Teal",  swatch: ["#14b8a6", "#081a20"] },
  { id: "light",     label: "Light", swatch: ["#2563eb", "#ffffff"] },
];

function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HelpDeaf logo"
      role="img"
    >
      <circle cx="32" cy="32" r="32" fill="#2563eb"/>
      <rect x="20" y="30" width="18" height="20" rx="4" fill="#ffffff"/>
      <rect x="12" y="30" width="10" height="7" rx="3.5" fill="#ffffff"/>
      <rect x="20" y="14" width="7" height="20" rx="3.5" fill="#ffffff"/>
      <rect x="28" y="22" width="6" height="12" rx="3" fill="#e0eaff"/>
      <rect x="34" y="24" width="5" height="10" rx="2.5" fill="#e0eaff"/>
      <rect x="34" y="14" width="5" height="18" rx="2.5" fill="#ffffff"/>
      <path d="M46 24 Q52 32 46 40" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M50 20 Q58 32 50 44" stroke="#bfdbfe" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

export default function Header({ theme, onThemeChange }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo size={36} />
          <h1 className={styles.title}>HelpDeaf</h1>
          <span className={styles.divider} />
          <p className={styles.tagline}>Bridging Sound and Silence</p>
        </div>

        <div className={styles.right}>
          <div className={styles.themeGroup}>
            <span className={styles.themeLabel}>Theme</span>
            <div className={styles.themes}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`${styles.themeBtn} ${theme === t.id ? styles.themeBtnActive : ""}`}
                  onClick={() => onThemeChange(t.id)}
                  title={t.label}
                  aria-label={`Switch to ${t.label} theme`}
                  aria-pressed={theme === t.id}
                >
                  <span
                    className={styles.themeSwatch}
                    style={{
                      background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)`,
                    }}
                  />
                  <span className={styles.themeSwatchLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <span className={styles.badge}>Prototype v0.1</span>
        </div>
      </div>
    </header>
  );
}
