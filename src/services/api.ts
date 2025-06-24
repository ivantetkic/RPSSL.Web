import type {
  Player,
  Choice,
  Games,
  Game,
  MultiplayerResult,
  CreatePlayerRequest,
  CreatePlayerResponse,
  CreateGameRequest,
  CreateGameResponse,
  JoinGameResponse,
  MakeChoiceRequest,
  MakeChoiceResponse,
  StartGameResponse,
  AddComputerPlayerRequest,
  AddComputerPlayerResponse,
  CancelGameResponse,
  UpdatePlayerStatusRequest,
  UpdatePlayerStatusResponse,
} from '../types/api';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';
const IS_DEVELOPMENT = import.meta.env.DEV;

// Mock data for development when backend is unavailable
const mockGames: Games = {
  games: [
    {
      id: '1',
      name: 'Test Game 1',
      creatorName: 'Player 1',
      creatorId: 'player-1',
      status: 'Waiting',
      playerCount: 1,
      maxPlayers: 2,
      createdAt: new Date().toISOString(),
      hasAvailableSlots: true,
    },
    {
      id: '2',
      name: 'Test Game 2',
      creatorName: 'Player 2',
      creatorId: 'player-2',
      status: 'Waiting',
      playerCount: 2,
      maxPlayers: 4,
      createdAt: new Date().toISOString(),
      hasAvailableSlots: true,
    }
  ]
};

const mockResults: MultiplayerResult[] = [
  {
    id: '1',
    gameId: 'game-1',
    resultType: 'GameSummary',
    playerValues: { 'player-1': 2, 'player-2': 1 },
    winnerId: 'player-1',
    winnerUsername: 'TestWinner',
    resultDescription: 'Rock beats Scissors',
    createdAt: new Date().toISOString(),
  }
];

class ApiError extends Error {
  public code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

class ApiService {  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            code: `HTTP_${response.status}`, 
            message: `HTTP ${response.status}: ${response.statusText}` 
          };
        }
        throw new ApiError(
          errorData.code || `HTTP_${response.status}`, 
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // If the response is not JSON, return the text
        const text = await response.text();
        return text as unknown as T;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('NETWORK_ERROR', 'Unable to connect to server. Please check if the backend is running.');
      }
      throw new ApiError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

  // Player endpoints
  async createPlayer(request: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    return this.request<CreatePlayerResponse>('/players', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getPlayers(): Promise<Player[]> {
    return this.request<Player[]>('/players');
  }

  async getPlayerById(playerId: string): Promise<Player> {
    return this.request<Player>(`/players/${playerId}`);
  }

  async updatePlayerStatus(
    playerId: string,
    request: UpdatePlayerStatusRequest
  ): Promise<UpdatePlayerStatusResponse> {
    return this.request<UpdatePlayerStatusResponse>(`/players/${playerId}/status`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  // Choice endpoints
  async getChoices(): Promise<Choice[]> {
    return this.request<Choice[]>('/choices');
  }

  async getRandomChoice(): Promise<Choice> {
    return this.request<Choice>('/choices/random');
  }  // Game endpoints
  async getGames(params?: {
    status?: string;
    creatorId?: string;
    playerId?: string;
    hasAvailableSlots?: boolean;
  }): Promise<Games> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.creatorId) queryParams.append('creatorId', params.creatorId);
    if (params?.playerId) queryParams.append('playerId', params.playerId);
    if (params?.hasAvailableSlots !== undefined) {
      queryParams.append('hasAvailableSlots', params.hasAvailableSlots.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/games?${queryString}` : '/games';
    
    try {
      return await this.request<Games>(endpoint);
    } catch (error) {
      // In development, return mock data if backend is unavailable
      if (IS_DEVELOPMENT && error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        console.warn('Backend unavailable in development, using mock data');
        return mockGames;
      }
      throw error;
    }
  }

  async getGame(gameId: string): Promise<Game> {
    return this.request<Game>(`/games/${gameId}`);
  }
  async createGame(
    playerId: string,
    request: CreateGameRequest
  ): Promise<CreateGameResponse> {
    return this.request<CreateGameResponse>(`/players/${playerId}/games`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  async joinGame(gameId: string, playerId: string): Promise<JoinGameResponse> {
    return this.request<JoinGameResponse>(`/games/${gameId}/players/${playerId}`, {
      method: 'POST',
    });
  }

  async startGame(gameId: string): Promise<StartGameResponse> {
    return this.request<StartGameResponse>(`/games/${gameId}/start`, {
      method: 'POST',
    });
  }
  async makeChoice(
    gameId: string,
    playerId: string,
    request: MakeChoiceRequest
  ): Promise<MakeChoiceResponse> {
    return this.request<MakeChoiceResponse>(
      `/games/${gameId}/players/${playerId}/choice`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
  async addComputerPlayer(
    gameId: string,
    request: AddComputerPlayerRequest
  ): Promise<AddComputerPlayerResponse> {
    return this.request<AddComputerPlayerResponse>(`/games/${gameId}/add-computer`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async cancelGame(gameId: string): Promise<CancelGameResponse> {
    return this.request<CancelGameResponse>(`/games/${gameId}/cancel`, {
      method: 'POST',
    });
  }
  async getGameResults(gameId: string): Promise<MultiplayerResult[]> {
    return this.request<MultiplayerResult[]>(`/games/${gameId}/results`);
  }  async getRecentGameResults(limit: number = 10, playerId?: string): Promise<MultiplayerResult[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('top', limit.toString());
    queryParams.append('resultType', 'GameSummary');
    if (playerId) {
      queryParams.append('playerId', playerId);
    }
    
    try {
      // Updated to match backend GetTopGameResults endpoint
      return await this.request<MultiplayerResult[]>(`/games/results?${queryParams.toString()}`);
    } catch (error) {
      // In development, return mock data if backend is unavailable
      if (IS_DEVELOPMENT && error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        console.warn('Backend unavailable in development, using mock results data');
        return mockResults;
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();
export { ApiError };
