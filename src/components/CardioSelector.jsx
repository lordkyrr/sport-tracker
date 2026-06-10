export function CardioSelector({ options, checked, onChange }) {
  return (
    <div style={{
      background: checked.length > 0 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${checked.length > 0 ? "#f59e0b44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      marginBottom: 10,
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Cardio</span>
        {checked.length > 0 && <span style={{ fontSize: 14 }}>✅</span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(opt => {
          const active = checked.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onChange(
                active ? checked.filter(c => c !== opt.id) : [...checked, opt.id]
              )}
              style={{
                background: active ? "#f59e0b22" : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? "#f59e0b88" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                padding: "10px 14px",
                color: active ? "#f59e0b" : "rgba(255,255,255,0.5)",
                fontWeight: active ? 800 : 400,
                fontSize: 13,
                fontFamily: "'Syne', sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s",
              }}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
