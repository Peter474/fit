interface ProgressBarProps {
  percent: number
  color: string
  trackColor?: string
  height?: number
}

export function ProgressBar({ percent, color, trackColor = 'var(--color-surface-3)', height = 8 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div
      className="w-full overflow-hidden rounded-pill"
      style={{ height, backgroundColor: trackColor }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-pill"
        style={{
          width: `${clamped}%`,
          backgroundColor: color,
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  )
}
