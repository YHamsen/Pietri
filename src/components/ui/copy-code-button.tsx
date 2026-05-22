"use client";

import { useState, useEffect } from "react";

interface CopyCodeProps {
  code: string;
  label?: string;
  accentColor?: string;
}

export function CopyCode({ code, label, accentColor = "#34d399" }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState(0);
  const duration = 3000;

  useEffect(() => {
    if (copied) {
      const showTimer = setTimeout(() => setShowConfirmation(true), 350);
      setProgress(0);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);
        if (elapsed >= duration) {
          clearInterval(interval);
          setShowConfirmation(false);
          setTimeout(() => { setCopied(false); setProgress(0); }, 350);
        }
      }, 16);
      return () => { clearInterval(interval); clearTimeout(showTimer); };
    }
  }, [copied]);

  const handleCopy = async () => {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 999,
        padding: "0 0.5rem 0 1.25rem",
        height: 52,
        minWidth: 220,
      }}
    >
      {/* Progress background */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${progress}%`,
          background: `rgba(${accentColor === '#34d399' ? '52,211,153' : '255,255,255'},0.08)`,
          opacity: copied ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />

      {/* Original content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "1.25rem",
          paddingRight: "0.4rem",
          opacity: copied ? 0 : 1,
          filter: copied ? "blur(10px)" : "blur(0)",
          transform: copied ? "scale(0.93)" : "scale(1)",
          transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: copied ? "none" : "auto",
          zIndex: copied ? 0 : 2,
        }}
      >
        <span
          style={{
            flex: 1,
            fontFamily: "'Anton', sans-serif",
            fontSize: "1rem",
            letterSpacing: "0.1em",
            color: accentColor,
            userSelect: "all",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {code}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: `rgba(${accentColor === '#34d399' ? '52,211,153' : '255,255,255'},0.12)`,
            border: `1px solid rgba(${accentColor === '#34d399' ? '52,211,153' : '255,255,255'},0.25)`,
            borderRadius: 999,
            padding: "0.4rem 1rem",
            color: accentColor,
            fontSize: "0.62rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginLeft: "0.6rem",
            transition: "all 200ms",
          }}
        >
          {label || "Copier"}
        </button>
      </div>

      {/* Confirmation */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          opacity: showConfirmation ? 1 : 0,
          filter: showConfirmation ? "blur(0)" : "blur(10px)",
          transform: showConfirmation ? "scale(1)" : "scale(1.08)",
          transition: "all 0.7s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            background: accentColor,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" fill="none" stroke="#0a0a0a" strokeWidth={2.5} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: showConfirmation ? 0 : 24,
                transition: "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1) 0.25s",
              }}
            />
          </svg>
        </div>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: accentColor, letterSpacing: "0.05em" }}>
          Copié !
        </span>
      </div>
    </div>
  );
}
