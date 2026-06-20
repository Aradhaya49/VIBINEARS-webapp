// ─── Auth & User ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  is_open_to_talk: boolean;
  latitude?: number;
  longitude?: number;
  distance_meters?: number;
  is_vip: boolean;
  party_streak: number;
  created_at: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  relation?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  phone?: string;
}

// ─── Social ─────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Connection {
  id: number;
  from_user: User;
  to_user: User;
  status: ConnectionStatus;
  created_at: string;
}

export interface NearbyUser extends User {
  distance_meters: number;
}

export interface IcebreakerResponse {
  message: string;
  suggestions: string[];
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'audio' | 'system';

export interface Message {
  id: number;
  conversation: number;
  sender: User | null;
  content: string;
  message_type: MessageType;
  audio_url?: string;
  translated_content?: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}
export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export type AIIntent = 'ORDER' | 'NAVIGATE' | 'CALL' | 'SOS' | 'TRANSLATE' | 'SUGGEST' | 'UNKNOWN';

export interface IntentResponse {
  intent: AIIntent;
  action: string;
  parameters: Record<string, unknown>;
}

export interface TranslateResponse {
  original: string;
  translated: string;
  detected_language: string;
}

export interface SuggestResponse {
  suggestions: string[];
}

// ─── Memory ──────────────────────────────────────────────────────────────────

export interface Memory {
  id: number;
  content: string;
  tags: string[];
  relevance_score: number;
  created_at: string;
}

// ─── SOS ─────────────────────────────────────────────────────────────────────

export type SosTriggerType = 'MANUAL' | 'VOICE' | 'SHAKE';
export type SosStatus = 'ACTIVE' | 'RESOLVED' | 'CANCELLED';

export interface SosEvent {
  id: number;
  latitude: number;
  longitude: number;
  trigger_type: SosTriggerType;
  status: SosStatus;
  audio_url?: string;
  notes?: string;
  created_at: string;
  resolved_at?: string;
}

// ─── Gamification ────────────────────────────────────────────────────────────

export type VipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Badge {
  id: number;
  name: string;
  icon_url: string;
  earned_at: string;
}

export interface GamificationStats {
  party_streak: number;
  total_spent: string;
  vip_points: number;
  tier: VipTier;
  last_activity?: string;
  badges: Badge[];
}

export interface OrderItem {
  name: string;
  price: number;
}

export interface Order {
  id: number;
  venue_id: string;
  items: OrderItem[];
  total_amount: string;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
}

// ─── Location ────────────────────────────────────────────────────────────────

export interface GeoNote {
  id: number;
  latitude: number;
  longitude: number;
  audio_url?: string;
  transcript?: string;
  radius_meters: number;
  expires_at?: string;
  created_at: string;
}

// ─── WebSocket ───────────────────────────────────────────────────────────────

export type WSEventType =
  | 'presence'
  | 'message'
  | 'typing'
  | 'connection_request'
  | 'webrtc_offer'
  | 'webrtc_answer'
  | 'webrtc_ice'
  | 'sos_alert'
  | 'error';

export interface WSPresenceEvent {
  type: 'presence';
  user_id: number;
  is_online: boolean;
  is_open_to_talk: boolean;
}

export interface WSMessageEvent {
  type: 'message';
  conversation_id: number;
  message: {
    id: number;
    sender_id: number;
    content: string;
    created_at: string;
  };
}

export interface WSTypingEvent {
  type: 'typing';
  conversation_id: number;
  user_id: number;
  is_typing: boolean;
}

export interface WSConnectionRequestEvent {
  type: 'connection_request';
  request: Connection;
}

export interface WSSosAlertEvent {
  type: 'sos_alert';
  user_id: number;
  latitude: number;
  longitude: number;
}

export interface WSWebRTCEvent {
  type: 'webrtc_offer' | 'webrtc_answer' | 'webrtc_ice';
  from_user_id?: number;
  peer_id?: number;
  sdp?: string;
  sdp_mid?: string;
  sdp_m_line_index?: number;
}

export type WSEvent =
  | WSPresenceEvent
  | WSMessageEvent
  | WSTypingEvent
  | WSConnectionRequestEvent
  | WSSosAlertEvent
  | WSWebRTCEvent;

// ─── UI ──────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
