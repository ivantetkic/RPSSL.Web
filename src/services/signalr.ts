import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';
import type {
  GameCreatedEvent,
  GameCompletedEvent,
  RoundCompletedEvent,
  RoundCreatedEvent,
  GameUpdatedEvent,
  PlayerJoinedEvent,
  PlayerTypingEvent,
  PlayerChoiceMadeEvent,
  PlayerReadyEvent,
} from '../types/api';

export type SignalREventHandlers = {
  onGameCreated?: (event: GameCreatedEvent) => void;
  onGameCompleted?: (event: GameCompletedEvent) => void;
  onRoundCompleted?: (event: RoundCompletedEvent) => void;
  onRoundCreated?: (event: RoundCreatedEvent) => void;
  onGameUpdated?: (event: GameUpdatedEvent) => void;
  onPlayerJoined?: (event: PlayerJoinedEvent) => void;
  onPlayerLeft?: (event: { gameId: string; playerId: string; playerUsername: string }) => void;
  onGameStarted?: (event: { gameId: string; gameName: string; startedAt: string }) => void;
  onPlayerTyping?: (event: PlayerTypingEvent) => void;
  onPlayerChoiceMade?: (event: PlayerChoiceMadeEvent) => void;
  onPlayerReady?: (event: PlayerReadyEvent) => void;
  onAvailableGame?: (event: unknown) => void;
  onConnectionStateChanged?: (state: HubConnectionState) => void;
  onError?: (error: Error) => void;
};

