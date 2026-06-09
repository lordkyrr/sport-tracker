import { useState, useEffect, useCallback, useRef } from "react";

const EXERCISES_A = [
  { id: "squats",    label: "Squats",      target: 100, unit: "reps",   color: "#f97316", emoji: "🦵", quickAdd: 20 },
  { id: "abdos",     label: "Abdos",       target: 200, unit: "reps",   color: "#ec4899", emoji: "💪", quickAdd: 50 },
  { id: "tractions", label: "Tractions",   target: 40,  unit: "reps",   color: "#8b5cf6", emoji: "🏋️", quickAdd: 5  },
  { id: "pompes",    label: "Pompes",      target: 50,  unit: "reps",   color: "#06b6d4", emoji: "👐", quickAdd: 10 },
  { id: "devcouche", label: "Dév. couché", target: 3,   unit: "séries", color: "#10b981", emoji: "🔥", isStrength: true },
];

const EXERCISES_B = [
  { id: "chaise",         label: "Chaise",              targetSec: 300, color: "#e879f9", emoji: "🪑", quickAddSec: 60 },
  { id: "planche",        label: "Planche",              targetSec: 300, color: "#f472b6", emoji: "🧘", quickAddSec: 60 },
  { id: "superman",       label: "Superman",             targetSec: 300, color: "#fb923c", emoji: "🦸", quickAddSec: 60 },
  { id: "pompebasse",     label: "Pompe pos. basse",     targetSec: 120, color: "#34d399", emoji: "👇", quickAddSec: 15 },
  { id: "tractionhaute",  label: "Traction pos. haute",  targetSec: 120, color: "#60a5fa", emoji: "☝️", quickAddSec: 15 },
];

const CARDIO_OPTIONS = [
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "velo",    label: "Vélo",    emoji: "🚴" },
  { id: "piscine", label: "Piscine", emoji: "🏊" },
  { id: "tennis",  label: "Tennis",  emoji: "🎾" },
];

const STORAGE_KEY = "workout-tracker-v1";
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function getTodayKey() { return new Date().toISOString().split("T")[0]; }
function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}
function fmtSec(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), sec = s % 60;
  return sec === 0 ? `${m}min` : `${m}min${sec}s`;
}

