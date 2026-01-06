import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MessageSquare, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Could trigger confetti or analytics here
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground mb-6">
              Sua assinatura do DM Focus Pro está ativa. Bem-vindo à família!
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Próximos passos:</h3>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  Conecte sua conta do Instagram
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  Aguarde a sincronização das DMs
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  Comece a gerenciar suas mensagens com IA!
                </li>
              </ol>
            </div>

            <Button className="w-full" size="lg" onClick={() => navigate("/")}>
              Acessar Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Você receberá um email de confirmação em breve.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/landing" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            DM Focus
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
