export function ProgressBar({ value, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const complete = pct >= 100;

  return (
    <div style={{
      background: "rgba(255,255,255,0.08)",
      borderRadius: 8,
      height: 5,
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: complete
          ? `linear-gradient(90deg, ${color}, #fff)`
          : `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: complete ? `0 0 8px ${color}66` : "none",
        borderRadius: 8,
        transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}
