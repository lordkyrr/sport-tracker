# Sport Tracker v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Sport Tracker from scratch as a configurable mobile-first React PWA with 4 day types (Dynamique/Statique/Repos/Match), smart session suggestions, and a parametrizable exercise program, deployable as an Android APK via Capacitor.

**Architecture:** State lifted into App.jsx (useProgram + useSessions hooks called once at root); custom hooks persist to localStorage; pure-function suggestion engine; 3-tab bottom nav + Config screen via ⚙️ header icon. No state manager.

**Tech Stack:** React 19, Vite 8, Vitest + @testing-library/react, Capacitor 8, vite-plugin-pwa, Google Fonts (Syne), localStorage.

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/utils.js` | Pure helpers: getTodayKey, formatDate, fmtSec |
| `src/lib/defaults.js` | DEFAULT_PROGRAM constant (initial exercise config) |
| `src/lib/suggestion.js` | Pure function: suggestDay(sessions) → { type, reason } |
| `src/hooks/useStorage.js` | Generic localStorage hook: [value, setValue] |
| `src/hooks/useProgram.js` | program-config persistence, wraps useStorage |
| `src/hooks/useSessions.js` | sessions persistence + saveSession/deleteSession |
| `src/components/ProgressBar.jsx` | Progress bar with glow at 100% |
| `src/components/DayTypePills.jsx` | 4-pill day type selector |
| `src/components/CardioSelector.jsx` | Multi-select cardio activities |
| `src/components/exercises/RepExercise.jsx` | Rep-based exercise card (Section A) |
| `src/components/exercises/TimeExercise.jsx` | Time-based exercise card (Section B) |
| `src/screens/TodayScreen.jsx` | Today's session: suggestion + pills + exercises + cardio |
| `src/screens/HistoryScreen.jsx` | Past sessions list (collapsible cards) |
| `src/screens/StatsScreen.jsx` | 14-day bar charts + streak |
| `src/screens/ConfigScreen.jsx` | Edit exercise lists A/B/C |
| `src/App.jsx` | Root: hooks + 3-tab nav + screen routing |
| `src/test/setup.js` | Vitest + @testing-library/jest-dom setup |

---

## Task 1: Project cleanup + directory structure

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `.gitignore`
- Delete: `src/App.css`
- Create dirs: `src/hooks/`, `src/components/exercises/`, `src/screens/`, `src/lib/`, `src/test/`

- [ ] **Step 1: Add .superpowers/ to .gitignore**

Append to `.gitignore`:
```
# Brainstorm visual companion
.superpowers/
```

- [ ] **Step 2: Delete src/App.css and wipe src/App.jsx**

```bash
rm src/App.css
```

Replace `src/App.jsx` entirely:
```jsx
export default function App() {
  return <div style={{ color: "#fff", padding: 20 }}>Sport Tracker v2</div>;
}
```

- [ ] **Step 3: Wipe src/index.css to minimal reset**

Replace `src/index.css` entirely:
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a0f; color: #fff; -webkit-tap-highlight-color: transparent; }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
```

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p src/hooks src/components/exercises src/screens src/lib src/test
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: server on localhost:5173, page shows "Sport Tracker v2" on dark background.

- [ ] **Step 6: Commit**

```bash
git add .gitignore src/App.jsx src/index.css
git rm src/App.css
git commit -m "chore: clean slate for v2 rebuild"
```

---

## Task 2: Install Vitest + configure testing

**Files:**
- Modify: `vite.config.js`
- Modify: `package.json`
- Create: `src/test/setup.js`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Add test config to vite.config.js**

Replace the entire `vite.config.js`:
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    globals: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Suivi Sportif",
        short_name: "Sport",
        description: "Tracker de séances sportives — dark, mobile-first",
        theme_color: "#0a0a0f",
        background_color: "#0a0a0f",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "fr",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, update the `scripts` section:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Create src/test/setup.js**

