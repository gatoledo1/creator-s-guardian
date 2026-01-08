import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClassificationPendingBadgeProps {
  status: 'pending' | 'processing' | 'classified' | 'skipped';
}

export function ClassificationPendingBadge({ status }: ClassificationPendingBadgeProps) {
  if (status === 'classified' || status === 'skipped') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs"
    >
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>
        {status === 'pending' ? 'Na fila' : 'Processando...'}
      </span>
    </motion.div>
  );
}
