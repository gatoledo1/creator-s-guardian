import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Menu, Instagram, Loader2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { MessageCard } from './MessageCard';
import { MessageDetail } from './MessageDetail';
import { MobileMessageDetail } from './MobileMessageDetail';
import { StatsHeader } from './StatsHeader';
import { MobileStatsHeader } from './MobileStatsHeader';
import { mockMessages } from '@/data/mockMessages';
import { Message, MessageIntent } from '@/types/message';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspace } from '@/hooks/useWorkspace';

type FilterType = MessageIntent | 'all' | 'opportunities';

export function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, loading: workspaceLoading } = useWorkspace();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const filteredMessages = useMemo(() => {
    let messages = mockMessages;

    if (activeFilter === 'opportunities') {
      messages = messages.filter(m => m.isOpportunity);
    } else if (activeFilter !== 'all') {
      messages = messages.filter(m => m.intent === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      messages = messages.filter(m => 
        m.content.toLowerCase().includes(query) ||
        m.author.name.toLowerCase().includes(query) ||
        m.author.username.toLowerCase().includes(query)
      );
    }

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

  // Loading state
  if (workspaceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not connected - show connect prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Instagram className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Conecte seu Instagram
          </h1>
          <p className="text-muted-foreground mb-6">
            Para começar a receber e classificar suas DMs automaticamente, conecte sua conta profissional do Instagram.
          </p>
          <Button
            onClick={() => navigate('/connect-instagram')}
            size="lg"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white"
          >
            <Instagram className="w-5 h-5 mr-2" />
            Conectar Instagram
          </Button>
        </motion.div>
      </div>
    );
  }

  // Mobile Layout
  const filterLabels: Record<FilterType, string> = {
    all: 'Todas',
    opportunities: 'Oportunidades',
    partnership: 'Parcerias',
    question: 'Dúvidas',
    fan: 'Fãs',
    hate: 'Hate',
    spam: 'Spam',
  };
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Inbox</h1>
                <p className="text-xs text-muted-foreground">
                  {filterLabels[activeFilter]}
                </p>
              </div>
            </div>
          </div>

          <MobileStatsHeader 
            unreadCount={stats.unreadCount} 
            opportunityCount={stats.opportunityCount} 
          />

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar mensagens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
        </header>

        {/* Message List */}
        <main className="flex-1 overflow-y-auto p-4 space-y-2">
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
        </main>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        {/* Mobile Message Detail */}
        {selectedMessage && (
          <MobileMessageDetail
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </div>
    );
  }

  // Desktop Layout
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
