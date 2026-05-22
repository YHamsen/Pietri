"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ChartDataPoint {
  label: string
  value: number
}

const DEFAULT_DATA: ChartDataPoint[] = [
  { label: "Mon", value: 65 },
  { label: "Tue", value: 85 },
  { label: "Wed", value: 45 },
  { label: "Thu", value: 95 },
  { label: "Fri", value: 70 },
  { label: "Sat", value: 55 },
  { label: "Sun", value: 80 },
]

interface MiniChartProps {
  data?: ChartDataPoint[]
  title?: string
  unit?: string
  color?: string
}

export function MiniChart({ data = DEFAULT_DATA, title = "Activity", unit = "%" }: MiniChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [displayValue, setDisplayValue] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  useEffect(() => {
    if (hoveredIndex !== null) {
      setDisplayValue(data[hoveredIndex].value)
    }
  }, [hoveredIndex, data])

  const handleContainerLeave = () => {
    setIsHovering(false)
    setHoveredIndex(null)
    setTimeout(() => setDisplayValue(null), 150)
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleContainerLeave}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem' }}
      className="group relative w-full flex flex-col gap-3 transition-all duration-500 hover:border-white/[0.12]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{title}</span>
        </div>
        <div className="relative h-6 flex items-center">
          <span
            className={cn(
              "text-base font-semibold tabular-nums transition-all duration-300 ease-out",
              isHovering && displayValue !== null
                ? "opacity-100 text-white"
                : "opacity-30 text-white",
            )}
          >
            {displayValue !== null ? displayValue : ""}
            {displayValue !== null && (
              <span className="text-[10px] font-normal ml-0.5 opacity-60">{unit}</span>
            )}
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5 h-20">
        {data.map((item, index) => {
          const heightPx = (item.value / maxValue) * 80
          const isHovered = hoveredIndex === index
          const isAnyHovered = hoveredIndex !== null
          const isNeighbor =
            hoveredIndex !== null &&
            (index === hoveredIndex - 1 || index === hoveredIndex + 1)

          return (
            <div
              key={item.label}
              className="relative flex-1 flex flex-col items-center justify-end h-full"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              {/* Tooltip */}
              <div
                className={cn(
                  "absolute -top-8 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all duration-200 pointer-events-none",
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                )}
                style={{ background: 'rgba(255,255,255,0.95)', color: '#0a0a0a' }}
              >
                {item.value}{unit}
              </div>

              {/* Bar */}
              <div
                className={cn(
                  "w-full rounded-sm cursor-pointer transition-all duration-300 ease-out origin-bottom",
                )}
                style={{
                  height: `${heightPx}px`,
                  background: isHovered
                    ? 'rgba(255,255,255,0.85)'
                    : isNeighbor
                    ? 'rgba(255,255,255,0.3)'
                    : isAnyHovered
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.18)',
                  transform: isHovered
                    ? 'scaleX(1.1)'
                    : isNeighbor
                    ? 'scaleX(1.04)'
                    : 'scaleX(1)',
                  transition: 'all 250ms cubic-bezier(0.32,0.72,0,1)',
                }}
              />

              {/* Label */}
              <span
                className={cn(
                  "text-[9px] font-medium mt-1.5 transition-all duration-300",
                )}
                style={{ color: isHovered ? 'white' : 'rgba(255,255,255,0.25)' }}
              >
                {item.label.charAt(0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
