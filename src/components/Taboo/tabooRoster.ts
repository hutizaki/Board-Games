/**
 * Roster storage.
 *
 * The line-up itself is deliberately NOT persisted — a new game night is a new
 * group, and a stale roster is worse than an empty one. What persists is the
 * pool of names, so nobody retypes "Grandma Jo" all weekend.
 */

export interface Player {
  /** Stable identity. FLIP animation keys on it, so values are never reused. */
  id: number;
  /** 1–18 chars, trimmed. Duplicates are legal — two Sams is a real family. */
  name: string;
  /** Index into teamNames. There is no unassigned state. */
  team: 0 | 1;
}

const RECENTS_KEY = 'taboo_recents';
const TEAM_NAMES_KEY = 'taboo_team_names';

const MAX_RECENTS = 40;
export const MAX_NAME_LENGTH = 18;

/**
 * One house style for every name: a single word, capitalised.
 *
 * Pills are narrow and the roster is scanned at a glance across a table, so
 * "mary ann sanders" becomes "Mary" and "DEV" becomes "Dev". Only the first
 * word survives — everything after the first space is dropped.
 */
export function normalizeName(raw: string): string {
  const firstWord = raw.trim().split(/\s+/)[0] ?? '';
  const clipped = firstWord.slice(0, MAX_NAME_LENGTH);
  if (!clipped) return '';
  return clipped.charAt(0).toUpperCase() + clipped.slice(1).toLowerCase();
}

export function sameName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/** First occurrence wins, compared case-insensitively. */
export function dedupeNames(names: string[]): string[] {
  const out: string[] = [];
  for (const raw of names) {
    const name = normalizeName(raw);
    if (!name) continue;
    if (!out.some((n) => sameName(n, name))) out.push(name);
  }
  return out;
}

export function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return dedupeNames(parsed.filter((n): n is string => typeof n === 'string')).slice(
      0,
      MAX_RECENTS
    );
  } catch {
    return [];
  }
}

/**
 * Saves the name pool. Callers pass the on-screen recents plus everyone
 * currently on a team: the roster vanishes at the end of the session, so any
 * name only held by a player would be lost with it.
 */
export function saveRecents(names: string[]): void {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(dedupeNames(names).slice(0, MAX_RECENTS)));
  } catch {
    // storage unavailable; the pool just won't persist
  }
}

export function loadTeamNames(): [string, string] {
  try {
    const raw = localStorage.getItem(TEAM_NAMES_KEY);
    if (!raw) return ['Team A', 'Team B'];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 2) return ['Team A', 'Team B'];
    return [String(parsed[0]) || 'Team A', String(parsed[1]) || 'Team B'];
  } catch {
    return ['Team A', 'Team B'];
  }
}

export function saveTeamNames(names: [string, string]): void {
  try {
    localStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(names));
  } catch {
    // ignore
  }
}
