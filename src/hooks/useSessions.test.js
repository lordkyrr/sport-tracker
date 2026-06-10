import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessions } from "./useSessions";

beforeEach(() => {
  localStorage.clear();
});

describe("useSessions", () => {
  it("starts with empty sessions", () => {
    const { result } = renderHook(() => useSessions());
    expect(result.current.sessions).toEqual({});
  });

  it("saves a session by date", () => {
    const { result } = renderHook(() => useSessions());
    act(() => {
      result.current.saveSession("2026-06-10", { type: "dynamique", exercises: {}, cardio: [] });
    });
    expect(result.current.sessions["2026-06-10"]).toEqual({ type: "dynamique", exercises: {}, cardio: [] });
  });

  it("overwrites an existing session", () => {
    const { result } = renderHook(() => useSessions());
    act(() => {
      result.current.saveSession("2026-06-10", { type: "repos" });
    });
    act(() => {
      result.current.saveSession("2026-06-10", { type: "match" });
    });
    expect(result.current.sessions["2026-06-10"].type).toBe("match");
  });

  it("deletes a session", () => {
    const { result } = renderHook(() => useSessions());
    act(() => {
      result.current.saveSession("2026-06-10", { type: "repos" });
    });
    act(() => {
      result.current.deleteSession("2026-06-10");
    });
    expect(result.current.sessions["2026-06-10"]).toBeUndefined();
  });

  it("persists sessions to localStorage under sessions key", () => {
    const { result } = renderHook(() => useSessions());
    act(() => {
      result.current.saveSession("2026-06-10", { type: "statique" });
    });
    const stored = JSON.parse(localStorage.getItem("sessions"));
    expect(stored["2026-06-10"].type).toBe("statique");
  });
});
