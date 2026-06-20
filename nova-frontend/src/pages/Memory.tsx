import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Search, Plus, Tag, Clock, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TopBar } from '@/components/layout/TopBar';
import { memoryService } from '@/services/memory.service';
import { useUIStore } from '@/store/ui.store';
import { formatTimeAgo } from '@/utils/format';

export function Memory() {
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: memories, refetch, isFetching } = useQuery({
    queryKey: ['memories-search', query],
    queryFn: () => memoryService.searchMemories(query || 'recent'),
    enabled: true,
  });

  const storeMutation = useMutation({
    mutationFn: () =>
      memoryService.storeMemory(
        newContent,
        newTags.split(',').map((t) => t.trim()).filter(Boolean)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories-search'] });
      setNewContent('');
      setNewTags('');
      setShowAdd(false);
      addNotification({ type: 'success', title: 'Memory stored!' });
    },
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Memory" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && refetch()}
                placeholder="Search memories..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-neon-purple/40 transition-all"
              />
            </div>
            <Button variant="neon" size="sm" onClick={() => refetch()} loading={isFetching}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowAdd((v) => !v)}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Add memory form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-5" animate={false}>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-neon-purple" />
                Store New Memory
              </h3>
              <div className="space-y-3">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What do you want to remember?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-neon-purple/40 transition-all resize-none"
                />
                <Input
                  placeholder="Tags (comma separated)"
                  icon={<Tag className="w-4 h-4" />}
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="neon" size="sm" onClick={() => storeMutation.mutate()} loading={storeMutation.isPending} disabled={!newContent.trim()} className="flex-1">
                    Store Memory
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Memories grid */}
        {!memories || memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Brain className="w-12 h-12 text-white/20 mb-3" />
            <p className="text-white/50">No memories found</p>
            <p className="text-white/30 text-sm mt-1">Try a different search or add a new memory</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <GlassCard className="p-4 h-full" animate={false}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-neon-purple" />
                    </div>
                    <Badge variant="purple" size="sm">{Math.round(m.relevance_score * 100)}% match</Badge>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed mb-3">{m.content}</p>
                  {m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {m.tags.map((t) => (
                        <Badge key={t} variant="ghost" size="sm">#{t}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(m.created_at)}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
