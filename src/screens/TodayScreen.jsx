import { useState } from "react";
import { getTodayKey, formatDate } from "../lib/utils";
import { suggestDay } from "../lib/suggestion";
import { DayTypePills } from "../components/DayTypePills";
import { RepExercise } from "../components/exercises/RepExercise";
import { TimeExercise } from "../components/exercises/TimeExercise";
import { CardioSelector } from "../components/CardioSelector";

const DAY_TYPE_COLORS = {
  dynamique: "#f97316",
  statique:  "#8b5cf6",
  repos:     "#6366f1",
  match:     "#10b981",
};

export function TodayScreen({ sessions, saveSession, deleteSession, program, onOpenConfig }) {
  const today = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;

  const session = sessions[selectedDate] || {};
  const suggestion = suggestDay(sessions);
  const sessionType = session.type || suggestion.type;
  const exercises = session.exercises || {};
  const cardio = session.cardio || [];

  const setType = (type) => {
    saveSession(selectedDate, { type, exercises: {}, cardio: [] });
  };

  const addRep = (exId, val) => {
    saveSession(selectedDate, {
      ...session,
      type: sessionType,
      exercises: { ...exercises, [exId]: [...(exercises[exId] || []), val] },
      cardio,
    });
  };

  const setCardio = (list) => {
    saveSession(selectedDate, { ...session, type: sessionType, exercises, cardio: list });
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

  const handleReset = () => {
    if (!confirm(`Remettre à zéro la séance du ${formatDate(selectedDate)} ?`)) return;
    deleteSession(selectedDate);
  };

  const showSuggestion = isToday && !session.type;
  const isRestOrMatch = sessionType === "repos" || sessionType === "match";

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "32px 20px 16px",
        background: "linear-gradient(180deg, #111118 0%, transparent 100%)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
              Suivi sportif
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
            {isToday && (
              <button onClick={onOpenConfig} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>
                ⚙️
              </button>
            )}
            {session.type && (
              <button onClick={handleReset} style={{
                background: "rgba(255,60,60,0.1)",
                border: "1px solid rgba(255,60,60,0.2)",
                borderRadius: 10,
                color: "#ff6060",
                fontSize: 11,
                padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
              }}>Reset</button>
            )}
          </div>
        </div>

        {/* Day navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <button onClick={goToPrevDay} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, color: "#fff", fontSize: 18, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: isToday ? "#fff" : "rgba(255,165,0,0.9)", fontWeight: 700 }}>
            {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
          </div>
          <button onClick={goToNextDay} style={{ background: isToday ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, color: isToday ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 18, width: 32, height: 32, cursor: isToday ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>

        {/* Suggestion badge */}
        {showSuggestion && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: `${DAY_TYPE_COLORS[suggestion.type]}15`, border: `1px solid ${DAY_TYPE_COLORS[suggestion.type]}30`, borderRadius: 20, padding: "4px 12px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: DAY_TYPE_COLORS[suggestion.type], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} suggéré · {suggestion.reason}
            </span>
          </div>
        )}

        {/* Day type pills */}
        <div style={{ marginTop: 12 }}>
          <DayTypePills selected={sessionType} onChange={setType} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "8px 16px" }}>
        {isRestOrMatch ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {sessionType === "repos" ? "😴" : "🎾"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>
              {sessionType === "repos" ? "Jour de repos" : "Match de tennis"}
            </div>
            {sessionType === "repos" && (
              <div style={{ fontSize: 13, marginTop: 8, color: "rgba(255,255,255,0.25)" }}>
                Récupération — c'est là que les muscles se construisent
              </div>
            )}
          </div>
        ) : (
          <>
            <SectionLabel text={sessionType === "dynamique" ? "Section A — Répétitions" : "Section B — Isométrie"} />
            {sessionType === "dynamique"
              ? program.A.map(e => (
                  <RepExercise key={e.id} exercise={e} log={exercises[e.id] || []} onAdd={(v) => addRep(e.id, v)} />
                ))
              : program.B.map(e => (
                  <TimeExercise key={e.id} exercise={e} log={exercises[e.id] || []} onAdd={(v) => addRep(e.id, v)} />
                ))
            }
            <SectionLabel text="Cardio" />
            <CardioSelector options={program.C} checked={cardio} onChange={setCardio} />
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ text }) {
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
