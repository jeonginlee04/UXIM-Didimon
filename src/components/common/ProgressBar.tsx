interface ProgressBarProps {
  value: number
  color?: string
  height?: number
  showLabel?: boolean
  animated?: boolean
}

export default function ProgressBar({
  value,
  color = '#256ef4',
  height = 8,
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-subtle">진행률</span>
          <span className="text-xs font-bold" style={{ color }}>
            {clamped}%
          </span>
        </div>
      )}
      <div
        className="w-full bg-bg-subtle rounded-full overflow-hidden"
        style={{ height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
