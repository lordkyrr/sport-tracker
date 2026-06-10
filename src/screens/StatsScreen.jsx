import { useMemo } from "react";
import { fmtSec, getTodayKey } from "../lib/utils";
import { SectionLabel } from "../components/SectionLabel";

export function StatsScreen({ sessions, program }) {
  const today = getTodayKey();

  const { last14, streak, sessionsThisWeek } = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split("T")[0];
    });

    const sortedKeys = Object.keys(sessions).sort((a, b) => b.localeCompare(a));
    let s = 0;
    let prevKey = today;
    for (const key of sortedKeys) {
      if (key > today) continue;
      const expected = new Date(prevKey + "T12:00:00");
      expected.setDate(expected.getDate() - 1);
      if (key !== expected.toISOString().split("T")[0]) break;
      const sess = sessions[key];
      if (sess.type === "dynamique" || sess.type === "statique") {
        s++;
        prevKey = key;
      } else { break; }
    }

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const dow = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
    const weekStartKey = weekStart.toISOString().split("T")[0];
    const weekCount = Object.keys(sessions).filter(d =>
      d >= weekStartKey && d <= today &&
      (sessions[d].type === "dynamique" || sessions[d].type === "statique")
    ).length;

    return { last14: days, streak: s, sessionsThisWeek: weekCount };
  }, [sessions, today]);

  return (
    <div style={{ padding: "32px 16px 0" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Statistiques</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label="Streak" value={`${streak}j`} color="#f97316" />
        <StatCard label="Cette semaine" value={`${sessionsThisWeek}x`} color="#8b5cf6" />
      </div>

      <SectionLabel text="Cardio — 14 jours" />
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {program.C.map(opt => {
            const count = last14.filter(d => ((sessions[d] || {}).cardio || []).includes(opt.id)).length;
            return (
              <div key={opt.id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>{opt.emoji}</div>
                <div style={{ fontWeight: 800, color: "#f59e0b", fontSize: 20 }}>{count}x</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{opt.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <SectionLabel text="Dynamique — Section A" />
      {program.A.map(e => {
        const points = last14.map(d => {
          const s = sessions[d];
          if (!s || s.type !== "dynamique") return 0;
          return ((s.exercises || {})[e.id] || []).reduce((a, b) => a + b, 0);
        });
        return (
          <BarChart key={e.id} label={e.label} color={e.color}
            points={points} dates={last14} targetLine={e.target}
            formatValue={v => String(v)} />
        );
      })}

      <SectionLabel text="Statique — Section B" />
      {program.B.map(e => {
        const points = last14.map(d => {
          const s = sessions[d];
          if (!s || s.type !== "statique") return 0;
          return ((s.exercises || {})[e.id] || []).reduce((a, b) => a + b, 0);
        });
        return (
          <BarChart key={e.id} label={e.label} color={e.color}
            points={points} dates={last14} targetLine={e.targetSec}
            formatValue={fmtSec} />
        );
      })}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 14, padding: 14, textAlign: "center" }}>
      <div style={{ color, fontWeight: 800, fontSize: 24, fontFamily: "'Syne', sans-serif" }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function BarChart({ label, color, points, dates, targetLine, formatValue }) {
  const max = Math.max(...points, targetLine, 1);
  const hasData = points.some(p => p > 0);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{label}</span>
        <span style={{ color, fontSize: 12, fontWeight: 700 }}>obj. {formatValue(targetLine)}</span>
      </div>
      {!hasData ? (
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Pas encore de données</div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56 }}>
          {points.map((p, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", minHeight: 10, textAlign: "center" }}>
                {p > 0 ? formatValue(p) : ""}
              </div>
              <div style={{
                width: "100%",
                minHeight: 2,
                height: `${(p / max) * 40}px`,
                background: p >= targetLine ? `linear-gradient(180deg, #fff, ${color})` : `${color}88`,
                boxShadow: p >= targetLine ? `0 0 6px ${color}66` : "none",
                borderRadius: "3px 3px 0 0",
                transition: "height 0.4s",
              }} />
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", transform: "rotate(-45deg)", transformOrigin: "top left", whiteSpace: "nowrap" }}>
                {dates[i].slice(5)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
