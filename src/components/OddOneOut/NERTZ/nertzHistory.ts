/**
 * NERTZ game history: types and localStorage helpers.
 * Snapshot shape matches resumable state (gameState, deckType, teams, etc.).
 */

export type GameState =
  | 'home'
  | 'teamSetup'
  | 'colorSelect'
  | 'readyToStart'
  | 'countdown'
  | 'game'
  | 'roundEnd'
  | 'roundStandings'
  | 'results';

export type DeckType = '8 pack' | '12 pack';

export interface TeamSnapshot {
  name: string;
  color: string;
  colorImage: string;
  teamImage: string;
  score: number;
  cardsInHand: number;
  cardsInPile: number;
}

export interface NertzSnapshot {
  gameState: GameState;
  deckType: DeckType;
  teams: TeamSnapshot[];
  selectedColors: string[];
  currentRound: number;
  roundWinner: number | null;
  currentInputTeam: number;
  inputPhase: 'hand' | 'pile';
  tempInput: string;
  handScoresTemp: number[];
  pileScoresTemp: number[];
}

export interface NertzHistoryEntry {
  id: string;
  savedAt: number;
  completed: boolean;
  snapshot: NertzSnapshot;
}

const STORAGE_KEY = 'nertz_game_history';
const MAX_HISTORY = 50;

export function getHistory(): NertzHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as NertzHistoryEntry[];
  } catch {
    return [];
  }
}

export function appendToHistory(entry: NertzHistoryEntry): void {
  try {
    const list = getHistory();
    list.unshift(entry);
    const capped = list.slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Quota or other error; don't crash
  }
}

const RESUMABLE_STATES: GameState[] = [
  'countdown',
  'game',
  'roundEnd',
  'roundStandings',
];

export function isSnapshotLoadable(entry: NertzHistoryEntry): boolean {
  if (entry.completed) return false;
  const s = entry.snapshot;
  if (!s || typeof s !== 'object') return false;
  if (!RESUMABLE_STATES.includes(s.gameState)) return false;
  if (s.deckType !== '8 pack' && s.deckType !== '12 pack') return false;
  if (!Array.isArray(s.teams) || s.teams.length === 0) return false;
  return true;
}

export function removeHistoryEntry(id: string): void {
  try {
    const list = getHistory().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
