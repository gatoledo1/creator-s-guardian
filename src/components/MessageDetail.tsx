import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ExternalLink, Clock, Users, Sparkles, X, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Message, MessageIntent } from '@/types/message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageDetailProps {
  message: Message | null;
  onClose: () => void;
  onSendReply?: (recipientId: string, message: string, messageId: string) => Promise<boolean>;
  sendingReply?: boolean;
}

const intentLabels: Record<MessageIntent, string> = {
  partnership: 'Parceria',
  question: 'Dúvida',
  fan: 'Fã',
  hate: 'Hate',
  spam: 'Spam',
};

const intentDescriptions: Record<MessageIntent, string> = {
  partnership: 'Esta mensagem parece ser uma proposta de parceria ou colaboração comercial.',
  question: 'O remetente está fazendo uma pergunta sobre seu conteúdo ou processo.',
  fan: 'Uma mensagem positiva de apoio ao seu trabalho.',
  hate: 'Mensagem negativa ou crítica destrutiva. Considere ignorar.',
  spam: 'Conteúdo promocional não solicitado. Recomendamos ignorar.',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function MessageDetail({ message, onClose, onSendReply, sendingReply }: MessageDetailProps) {
  const [copied, setCopied] = useState(false);
  const [reply, setReply] = useState('');

  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Selecione uma mensagem para ver os detalhes</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    if (message.suggestedReply) {
      navigator.clipboard.writeText(message.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseReply = () => {
    if (message.suggestedReply) {
      setReply(message.suggestedReply);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !message.senderInstagramId || !onSendReply) return;
    
    const success = await onSendReply(message.senderInstagramId, reply, message.id);
    if (success) {
      setReply('');
    }
  };

  const canSendReply = !!message.senderInstagramId && !!onSendReply;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        className="flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <img 
                src={message.author.avatar} 
                alt={message.author.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
              />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {message.author.name}
                </h2>
                <p className="text-sm text-muted-foreground">{message.author.username}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={message.intent}>
              {intentLabels[message.intent]}
            </Badge>
            {message.isOpportunity && (
              <Badge variant="opportunity">
                <Sparkles className="w-3 h-3 mr-1" />
                Oportunidade
              </Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(message.timestamp)}
            </span>
            {message.author.followers && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                {message.author.followers.toLocaleString()} seguidores
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Original message */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Mensagem</h3>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-foreground leading-relaxed">{message.content}</p>
            </div>
            {message.context && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {message.context} • {message.channel}
              </p>
            )}
          </div>

          {/* AI Analysis */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Análise da IA</h3>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground">{intentDescriptions[message.intent]}</p>
            </div>
          </div>

          {/* Suggested Reply */}
          {message.suggestedReply && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Resposta sugerida</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopy}
                    className="text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleUseReply}
                    className="text-xs"
                  >
                    Usar resposta
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-partnership/5 border border-partnership/20">
                <p className="text-sm text-foreground leading-relaxed">{message.suggestedReply}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reply box */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={canSendReply ? "Digite sua resposta..." : "Conecte o Instagram para responder"}
              disabled={!canSendReply || sendingReply}
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm disabled:opacity-50"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && canSendReply) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <Button 
              variant="glow" 
              size="icon" 
              className="h-auto aspect-square"
              onClick={handleSendReply}
              disabled={!reply.trim() || !canSendReply || sendingReply}
            >
              {sendingReply ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!canSendReply && (
            <p className="text-xs text-muted-foreground mt-2">
              O ID do remetente não está disponível para esta mensagem.
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
