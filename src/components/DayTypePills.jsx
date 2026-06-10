const DAY_TYPES = [
  { id: "dynamique", label: "Dynamique", color: "#f97316" },
  { id: "statique",  label: "Statique",  color: "#8b5cf6" },
  { id: "repos",     label: "Repos",     color: "#6366f1" },
  { id: "match",     label: "Match",     color: "#10b981" },
];

export function DayTypePills({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {DAY_TYPES.map(dt => {
        const active = selected === dt.id;
        return (
          <button
            key={dt.id}
            onClick={() => onChange(dt.id)}
            style={{
              background: active ? `${dt.color}20` : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? dt.color + "66" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              padding: "6px 14px",
              color: active ? dt.color : "rgba(255,255,255,0.4)",
              fontWeight: active ? 800 : 400,
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {dt.label}
          </button>
        );
      })}
    </div>
  );
}
