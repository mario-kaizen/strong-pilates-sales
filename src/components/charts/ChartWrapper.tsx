'use client'

import { useEffect, useRef } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

Chart.register(...registerables)

// Global Chart.js defaults
Chart.defaults.font.family = "'DM Sans', sans-serif"
Chart.defaults.font.size = 12
Chart.defaults.color = '#6B6B6B'
Chart.defaults.plugins.legend.labels.usePointStyle = true
Chart.defaults.plugins.legend.labels.pointStyle = 'circle'

interface Props {
  config: ChartConfiguration
  height?: number
  className?: string
}

export function ChartWrapper({ config, height = 300, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(canvasRef.current, {
      ...config,
      options: {
        ...config.options,
        responsive: true,
        maintainAspectRatio: false,
      },
    })

    return () => {
      chartRef.current?.destroy()
    }
  }, [config])

  return (
    <div style={{ height: `${height}px`, position: 'relative' }} className={className}>
      <canvas ref={canvasRef} />
    </div>
  )
}
