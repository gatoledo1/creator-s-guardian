import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MessageCard } from './MessageCard';
import { MessageDetail } from './MessageDetail';
import { StatsHeader } from './StatsHeader';
import { mockMessages } from '@/data/mockMessages';
import { Message, MessageIntent } from '@/types/message';

type FilterType = MessageIntent | 'all' | 'opportunities';

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = useMemo(() => {
    let messages = mockMessages;

    // Apply intent filter
    if (activeFilter === 'opportunities') {
      messages = messages.filter(m => m.isOpportunity);
    } else if (activeFilter !== 'all') {
      messages = messages.filter(m => m.intent === activeFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      messages = messages.filter(m => 
        m.content.toLowerCase().includes(query) ||
        m.author.name.toLowerCase().includes(query) ||
        m.author.username.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    return messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activeFilter, searchQuery]);

  const counts = useMemo(() => ({
    all: mockMessages.length,
    opportunities: mockMessages.filter(m => m.isOpportunity).length,
    partnership: mockMessages.filter(m => m.intent === 'partnership').length,
    question: mockMessages.filter(m => m.intent === 'question').length,
    fan: mockMessages.filter(m => m.intent === 'fan').length,
    hate: mockMessages.filter(m => m.intent === 'hate').length,
    spam: mockMessages.filter(m => m.intent === 'spam').length,
  }), []);

  const stats = useMemo(() => ({
    totalMessages: mockMessages.length,
    unreadCount: mockMessages.filter(m => !m.isRead).length,
    opportunityCount: mockMessages.filter(m => m.isOpportunity).length,
    avgResponseTime: '2.4h',
  }), []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        counts={counts}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas mensagens e oportunidades
              </p>
            </div>
          </div>
          
          <StatsHeader {...stats} />
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Message List */}
          <div className="w-96 flex flex-col">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar mensagens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  isSelected={selectedMessage?.id === message.id}
                  onSelect={setSelectedMessage}
                />
              ))}
              
              {filteredMessages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <p>Nenhuma mensagem encontrada</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <MessageDetail 
            message={selectedMessage} 
            onClose={() => setSelectedMessage(null)}
          />
        </div>
      </main>
    </div>
  );
}
