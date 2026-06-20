import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Brain, Sparkles, Zap, Volume2, Languages, Search } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Waveform } from '@/components/ui/Waveform';
import { Input } from '@/components/ui/Input';
import { TopBar } from '@/components/layout/TopBar';
import { aiService } from '@/services/ai.service';
import { memoryService } from '@/services/memory.service';
import { useVoice } from '@/hooks/useVoice';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/utils/cn';
import type { AIIntent } from '@/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: AIIntent;
  suggestions?: string[];
  timestamp: Date;
}

const intentColors: Record<AIIntent, string> = {
  ORDER: 'text-neon-gold',
  NAVIGATE: 'text-neon-blue',
  CALL: 'text-neon-cyan',
  SOS: 'text-red-400',
  TRANSLATE: 'text-neon-pink',
  SUGGEST: 'text-neon-purple',
  UNKNOWN: 'text-white/40',
};

const intentIcons: Record<AIIntent, string> = {
  ORDER: '🍹',
  NAVIGATE: '🗺️',
  CALL: '📞',
  SOS: '🚨',
  TRANSLATE: '🌐',
  SUGGEST: '✨',
  UNKNOWN: '🤖',
};

export function AIAssistant() {
  const { addNotification } = useUIStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hey! I'm Nova AI. I can help you find people, order drinks, navigate, translate, or just chat. Try speaking or typing!",
      timestamp: new Date(),
    },
  ]);
  const [textInput, setTextInput] = useState('');
  const [memoryQuery, setMemoryQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'translate'>('chat');
  const [translateText, setTranslateText] = useState('');
  const [targetLang, setTargetLang] = useState('es');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, audioLevel, toggleListening } = useVoice((text) => {
    handleSend(text);
  });

  const intentMutation = useMutation({
    mutationFn: (transcript: string) => aiService.processIntent(transcript),
    onSuccess: (data, transcript) => {
      const msg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.action || `Detected intent: ${data.intent}`,
        intent: data.intent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
    },
  });

  const suggestMutation = useMutation({
    mutationFn: (msgs: ChatMessage[]) =>
      aiService.getSuggestions(
        msgs.map((m) => ({ role: m.role, content: m.content }))
      ),
    onSuccess: (data) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, suggestions: data.suggestions }];
        }
        return prev;
      });
    },
  });

  const translateMutation = useMutation({
    mutationFn: () => aiService.translate(translateText, targetLang),
  });

  const { data: memories, refetch: searchMemories, isFetching: searchingMemories } = useQuery({
    queryKey: ['memories', memoryQuery],
    queryFn: () => memoryService.searchMemories(memoryQuery),
    enabled: false,
  });

  const handleSend = async (text?: string) => {
    const content = text ?? textInput.trim();
    if (!content) return;
    setTextInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    intentMutation.mutate(content);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <TopBar title="Nova AI" />

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-3 border-b border-white/5 bg-bg-dark/40">
        {([
          { id: 'chat', icon: Zap, label: 'Chat' },
          { id: 'memory', icon: Brain, label: 'Memory' },
          { id: 'translate', icon: Languages, label: 'Translate' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === id
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chat tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Voice visualizer */}
          <div className="p-4 flex justify-center">
            <motion.div
              animate={isListening ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                'relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all',
                isListening
                  ? 'bg-gradient-to-br from-neon-pink to-neon-purple shadow-neon-pink'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              )}
              onClick={toggleListening}
            >
              {isListening && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-neon-pink/50"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-neon-purple/30"
                    animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}
              {isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white/60" />
              )}
            </motion.div>
          </div>

          {isListening && (
            <div className="px-4 pb-2 flex flex-col items-center gap-2">
              <Waveform isActive audioLevel={audioLevel} bars={24} color="#EC4899" size="md" />
              {transcript && (
                <p className="text-sm text-white/60 italic text-center max-w-xs">"{transcript}"</p>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3 max-w-[85%]', msg.role === 'user' ? 'ml-auto flex-row-reverse' : '')}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="space-y-2">
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-neon-purple to-neon-blue text-white rounded-br-sm'
                        : 'bg-white/8 border border-white/10 text-white/90 rounded-bl-sm'
                    )}
                  >
                    {msg.intent && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span>{intentIcons[msg.intent]}</span>
                        <span className={cn('text-xs font-medium', intentColors[msg.intent])}>
                          {msg.intent}
                        </span>
                      </div>
                    )}
                    {msg.content}
                  </div>
                  {msg.suggestions && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s)}
                          className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-xs text-neon-purple hover:bg-neon-purple/20 transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {intentMutation.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/8 border border-white/10">
                  <Waveform isActive bars={6} color="#EC4899" size="sm" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Nova anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-neon-purple/40 transition-all"
              />
              <Button variant="neon" size="sm" onClick={() => handleSend()} disabled={!textInput.trim()} className="px-3">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Memory tab */}
      {activeTab === 'memory' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <GlassCard className="p-5" animate={false}>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-neon-purple" />
              Semantic Memory Search
            </h3>
            <div className="flex gap-2">
              <input
                value={memoryQuery}
                onChange={(e) => setMemoryQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchMemories()}
                placeholder="Search your memories..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-neon-purple/40 transition-all"
              />
              <Button variant="neon" size="sm" onClick={() => searchMemories()} loading={searchingMemories} className="px-3">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>

          {memories && memories.length > 0 && (
            <div className="space-y-3">
              {memories.map((m) => (
                <GlassCard key={m.id} className="p-4" animate={false}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-white/80 flex-1">{m.content}</p>
                    <Badge variant="purple" size="sm">{Math.round(m.relevance_score * 100)}%</Badge>
                  </div>
                  {m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {m.tags.map((t) => (
                        <Badge key={t} variant="ghost" size="sm">#{t}</Badge>
                      ))}
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}

          {memories?.length === 0 && (
            <div className="text-center py-12 text-white/30">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No memories found</p>
            </div>
          )}
        </div>
      )}

      {/* Translate tab */}
      {activeTab === 'translate' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <GlassCard className="p-5" animate={false}>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Languages className="w-5 h-5 text-neon-pink" />
              AI Translation
            </h3>
            <div className="space-y-4">
              <textarea
                value={translateText}
                onChange={(e) => setTranslateText(e.target.value)}
                placeholder="Enter text to translate..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-neon-pink/40 transition-all resize-none"
              />
              <div className="flex items-center gap-3">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                >
                  {[['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['ja', 'Japanese'], ['zh', 'Chinese'], ['ar', 'Arabic'], ['pt', 'Portuguese']].map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <Button
                  variant="neon"
                  size="md"
                  onClick={() => translateMutation.mutate()}
                  loading={translateMutation.isPending}
                  disabled={!translateText.trim()}
                >
                  Translate
                </Button>
              </div>
            </div>
          </GlassCard>

          {translateMutation.data && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-5" animate={false}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="pink" size="sm">{translateMutation.data.detected_language} → {targetLang}</Badge>
                </div>
                <p className="text-white text-sm leading-relaxed">{translateMutation.data.translated}</p>
                <button className="mt-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                  Listen
                </button>
              </GlassCard>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
