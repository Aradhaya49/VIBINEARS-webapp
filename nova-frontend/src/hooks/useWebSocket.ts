import { useEffect, useRef } from 'react';
import wsService from '@/services/websocket.service';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useChatStore } from '@/store/chat.store';
import { useSocialStore } from '@/store/social.store';
import type { WSEvent, Message } from '@/types';

export function useWebSocket() {
  const { isAuthenticated } = useAuthStore();
  const { setWSConnected, addNotification } = useUIStore();
  const { addMessage, setTyping, updateConversationLastMessage } = useChatStore();
  const { setUserOnline, setUserOpenToTalk, addPendingConnection } = useSocialStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;
    initialized.current = true;

    wsService.connect();

    const unsubConnect = wsService.onConnect(() => setWSConnected(true));
    const unsubDisconnect = wsService.onDisconnect(() => setWSConnected(false));

    const unsubEvents = wsService.on((event: WSEvent) => {
      switch (event.type) {
        case 'presence':
          setUserOnline(event.user_id, event.is_online);
          setUserOpenToTalk(event.user_id, event.is_open_to_talk);
          break;

        case 'message': {
          const msg: Message = {
            id: event.message.id,
            conversation: event.conversation_id,
            sender: null, // will be resolved from participants
            content: event.message.content,
            message_type: 'text',
            is_read: false,
            created_at: event.message.created_at,
          };
          addMessage(event.conversation_id, msg);
          updateConversationLastMessage(event.conversation_id, msg);
          break;
        }

        case 'typing':
          setTyping(event.conversation_id, event.user_id, event.is_typing);
          break;

        case 'connection_request':
          addPendingConnection(event.request);
          addNotification({
            type: 'info',
            title: 'Connection Request',
            message: `${event.request.from_user.username} wants to connect`,
          });
          break;

        case 'sos_alert':
          addNotification({
            type: 'error',
            title: '🚨 SOS Alert',
            message: `User ${event.user_id} triggered an emergency`,
            duration: 0,
          });
          break;

        default:
          break;
      }
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubEvents();
      wsService.disconnect();
      initialized.current = false;
    };
  }, [isAuthenticated]);
}
