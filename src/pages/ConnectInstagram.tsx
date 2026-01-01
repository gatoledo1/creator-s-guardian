import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ConnectInstagram() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [connectedUsername, setConnectedUsername] = useState('');

  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Handle OAuth callback
  useEffect(() => {
    if (error) {
      setStatus('error');
      setErrorMessage('Acesso negado ou cancelado pelo usuário');
      return;
    }

    if (code && user) {
      exchangeToken(code);
    }
  }, [code, error, user]);

  const exchangeToken = async (authCode: string) => {
    setStatus('loading');
    try {
      const redirectUri = `${window.location.origin}/connect-instagram`;
      
      const { data, error: fnError } = await supabase.functions.invoke('instagram-oauth', {
        body: {
          code: authCode,
          redirect_uri: redirectUri,
          user_id: user?.id,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add action param via query string workaround
      const response = await fetch(
        `https://rwjaslzuxsalsspjqaig.supabase.co/functions/v1/instagram-oauth?action=exchange_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            code: authCode,
            redirect_uri: redirectUri,
            user_id: user?.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erro ao conectar Instagram');
      }

      setConnectedUsername(result.username);
      setStatus('success');
      toast.success('Instagram conectado com sucesso!');
      
      // Redirect after success
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Token exchange error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const startOAuth = async () => {
    setStatus('loading');
    try {
      const redirectUri = `${window.location.origin}/connect-instagram`;
      
      const response = await fetch(
        `https://rwjaslzuxsalsspjqaig.supabase.co/functions/v1/instagram-oauth?action=get_auth_url&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro ao iniciar conexão');
      }

      window.location.href = data.auth_url;
    } catch (err) {
      console.error('OAuth start error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Erro ao iniciar conexão');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Conectar Instagram</h1>
            <p className="text-muted-foreground mt-2">
              Conecte sua conta profissional do Instagram para receber DMs
            </p>
          </div>

          {/* Status Content */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
                <p>✓ Receba DMs em tempo real</p>
                <p>✓ Classificação automática por IA</p>
                <p>✓ Identifique oportunidades de parceria</p>
              </div>
              
              <Button 
                onClick={startOAuth}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white"
                size="lg"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Conectar com Instagram
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Conectando ao Instagram...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Conectado!</h2>
              <p className="text-muted-foreground">
                @{connectedUsername} foi conectado com sucesso
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecionando...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Erro na conexão</h2>
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              
              <div className="space-y-2">
                <Button onClick={startOAuth} className="w-full">
                  Tentar novamente
                </Button>
                <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
                  Voltar ao início
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Você precisa de uma conta profissional do Instagram conectada a uma página do Facebook
        </p>
      </motion.div>
    </div>
  );
}
