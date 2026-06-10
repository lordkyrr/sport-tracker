import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStorage } from "./useStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("useStorage", () => {
  it("returns defaultValue when nothing is stored", () => {
    const { result } = renderHook(() => useStorage("k", { foo: "bar" }));
    expect(result.current[0]).toEqual({ foo: "bar" });
  });

  it("reads existing value from localStorage on mount", () => {
    localStorage.setItem("k", JSON.stringify({ foo: "existing" }));
    const { result } = renderHook(() => useStorage("k", { foo: "default" }));
    expect(result.current[0]).toEqual({ foo: "existing" });
  });

  it("updates state and writes to localStorage on setValue", () => {
    const { result } = renderHook(() => useStorage("k", {}));
    act(() => {
      result.current[1]({ x: 1 });
    });
    expect(result.current[0]).toEqual({ x: 1 });
    expect(JSON.parse(localStorage.getItem("k"))).toEqual({ x: 1 });
  });

  it("returns defaultValue when stored JSON is corrupt", () => {
    localStorage.setItem("k", "not-json{{");
    const { result } = renderHook(() => useStorage("k", 42));
    expect(result.current[0]).toBe(42);
  });
});
