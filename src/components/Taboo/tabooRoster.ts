/**
 * Player roster: the remembered list of everyone who has ever played, plus the
 * last teams used. Reunions run many games back to back, so nobody should have
 * to type "Grandma Jo" more than once all weekend.
 */

const KNOWN_PLAYERS_KEY = 'taboo_known_players';
const ROSTER_KEY = 'taboo_roster';

const MAX_KNOWN = 200;
export const MAX_NAME_LENGTH = 20;

export interface SavedRoster {
  teamNames: [string, string];
  rosters: [string[], string[]];
}

/** Trimmed, collapsed whitespace, capped. Empty string means "not a name". */
export function normalizeName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

/** Names are compared case-insensitively so "mike" and "Mike" are one person. */
export function sameName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is string => typeof n === 'string');
  } catch {
    return [];
  }
}

export function getKnownPlayers(): string[] {
  return sortNames(readList(KNOWN_PLAYERS_KEY));
}

export function sortNames(names: string[]): string[] {
  return [...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/** Adds any names not already remembered. Returns the new full list. */
export function rememberPlayers(names: string[]): string[] {
  const known = readList(KNOWN_PLAYERS_KEY);
  for (const name of names) {
    const clean = normalizeName(name);
    if (!clean) continue;
    if (!known.some((k) => sameName(k, clean))) known.push(clean);
  }
  const capped = known.slice(-MAX_KNOWN);
  try {
    localStorage.setItem(KNOWN_PLAYERS_KEY, JSON.stringify(capped));
  } catch {
    // storage unavailable; the list just won't persist
  }
  return sortNames(capped);
}

export function forgetPlayer(name: string): string[] {
  const remaining = readList(KNOWN_PLAYERS_KEY).filter((k) => !sameName(k, name));
  try {
    localStorage.setItem(KNOWN_PLAYERS_KEY, JSON.stringify(remaining));
  } catch {
    // ignore
  }
  return sortNames(remaining);
}

export function loadRoster(): SavedRoster | null {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedRoster>;
    const names = parsed.teamNames;
    const rosters = parsed.rosters;
    if (!Array.isArray(names) || names.length !== 2) return null;
    if (!Array.isArray(rosters) || rosters.length !== 2) return null;
    if (!Array.isArray(rosters[0]) || !Array.isArray(rosters[1])) return null;
    return {
      teamNames: [String(names[0]), String(names[1])],
      rosters: [rosters[0].map(String), rosters[1].map(String)],
    };
  } catch {
    return null;
  }
}

export function saveRoster(roster: SavedRoster): void {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  } catch {
    // ignore
  }
}
