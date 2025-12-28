import { motion } from 'framer-motion';
import { Clock, ExternalLink, Sparkles } from 'lucide-react';
import { Message, MessageIntent } from '@/types/message';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MessageCardProps {
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
}

const intentLabels: Record<MessageIntent, string> = {
  partnership: 'Parceria',
  question: 'Dúvida',
  fan: 'Fã',
  hate: 'Hate',
  spam: 'Spam',
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export function MessageCard({ message, isSelected, onSelect }: MessageCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(message)}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200",
        isSelected 
          ? "bg-accent border-primary/30 shadow-lg shadow-primary/5" 
          : "bg-card border-border hover:bg-accent/50 hover:border-border/80",
        !message.isRead && "border-l-2 border-l-primary"
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img 
            src={message.author.avatar} 
            alt={message.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {!message.isRead && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground truncate">
              {message.author.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.author.username}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {message.content}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={message.intent}>
              {intentLabels[message.intent]}
            </Badge>
            
            {message.isOpportunity && (
              <Badge variant="opportunity">
                <Sparkles className="w-3 h-3 mr-1" />
                Oportunidade
              </Badge>
            )}

            {message.priority === 'high' && message.intent !== 'hate' && message.intent !== 'spam' && (
              <Badge variant="priority">
                Prioridade
              </Badge>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimestamp(message.timestamp)}
          </span>
          {message.author.followers && message.author.followers > 10000 && (
            <span className="text-xs text-muted-foreground">
              {(message.author.followers / 1000).toFixed(0)}k seguidores
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
