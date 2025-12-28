import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, MessageCircle, Clock } from 'lucide-react';

interface StatsHeaderProps {
  totalMessages: number;
  unreadCount: number;
  opportunityCount: number;
  avgResponseTime: string;
}

export function StatsHeader({ 
  totalMessages, 
  unreadCount, 
  opportunityCount,
  avgResponseTime 
}: StatsHeaderProps) {
  const stats = [
    {
      label: 'Não lidas',
      value: unreadCount,
      icon: MessageCircle,
      color: 'text-primary',
    },
    {
      label: 'Oportunidades',
      value: opportunityCount,
      icon: Sparkles,
      color: 'text-partnership',
    },
    {
      label: 'Total hoje',
      value: totalMessages,
      icon: TrendingUp,
      color: 'text-question',
    },
    {
      label: 'Tempo médio',
      value: avgResponseTime,
      icon: Clock,
      color: 'text-fan',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
