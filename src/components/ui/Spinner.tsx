export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-text-tertiary/30 border-t-text-primary"
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  )
}
