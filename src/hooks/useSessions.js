import { useStorage } from "./useStorage";

export function useSessions() {
  const [sessions, setSessions] = useStorage("sessions", {});

  const saveSession = (date, data) => {
    setSessions(prev => ({ ...prev, [date]: data }));
  };

  const deleteSession = (date) => {
    setSessions(prev => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  };

  return { sessions, saveSession, deleteSession };
}
