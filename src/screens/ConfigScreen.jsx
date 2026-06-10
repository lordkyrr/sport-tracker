export function ConfigScreen({ program, setProgram, onBack }) {
  return (
    <div style={{ padding: "32px 16px 0", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10,
          color: "#fff", fontSize: 20, width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>‹</button>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Configuration</div>
      </div>

      <ExerciseSection
        title="Section A — Répétitions"
        exercises={program.A}
        isTime={false}
        onChange={(A) => setProgram({ ...program, A })}
      />

      <ExerciseSection
        title="Section B — Isométrie"
        exercises={program.B}
        isTime={true}
        onChange={(B) => setProgram({ ...program, B })}
      />

      <CardioSection
        options={program.C}
        onChange={(C) => setProgram({ ...program, C })}
      />
    </div>
  );
}

function ExerciseSection({ title, exercises, isTime, onChange }) {
  const update = (index, field, value) =>
    onChange(exercises.map((e, i) => i === index ? { ...e, [field]: value } : e));

  const remove = (index) => onChange(exercises.filter((_, i) => i !== index));

  const add = () => onChange([
    ...exercises,
    isTime
      ? { id: `ex-${Date.now()}`, label: "Nouvel exercice", targetSec: 60, quickAddSec: 15, color: "#ffffff" }
      : { id: `ex-${Date.now()}`, label: "Nouvel exercice", target: 20, quickAdd: 5, color: "#ffffff" },
  ]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </div>
      {exercises.map((e, i) => (
        <div key={e.id} style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 8,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}>
          <input
            type="color"
            value={e.color}
            onChange={ev => update(i, "color", ev.target.value)}
            style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer", padding: 0, background: "none", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              type="text"
              value={e.label}
              onChange={ev => update(i, "label", ev.target.value)}
              style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", outline: "none", marginBottom: 4 }}
            />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Obj.</span>
                <input
                  type="number"
                  value={isTime ? e.targetSec : e.target}
                  onChange={ev => update(i, isTime ? "targetSec" : "target", Number(ev.target.value))}
                  style={{ width: 52, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, padding: "2px 6px", fontFamily: "'Syne', sans-serif", outline: "none", textAlign: "center" }}
                />
                {isTime && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>s</span>}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>+</span>
                <input
                  type="number"
                  value={isTime ? e.quickAddSec : e.quickAdd}
                  onChange={ev => update(i, isTime ? "quickAddSec" : "quickAdd", Number(ev.target.value))}
                  style={{ width: 40, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, padding: "2px 6px", fontFamily: "'Syne', sans-serif", outline: "none", textAlign: "center" }}
                />
              </label>
            </div>
          </div>
          <button
            onClick={() => remove(i)}
            style={{ background: "rgba(255,60,60,0.1)", border: "none", borderRadius: 8, color: "#ff6060", fontSize: 16, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >✕</button>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 10, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
        + Ajouter un exercice
      </button>
    </div>
  );
}

function CardioSection({ options, onChange }) {
  const update = (index, field, value) =>
    onChange(options.map((e, i) => i === index ? { ...e, [field]: value } : e));
  const remove = (index) => onChange(options.filter((_, i) => i !== index));
  const add = () => onChange([...options, { id: `cardio-${Date.now()}`, label: "Nouvelle activité", emoji: "🏃" }]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        Section C — Cardio
      </div>
      {options.map((opt, i) => (
        <div key={opt.id} style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "10px 14px",
          marginBottom: 8,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}>
          <input
            type="text"
            value={opt.emoji}
            onChange={ev => update(i, "emoji", ev.target.value)}
            maxLength={2}
            style={{ width: 32, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "#fff", fontSize: 16, padding: 4, textAlign: "center", outline: "none", flexShrink: 0 }}
          />
          <input
            type="text"
            value={opt.label}
            onChange={ev => update(i, "label", ev.target.value)}
            style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", outline: "none" }}
          />
          <button
            onClick={() => remove(i)}
            style={{ background: "rgba(255,60,60,0.1)", border: "none", borderRadius: 8, color: "#ff6060", fontSize: 16, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >✕</button>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 10, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
        + Ajouter une activité
      </button>
    </div>
  );
}
