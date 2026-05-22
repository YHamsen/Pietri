"use client"

import { useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface ShatterButtonProps {
  children: ReactNode
  className?: string
  shardCount?: number
  shatterColor?: string
  href?: string
  onClick?: () => void
  style?: React.CSSProperties
}

interface Shard {
  id: number
  velocityX: number
  velocityY: number
  rotation: number
  size: number
  clipPath: string
}

export function ShatterButton({
  children,
  className = "",
  shardCount = 16,
  shatterColor = "#ffffff",
  href,
  onClick,
  style,
}: ShatterButtonProps) {
  const [isShattered, setIsShattered] = useState(false)
  const [shards, setShards] = useState<Shard[]>([])

  const handleClick = useCallback(() => {
    if (isShattered) return

    const newShards: Shard[] = Array.from({ length: shardCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / shardCount + Math.random() * 0.4
      const velocity = 60 + Math.random() * 140
      return {
        id: i,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        rotation: Math.random() * 540 - 270,
        size: 3 + Math.random() * 9,
        clipPath: `polygon(${Math.random() * 40}% 0%,100% ${Math.random() * 40}%,${60 + Math.random() * 40}% 100%,0% ${50 + Math.random() * 50}%)`,
      }
    })

    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 30, 8])
    }

    setShards(newShards)
    setIsShattered(true)
    onClick?.()

    if (href) {
      setTimeout(() => { window.location.href = href }, 500)
    }

    setTimeout(() => { setIsShattered(false); setShards([]) }, 900)
  }, [isShattered, shardCount, onClick, href])

  return (
    <div className="relative inline-flex" style={style}>
      <motion.button
        onClick={handleClick}
        className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-[0.1em] overflow-hidden w-full justify-center ${className}`}
        animate={{ scale: isShattered ? 0 : 1, opacity: isShattered ? 0 : 1 }}
        transition={{ duration: 0.12 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          background: `linear-gradient(135deg, ${shatterColor}14, ${shatterColor}28)`,
          border: `1px solid ${shatterColor}44`,
          color: shatterColor,
          boxShadow: `0 0 16px ${shatterColor}22`,
          cursor: "pointer",
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0"
          whileHover={{ opacity: 1 }}
          style={{ background: `radial-gradient(circle at center, ${shatterColor}22 0%, transparent 70%)` }}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>

      {/* Shards */}
      <AnimatePresence>
        {shards.map((shard) => (
          <motion.div
            key={shard.id}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              width: shard.size,
              height: shard.size,
              background: shatterColor,
              boxShadow: `0 0 8px ${shatterColor}`,
              clipPath: shard.clipPath,
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{ x: shard.velocityX, y: shard.velocityY, rotate: shard.rotation, opacity: 0, scale: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        ))}
      </AnimatePresence>

      {/* Explosion ring */}
      <AnimatePresence>
        {isShattered && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 220, height: 220, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{ border: `1.5px solid ${shatterColor}`, boxShadow: `0 0 20px ${shatterColor}` }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
