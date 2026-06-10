import { useState } from "react";
import { formatDate, fmtSec } from "../lib/utils";

const DAY_TYPE_COLORS = {
  dynamique: "#f97316",
  statique:  "#8b5cf6",
  repos:     "#6366f1",
  match:     "#10b981",
};

const DAY_TYPE_LABELS = {
  dynamique: "Dynamique",
  statique:  "Statique",
  repos:     "Repos",
  match:     "Match",
};

export function HistoryScreen({ sessions, program }) {
  const today = new Date().toISOString().split("T")[0];
  const days = Object.keys(sessions)
    .filter(d => d !== today)
    .sort((a, b) => b.localeCompare(a));

  if (days.length === 0) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
        <div style={{ fontSize: 15 }}>Aucun historique encore.<br />Commence ta première séance !</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 16px 0" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Historique</div>
      {days.map(d => (
        <HistoryDay key={d} dateKey={d} session={sessions[d]} program={program} />
      ))}
    </div>
  );
}

function HistoryDay({ dateKey, session, program }) {
  const [open, setOpen] = useState(false);
  const color = DAY_TYPE_COLORS[session.type] || "#fff";
  const label = DAY_TYPE_LABELS[session.type] || session.type;
  const isRestOrMatch = session.type === "repos" || session.type === "match";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      marginBottom: 10,
      overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, textTransform: "capitalize" }}>
          {formatDate(dateKey)}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            background: `${color}20`,
            border: `1px solid ${color}40`,
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 11,
            color,
            fontWeight: 700,
          }}>{label}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && !isRestOrMatch && (
        <div style={{ padding: "0 18px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {session.type === "dynamique" && program.A.map(e => {
            const log = (session.exercises || {})[e.id] || [];
            if (!log.length) return null;
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{e.label}</span>
                <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>
                  {log.reduce((a, b) => a + b, 0)} reps
                </span>
              </div>
            );
          })}
          {session.type === "statique" && program.B.map(e => {
            const log = (session.exercises || {})[e.id] || [];
            if (!log.length) return null;
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{e.label}</span>
                <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>
                  {fmtSec(log.reduce((a, b) => a + b, 0))}
                </span>
              </div>
            );
          })}
          {(session.cardio || []).length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Cardio</span>
              <div style={{ display: "flex", gap: 5 }}>
                {(session.cardio || []).map(cId => {
                  const opt = program.C.find(c => c.id === cId);
                  return opt ? <span key={cId} style={{ fontSize: 16 }}>{opt.emoji}</span> : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
