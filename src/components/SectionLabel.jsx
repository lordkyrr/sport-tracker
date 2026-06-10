export function SectionLabel({ text }) {
  return (
    <div style={{ marginBottom: 12, marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}
