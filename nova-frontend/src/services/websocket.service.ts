import { getAccessToken } from './api';
import type { WSEvent } from '@/types';

type EventHandler = (event: WSEvent) => void;
type ConnectionHandler = () => void;

class NovaWebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Set<EventHandler> = new Set();
  private onConnectHandlers: Set<ConnectionHandler> = new Set();
  private onDisconnectHandlers: Set<ConnectionHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isIntentionalClose = false;

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect() {
    const token = getAccessToken();
    if (!token) return;

    this.isIntentionalClose = false;
    const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    this.ws = new WebSocket(`${wsBase}/ws/?token=${token}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onConnectHandlers.forEach((h) => h());
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSEvent;
        this.handlers.forEach((h) => h(data));
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.onDisconnectHandlers.forEach((h) => h());
      if (!this.isIntentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  disconnect() {
    this.isIntentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  send(data: Record<string, unknown>) {
    if (this.isConnected) {
      this.ws!.send(JSON.stringify(data));
    }
  }

  // Presence
  sendPresence(is_open_to_talk: boolean) {
    this.send({ type: 'presence', is_open_to_talk });
  }

  // Chat
  sendMessage(conversation_id: number, content: string) {
    this.send({ type: 'message', conversation_id, content });
  }

  sendTyping(conversation_id: number, is_typing: boolean) {
    this.send({ type: 'typing', conversation_id, is_typing });
  }

  // WebRTC
  sendWebRTCOffer(peer_id: number, sdp: string) {
    this.send({ type: 'webrtc_offer', peer_id, sdp });
  }

  sendWebRTCAnswer(peer_id: number, sdp: string) {
    this.send({ type: 'webrtc_answer', peer_id, sdp });
  }

  sendWebRTCIce(peer_id: number, sdp_mid: string, sdp_m_line_index: number, sdp: string) {
    this.send({ type: 'webrtc_ice', peer_id, sdp_mid, sdp_m_line_index, sdp });
  }

  // Event subscription
  on(handler: EventHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler) {
    this.onConnectHandlers.add(handler);
    return () => this.onConnectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler) {
    this.onDisconnectHandlers.add(handler);
    return () => this.onDisconnectHandlers.delete(handler);
  }
}

export const wsService = new NovaWebSocketService();
export default wsService;
