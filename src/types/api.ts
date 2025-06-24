// API Types based on backend XML documentation

export interface Player {
  id: string;
  username: string;
  type: string;
  status: string;
  registeredAt: string;
  lastActiveAt?: string;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
}

export interface Choice {
  id: number;
  name: string;
}

export interface Games{
    games: GameListItem[];
}

export interface GameListItem {
  id: string;
  name: string;
  creatorName: string; 
  creatorId: string; 
  status: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
  hasAvailableSlots: boolean; 
}

export interface GamePlayer {
  playerId: string;
  username: string;
  score: number;
  joinedAt: string;
}

export interface GameRound {
  id: string;
  roundNumber: number;
  createdAt: string;
  completedAt?: string;
  winnerId?: string;
  resultDescription?: string;
}

export interface Game {
  id: string;
  name: string;
  creatorId: string;
  creatorUsername: string;
  status: string;
  maxPlayers: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  players: GamePlayer[];
  rounds: GameRound[];
  currentRoundNumber: number;
}

export interface MultiplayerResult {
  id: string;
  gameId: string;
  roundId?: string;
  resultType: 'Round' | 'GameSummary' | 'HeadToHead';
  playerValues: Record<string, number>;
  winnerId?: string;
  winnerUsername?: string;
  resultDescription: string;
  createdAt: string;
}

// Request/Response Types
export interface CreatePlayerRequest {
  username: string;
}

export interface CreatePlayerResponse {
  id: string;
  username: string;
  registeredAt: string;
}

export interface CreateGameRequest {
  name: string;
  maxPlayers: number;
}

export interface CreateGameResponse {
  id: string;
  name: string;
  creatorId: string;
  status: string;
  maxPlayers: number;
  createdAt: string;
}

export interface JoinGameResponse {
  gameId: string;
  gameName: string;
  playerId: string;
  playerUsername: string;
  joinedAt: string;
  gameStarted: boolean;
}

export interface MakeChoiceRequest {
  choiceId: number;
}

export interface MakeChoiceResponse {
  gameId: string;
  roundId: string;
  roundNumber: number;
  playerId: string;
  choiceId: number;
  choiceName: string;
  madeAt: string;
  roundComplete: boolean;
  roundWinnerId?: string;
  resultDescription?: string;
  gameEnded: boolean;
}

export interface StartGameResponse {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  firstRoundId: string;
  playerCount: number;
}

export interface AddComputerPlayerRequest {
  playerId: string;
}

export interface AddComputerPlayerResponse {
  gameId: string;
  computerPlayerId: string;
  computerPlayerUsername: string;
}

export interface CancelGameResponse {
  id: string;
  name: string;
  status: string;
  endedAt: string;
}

export interface UpdatePlayerStatusRequest {
  status: string;
}

export interface UpdatePlayerStatusResponse {
  id: string;
  username: string;
  status: string;
  lastActiveAt: string;
}

// SignalR Event Types
export interface GameCreatedEvent {
  gameId: string;
  gameName: string;
  creatorId: string;
  creatorUsername: string;
  maxPlayers: number;
}

export interface GameCompletedEvent {
  gameId: string;
  gameName: string;
  winnerPlayerId?: string;
  playerIds: string[];
  playerScores: Record<string, number>;
  endedAt: string;
  gameStatus: string;
}

export interface RoundCompletedEvent {
  gameId: string;
  roundId: string;
  roundNumber: number;
  winnerId?: string;
  playerChoices: Record<string, number>;
  resultDescription: string;
  completedAt: string;
}

export interface GameUpdatedEvent {
  id: string;
  name: string;
  status: string;
  playerCount: number;
  maxPlayers: number;
}

export interface PlayerJoinedEvent {
  gameId: string;
  playerId: string;
  playerUsername: string;
  playerCount: number;
}

export interface RoundCreatedEvent {
  gameId: string;
  roundId: string;
  roundNumber: number;
  createdAt: string;
}

export interface PlayerTypingEvent {
  gameId: string;
  playerId: string;
  playerUsername: string;
}

export interface PlayerChoiceMadeEvent {
  gameId: string;
  playerId: string;
  playerUsername: string;
}

export interface PlayerReadyEvent {
  gameId: string;
  playerId: string;
}

// App State Types
export interface AppState {
  currentPlayer?: Player;
  isAuthenticated: boolean;
  currentGame?: Game;
  availableGames: GameListItem[];
  choices: Choice[];
}

// API Error Type
export interface ApiError {
  code: string;
  message: string;
}

// Game Status Constants
export const GameStatus = {
  Waiting: 'Waiting',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Cancelled: 'Cancelled'
} as const;

export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

// Player Status Constants
export const PlayerStatus = {
  Online: 'Online',
  Away: 'Away',
  Offline: 'Offline'
} as const;

export type PlayerStatus = typeof PlayerStatus[keyof typeof PlayerStatus];
