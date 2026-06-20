import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles, ArrowLeft, Phone, MoreVertical, Check, CheckCheck, MessageCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Waveform } from '@/components/ui/Waveform';
import { TopBar } from '@/components/layout/TopBar';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { useSocialStore } from '@/store/social.store';
import { useUIStore } from '@/store/ui.store';
import wsService from '@/services/websocket.service';
import { formatTime, formatTimeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Conversation, Message } from '@/types';

function ConversationList({ conversations, activeId }: { conversations: Conversation[]; activeId?: number }) {
  const navigate = useNavigate();
  const { onlineUsers } = useSocialStore();
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h2 className="font-display font-semibold text-white text-lg">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-sm">No conversations yet</div>
        ) : (
          conversations.map((conv) => {
            const other = conv.participants.find((p) => p.id !== user?.id);
            if (!other) return null;
            return (
              <motion.div
                key={conv.id}
                whileHover={{ x: 2 }}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                  activeId === conv.id ? 'bg-neon-purple/15 border border-neon-purple/20' : 'hover:bg-white/5'
                )}
              >
                <Avatar
                  src={other.avatar_url}
                  name={other.username}
                  size="md"
                  isOnline={onlineUsers.has(other.id)}
                  isVip={other.is_vip}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">{other.username}</p>
                    {conv.last_message && (
                      <span className="text-xs text-white/30 flex-shrink-0 ml-2">
                        {formatTime(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-white/40 truncate">
                      {conv.last_message?.content ?? 'Start a conversation'}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-neon-purple text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn('flex gap-2 max-w-[80%]', isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto')}
    >
      {!isOwn && message.sender && (
        <Avatar src={message.sender.avatar_url} name={message.sender.username} size="xs" className="mt-auto mb-1" />
      )}
      <div>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-gradient-to-br from-neon-purple to-neon-blue text-white rounded-br-sm'
              : 'bg-white/8 text-white/90 border border-white/10 rounded-bl-sm'
          )}
        >
          {message.content}
        </div>
        <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] text-white/30">{formatTime(message.created_at)}</span>
          {isOwn && (
            message.is_read
              ? <CheckCheck className="w-3 h-3 text-neon-cyan" />
              : <Check className="w-3 h-3 text-white/30" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ChatWindow({ conversationId }: { conversationId: number }) {
  const { user } = useAuthStore();
  const { messages, addMessage, typingUsers } = useChatStore();
  const { onlineUsers } = useSocialStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: conv } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatService.getConversations().then((cs) => cs.find((c) => c.id === conversationId)),
  });

  const { data: msgHistory } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', conversationId],
    queryFn: () => chatService.getSuggestedReplies(conversationId),
    enabled: showSuggestions,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage(conversationId, { content, message_type: 'text' }),
    onSuccess: (msg) => {
      addMessage(conversationId, msg);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => addNotification({ type: 'error', title: 'Failed to send message' }),
  });

  const allMessages = [
    ...(msgHistory?.results ?? []),
    ...(messages[conversationId] ?? []).filter(
      (m) => !msgHistory?.results.some((h) => h.id === m.id)
    ),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const other = conv?.participants.find((p) => p.id !== user?.id);
  const typingSet = typingUsers[conversationId];
  const otherIsTyping = other && typingSet?.has(other.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length, otherIsTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      wsService.sendTyping(conversationId, true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      wsService.sendTyping(conversationId, false);
    }, 1500);
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    setInput('');
    sendMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-bg-dark/60 backdrop-blur-xl">
        <button onClick={() => window.history.back()} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/60">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {other && (
          <>
            <Avatar
              src={other.avatar_url}
              name={other.username}
              size="md"
              isOnline={onlineUsers.has(other.id)}
              isVip={other.is_vip}
            />
            <div className="flex-1">
              <p className="font-semibold text-white">{other.username}</p>
              <p className="text-xs text-white/40">
                {onlineUsers.has(other.id) ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {allMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender?.id === user?.id} />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {otherIsTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2"
            >
              <Avatar src={other?.avatar_url} name={other?.username ?? ''} size="xs" />
              <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/8 border border-white/10">
                <Waveform isActive bars={5} color="#A1A1AA" size="sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions?.suggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide"
          >
            {suggestions.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); setShowSuggestions(false); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-xs text-neon-purple hover:bg-neon-purple/20 transition-all"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-bg-dark/40 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSuggestions((v) => !v)}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              showSuggestions ? 'bg-neon-pink/20 text-neon-pink' : 'bg-white/5 text-white/40 hover:text-white'
            )}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-neon-purple/40 transition-all"
          />
          <button className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
            <Mic className="w-4 h-4" />
          </button>
          <Button
            variant="neon"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2.5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const { id } = useParams<{ id?: string }>();
  const conversationId = id ? parseInt(id) : undefined;

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatService.getConversations,
  });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversation list */}
      <div className={cn(
        'w-full lg:w-80 border-r border-white/5 bg-bg-dark/40 flex-shrink-0',
        conversationId ? 'hidden lg:flex flex-col' : 'flex flex-col'
      )}>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded animate-pulse w-24" />
                  <div className="h-2.5 bg-white/5 rounded animate-pulse w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ConversationList conversations={conversations ?? []} activeId={conversationId} />
        )}
      </div>

      {/* Chat window */}
      <div className={cn(
        'flex-1',
        !conversationId ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'
      )}>
        {conversationId ? (
          <ChatWindow conversationId={conversationId} />
        ) : (
          <div className="text-center text-white/30">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}


