// Central consumption data source (real state shared by Dashboard, Consumo, charts and PDF)

export const CHART_HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
export const DEFAULT_GOAL = 250;

const GOALS_KEY = "saneamento-goals";
const HISTORY_KEY = "saneamento-consumption";
const CREATED_KEY = "saneamento-created-at";

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function isFuture(key: string): boolean {
  return key > todayKey();
}

function seededRandom(seed: number) {
  let s = (seed % 2147483646) + 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function seedFrom(str: string): number {
  return str.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
}

/** Deterministic pseudo-history for past days (never for future days). */
export function generatedConsumption(key: string): number {
  if (isFuture(key)) return 0;
  const rng = seededRandom(seedFrom(key));
  return Math.round(120 + rng() * 180);
}

export function getCreatedAt(): string {
  const saved = localStorage.getItem(CREATED_KEY);
  if (saved) return saved;
  const d = new Date();
  d.setDate(d.getDate() - 365);
  const key = dateKey(d);
  localStorage.setItem(CREATED_KEY, key);
  return key;
}

export function setCreatedAt(key: string) {
  localStorage.setItem(CREATED_KEY, key);
}

/** Consumption of a given day: real record → generated (past) → 0 (future). */
export function getConsumption(key: string, history: Record<string, number>): number {
  if (isFuture(key)) return 0;
  if (typeof history[key] === "number") return history[key];
  return generatedConsumption(key);
}

/**
 * Distributes the day total across the chart hour buckets so the sum of the
 * plotted points is exactly equal to the day total shown in the drop.
 */
export function getHourly(key: string, history: Record<string, number>): { hour: string; value: number }[] {
  const total = getConsumption(key, history);
  const rng = seededRandom(seedFrom(key) + 13);
  const weights = CHART_HOURS.map(() => 0.4 + rng());
  const sum = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return CHART_HOURS.map((h, i) => {
    let v: number;
    if (i === CHART_HOURS.length - 1) {
      v = total - acc;
    } else {
      v = Math.round((weights[i] / sum) * total);
      acc += v;
    }
    return { hour: `${h}h`, value: Math.max(0, v) };
  });
}

/** Fills gaps in past days (retroactive) and drops any future records. */
export function backfillHistory(history: Record<string, number>): Record<string, number> {
  const next: Record<string, number> = {};
  Object.entries(history).forEach(([k, v]) => { if (!isFuture(k)) next[k] = v; });

  const start = new Date(`${getCreatedAt()}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(start);
  while (cursor <= today) {
    const k = dateKey(cursor);
    if (typeof next[k] !== "number") next[k] = generatedConsumption(k);
    cursor.setDate(cursor.getDate() + 1);
  }
  return next;
}

export function loadHistory(): Record<string, number> {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function saveHistory(h: Record<string, number>) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

// ---- Goals ----

export function loadGoals(): Record<string, number> {
  try {
    const saved = localStorage.getItem(GOALS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function saveGoals(g: Record<string, number>) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(g));
}

/** Goal for a day: custom → generated (past/today) → 0 (future, empty). */
export function getGoal(key: string, goals: Record<string, number>): number {
  if (typeof goals[key] === "number") return goals[key];
  if (isFuture(key)) return 0;
  return DEFAULT_GOAL;
}
