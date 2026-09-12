/** One tick per actual lesson or screen; counts are never decorative estimates. */
export function SegmentedProgress({ completed, total, label, className = "" }: {
  completed: number; total: number; label: string; className?: string;
}) {
  const count = Math.max(0, Math.floor(total));
  const done = Math.max(0, Math.min(count, Math.floor(completed)));
  return <div className={`segmented-progress ${className}`} role="progressbar"
    aria-label={label} aria-valuemin={0} aria-valuemax={count || 1} aria-valuenow={done}
    aria-valuetext={`${done} of ${count} ${label.toLowerCase()}`}>
    {Array.from({ length: count }, (_, i) => <span key={i} data-filled={i < done} />)}
  </div>;
}
