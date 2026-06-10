import { describe, it, expect } from "vitest";
import { suggestDay } from "./suggestion";

function daysAgoKey(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

describe("suggestDay", () => {
  it("suggests dynamique with no history", () => {
    expect(suggestDay({})).toEqual({ type: "dynamique", reason: "première séance" });
  });

  it("suggests statique after last session was dynamique", () => {
    const sessions = { [daysAgoKey(1)]: { type: "dynamique" } };
    expect(suggestDay(sessions)).toEqual({ type: "statique", reason: "alternance après Dynamique" });
  });

  it("suggests dynamique after last session was statique", () => {
    const sessions = { [daysAgoKey(1)]: { type: "statique" } };
    expect(suggestDay(sessions)).toEqual({ type: "dynamique", reason: "alternance après Statique" });
  });

  it("suggests repos after 2 consecutive active days", () => {
    const sessions = {
      [daysAgoKey(1)]: { type: "dynamique" },
      [daysAgoKey(2)]: { type: "statique" },
    };
    expect(suggestDay(sessions)).toEqual({ type: "repos", reason: "2 jours actifs consécutifs" });
  });

  it("counts match as active for consecutive check", () => {
    const sessions = {
      [daysAgoKey(1)]: { type: "match" },
      [daysAgoKey(2)]: { type: "dynamique" },
    };
    expect(suggestDay(sessions)).toEqual({ type: "repos", reason: "2 jours actifs consécutifs" });
  });

  it("does not suggest repos after only 1 active day", () => {
    const sessions = { [daysAgoKey(1)]: { type: "dynamique" } };
    expect(suggestDay(sessions).type).not.toBe("repos");
  });

  it("does not count repos as active", () => {
    const sessions = {
      [daysAgoKey(1)]: { type: "repos" },
      [daysAgoKey(2)]: { type: "dynamique" },
    };
    expect(suggestDay(sessions).type).not.toBe("repos");
  });

  it("ignores a gap between days (no consecutive count across a gap)", () => {
    const sessions = { [daysAgoKey(1)]: { type: "dynamique" } };
    expect(suggestDay(sessions).type).not.toBe("repos");
  });

  it("uses last strength session for alternance even after a repos", () => {
    const sessions = {
      [daysAgoKey(1)]: { type: "repos" },
      [daysAgoKey(3)]: { type: "statique" },
    };
    expect(suggestDay(sessions).type).toBe("dynamique");
  });
});
