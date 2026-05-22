"use client"

import { useState, useEffect } from "react"

interface LocationTagProps {
  city?: string
  country?: string
  timezone?: string
}

export function LocationTag({ city = "Abidjan", country = "Côte d'Ivoire", timezone = "GMT" }: LocationTagProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Africa/Abidjan",
        }),
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '999px',
        border: isHovered ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.12)',
        background: isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        padding: '8px 16px',
        transition: 'all 400ms ease',
        cursor: 'default',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Live pulse */}
      <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px', flexShrink: 0 }}>
        <span style={{ position: 'absolute', display: 'inline-flex', width: '100%', height: '100%', borderRadius: '50%', background: '#10b981', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
        <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
      </span>

      {/* Text */}
      <span style={{ position: 'relative', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', color: 'white', height: '1em', overflow: 'hidden', minWidth: '120px' }}>
        <span style={{ display: 'block', transition: 'transform 400ms ease, opacity 400ms ease', transform: isHovered ? 'translateY(-100%)' : 'translateY(0)', opacity: isHovered ? 0 : 0.8 }}>
          {city}, {country}
        </span>
        <span style={{ position: 'absolute', top: 0, left: 0, display: 'block', transition: 'transform 400ms ease, opacity 400ms ease', transform: isHovered ? 'translateY(0)' : 'translateY(100%)', opacity: isHovered ? 0.9 : 0 }}>
          {currentTime} {timezone}
        </span>
      </span>

      {/* Arrow */}
      <svg
        style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)', transition: 'transform 300ms ease, opacity 300ms ease', transform: isHovered ? 'translateX(2px) rotate(-45deg)' : 'translateX(0) rotate(0)', opacity: isHovered ? 1 : 0.4 }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>

      <style>{`@keyframes ping { 75%,100%{transform:scale(2);opacity:0} }`}</style>
    </button>
  )
}
