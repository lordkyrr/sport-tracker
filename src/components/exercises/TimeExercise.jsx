import { useState } from "react";
import { fmtSec } from "../../lib/utils";
import { ProgressBar } from "../ProgressBar";

export function TimeExercise({ exercise, log, onAdd }) {
  const [val, setVal] = useState("");

  const totalSec = log.reduce((a, b) => a + b, 0);
  const complete = totalSec >= exercise.targetSec;

  const handleAdd = (sec) => {
    const n = sec !== undefined ? sec : Number(val);
    if (!n || n <= 0) return;
    onAdd(n);
    setVal("");
  };

  return (
    <div style={{
      background: complete ? `${exercise.color}11` : "rgba(255,255,255,0.04)",
      border: `1px solid ${complete ? exercise.color + "44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      marginBottom: 10,
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{exercise.label}</span>
          {complete && <span style={{ fontSize: 14 }}>✅</span>}
        </div>
        <div>
          <span style={{ color: exercise.color, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{fmtSec(totalSec)}</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>/{fmtSec(exercise.targetSec)}</span>
        </div>
      </div>

      <ProgressBar value={totalSec} total={exercise.targetSec} color={exercise.color} />

      {log.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10, marginBottom: 10 }}>
          {log.map((s, i) => (
            <span key={i} style={{
              background: `${exercise.color}22`,
              border: `1px solid ${exercise.color}55`,
              color: exercise.color,
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
            }}>+{fmtSec(s)}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <button
          onClick={() => handleAdd(exercise.quickAddSec)}
          style={{
            background: `${exercise.color}33`,
            border: `1px solid ${exercise.color}66`,
            borderRadius: 10,
            padding: "8px 14px",
            color: exercise.color,
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >+{fmtSec(exercise.quickAddSec)}</button>
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="sec…"
          style={{
            flex: 1,
            minWidth: 60,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "8px 12px",
            color: "#fff",
            fontSize: 14,
            fontFamily: "'Syne', sans-serif",
            outline: "none",
          }}
        />
        <button
          onClick={() => handleAdd()}
          style={{
            background: exercise.color,
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            color: "#000",
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            cursor: "pointer",
          }}
        >+</button>
      </div>
    </div>
  );
}
