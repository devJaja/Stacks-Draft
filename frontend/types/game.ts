export type PieceType = 0 | 1 | 2 | 3 | 4;

export interface GameState {
  player1: { value: string };
  player2: { value: { value: string } | null };
  'current-turn': { value: string };
  winner: { value: { value: string } | null };
  'is-active': { value: boolean };
  'move-count': { value: number };
  'p1-pieces': { value: number };
  'p2-pieces': { value: number };
  'draw-offered-by': { value: { value: string } | null };
  'created-at': { value: number };
}

export interface MoveRecord {
  from: number;
  to: number;
  piece: PieceType;
  wasCapture: boolean;
  wasPromotion: boolean;
  timestamp: number;
}

export interface PlayerStats {
  'games-played': number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  'win-streak': number;
  'best-streak': number;
  'total-captures': number;
}
