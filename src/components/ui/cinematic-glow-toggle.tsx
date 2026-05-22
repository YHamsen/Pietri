"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface CinematicSwitchProps {
  /** Back-button mode: starts ON (right), slides LEFT when tapped, then navigates back */
  asBackButton?: boolean;
  label?: string;
  onToggle?: (val: boolean) => void;
}

export default function CinematicSwitch({ asBackButton, label, onToggle }: CinematicSwitchProps) {
  // asBackButton: starts ON (thumb right), click = slide left then navigate
  const [isOn, setIsOn] = useState(asBackButton ? true : false);
  const [firing, setFiring] = useState(false);

  function handleClick() {
    if (firing) return;

    if (asBackButton) {
      setFiring(true);
      setIsOn(false); // thumb slides LEFT
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([8, 40, 12]);
      }
      setTimeout(() => window.history.back(), 380);
      return;
    }

    const next = !isOn;
    setIsOn(next);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(6);
    onToggle?.(next);
  }

  return (
    <div
      onClick={handleClick}
      style={{ cursor: firing ? "default" : "pointer", userSelect: "none" }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md select-none"
    >
      {/* Back arrow + label (asBackButton only) */}
      {asBackButton && (
        <motion.span
          animate={{ x: isOn ? 0 : -2, opacity: isOn ? 0.8 : 0.4 }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="text-[10px] font-bold tracking-[0.13em] uppercase flex items-center gap-1.5 text-white/70"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {label ?? "Retour"}
        </motion.span>
      )}

      {/* OFF label (standalone mode) */}
      {!asBackButton && (
        <span className={`text-[9px] font-bold tracking-wider transition-colors duration-300 ${!isOn ? "text-zinc-400" : "text-zinc-600"}`}>
          OFF
        </span>
      )}

      {/* Track */}
      <motion.div
        className="relative rounded-full shadow-inner flex-shrink-0"
        style={{ width: 40, height: 22 }}
        initial={false}
        animate={{ backgroundColor: isOn ? "#064e3b" : "#27272a" }}
        transition={{ duration: 0.28 }}
      >
        {/* Thumb — starts RIGHT when asBackButton, slides to LEFT */}
        <motion.div
          className="absolute rounded-full border border-white/10 shadow-md"
          style={{ top: 3, left: 3, width: 16, height: 16 }}
          initial={false}
          animate={{
            x: isOn ? 18 : 0,           // ON = right (+18px), OFF = left (0px)
            backgroundColor: isOn ? "#34d399" : "#52525b",
          }}
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
          whileTap={{ scale: 0.88 }}
        >
          {/* Gloss highlight */}
          <div className="absolute top-[3px] left-[3px] w-[6px] h-[3px] bg-white/25 rounded-full blur-[0.5px]" />
        </motion.div>

        {/* Emerald glow when ON */}
        {isOn && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ boxShadow: "0 0 12px rgba(52,211,153,0.4)" }}
          />
        )}
      </motion.div>

      {/* ON label (standalone mode) */}
      {!asBackButton && (
        <span className={`text-[9px] font-bold tracking-wider transition-colors duration-300 ${isOn ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "text-zinc-700"}`}>
          ON
        </span>
      )}
    </div>
  );
}
