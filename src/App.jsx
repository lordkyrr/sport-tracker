import { useState } from "react";
import { useProgram } from "./hooks/useProgram";
import { useSessions } from "./hooks/useSessions";
import { TodayScreen } from "./screens/TodayScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { ConfigScreen } from "./screens/ConfigScreen";

const TABS = [
  { id: "today",   label: "Séance",     icon: "🏃" },
  { id: "history", label: "Historique", icon: "📅" },
  { id: "stats",   label: "Stats",      icon: "📊" },
];

export default function App() {
  const [view, setView] = useState("today");
  const { program, setProgram } = useProgram();
  const { sessions, saveSession, deleteSession } = useSessions();

  return (
    <div style={{
      background: "#0a0a0f",
      minHeight: "100vh",
      fontFamily: "'Syne', sans-serif",
      color: "#fff",
      maxWidth: 480,
      margin: "0 auto",
      padding: "0 0 80px",
    }}>
      {view === "today" && (
        <TodayScreen
          sessions={sessions}
          saveSession={saveSession}
          deleteSession={deleteSession}
          program={program}
          onOpenConfig={() => setView("config")}
        />
      )}
      {view === "history" && (
        <HistoryScreen sessions={sessions} program={program} />
      )}
      {view === "stats" && (
        <StatsScreen sessions={sessions} program={program} />
      )}
      {view === "config" && (
        <ConfigScreen
          program={program}
          setProgram={setProgram}
          onBack={() => setView("today")}
        />
      )}

      {view !== "config" && (
        <nav style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "rgba(10,10,15,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          padding: "10px 0 20px",
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "4px 0",
                opacity: view === tab.id ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span style={{
                fontSize: 10,
                color: view === tab.id ? "#fff" : "rgba(255,255,255,0.5)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: view === tab.id ? 700 : 400,
                letterSpacing: 0.5,
              }}>{tab.label}</span>
              {view === tab.id && (
                <div style={{ width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
