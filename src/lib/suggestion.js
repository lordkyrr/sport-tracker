export function suggestDay(sessions) {
  const todayDate = new Date();
  todayDate.setHours(12, 0, 0, 0);
  const today = todayDate.toISOString().split("T")[0];

  const ydDate = new Date(todayDate); ydDate.setDate(ydDate.getDate() - 1);
  const dbDate = new Date(todayDate); dbDate.setDate(dbDate.getDate() - 2);
  const yesterdayKey = ydDate.toISOString().split("T")[0];
  const dayBeforeKey = dbDate.toISOString().split("T")[0];

  const isActive = (s) => s != null && s.type !== "repos";

  if (isActive(sessions[yesterdayKey]) && isActive(sessions[dayBeforeKey])) {
    return { type: "repos", reason: "2 jours actifs consécutifs" };
  }

  const past = Object.entries(sessions)
    .filter(([d]) => d < today)
    .sort(([a], [b]) => b.localeCompare(a));

  const lastStrength = past.find(([, s]) => s.type === "dynamique" || s.type === "statique");

  if (!lastStrength) {
    return { type: "dynamique", reason: "première séance" };
  }
  if (lastStrength[1].type === "dynamique") {
    return { type: "statique", reason: "alternance après Dynamique" };
  }
  return { type: "dynamique", reason: "alternance après Statique" };
}
