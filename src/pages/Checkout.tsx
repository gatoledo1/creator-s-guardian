import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Check, ArrowLeft, Loader2, CreditCard, QrCode, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    monthly: {
      price: "R$49",
      period: "/mês",
      total: "R$49",
      savings: null,
    },
    yearly: {
      price: "R$39",
      period: "/mês",
      total: "R$470/ano",
      savings: "Economize 20%",
    },
  };

  const features = [
    "Classificação ilimitada com IA",
    "Priorização inteligente de mensagens",
    "Respostas sugeridas por IA",
    "Filtros anti-spam e anti-hate",
    "Identificação de parcerias",
    "Dashboard de analytics",
    "Suporte prioritário",
  ];

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("mercadopago-checkout", {
        body: {
          user_id: user.id,
          user_email: user.email,
          plan_type: selectedPlan,
        },
      });

      if (error) throw error;

      // Redirect to Mercado Pago checkout
      // Use init_point for production, sandbox_init_point for testing
      const checkoutUrl = data.init_point || data.sandbox_init_point;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">DM Focus</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/landing">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">Escolha seu plano</h1>
            <p className="text-muted-foreground">
              Comece a organizar suas DMs hoje mesmo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedPlan === "monthly" 
                  ? "border-primary shadow-lg shadow-primary/10" 
                  : "border-border hover:border-muted-foreground/50"
              }`}
              onClick={() => setSelectedPlan("monthly")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Mensal</h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === "monthly" ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {selectedPlan === "monthly" && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plans.monthly.price}</span>
                  <span className="text-muted-foreground">{plans.monthly.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Cobrado mensalmente
                </p>
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card 
              className={`cursor-pointer transition-all relative ${
                selectedPlan === "yearly" 
                  ? "border-primary shadow-lg shadow-primary/10" 
                  : "border-border hover:border-muted-foreground/50"
              }`}
              onClick={() => setSelectedPlan("yearly")}
            >
              {plans.yearly.savings && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plans.yearly.savings}
                </Badge>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Anual</h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === "yearly" ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {selectedPlan === "yearly" && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plans.yearly.price}</span>
                  <span className="text-muted-foreground">{plans.yearly.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plans.yearly.total} - cobrado anualmente
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features & Checkout */}
          <Card>
            <CardContent className="p-8">
              <h3 className="font-semibold text-lg mb-4">O que está incluso:</h3>
              <ul className="grid md:grid-cols-2 gap-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total hoje</p>
                    <p className="text-2xl font-bold">
                      {selectedPlan === "monthly" ? "R$49" : "R$470"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão</span>
                    <span className="mx-1">·</span>
                    <QrCode className="w-4 h-4" />
                    <span>PIX</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Continuar para pagamento"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Pagamento seguro processado por Mercado Pago.
                  <br />
                  Ao continuar, você concorda com nossos{" "}
                  <Link to="/terms" className="underline hover:text-foreground">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacy" className="underline hover:text-foreground">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
