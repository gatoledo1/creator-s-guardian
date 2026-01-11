import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ExternalLink, Clock, Users, Sparkles, X, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Message, MessageIntent } from '@/types/message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MobileMessageDetailProps {
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

export function MobileMessageDetail({ message, onClose, onSendReply, sendingReply }: MobileMessageDetailProps) {
  const [copied, setCopied] = useState(false);
  const [reply, setReply] = useState('');

  if (!message) return null;

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
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 bg-background z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img 
            src={message.author.avatar} 
            alt={message.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {message.author.name}
            </h2>
            <p className="text-xs text-muted-foreground">{message.author.username}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Badges */}
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
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(message.timestamp)}
            </span>
          </div>

          {/* Original message */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Mensagem</h3>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-foreground text-sm leading-relaxed">{message.content}</p>
            </div>
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
              </div>
              <div className="p-4 rounded-xl bg-partnership/5 border border-partnership/20 mb-3">
                <p className="text-sm text-foreground leading-relaxed">{message.suggestedReply}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleUseReply}
                  className="flex-1"
                >
                  Usar resposta
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Reply box */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={canSendReply ? "Digite sua resposta..." : "Conecte o Instagram para responder"}
              disabled={!canSendReply || sendingReply}
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm disabled:opacity-50"
              rows={2}
            />
            <Button 
              variant="glow" 
              size="icon" 
              className="h-auto aspect-square self-end"
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
