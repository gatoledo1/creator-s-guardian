import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, TrendingUp, Clock } from 'lucide-react';

interface MobileStatsHeaderProps {
  unreadCount: number;
  opportunityCount: number;
}

export function MobileStatsHeader({ unreadCount, opportunityCount }: MobileStatsHeaderProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 glass rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-muted text-primary">
          <MessageCircle className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">{unreadCount}</p>
          <p className="text-xs text-muted-foreground">Não lidas</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-shrink-0 glass rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-muted text-partnership">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">{opportunityCount}</p>
          <p className="text-xs text-muted-foreground">Oportunidades</p>
        </div>
      </motion.div>
    </div>
  );
}
