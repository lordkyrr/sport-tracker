import { describe, it, expect } from "vitest";
import { getTodayKey, formatDate, fmtSec } from "./utils";

describe("getTodayKey", () => {
  it("returns today as YYYY-MM-DD", () => {
    const result = getTodayKey();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("fmtSec", () => {
  it("formats seconds under 60", () => {
    expect(fmtSec(45)).toBe("45s");
  });
  it("formats exact minutes", () => {
    expect(fmtSec(120)).toBe("2min");
  });
  it("formats exactly 60 seconds as 1min", () => {
    expect(fmtSec(60)).toBe("1min");
  });
  it("formats minutes and seconds", () => {
    expect(fmtSec(75)).toBe("1min15s");
  });
  it("formats 0", () => {
    expect(fmtSec(0)).toBe("0s");
  });
});

describe("formatDate", () => {
  it("returns a localized French date string", () => {
    const result = formatDate("2026-06-10");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result.toLowerCase()).toContain("juin");
  });
});
