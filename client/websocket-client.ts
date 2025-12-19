// WebSocket client for IOS CLI Trainer

export interface WSMessage {
  type: string;
  data?: any;
}

export type MessageHandler = (message: WSMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: Event) => void;
  
  constructor() {}
  
  public connect(url: string): void {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      if (this.onOpenCallback) {
        this.onOpenCallback();
      }
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;
        this.dispatchMessage(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    
    this.ws.onclose = () => {
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    };
    
    this.ws.onerror = (error) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    };
  }
  
  public on(messageType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }
  
  public onOpen(callback: () => void): void {
    this.onOpenCallback = callback;
  }
  
  public onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }
  
  public onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }
  
  public send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  public close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
  
  private dispatchMessage(message: WSMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(message);
      }
    }
  }
}

