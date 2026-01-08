import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export function SubscriptionBanner() {
  const navigate = useNavigate();
  const { status, graceDaysRemaining, daysRemaining, isReadOnly, isBlocked } = useSubscription();

  // Active subscription with more than 7 days - no banner
  if (status === 'active' && daysRemaining && daysRemaining > 7) {
    return null;
  }

  // Active but expiring soon
  if (status === 'active' && daysRemaining && daysRemaining <= 7) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3">
        <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-500 font-medium">
            Sua assinatura expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
          </p>
          <p className="text-xs text-amber-500/70">
            Renove para continuar usando todos os recursos
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/checkout')}
          className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0"
        >
          Renovar
        </Button>
      </div>
    );
  }

  // Grace period - read only mode
  if (isReadOnly) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-orange-500 font-medium">
            Sua assinatura expirou - Modo somente leitura
          </p>
          <p className="text-xs text-orange-500/70">
            {graceDaysRemaining !== null && graceDaysRemaining > 0 
              ? `Você tem ${graceDaysRemaining} ${graceDaysRemaining === 1 ? 'dia' : 'dias'} para renovar antes do bloqueio`
              : 'Renove agora para continuar usando a plataforma'}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/checkout')}
          className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
        >
          Renovar Agora
        </Button>
      </div>
    );
  }

  // Blocked
  if (isBlocked) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-destructive font-medium">
            Acesso bloqueado
          </p>
          <p className="text-xs text-destructive/70">
            Sua conta será excluída em 30 dias. Renove para recuperar o acesso.
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/checkout')}
          variant="destructive"
          className="flex-shrink-0"
        >
          Reativar Conta
        </Button>
      </div>
    );
  }

  // No subscription
  if (status === 'none') {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-primary font-medium">
            Período de teste
          </p>
          <p className="text-xs text-primary/70">
            Assine para desbloquear todos os recursos
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/checkout')}
          className="flex-shrink-0"
        >
          Assinar
        </Button>
      </div>
    );
  }

  return null;
}
