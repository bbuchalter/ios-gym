// WebSocket client for IOS CLI Trainer
export class WebSocketClient {
    constructor() {
        this.ws = null;
        this.messageHandlers = new Map();
    }
    connect(url) {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => {
            if (this.onOpenCallback) {
                this.onOpenCallback();
            }
        };
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.dispatchMessage(message);
            }
            catch (error) {
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
    on(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);
    }
    onOpen(callback) {
        this.onOpenCallback = callback;
    }
    onClose(callback) {
        this.onCloseCallback = callback;
    }
    onError(callback) {
        this.onErrorCallback = callback;
    }
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
    isConnected() {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
    dispatchMessage(message) {
        const handlers = this.messageHandlers.get(message.type);
        if (handlers) {
            for (const handler of handlers) {
                handler(message);
            }
        }
    }
}
