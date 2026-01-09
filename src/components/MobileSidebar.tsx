import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Sparkles, 
  Users, 
  MessageCircle, 
  Heart, 
  AlertTriangle, 
  Trash2,
  TrendingUp,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { MessageIntent } from '@/types/message';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: MessageIntent | 'all' | 'opportunities';
  onFilterChange: (filter: MessageIntent | 'all' | 'opportunities') => void;
  counts: Record<string, number>;
}

const filters = [
  { id: 'all' as const, label: 'Todas', icon: Inbox },
  { id: 'opportunities' as const, label: 'Oportunidades', icon: Sparkles },
  { id: 'partnership' as const, label: 'Parcerias', icon: TrendingUp },
  { id: 'question' as const, label: 'Dúvidas', icon: MessageCircle },
  { id: 'fan' as const, label: 'Fãs', icon: Heart },
  { id: 'hate' as const, label: 'Hate', icon: AlertTriangle },
  { id: 'spam' as const, label: 'Spam', icon: Trash2 },
];

export function MobileSidebar({ isOpen, onClose, activeFilter, onFilterChange, counts }: MobileSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleFilterChange = (filter: MessageIntent | 'all' | 'opportunities') => {
    onFilterChange(filter);
    onClose();
  };

  const handleSettingsClick = () => {
    onClose();
    navigate('/settings');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">Backstage</h1>
                  <p className="text-xs text-muted-foreground">Copilot para criadores</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.id;
                const count = counts[filter.id] || 0;
                const Icon = filter.icon;
                
                return (
                  <motion.button
                    key={filter.id}
                    onClick={() => handleFilterChange(filter.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      filter.id === 'partnership' && "text-partnership",
                      filter.id === 'question' && "text-question",
                      filter.id === 'fan' && "text-fan",
                      filter.id === 'hate' && "text-hate",
                      filter.id === 'spam' && "text-spam",
                      filter.id === 'opportunities' && "text-primary",
                    )} />
                    <span className="flex-1 text-left">{filter.label}</span>
                    {count > 0 && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        isActive 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-fan/60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">@seuperfil</p>
                  <p className="text-xs text-muted-foreground">Instagram conectado</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSettingsClick}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
