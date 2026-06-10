import { useStorage } from "./useStorage";

export function useSessions() {
  const [sessions, setSessions] = useStorage("sessions", {});

  const saveSession = (date, data) => {
    setSessions({ ...sessions, [date]: data });
  };

  const deleteSession = (date) => {
    const next = { ...sessions };
    delete next[date];
    setSessions(next);
  };

  return { sessions, saveSession, deleteSession };
}
