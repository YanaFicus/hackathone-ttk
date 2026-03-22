import * as signalR from '@microsoft/signalr';
import type { ChatHubEvents, ChatHubMethods } from './types';

const SIGNALR_URL = 'http://95.174.104.223:7401/';

export class ChatHubClient {
  private connection: signalR.HubConnection | null = null;
  private eventHandlers = new Map<keyof ChatHubEvents, Set<(...args: any[]) => void>>();

  private getAccessToken(): string {
    let token = localStorage.getItem('accessToken') || '';
    
    console.log('🔑 Raw token from localStorage:', token ? `${token.substring(0, 30)}...` : 'null');
    
    // Убираем префикс "Bearer " если есть
    if (token.toLowerCase().startsWith('bearer ')) {
      token = token.substring(7).trim();
      console.log('🔑 Removed Bearer prefix, new token:', `${token.substring(0, 30)}...`);
    }
    
    // Убираем кавычки если есть (на случай JSON.stringify)
    const originalToken = token;
    token = token.replace(/^["']|["']$/g, '');
    if (originalToken !== token) {
      console.log('🔑 Removed quotes, new token:', `${token.substring(0, 30)}...`);
    }
    
    if (!token) {
      console.error('❌ No access token for SignalR');
    } else {
      console.log('✅ Token prepared for SignalR, length:', token.length, 'first 10 chars:', token.substring(0, 10));
    }
    
    return token;
  }

  async connect(): Promise<void> {
    console.log('🔄 SignalR: Starting connection...');
    
    const token = this.getAccessToken();
    
    if (!token) {
      console.error('❌ No access token for SignalR');
      throw new Error('Not authenticated');
    }

    console.log('🔌 SignalR: Connecting to URL:', SIGNALR_URL);
    console.log('🔑 SignalR: Token (last 10 chars):', '***' + token.slice(-10));
    console.log('🔑 SignalR: Token length:', token.length);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: () => {
          const currentToken = this.getAccessToken();
          console.log('🎫 accessTokenFactory called, returning token length:', currentToken.length);
          return currentToken;
        },
        queryParams: {
          access_token: token,
        },
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onreconnecting((error) => {
      console.log('🔄 SignalR: Reconnecting...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR: Reconnected, connectionId:', connectionId);
    });

    this.connection.on('MessageCreated', (...args) => {
      console.log('📨 SignalR: MessageCreated event received:', args);
      this.eventHandlers.get('MessageCreated')?.forEach((handler) => handler(...args));
    });

    this.connection.on('MessageStatusUpdated', (...args) => {
      console.log('🔄 SignalR: MessageStatusUpdated event received:', args);
      this.eventHandlers.get('MessageStatusUpdated')?.forEach((handler) => handler(...args));
    });

    this.connection.onclose((error) => {
      console.log('🔌 SignalR connection closed:', error);
    });

    try {
      await this.connection.start();
      console.log('✅ SignalR: Connected successfully!');
      console.log('📡 Connection state:', this.connection.state);
      console.log('🔑 Connection ID:', this.connection.connectionId);
    } catch (error) {
      console.error('❌ SignalR: Connection failed:', error);
      throw error;
    }
  }

  async invoke<TMethod extends keyof ChatHubMethods, TResult>(
    method: TMethod,
    ...args: ChatHubMethods[TMethod]
  ): Promise<TResult> {
    console.log(`📤 SignalR: Invoking method "${method}" with args:`, args);
    
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.log(`⚠️ SignalR: Not connected, attempting to connect...`);
      await this.connect();
    }
    
    try {
      const result = await this.connection!.invoke<TResult>(method, ...args);
      console.log(`✅ SignalR: Method "${method}" succeeded, result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ SignalR: Method "${method}" failed:`, error);
      throw error;
    }
  }

  async sendMessage(request: { text: string; recipientId?: string }): Promise<any> {
    console.log('📝 Sending message to server:', request);
    console.log('🔑 Current token before send:', this.getAccessToken().substring(0, 20) + '...');
    console.log('📡 Connection state before send:', this.connection?.state);
    
    return this.invoke('SendMessage', request);
  }

  async getMessages(request: { userId?: string; status?: string; fromDate?: string; toDate?: string; limit?: number }): Promise<any[]> {
    console.log('📥 Getting messages with filter:', request);
    return this.invoke('GetMessages', request);
  }

  async updateMessageStatus(messageId: string, request: { status: string }): Promise<any> {
    console.log('🔄 Updating message status:', { messageId, request });
    return this.invoke('UpdateMessageStatus', messageId, request);
  }

  on<K extends keyof ChatHubEvents>(
    event: K,
    handler: (...args: ChatHubEvents[K]) => void
  ): () => void {
    console.log(`👂 Registering handler for event: ${event}`);
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler);
    return () => { 
      console.log(`🔇 Unregistering handler for event: ${event}`);
      handlers.delete(handler); 
      if (handlers.size === 0) this.eventHandlers.delete(event); 
    };
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting from SignalR...');
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.eventHandlers.clear();
      console.log('✅ SignalR disconnected');
    }
  }

  isConnected(): boolean {
    const connected = this.connection?.state === signalR.HubConnectionState.Connected;
    console.log(`📡 Connection status: ${connected ? 'Connected' : 'Disconnected'}, state:`, this.connection?.state);
    return connected;
  }
}

export const chatHub = new ChatHubClient();