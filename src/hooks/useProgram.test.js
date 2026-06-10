import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProgram } from "./useProgram";
import { DEFAULT_PROGRAM } from "../lib/defaults";

beforeEach(() => {
  localStorage.clear();
});

describe("useProgram", () => {
  it("returns DEFAULT_PROGRAM when nothing stored", () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.program).toEqual(DEFAULT_PROGRAM);
  });

  it("persists changes to localStorage under program-config", () => {
    const { result } = renderHook(() => useProgram());
    const modified = { ...DEFAULT_PROGRAM, A: [] };
    act(() => {
      result.current.setProgram(modified);
    });
    expect(result.current.program.A).toEqual([]);
    expect(JSON.parse(localStorage.getItem("program-config")).A).toEqual([]);
  });
});
