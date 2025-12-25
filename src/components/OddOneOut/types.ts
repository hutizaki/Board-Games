export type GameState = 'category' | 'setup' | 'lobby' | 'reveal' | 'voting' | 'votingInstructions' | 'results' | 'final';

export interface Player {
  name: string;
  isImposter: boolean;
  hasRevealed: boolean;
  hasVoted: boolean;
  word?: string;
}

export interface GameSettings {
  numPlayers: number;
  numImposters: number;
  showHint: boolean;
  showCategory: boolean;
  imposterGoesFirst: boolean;
}

export interface VoteResult {
  voteCounts: Record<number, number>;
  accused: number;
  isImposter: boolean;
}