```js
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Run tests to confirm setup**

```bash
npm test
```

Expected: `No test files found` (or 0 tests run) — confirms setup works without errors.

- [ ] **Step 6: Commit**

```bash
git add vite.config.js package.json package-lock.json src/test/setup.js
git commit -m "chore: add Vitest + @testing-library/react"
```

---

## Task 3: src/lib/utils.js

**Files:**
- Create: `src/lib/utils.js`
- Create: `src/lib/utils.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/utils.test.js`:
```js
import { describe, it, expect } from "vitest";
import { getTodayKey, formatDate, fmtSec } from "./utils";

describe("getTodayKey", () => {
  it("returns today as YYYY-MM-DD", () => {
    const result = getTodayKey();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe(new Date().toISOString().split("T")[0]);
  });
});

describe("fmtSec", () => {
  it("formats seconds under 60", () => {
    expect(fmtSec(45)).toBe("45s");
  });
  it("formats exact minutes", () => {
    expect(fmtSec(120)).toBe("2min");
  });
  it("formats minutes and seconds", () => {
    expect(fmtSec(75)).toBe("1min15s");
  });
  it("formats 0", () => {
    expect(fmtSec(0)).toBe("0s");
  });
});

describe("formatDate", () => {
  it("returns a non-empty string for a valid date", () => {
    const result = formatDate("2026-06-10");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './utils'`

- [ ] **Step 3: Implement src/lib/utils.js**

```js
export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export function fmtSec(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec === 0 ? `${m}min` : `${m}min${sec}s`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/lib/utils.test.js
git commit -m "feat: add utils helpers (getTodayKey, fmtSec, formatDate)"
```

---

## Task 4: src/lib/defaults.js

**Files:**
- Create: `src/lib/defaults.js`

No tests needed — this is a data constant.

- [ ] **Step 1: Create src/lib/defaults.js**

```js
export const DEFAULT_PROGRAM = {
  A: [
    { id: "squats",    label: "Squats",    target: 100, quickAdd: 20, color: "#f97316" },
    { id: "abdos",     label: "Abdos",     target: 200, quickAdd: 50, color: "#ec4899" },
    { id: "tractions", label: "Tractions", target: 40,  quickAdd: 5,  color: "#8b5cf6" },
    { id: "pompes",    label: "Pompes",    target: 50,  quickAdd: 10, color: "#06b6d4" },
  ],
  B: [
    { id: "planche",       label: "Planche",             targetSec: 300, quickAddSec: 60, color: "#f472b6" },
    { id: "chaise",        label: "Chaise",              targetSec: 300, quickAddSec: 60, color: "#e879f9" },
    { id: "superman",      label: "Superman",            targetSec: 300, quickAddSec: 60, color: "#fb923c" },
    { id: "pompebasse",    label: "Pompe pos. basse",    targetSec: 120, quickAddSec: 15, color: "#34d399" },
    { id: "tractionhaute", label: "Traction pos. haute", targetSec: 120, quickAddSec: 15, color: "#60a5fa" },
  ],
  C: [
    { id: "running", label: "Running", emoji: "🏃" },
    { id: "velo",    label: "Vélo",    emoji: "🚴" },
    { id: "piscine", label: "Piscine", emoji: "🏊" },
    { id: "tennis",  label: "Tennis",  emoji: "🎾" },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/defaults.js
git commit -m "feat: add DEFAULT_PROGRAM config"
```

---

## Task 5: src/hooks/useStorage.js

**Files:**
- Create: `src/hooks/useStorage.js`
- Create: `src/hooks/useStorage.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useStorage.test.js`:
```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './useStorage'`

- [ ] **Step 3: Implement src/hooks/useStorage.js**

```js
import { useState } from "react";

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = (newValue) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch {}
  };

  return [value, set];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStorage.js src/hooks/useStorage.test.js
git commit -m "feat: add useStorage hook"
```

---

## Task 6: src/hooks/useProgram.js

**Files:**
- Create: `src/hooks/useProgram.js`
- Create: `src/hooks/useProgram.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useProgram.test.js`:
```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './useProgram'`

- [ ] **Step 3: Implement src/hooks/useProgram.js**

```js
import { useStorage } from "./useStorage";
import { DEFAULT_PROGRAM } from "../lib/defaults";

export function useProgram() {
  const [program, setProgram] = useStorage("program-config", DEFAULT_PROGRAM);
  return { program, setProgram };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useProgram.js src/hooks/useProgram.test.js
git commit -m "feat: add useProgram hook"
```

---

## Task 7: src/hooks/useSessions.js

**Files:**
- Create: `src/hooks/useSessions.js`
- Create: `src/hooks/useSessions.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useSessions.test.js`:
```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './useSessions'`

- [ ] **Step 3: Implement src/hooks/useSessions.js**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSessions.js src/hooks/useSessions.test.js
git commit -m "feat: add useSessions hook"
```

---

## Task 8: src/lib/suggestion.js

**Files:**
- Create: `src/lib/suggestion.js`
- Create: `src/lib/suggestion.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/suggestion.test.js`:
```js
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
    // yesterday active, day before missing (gap) → not 2 consecutive
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './suggestion'`

- [ ] **Step 3: Implement src/lib/suggestion.js**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/suggestion.js src/lib/suggestion.test.js
git commit -m "feat: add suggestion engine with tests"
```

---

## Task 9: src/components/ProgressBar.jsx

**Files:**
- Create: `src/components/ProgressBar.jsx`

- [ ] **Step 1: Create src/components/ProgressBar.jsx**

```jsx
export function ProgressBar({ value, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const complete = pct >= 100;

  return (
    <div style={{
      background: "rgba(255,255,255,0.08)",
      borderRadius: 8,
      height: 5,
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: complete
          ? `linear-gradient(90deg, ${color}, #fff)`
          : `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: complete ? `0 0 8px ${color}66` : "none",
        borderRadius: 8,
        transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}
```

- [ ] **Step 2: Verify dev server still starts**

```bash
npm run dev
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProgressBar.jsx
git commit -m "feat: add ProgressBar component with glow at 100%"
```

---

## Task 10: src/components/DayTypePills.jsx

**Files:**
- Create: `src/components/DayTypePills.jsx`

- [ ] **Step 1: Create src/components/DayTypePills.jsx**

```jsx
const DAY_TYPES = [
  { id: "dynamique", label: "Dynamique", color: "#f97316" },
  { id: "statique",  label: "Statique",  color: "#8b5cf6" },
  { id: "repos",     label: "Repos",     color: "#6366f1" },
  { id: "match",     label: "Match",     color: "#10b981" },
];

export function DayTypePills({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {DAY_TYPES.map(dt => {
        const active = selected === dt.id;
        return (
          <button
            key={dt.id}
            onClick={() => onChange(dt.id)}
            style={{
              background: active ? `${dt.color}20` : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? dt.color + "66" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              padding: "6px 14px",
              color: active ? dt.color : "rgba(255,255,255,0.4)",
              fontWeight: active ? 800 : 400,
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {dt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DayTypePills.jsx
git commit -m "feat: add DayTypePills component"
```

---

## Task 11: src/components/exercises/RepExercise.jsx

**Files:**
- Create: `src/components/exercises/RepExercise.jsx`

- [ ] **Step 1: Create src/components/exercises/RepExercise.jsx**

```jsx
import { useState } from "react";
import { ProgressBar } from "../ProgressBar";

export function RepExercise({ exercise, log, onAdd }) {
  const [val, setVal] = useState("");

  const total = log.reduce((a, b) => a + b, 0);
  const complete = total >= exercise.target;

  const handleAdd = (v) => {
    const n = Number(v !== undefined ? v : val);
    if (!n || n <= 0) return;
    onAdd(n);
    setVal("");
  };

  return (
    <div style={{
      background: complete ? `${exercise.color}11` : "rgba(255,255,255,0.04)",
      border: `1px solid ${complete ? exercise.color + "44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      marginBottom: 10,
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{exercise.label}</span>
          {complete && <span style={{ fontSize: 14 }}>✅</span>}
        </div>
        <div>
          <span style={{ color: exercise.color, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{total}</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>/{exercise.target} reps</span>
        </div>
      </div>

      <ProgressBar value={total} total={exercise.target} color={exercise.color} />

      {log.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10, marginBottom: 10 }}>
          {log.map((s, i) => (
            <span key={i} style={{
              background: `${exercise.color}22`,
              border: `1px solid ${exercise.color}55`,
              color: exercise.color,
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
            }}>+{s}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <button
          onClick={() => handleAdd(exercise.quickAdd)}
          style={{
            background: `${exercise.color}33`,
            border: `1px solid ${exercise.color}66`,
            borderRadius: 10,
            padding: "8px 14px",
            color: exercise.color,
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >+{exercise.quickAdd}</button>
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="autre…"
          style={{
            flex: 1,
            minWidth: 60,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "8px 12px",
            color: "#fff",
            fontSize: 14,
            fontFamily: "'Syne', sans-serif",
            outline: "none",
          }}
        />
        <button
          onClick={() => handleAdd()}
          style={{
            background: exercise.color,
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            color: "#000",
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            cursor: "pointer",
          }}
        >+</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/exercises/RepExercise.jsx
git commit -m "feat: add RepExercise component"
```

---

## Task 12: src/components/exercises/TimeExercise.jsx

**Files:**
- Create: `src/components/exercises/TimeExercise.jsx`

- [ ] **Step 1: Create src/components/exercises/TimeExercise.jsx**

```jsx
import { useState } from "react";
import { fmtSec } from "../../lib/utils";
import { ProgressBar } from "../ProgressBar";

export function TimeExercise({ exercise, log, onAdd }) {
  const [val, setVal] = useState("");

  const totalSec = log.reduce((a, b) => a + b, 0);
  const complete = totalSec >= exercise.targetSec;

  const handleAdd = (sec) => {
    const n = sec !== undefined ? sec : Number(val);
    if (!n || n <= 0) return;
    onAdd(n);
    setVal("");
  };

  return (
    <div style={{
      background: complete ? `${exercise.color}11` : "rgba(255,255,255,0.04)",
      border: `1px solid ${complete ? exercise.color + "44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      marginBottom: 10,
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{exercise.label}</span>
          {complete && <span style={{ fontSize: 14 }}>✅</span>}
        </div>
        <div>
          <span style={{ color: exercise.color, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{fmtSec(totalSec)}</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>/{fmtSec(exercise.targetSec)}</span>
        </div>
      </div>

      <ProgressBar value={totalSec} total={exercise.targetSec} color={exercise.color} />

      {log.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10, marginBottom: 10 }}>
          {log.map((s, i) => (
            <span key={i} style={{
              background: `${exercise.color}22`,
              border: `1px solid ${exercise.color}55`,
              color: exercise.color,
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
            }}>+{fmtSec(s)}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <button
          onClick={() => handleAdd(exercise.quickAddSec)}
          style={{
            background: `${exercise.color}33`,
            border: `1px solid ${exercise.color}66`,
            borderRadius: 10,
            padding: "8px 14px",
            color: exercise.color,
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >+{fmtSec(exercise.quickAddSec)}</button>
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="sec…"
          style={{
            flex: 1,
            minWidth: 60,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "8px 12px",
            color: "#fff",
            fontSize: 14,
            fontFamily: "'Syne', sans-serif",
            outline: "none",
          }}
        />
        <button
          onClick={() => handleAdd()}
          style={{
            background: exercise.color,
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            color: "#000",
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            cursor: "pointer",
          }}
        >+</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/exercises/TimeExercise.jsx
git commit -m "feat: add TimeExercise component"
```

---

## Task 13: src/components/CardioSelector.jsx

**Files:**
- Create: `src/components/CardioSelector.jsx`

- [ ] **Step 1: Create src/components/CardioSelector.jsx**

```jsx
export function CardioSelector({ options, checked, onChange }) {
  return (
    <div style={{
      background: checked.length > 0 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${checked.length > 0 ? "#f59e0b44" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      marginBottom: 10,
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Cardio</span>
        {checked.length > 0 && <span style={{ fontSize: 14 }}>✅</span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(opt => {
          const active = checked.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onChange(
                active ? checked.filter(c => c !== opt.id) : [...checked, opt.id]
              )}
              style={{
                background: active ? "#f59e0b22" : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? "#f59e0b88" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                padding: "10px 14px",
                color: active ? "#f59e0b" : "rgba(255,255,255,0.5)",
                fontWeight: active ? 800 : 400,
                fontSize: 13,
                fontFamily: "'Syne', sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s",
              }}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CardioSelector.jsx
git commit -m "feat: add CardioSelector component"
```

---

## Task 14: src/App.jsx — shell + navigation

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace src/App.jsx with shell + bottom nav**

```jsx
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
```

- [ ] **Step 2: Create placeholder screens so the app compiles**

Create `src/screens/TodayScreen.jsx`:
```jsx
export function TodayScreen() { return <div style={{ padding: 20 }}>Today</div>; }
```

Create `src/screens/HistoryScreen.jsx`:
```jsx
export function HistoryScreen() { return <div style={{ padding: 20 }}>History</div>; }
```

Create `src/screens/StatsScreen.jsx`:
```jsx
export function StatsScreen() { return <div style={{ padding: 20 }}>Stats</div>; }
```

Create `src/screens/ConfigScreen.jsx`:
```jsx
export function ConfigScreen({ onBack }) { return <div style={{ padding: 20 }}><button onClick={onBack}>Back</button> Config</div>; }
```

- [ ] **Step 3: Verify dev server — tabs should switch screens**

```bash
npm run dev
```

Expected: 3 tabs visible at bottom, clicking switches between "Today / History / Stats" placeholders. Config opens when ⚙️ is added (next task).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/screens/TodayScreen.jsx src/screens/HistoryScreen.jsx src/screens/StatsScreen.jsx src/screens/ConfigScreen.jsx
git commit -m "feat: App shell with 3-tab bottom nav"
```

---

## Task 15: src/screens/TodayScreen.jsx

**Files:**
- Modify: `src/screens/TodayScreen.jsx`

- [ ] **Step 1: Replace TodayScreen.jsx with full implementation**

```jsx
import { useState } from "react";
import { getTodayKey, formatDate } from "../lib/utils";
import { suggestDay } from "../lib/suggestion";
import { DayTypePills } from "../components/DayTypePills";
import { RepExercise } from "../components/exercises/RepExercise";
import { TimeExercise } from "../components/exercises/TimeExercise";
import { CardioSelector } from "../components/CardioSelector";

const DAY_TYPE_COLORS = {
  dynamique: "#f97316",
  statique:  "#8b5cf6",
  repos:     "#6366f1",
  match:     "#10b981",
};

export function TodayScreen({ sessions, saveSession, deleteSession, program, onOpenConfig }) {
  const today = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;

  const session = sessions[selectedDate] || {};
  const suggestion = suggestDay(sessions);
  const sessionType = session.type || suggestion.type;
  const exercises = session.exercises || {};
  const cardio = session.cardio || [];

  const setType = (type) => {
    saveSession(selectedDate, { type, exercises: {}, cardio: [] });
  };

  const addRep = (exId, val) => {
    saveSession(selectedDate, {
      ...session,
      type: sessionType,
      exercises: { ...exercises, [exId]: [...(exercises[exId] || []), val] },
      cardio,
    });
  };

  const setCardio = (list) => {
    saveSession(selectedDate, { ...session, type: sessionType, exercises, cardio: list });
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split("T")[0];
    if (next <= today) setSelectedDate(next);
  };

  const handleReset = () => {
    if (!confirm(`Remettre à zéro la séance du ${formatDate(selectedDate)} ?`)) return;
    deleteSession(selectedDate);
  };

  const showSuggestion = isToday && !session.type;
  const isRestOrMatch = sessionType === "repos" || sessionType === "match";

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "32px 20px 16px",
        background: "linear-gradient(180deg, #111118 0%, transparent 100%)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
              Suivi sportif
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
            {isToday && (
              <button onClick={onOpenConfig} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>
                ⚙️
              </button>
            )}
            {session.type && (
              <button onClick={handleReset} style={{
                background: "rgba(255,60,60,0.1)",
                border: "1px solid rgba(255,60,60,0.2)",
                borderRadius: 10,
                color: "#ff6060",
                fontSize: 11,
                padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
              }}>Reset</button>
            )}
          </div>
        </div>

        {/* Day navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <button onClick={goToPrevDay} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, color: "#fff", fontSize: 18, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: isToday ? "#fff" : "rgba(255,165,0,0.9)", fontWeight: 700 }}>
            {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
          </div>
          <button onClick={goToNextDay} style={{ background: isToday ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, color: isToday ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 18, width: 32, height: 32, cursor: isToday ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>

        {/* Suggestion badge */}
        {showSuggestion && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: `${DAY_TYPE_COLORS[suggestion.type]}15`, border: `1px solid ${DAY_TYPE_COLORS[suggestion.type]}30`, borderRadius: 20, padding: "4px 12px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: DAY_TYPE_COLORS[suggestion.type], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} suggéré · {suggestion.reason}
            </span>
          </div>
        )}

        {/* Day type pills */}
        <div style={{ marginTop: 12 }}>
          <DayTypePills selected={sessionType} onChange={setType} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "8px 16px" }}>
        {isRestOrMatch ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {sessionType === "repos" ? "😴" : "🎾"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>
              {sessionType === "repos" ? "Jour de repos" : "Match de tennis"}
            </div>
            {sessionType === "repos" && (
              <div style={{ fontSize: 13, marginTop: 8, color: "rgba(255,255,255,0.25)" }}>
                Récupération — c'est là que les muscles se construisent
              </div>
            )}
          </div>
        ) : (
          <>
            <SectionLabel text={sessionType === "dynamique" ? "Section A — Répétitions" : "Section B — Isométrie"} />
            {sessionType === "dynamique"
              ? program.A.map(e => (
                  <RepExercise key={e.id} exercise={e} log={exercises[e.id] || []} onAdd={(v) => addRep(e.id, v)} />
                ))
              : program.B.map(e => (
                  <TimeExercise key={e.id} exercise={e} log={exercises[e.id] || []} onAdd={(v) => addRep(e.id, v)} />
                ))
            }
            <SectionLabel text="Cardio" />
            <CardioSelector options={program.C} checked={cardio} onChange={setCardio} />
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ marginBottom: 12, marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser — test the golden path**

```bash
npm run dev
```

Test: open app → suggestion badge visible → click "Dynamique" pill → Section A exercises appear → add reps → progress bar fills → toggle cardio → switch to "Repos" → rest screen shown → navigate to yesterday with ‹ → ⚙️ opens config placeholder.

- [ ] **Step 3: Commit**

```bash
git add src/screens/TodayScreen.jsx
git commit -m "feat: implement TodayScreen"
```

---

## Task 16: src/screens/HistoryScreen.jsx

**Files:**
- Modify: `src/screens/HistoryScreen.jsx`

- [ ] **Step 1: Replace HistoryScreen.jsx with full implementation**

```jsx
import { useState } from "react";
import { formatDate, fmtSec } from "../lib/utils";

const DAY_TYPE_COLORS = {
  dynamique: "#f97316",
  statique:  "#8b5cf6",
  repos:     "#6366f1",
  match:     "#10b981",
};

const DAY_TYPE_LABELS = {
  dynamique: "Dynamique",
  statique:  "Statique",
  repos:     "Repos",
  match:     "Match",
};

export function HistoryScreen({ sessions, program }) {
  const today = new Date().toISOString().split("T")[0];
  const days = Object.keys(sessions)
    .filter(d => d !== today)
    .sort((a, b) => b.localeCompare(a));

  if (days.length === 0) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
        <div style={{ fontSize: 15 }}>Aucun historique encore.<br />Commence ta première séance !</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 16px 0" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Historique</div>
      {days.map(d => (
        <HistoryDay key={d} dateKey={d} session={sessions[d]} program={program} />
      ))}
    </div>
  );
}

function HistoryDay({ dateKey, session, program }) {
  const [open, setOpen] = useState(false);
  const color = DAY_TYPE_COLORS[session.type] || "#fff";
  const label = DAY_TYPE_LABELS[session.type] || session.type;
  const isRestOrMatch = session.type === "repos" || session.type === "match";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      marginBottom: 10,
      overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, textTransform: "capitalize" }}>
          {formatDate(dateKey)}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            background: `${color}20`,
            border: `1px solid ${color}40`,
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 11,
            color,
            fontWeight: 700,
          }}>{label}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && !isRestOrMatch && (
        <div style={{ padding: "0 18px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {session.type === "dynamique" && program.A.map(e => {
            const log = (session.exercises || {})[e.id] || [];
            if (!log.length) return null;
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{e.label}</span>
                <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>
                  {log.reduce((a, b) => a + b, 0)} reps
                </span>
              </div>
            );
          })}
          {session.type === "statique" && program.B.map(e => {
            const log = (session.exercises || {})[e.id] || [];
            if (!log.length) return null;
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{e.label}</span>
                <span style={{ color: e.color, fontSize: 12, fontWeight: 700 }}>
                  {fmtSec(log.reduce((a, b) => a + b, 0))}
                </span>
              </div>
            );
          })}
          {(session.cardio || []).length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Cardio</span>
              <div style={{ display: "flex", gap: 5 }}>
                {(session.cardio || []).map(cId => {
                  const opt = program.C.find(c => c.id === cId);
                  return opt ? <span key={cId} style={{ fontSize: 16 }}>{opt.emoji}</span> : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Add a session for yesterday in TodayScreen (navigate with ‹), then check Historique tab: card visible, expand shows exercises.

- [ ] **Step 3: Commit**

```bash
git add src/screens/HistoryScreen.jsx
git commit -m "feat: implement HistoryScreen"
```

---

## Task 17: src/screens/StatsScreen.jsx

**Files:**
- Modify: `src/screens/StatsScreen.jsx`

- [ ] **Step 1: Replace StatsScreen.jsx with full implementation**

```jsx
import { fmtSec } from "../lib/utils";

export function StatsScreen({ sessions, program }) {
  const today = new Date().toISOString().split("T")[0];

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  // Streak: consecutive dynamique/statique days ending today (backwards from today)
  const sortedKeys = Object.keys(sessions).sort((a, b) => b.localeCompare(a));
  let streak = 0;
  for (const key of sortedKeys) {
    if (key > today) continue;
    const s = sessions[key];
    if (s.type === "dynamique" || s.type === "statique") {
      streak++;
    } else {
      break;
    }
  }

  // Sessions this week (Mon–today)
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
  const weekStartKey = weekStart.toISOString().split("T")[0];
  const sessionsThisWeek = Object.keys(sessions).filter(d =>
    d >= weekStartKey && d <= today &&
    (sessions[d].type === "dynamique" || sessions[d].type === "statique")
  ).length;

  return (
    <div style={{ padding: "32px 16px 0" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Statistiques</div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label="Streak" value={`${streak}j`} color="#f97316" />
        <StatCard label="Cette semaine" value={`${sessionsThisWeek}x`} color="#8b5cf6" />
      </div>

      {/* Cardio */}
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

      {/* Section A charts */}
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

      {/* Section B charts */}
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

function SectionLabel({ text }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Add a few sessions across different days, then check Stats tab: streak counter, cardio counts, bar charts populated.

- [ ] **Step 3: Commit**

```bash
git add src/screens/StatsScreen.jsx
git commit -m "feat: implement StatsScreen with bar charts and streak"
```

---

## Task 18: src/screens/ConfigScreen.jsx

**Files:**
- Modify: `src/screens/ConfigScreen.jsx`

- [ ] **Step 1: Replace ConfigScreen.jsx with full implementation**

```jsx
export function ConfigScreen({ program, setProgram, onBack }) {
  return (
    <div style={{ padding: "32px 16px 0", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10,
          color: "#fff", fontSize: 20, width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>‹</button>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Configuration</div>
      </div>

      <ExerciseSection
        title="Section A — Répétitions"
        exercises={program.A}
        isTime={false}
        onChange={(A) => setProgram({ ...program, A })}
      />

      <ExerciseSection
        title="Section B — Isométrie"
        exercises={program.B}
        isTime={true}
        onChange={(B) => setProgram({ ...program, B })}
      />

      <CardioSection
        options={program.C}
        onChange={(C) => setProgram({ ...program, C })}
      />
    </div>
  );
}

function ExerciseSection({ title, exercises, isTime, onChange }) {
  const update = (index, field, value) =>
    onChange(exercises.map((e, i) => i === index ? { ...e, [field]: value } : e));

  const remove = (index) => onChange(exercises.filter((_, i) => i !== index));

  const add = () => onChange([
    ...exercises,
    isTime
      ? { id: `ex-${Date.now()}`, label: "Nouvel exercice", targetSec: 60, quickAddSec: 15, color: "#ffffff" }
      : { id: `ex-${Date.now()}`, label: "Nouvel exercice", target: 20, quickAdd: 5, color: "#ffffff" },
  ]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </div>
      {exercises.map((e, i) => (
        <div key={e.id} style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 8,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}>
          <input
            type="color"
            value={e.color}
            onChange={ev => update(i, "color", ev.target.value)}
            style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer", padding: 0, background: "none", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              type="text"
              value={e.label}
              onChange={ev => update(i, "label", ev.target.value)}
              style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", outline: "none", marginBottom: 4 }}
            />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Obj.</span>
                <input
                  type="number"
                  value={isTime ? e.targetSec : e.target}
                  onChange={ev => update(i, isTime ? "targetSec" : "target", Number(ev.target.value))}
                  style={{ width: 52, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, padding: "2px 6px", fontFamily: "'Syne', sans-serif", outline: "none", textAlign: "center" }}
                />
                {isTime && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>s</span>}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>+</span>
                <input
                  type="number"
                  value={isTime ? e.quickAddSec : e.quickAdd}
                  onChange={ev => update(i, isTime ? "quickAddSec" : "quickAdd", Number(ev.target.value))}
                  style={{ width: 40, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, padding: "2px 6px", fontFamily: "'Syne', sans-serif", outline: "none", textAlign: "center" }}
                />
              </label>
            </div>
          </div>
          <button
            onClick={() => remove(i)}
            style={{ background: "rgba(255,60,60,0.1)", border: "none", borderRadius: 8, color: "#ff6060", fontSize: 16, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >✕</button>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 10, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
        + Ajouter un exercice
      </button>
    </div>
  );
}

function CardioSection({ options, onChange }) {
  const update = (index, field, value) =>
    onChange(options.map((e, i) => i === index ? { ...e, [field]: value } : e));
  const remove = (index) => onChange(options.filter((_, i) => i !== index));
  const add = () => onChange([...options, { id: `cardio-${Date.now()}`, label: "Nouvelle activité", emoji: "🏃" }]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        Section C — Cardio
      </div>
      {options.map((opt, i) => (
        <div key={opt.id} style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "10px 14px",
          marginBottom: 8,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}>
          <input
            type="text"
            value={opt.emoji}
            onChange={ev => update(i, "emoji", ev.target.value)}
            maxLength={2}
            style={{ width: 32, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "#fff", fontSize: 16, padding: 4, textAlign: "center", outline: "none", flexShrink: 0 }}
          />
          <input
            type="text"
            value={opt.label}
            onChange={ev => update(i, "label", ev.target.value)}
            style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", outline: "none" }}
          />
          <button
            onClick={() => remove(i)}
            style={{ background: "rgba(255,60,60,0.1)", border: "none", borderRadius: 8, color: "#ff6060", fontSize: 16, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >✕</button>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 10, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
        + Ajouter une activité
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open ⚙️ → Config screen shows exercises for A/B/C → edit a label → go back → see updated label in Séance tab → add an exercise → verify it appears in Séance.

- [ ] **Step 3: Commit**

```bash
git add src/screens/ConfigScreen.jsx
git commit -m "feat: implement ConfigScreen with editable exercise lists"
```

---

## Task 19: Final integration — build + Capacitor sync + push

**Files:**
- No code changes

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all tests PASS (utils, suggestion, useStorage, useProgram, useSessions).

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: build succeeds, output in `dist/`, PWA + service worker generated.

- [ ] **Step 3: Sync Capacitor**

```bash
npx cap sync android
```

Expected: `Sync finished in X.XXXs`

- [ ] **Step 4: Smoke test in browser (npm run preview)**

```bash
npm run preview
```

Test the full golden path:
1. Fresh load → suggestion badge visible → select "Dynamique" → add reps to exercises → progress bars fill → select cardio → navigate to yesterday → add a session → go to Historique → expand card → go to Stats → bar chart and streak visible → open Config → edit exercise goal → return to Séance → verify updated goal.

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "feat: complete Sport Tracker v2 rebuild"
git push origin claude/migrate-sports-tracker-react-wfazzr
```