function SectionHeader({ label, sublabel }) {
  return (
    <div style={{ marginBottom: 12, marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>
      {sublabel && <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{sublabel}</div>}
    </div>
  );
}

function SeriesInput({ exercise, onAdd, seriesLog }) {
  const [val, setVal] = useState("");
  const handleAdd = (v) => {
    const n = Number(v ?? val);
    if (!n || n <= 0) return;
    onAdd(exercise.id, n);
    setVal("");
  };
  const count = seriesLog.length;
  const total = exercise.isStrength ? count : seriesLog.reduce((a, b) => a + b, 0);
  const pct = Math.min(100, Math.round((total / exercise.target) * 100));

  return (
    <div style={{
      background: pct >= 100 ? `${exercise.color}11` : "rgba(255,255,255,0.04)",
      border: `1px solid ${pct >= 100 ? exercise.color + "44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16, padding: "16px 18px", marginBottom: 10, transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{exercise.emoji}</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{exercise.label}</span>
          {pct >= 100 && <span style={{ fontSize: 14 }}>✅</span>}
        </div>
        <div>
          {exercise.isStrength
            ? <span style={{ color: exercise.color, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{count}<span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>/{exercise.target} séries</span></span>
            : <><span style={{ color: exercise.color, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{total}</span><span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>/{exercise.target} {exercise.unit}</span></>
          }
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 5, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? `linear-gradient(90deg,${exercise.color},#fff)` : `linear-gradient(90deg,${exercise.color}88,${exercise.color})`, borderRadius: 8, transition: "width 0.5s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      {seriesLog.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {seriesLog.map((s, i) => (
            <span key={i} style={{ background: `${exercise.color}22`, border: `1px solid ${exercise.color}55`, color: exercise.color, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
              {exercise.isStrength ? `S${i + 1}: ${s}kg` : `+${s}`}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {exercise.quickAdd && (
          <button onClick={() => handleAdd(exercise.quickAdd)} style={{
            background: `${exercise.color}33`, border: `1px solid ${exercise.color}66`,
            borderRadius: 10, padding: "8px 14px", color: exercise.color,
            fontWeight: 800, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
          }}>+{exercise.quickAdd}</button>
        )}
        <input type="number" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder={exercise.isStrength ? "kg" : "autre…"}
          style={{ flex: 1, minWidth: 60, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 14, fontFamily: "'Syne', sans-serif", outline: "none" }} />
        <button onClick={() => handleAdd()} style={{ background: exercise.color, border: "none", borderRadius: 10, padding: "8px 14px", color: "#000", fontWeight: 800, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer" }}>+</button>
      </div>
    </div>
  );
}

function TimeInput({ exercise, onAdd, seriesLog }) {
  const [val, setVal] = useState("");
  const handleAdd = (sec) => {
    const n = sec ?? Number(val);
    if (!n || n <= 0) return;
    onAdd(exercise.id, n);
    setVal("");
  };
  const totalSec = seriesLog.reduce((a, b) => a + b, 0);
  const pct = Math.min(100, Math.round((totalSec / exercise.targetSec) * 100));

  return (
    <div style={{
      background: pct >= 100 ? `${exercise.color}11` : "rgba(255,255,255,0.04)",
      border: `1px solid ${pct >= 100 ? exercise.color + "44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16, padding: "16px 18px", marginBottom: 10, transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{exercise.emoji}</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{exercise.label}</span>
          {pct >= 100 && <span style={{ fontSize: 14 }}>✅</span>}
        </div>
        <div>
          <span style={{ color: exercise.color, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{fmtSec(totalSec)}</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>/{fmtSec(exercise.targetSec)}</span>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 5, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? `linear-gradient(90deg,${exercise.color},#fff)` : `linear-gradient(90deg,${exercise.color}88,${exercise.color})`, borderRadius: 8, transition: "width 0.5s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      {seriesLog.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {seriesLog.map((s, i) => (
            <span key={i} style={{ background: `${exercise.color}22`, border: `1px solid ${exercise.color}55`, color: exercise.color, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>+{fmtSec(s)}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => handleAdd(exercise.quickAddSec)} style={{
          background: `${exercise.color}33`, border: `1px solid ${exercise.color}66`,
          borderRadius: 10, padding: "8px 14px", color: exercise.color,
          fontWeight: 800, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
        }}>+{fmtSec(exercise.quickAddSec)}</button>
        <input type="number" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="sec…"
          style={{ flex: 1, minWidth: 60, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 14, fontFamily: "'Syne', sans-serif", outline: "none" }} />
        <button onClick={() => handleAdd()} style={{ background: exercise.color, border: "none", borderRadius: 10, padding: "8px 14px", color: "#000", fontWeight: 800, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer" }}>+</button>
      </div>
    </div>
  );
}

function CardioCard({ checked, onChange }) {
  return (
    <div style={{
      background: checked.length > 0 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${checked.length > 0 ? "#f59e0b44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16, padding: "16px 18px", marginBottom: 10, transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>🏃</span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>Cardio</span>
        {checked.length > 0 && <span style={{ fontSize: 14 }}>✅</span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CARDIO_OPTIONS.map(opt => {
          const active = checked.includes(opt.id);
          return (
            <button key={opt.id} onClick={() => onChange(active ? checked.filter(c => c !== opt.id) : [...checked, opt.id])} style={{
              background: active ? "#f59e0b22" : "rgba(255,255,255,0.05)",
              border: `1px solid ${active ? "#f59e0b88" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 12, padding: "10px 14px",
              color: active ? "#f59e0b" : "rgba(255,255,255,0.5)",
              fontWeight: active ? 800 : 400, fontSize: 13,
              fontFamily: "'Syne', sans-serif", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
            }}>
              <span>{opt.emoji}</span><span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RestDayCard({ isRest, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: "100%", marginBottom: 14, padding: "14px 18px",
      background: isRest ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${isRest ? "#6366f1aa" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s",
    }}>
      <span style={{ fontSize: 22 }}>{isRest ? "😴" : "🔲"}</span>
      <div style={{ textAlign: "left", flex: 1 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: isRest ? "#a5b4fc" : "rgba(255,255,255,0.5)" }}>Jour de repos</div>
        {isRest && <div style={{ fontSize: 11, color: "rgba(165,180,252,0.6)", marginTop: 2 }}>Récupération — c'est là que les muscles se construisent 💪</div>}
      </div>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: isRest ? "#6366f1" : "rgba(255,255,255,0.08)", border: `1px solid ${isRest ? "#6366f1" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all 0.2s" }}>{isRest ? "✓" : ""}</div>
    </button>
  );
}

function HistoryDay({ dateKey, data }) {
  const [open, setOpen] = useState(false);
  const isRest = data._rest === true;
  const cardio = data._cardio || [];

  return (
    <div style={{
      background: isRest ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${isRest ? "#6366f133" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14, marginBottom: 10, overflow: "hidden",
    }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: isRest ? "#a5b4fc" : "#fff", fontSize: 14, textTransform: "capitalize" }}>
          {isRest ? "😴 " : ""}{formatDate(dateKey)}
        </span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {!isRest && <>
            {EXERCISES_A.filter(e => (data[e.id] || []).length > 0).map(e => <span key={e.id} style={{ fontSize: 13 }}>{e.emoji}</span>)}
            {EXERCISES_B.filter(e => (data[e.id] || []).length > 0).map(e => <span key={e.id} style={{ fontSize: 13 }}>{e.emoji}</span>)}
            {cardio.map(c => { const o = CARDIO_OPTIONS.find(x => x.id === c); return o ? <span key={c} style={{ fontSize: 13 }}>{o.emoji}</span> : null; })}
          </>}
          {isRest && <span style={{ fontSize: 12, color: "#a5b4fc" }}>Repos</span>}
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && !isRest && (
        <div style={{ padding: "0 18px 14px" }}>
          {EXERCISES_A.map(e => {
            const log = data[e.id] || [];
            if (!log.length) return null;
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{e.emoji} {e.label}</span>
                <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>{log.reduce((a, b) => a + b, 0)} {e.unit}</span>
              </div>
            );
          })}
          {EXERCISES_B.map(e => {
            const log = data[e.id] || [];
            if (!log.length) return null;
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{e.emoji} {e.label}</span>
                <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>{fmtSec(log.reduce((a, b) => a + b, 0))}</span>
              </div>
            );
          })}
          {cardio.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>🏃 Cardio</span>
              <div style={{ display: "flex", gap: 5 }}>
                {cardio.map(c => { const o = CARDIO_OPTIONS.find(x => x.id === c); return o ? <span key={c} style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>{o.emoji}</span> : null; })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhotoTab({ onConfirm }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [editing, setEditing] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!API_KEY) { setStatus("nokey"); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setPreview(ev.target.result);
      setStatus("loading");
      try {
        const aList = EXERCISES_A.map(e => `- ${e.id} (${e.label})`).join("\n");
        const bList = EXERCISES_B.map(e => `- ${e.id} (${e.label}, en secondes)`).join("\n");
        const prompt = `Tu es un assistant sportif. Analyse ce tableau d'entraînement et retourne UNIQUEMENT un JSON valide sans backticks.
Colonne A (répétitions) :
${aList}
Colonne B (durées en secondes) :
${bList}
Cardio : running, velo, piscine, tennis

Format : {"squats":[20,20],"abdos":[50],"tractions":[5,5],"pompes":[10],"devcouche":[40,50],"chaise":[60,60],"planche":[60],"superman":[60],"pompebasse":[15,15],"tractionhaute":[15],"_cardio":["tennis"],"_rest":false}

Données manquantes = []. Durées colonne B en secondes.`;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
              { type: "text", text: prompt }
            ]}]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "API error");
        const text = data.content?.find(b => b.type === "text")?.text || "";
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        const v = { _cardio: parsed._cardio || [], _rest: !!parsed._rest };
        for (const e of EXERCISES_A) v[e.id] = (parsed[e.id] || []).filter(n => typeof n === "number" && n > 0);
        for (const e of EXERCISES_B) v[e.id] = (parsed[e.id] || []).filter(n => typeof n === "number" && n > 0);
        setEditing(JSON.parse(JSON.stringify(v)));
        setStatus("confirm");
      } catch { setStatus("error"); }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => { setStatus("idle"); setPreview(null); setEditing(null); };

  return (
    <div style={{ padding: "8px 0" }}>
      {status === "idle" && (
        <>
          <div style={{ border: "2px dashed rgba(255,255,255,0.12)", borderRadius: 20, padding: "48px 24px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.02)" }} onClick={() => fileRef.current.click()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Envoie ta photo</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6 }}>Photo de ton tableau blanc, feuille ou écran<br />Claude extrait les données automatiquement</div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={e => { e.stopPropagation(); fileRef.current.removeAttribute("capture"); fileRef.current.click(); }} style={{ background: "linear-gradient(90deg,#f97316,#ec4899)", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer" }}>🖼️ Galerie</button>
              <button onClick={e => { e.stopPropagation(); fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 20px", fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer" }}>📷 Caméra</button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        </>
      )}
      {status === "nokey" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔑</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Clé API manquante</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Crée un fichier <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>.env</code> à la racine du projet<br />
            avec <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>VITE_ANTHROPIC_API_KEY=sk-ant-…</code>
          </div>
          <button onClick={handleReset} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Syne', sans-serif", cursor: "pointer" }}>Retour</button>
        </div>
      )}
      {status === "loading" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          {preview && <img src={preview} alt="" style={{ width: "100%", borderRadius: 16, marginBottom: 24, opacity: 0.5, maxHeight: 200, objectFit: "cover" }} />}
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Analyse en cours…</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Claude lit ton tableau</div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 6 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
        </div>
      )}
      {status === "error" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Impossible de lire la photo</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 24 }}>Essaie avec une photo plus nette</div>
          <button onClick={handleReset} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Syne', sans-serif", cursor: "pointer" }}>Réessayer</button>
        </div>
      )}
      {status === "confirm" && editing && (
        <div>
          {preview && <img src={preview} alt="" style={{ width: "100%", borderRadius: 16, marginBottom: 16, maxHeight: 160, objectFit: "cover" }} />}
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <span>✅</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Données extraites — vérifie et corrige si besoin</span>
          </div>
          <RestDayCard isRest={editing._rest} onToggle={() => setEditing(p => ({ ...p, _rest: !p._rest }))} />
          {!editing._rest && (
            <>
              <SectionHeader label="Colonne A — Répétitions" />
              {EXERCISES_A.map(e => (
                <div key={e.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.emoji} {e.label}</span>
                    <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>{(editing[e.id] || []).filter(n => n > 0).reduce((a, b) => a + b, 0)} {e.unit}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(editing[e.id] || []).map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 3 }}>
                        <input type="number" value={s} onChange={ev => { const c = { ...editing, [e.id]: [...editing[e.id]] }; c[e.id][i] = Number(ev.target.value) || 0; setEditing(c); }} style={{ width: 44, background: `${e.color}22`, border: `1px solid ${e.color}55`, borderRadius: 6, padding: "3px 5px", color: e.color, fontWeight: 700, fontSize: 12, fontFamily: "'Syne',sans-serif", outline: "none", textAlign: "center" }} />
                        <button onClick={() => { const c = { ...editing, [e.id]: editing[e.id].filter((_, j) => j !== i) }; setEditing(c); }} style={{ background: "rgba(255,60,60,0.15)", border: "none", borderRadius: 5, color: "#ff6060", fontSize: 10, padding: "2px 4px", cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => setEditing(p => ({ ...p, [e.id]: [...(p[e.id] || []), 0] }))} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 12, padding: "3px 8px", cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>+</button>
                  </div>
                </div>
              ))}
              <SectionHeader label="Colonne B — Isométrie" sublabel="Valeurs en secondes" />
              {EXERCISES_B.map(e => (
                <div key={e.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.emoji} {e.label}</span>
                    <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>{fmtSec((editing[e.id] || []).filter(n => n > 0).reduce((a, b) => a + b, 0))}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(editing[e.id] || []).map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 3 }}>
                        <input type="number" value={s} onChange={ev => { const c = { ...editing, [e.id]: [...editing[e.id]] }; c[e.id][i] = Number(ev.target.value) || 0; setEditing(c); }} style={{ width: 44, background: `${e.color}22`, border: `1px solid ${e.color}55`, borderRadius: 6, padding: "3px 5px", color: e.color, fontWeight: 700, fontSize: 12, fontFamily: "'Syne',sans-serif", outline: "none", textAlign: "center" }} />
                        <button onClick={() => { const c = { ...editing, [e.id]: editing[e.id].filter((_, j) => j !== i) }; setEditing(c); }} style={{ background: "rgba(255,60,60,0.15)", border: "none", borderRadius: 5, color: "#ff6060", fontSize: 10, padding: "2px 4px", cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => setEditing(p => ({ ...p, [e.id]: [...(p[e.id] || []), 0] }))} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 12, padding: "3px 8px", cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>+</button>
                  </div>
                </div>
              ))}
              <SectionHeader label="Cardio" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {CARDIO_OPTIONS.map(opt => {
                  const active = (editing._cardio || []).includes(opt.id);
                  return <button key={opt.id} onClick={() => setEditing(p => ({ ...p, _cardio: active ? p._cardio.filter(x => x !== opt.id) : [...(p._cardio || []), opt.id] }))} style={{ background: active ? "#f59e0b22" : "rgba(255,255,255,0.05)", border: `1px solid ${active ? "#f59e0b88" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "8px 12px", color: active ? "#f59e0b" : "rgba(255,255,255,0.4)", fontWeight: active ? 800 : 400, fontSize: 12, fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>{opt.emoji} {opt.label}</button>;
                })}
              </div>
            </>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={handleReset} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>Annuler</button>
            <button onClick={() => { onConfirm(editing); handleReset(); }} style={{ flex: 2, background: "linear-gradient(90deg,#f97316,#ec4899)", border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>✓ Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("today");
  const [allData, setAllData] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAllData(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const save = useCallback((nd) => {
    setAllData(nd);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nd)); } catch {}
  }, []);

  const today = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const selectedData = allData[selectedDate] || {};
  const isRestDay = selectedData._rest === true;
  const todayCardio = selectedData._cardio || [];

  const addSeries = (exId, val) => {
    if (isRestDay) return;
    save({ ...allData, [selectedDate]: { ...selectedData, [exId]: [...(selectedData[exId] || []), val] } });
  };
  const setCardio = (list) => save({ ...allData, [selectedDate]: { ...selectedData, _cardio: list } });
  const toggleRest = () => save({ ...allData, [selectedDate]: { ...selectedData, _rest: !isRestDay } });

  const confirmPhotoData = (extracted) => {
    if (extracted._rest) {
      save({ ...allData, [selectedDate]: { ...selectedData, _rest: true } });
    } else {
      const merged = { ...selectedData, _rest: false };
      for (const e of [...EXERCISES_A, ...EXERCISES_B]) {
        const inc = (extracted[e.id] || []).filter(n => n > 0);
        if (inc.length > 0) merged[e.id] = [...(merged[e.id] || []), ...inc];
      }
      if (extracted._cardio?.length) merged._cardio = [...new Set([...(merged._cardio || []), ...extracted._cardio])];
      save({ ...allData, [selectedDate]: merged });
    }
    setView("today");
  };

  const resetToday = () => {
    if (!confirm(`Remettre à zéro la séance du ${formatDate(selectedDate)} ?`)) return;
    const u = { ...allData }; delete u[selectedDate]; save(u);
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };
  const goToNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split("T")[0];
    if (next <= today) setSelectedDate(next);
  };

  const historyDays = Object.keys(allData).filter(k => k !== today).sort((a, b) => b.localeCompare(a));
  const allDays = Object.keys(allData).sort((a, b) => b.localeCompare(a)).slice(0, 14);

  const TABS = [
    { id: "today",   label: "Séance",     icon: "🏃" },
    { id: "photo",   label: "Photo",      icon: "📷" },
    { id: "history", label: "Historique", icon: "📅" },
    { id: "stats",   label: "Stats",      icon: "📊" },
  ];
  const viewTitle = { today: formatDate(selectedDate), photo: "Import photo", history: "Historique", stats: "Statistiques" }[view];

  if (!loaded) return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#fff" }}>Chargement…</span>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", fontFamily: "'Syne',sans-serif", color: "#fff", maxWidth: 480, margin: "0 auto", padding: "0 0 110px" }}>

      {/* Header */}
      <div style={{ padding: "32px 20px 20px", background: "linear-gradient(180deg,#111118 0%,transparent 100%)", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Suivi sportif</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: isRestDay && view === "today" ? "#a5b4fc" : "#fff", textTransform: "capitalize" }}>
              {isRestDay && view === "today" ? "😴 Jour de repos" : viewTitle}
            </div>
          </div>
          {view === "today" && <button onClick={resetToday} style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.2)", borderRadius: 10, color: "#ff6060", fontSize: 11, padding: "6px 12px", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>Reset</button>}
        </div>
        {view === "today" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <button onClick={goToPrevDay} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, color: "#fff", fontSize: 16, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: isToday ? "#fff" : "rgba(255,165,0,0.9)", fontWeight: 700 }}>
              {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
            </div>
            <button onClick={goToNextDay} style={{ background: isToday ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, color: isToday ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 16, width: 32, height: 32, cursor: isToday ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          </div>
        )}
        {view === "today" && !isRestDay && (
          <div style={{ marginTop: 10, display: "flex", gap: 4 }}>
            {[...EXERCISES_A, ...EXERCISES_B].map(e => {
              const log = selectedData[e.id] || [];
              const total = log.reduce((a, b) => a + b, 0);
              const target = e.target ?? e.targetSec;
              const pct = Math.min(100, (total / target) * 100);
              return (
                <div key={e.id} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: e.color, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{e.emoji}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "8px 16px" }}>
        {view === "today" && (
          <>
            <RestDayCard isRest={isRestDay} onToggle={toggleRest} />
            {!isRestDay && (
              <>
                <SectionHeader label="Colonne A — Répétitions" />
                {EXERCISES_A.map(e => <SeriesInput key={e.id} exercise={e} onAdd={addSeries} seriesLog={selectedData[e.id] || []} />)}
                <SectionHeader label="Colonne B — Isométrie" sublabel="Objectif en temps cumulé" />
                {EXERCISES_B.map(e => <TimeInput key={e.id} exercise={e} onAdd={addSeries} seriesLog={selectedData[e.id] || []} />)}
                <SectionHeader label="Cardio" />
                <CardioCard checked={todayCardio} onChange={setCardio} />
              </>
            )}
          </>
        )}

        {view === "photo" && <PhotoTab onConfirm={confirmPhotoData} />}

        {view === "history" && (
          historyDays.length === 0
            ? <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 60, fontSize: 15 }}>Aucun historique encore.<br />Commence ta première séance ! 💪</div>
            : historyDays.map(d => <HistoryDay key={d} dateKey={d} data={allData[d]} />)
        )}

        {view === "stats" && (
          <div>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: "16px", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>🏃 Cardio — 14 derniers jours</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {CARDIO_OPTIONS.map(opt => {
                  const count = allDays.filter(d => ((allData[d] || {})._cardio || []).includes(opt.id)).length;
                  return <div key={opt.id} style={{ textAlign: "center" }}><div style={{ fontSize: 22 }}>{opt.emoji}</div><div style={{ fontWeight: 800, color: "#f59e0b", fontSize: 18 }}>{count}x</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{opt.label}</div></div>;
                })}
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 22 }}>😴</div><div style={{ fontWeight: 800, color: "#a5b4fc", fontSize: 18 }}>{allDays.filter(d => (allData[d] || {})._rest).length}x</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Repos</div></div>
              </div>
            </div>

            <SectionHeader label="Colonne A" />
            {EXERCISES_A.map(e => {
              const points = allDays.map(d => ((allData[d] || {})[e.id] || []).reduce((a, b) => a + b, 0)).reverse();
              const labels = allDays.map(d => d.slice(5)).reverse();
              const max = Math.max(...points, e.target);
              return (
                <div key={e.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{e.emoji} {e.label}</span>
                    <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>obj. {e.target}</span>
                  </div>
                  {points.every(p => p === 0) ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Pas encore de données</div> : (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56 }}>
                      {points.map((p, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{p > 0 ? p : ""}</div>
                          <div style={{ width: "100%", minHeight: 2, height: max > 0 ? `${(p / max) * 40}px` : "2px", background: p >= e.target ? `linear-gradient(180deg,#fff,${e.color})` : `${e.color}88`, borderRadius: "3px 3px 0 0", transition: "height 0.4s" }} />
                          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", transform: "rotate(-45deg)", transformOrigin: "top left", whiteSpace: "nowrap" }}>{labels[i]}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <SectionHeader label="Colonne B" />
            {EXERCISES_B.map(e => {
              const points = allDays.map(d => ((allData[d] || {})[e.id] || []).reduce((a, b) => a + b, 0)).reverse();
              const labels = allDays.map(d => d.slice(5)).reverse();
              const max = Math.max(...points, e.targetSec);
              return (
                <div key={e.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{e.emoji} {e.label}</span>
                    <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>obj. {fmtSec(e.targetSec)}</span>
                  </div>
                  {points.every(p => p === 0) ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Pas encore de données</div> : (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56 }}>
                      {points.map((p, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{p > 0 ? fmtSec(p) : ""}</div>
                          <div style={{ width: "100%", minHeight: 2, height: max > 0 ? `${(p / max) * 40}px` : "2px", background: p >= e.targetSec ? `linear-gradient(180deg,#fff,${e.color})` : `${e.color}88`, borderRadius: "3px 3px 0 0", transition: "height 0.4s" }} />
                          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", transform: "rotate(-45deg)", transformOrigin: "top left", whiteSpace: "nowrap" }}>{labels[i]}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "12px 0 20px" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", opacity: view === tab.id ? 1 : 0.4, position: "relative" }}>
            {tab.id === "photo" && (
              <div style={{ position: "absolute", top: -18, width: 44, height: 44, borderRadius: "50%", background: view === "photo" ? "linear-gradient(135deg,#f97316,#ec4899)" : "linear-gradient(135deg,#333,#555)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: view === "photo" ? "0 0 20px #f9731666" : "none", transition: "all 0.3s" }}>📷</div>
            )}
            <span style={{ fontSize: tab.id === "photo" ? 0 : 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, color: view === tab.id ? (tab.id === "photo" ? "#f97316" : "#fff") : "rgba(255,255,255,0.5)", fontFamily: "'Syne',sans-serif", fontWeight: view === tab.id ? 700 : 400, letterSpacing: 0.5, marginTop: tab.id === "photo" ? 22 : 0 }}>{tab.label}</span>
            {view === tab.id && <div style={{ width: 20, height: 2, background: tab.id === "photo" ? "#f97316" : "#fff", borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