class SignalRService {
  private connection: HubConnection | null = null;
  private handlers: SignalREventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:7001/gameHub';
    
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
            return this.reconnectDelay * Math.pow(2, retryContext.previousRetryCount);
          }
          return null; // Stop retrying
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventListeners();
    this.setupConnectionEvents();
  }
  private setupEventListeners(): void {
    if (!this.connection) return;

    // Game events
    this.connection.on('GameCreated', (event: GameCreatedEvent) => {
      this.handlers.onGameCreated?.(event);
    });

    this.connection.on('GameCompleted', (event: GameCompletedEvent) => {
      this.handlers.onGameCompleted?.(event);
    });

    this.connection.on('RoundCompleted', (event: RoundCompletedEvent) => {
      this.handlers.onRoundCompleted?.(event);
    });

    this.connection.on('RoundCreated', (event: RoundCreatedEvent) => {
      this.handlers.onRoundCreated?.(event);
    });

    this.connection.on('GameUpdated', (event: GameUpdatedEvent) => {
      this.handlers.onGameUpdated?.(event);
    });

    this.connection.on('PlayerJoined', (event: PlayerJoinedEvent) => {
      this.handlers.onPlayerJoined?.(event);
    });

    this.connection.on('PlayerLeft', (event: { gameId: string; playerId: string; playerUsername: string }) => {
      this.handlers.onPlayerLeft?.(event);
    });

    this.connection.on('GameStarted', (event: { gameId: string; gameName: string; startedAt: string }) => {
      this.handlers.onGameStarted?.(event);
    });

    // Player interaction events
    this.connection.on('PlayerTyping', (event: PlayerTypingEvent) => {
      this.handlers.onPlayerTyping?.(event);
    });

    this.connection.on('PlayerChoiceMade', (event: PlayerChoiceMadeEvent) => {
      this.handlers.onPlayerChoiceMade?.(event);
    });    this.connection.on('PlayerReady', (event: PlayerReadyEvent) => {
      this.handlers.onPlayerReady?.(event);
    });    // Available games update event - try multiple variations
    this.connection.on('availablegame', (event: unknown) => {
      console.log('📡 SignalR: availablegame event received:', event);
      this.handlers.onAvailableGame?.(event);
    });

    this.connection.on('AvailableGame', (event: unknown) => {
      console.log('📡 SignalR: AvailableGame event (PascalCase):', event);
      this.handlers.onAvailableGame?.(event);
    });

    this.connection.on('GameAvailable', (event: unknown) => {
      console.log('📡 SignalR: GameAvailable event:', event);
      this.handlers.onAvailableGame?.(event);
    });

    this.connection.on('gameavailable', (event: unknown) => {
      console.log('📡 SignalR: gameavailable event (lowercase):', event);
      this.handlers.onAvailableGame?.(event);
    });

    this.connection.on('gameupdate', (event: unknown) => {
      console.log('Game update event (lowercase):', event);
      this.handlers.onGameUpdated?.(event as GameUpdatedEvent);
    });

    this.connection.on('playerjoined', (event: unknown) => {
      console.log('Player joined event (lowercase):', event);
      this.handlers.onPlayerJoined?.(event as PlayerJoinedEvent);
    });

    this.connection.on('playerleft', (event: unknown) => {
      console.log('Player left event (lowercase):', event);
      this.handlers.onPlayerLeft?.(event as { gameId: string; playerId: string; playerUsername: string });
    });
  }

  private setupConnectionEvents(): void {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      console.warn('SignalR connection closed:', error);
      this.handlers.onConnectionStateChanged?.(HubConnectionState.Disconnected);
      if (error) {
        this.handlers.onError?.(error);
      }
    });

    this.connection.onreconnecting((error) => {
      console.info('SignalR reconnecting:', error);
      this.handlers.onConnectionStateChanged?.(HubConnectionState.Reconnecting);
      this.reconnectAttempts++;
    });

    this.connection.onreconnected((connectionId) => {
      console.info('SignalR reconnected:', connectionId);
      this.handlers.onConnectionStateChanged?.(HubConnectionState.Connected);
      this.reconnectAttempts = 0;
    });
  }

  async start(): Promise<void> {
    if (!this.connection) {
      throw new Error('SignalR connection not initialized');
    }

    if (this.connection.state === HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
        console.info('SignalR connected successfully');
        this.handlers.onConnectionStateChanged?.(HubConnectionState.Connected);
      } catch (error) {
        console.error('Failed to start SignalR connection:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async stop(): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      try {
        await this.connection.stop();
        console.info('SignalR disconnected successfully');
      } catch (error) {
        console.error('Failed to stop SignalR connection:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async joinGameGroup(gameId: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinGameGroup', gameId);
        console.info(`Joined game group: ${gameId}`);
      } catch (error) {
        console.error('Failed to join game group:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async leaveGameGroup(gameId: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveGameGroup', gameId);
        console.info(`Left game group: ${gameId}`);
      } catch (error) {
        console.error('Failed to leave game group:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async subscribeToPlayer(playerId: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SubscribeToPlayer', playerId);
        console.info(`Subscribed to player: ${playerId}`);
      } catch (error) {
        console.error('Failed to subscribe to player:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async unsubscribeFromPlayer(playerId: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('UnsubscribeFromPlayer', playerId);
        console.info(`Unsubscribed from player: ${playerId}`);
      } catch (error) {
        console.error('Failed to unsubscribe from player:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async registerPlayerPresence(playerId: string, username: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('RegisterPlayerPresence', playerId, username);
        console.info(`Registered player presence: ${username}`);
      } catch (error) {
        console.error('Failed to register player presence:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async spectateGame(gameId: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SpectateGame', gameId);
        console.info(`Started spectating game: ${gameId}`);
      } catch (error) {
        console.error('Failed to spectate game:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async stopSpectatingGame(gameId: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('StopSpectatingGame', gameId);
        console.info(`Stopped spectating game: ${gameId}`);
      } catch (error) {
        console.error('Failed to stop spectating game:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async sendGameMessage(gameId: string, playerId: string, playerUsername: string, message: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendGameMessage', gameId, playerId, playerUsername, message);
        console.info(`Sent message to game ${gameId}`);
      } catch (error) {
        console.error('Failed to send game message:', error);
        this.handlers.onError?.(error as Error);
        throw error;
      }
    }
  }

  async notifyTyping(gameId: string, playerId: string, playerUsername: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('NotifyTyping', gameId, playerId, playerUsername);
      } catch (error) {
        console.error('Failed to notify typing:', error);
        this.handlers.onError?.(error as Error);
      }
    }
  }

  async notifyPlayerMadeChoice(gameId: string, playerId: string, playerUsername: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('NotifyPlayerMadeChoice', gameId, playerId, playerUsername);
      } catch (error) {
        console.error('Failed to notify player made choice:', error);
        this.handlers.onError?.(error as Error);
      }
    }
  }

  async notifyPlayerReady(gameId: string, playerId: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('NotifyPlayerReady', gameId, playerId);
      } catch (error) {
        console.error('Failed to notify player ready:', error);
        this.handlers.onError?.(error as Error);
      }
    }
  }

  setEventHandlers(handlers: SignalREventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  removeEventHandlers(): void {
    this.handlers = {};
  }

  getConnectionState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
