import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  CreditCard,
  Bell,
  Shield,
  Instagram,
  LogOut,
  Crown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const { workspace } = useWorkspace();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.mercadopago_subscription_id) {
      toast.error('Nenhuma assinatura ativa para cancelar');
      return;
    }

    setIsCancelling(true);
    try {
      const { error } = await supabase.functions.invoke('mercadopago-checkout', {
        body: { 
          action: 'cancel',
          subscriptionId: subscription.mercadopago_subscription_id 
        }
      });

      if (error) throw error;

      toast.success('Assinatura cancelada com sucesso');
      // Refresh the page to update subscription status
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Erro ao cancelar assinatura. Tente novamente.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRenewSubscription = () => {
    navigate('/checkout');
  };

  const getStatusBadge = () => {
    if (!subscription) {
      return <Badge variant="outline" className="text-muted-foreground">Sem assinatura</Badge>;
    }

    switch (subscription.status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ativa
          </Badge>
        );
      case 'grace_period':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Período de carência
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Bloqueada
          </Badge>
        );
      case 'pending_deletion':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Aguardando exclusão
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Perfil</CardTitle>
                  <CardDescription>Informações da sua conta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email || 'Não disponível'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Instagram</p>
                    <p className="text-sm text-muted-foreground">
                      {workspace?.instagram_page_id ? 'Conta conectada' : 'Não conectado'}
                    </p>
                  </div>
                </div>
                {workspace?.instagram_page_id ? (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => navigate('/connect-instagram')}>
                    Conectar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Assinatura</CardTitle>
                    {getStatusBadge()}
                  </div>
                  <CardDescription>Gerencie seu plano e pagamentos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ) : subscription ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Plano</p>
                      <p className="text-lg font-semibold text-foreground capitalize">
                        {subscription.plan === 'monthly' ? 'Mensal' : subscription.plan}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {subscription.status === 'active' ? 'Próxima cobrança' : 'Expira em'}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {format(new Date(subscription.expires_at), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {subscription.status === 'grace_period' && subscription.grace_period_until && (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-500">Período de carência</p>
                          <p className="text-sm text-muted-foreground">
                            Sua assinatura expirou. Você tem até{' '}
                            <strong>{format(new Date(subscription.grace_period_until), "dd/MM/yyyy", { locale: ptBR })}</strong>
                            {' '}para renovar e manter acesso total.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription.status === 'blocked' && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Acesso bloqueado</p>
                          <p className="text-sm text-muted-foreground">
                            Sua assinatura foi cancelada. Renove agora para recuperar o acesso completo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3">
                    {(subscription.status === 'grace_period' || subscription.status === 'blocked') && (
                      <Button onClick={handleRenewSubscription} className="flex-1">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Renovar assinatura
                      </Button>
                    )}
                    
                    {subscription.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-destructive hover:text-destructive">
                            Cancelar assinatura
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza que deseja cancelar?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ao cancelar sua assinatura, você terá acesso até{' '}
                              {format(new Date(subscription.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                              Após isso, entrará em período de carência de 7 dias antes do bloqueio total.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSubscription}
                              disabled={isCancelling}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isCancelling ? 'Cancelando...' : 'Sim, cancelar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Crown className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Você ainda não tem uma assinatura ativa</p>
                  <Button onClick={handleRenewSubscription}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Assinar agora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Notificações</CardTitle>
                  <CardDescription>Configure como receber alertas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Notificações por email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas de novas oportunidades
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="partnership-alerts" className="text-sm font-medium">
                    Alertas de parcerias
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado sobre propostas de alto valor
                  </p>
                </div>
                <Switch id="partnership-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Segurança</CardTitle>
                  <CardDescription>Proteja sua conta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sessões ativas</p>
                  <p className="text-sm text-muted-foreground">Gerencie onde você está logado</p>
                </div>
                <Button variant="outline" size="sm">
                  Ver sessões
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-lg text-destructive">Zona de perigo</CardTitle>
                  <CardDescription>Ações irreversíveis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sair da conta</p>
                  <p className="text-sm text-muted-foreground">Encerrar sua sessão atual</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Excluir conta</p>
                  <p className="text-sm text-muted-foreground">
                    Remove permanentemente todos os seus dados
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Excluir conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os seus dados, incluindo mensagens,
                        classificações e configurações serão permanentemente removidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sim, excluir minha conta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
