import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, MessageSquare, RefreshCw, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CheckoutFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-destructive/20">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-10 h-10 text-destructive" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Pagamento não Aprovado</h1>
            <p className="text-muted-foreground mb-6">
              Infelizmente não foi possível processar seu pagamento. Por favor, tente novamente.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Possíveis motivos:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Saldo insuficiente no cartão</li>
                <li>• Dados do cartão incorretos</li>
                <li>• Limite de transação excedido</li>
                <li>• Cartão bloqueado pelo banco</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                className="w-full" 
                onClick={() => navigate("/checkout")}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => navigate("/landing")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Precisa de ajuda? suporte@dmfocus.com
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

export default CheckoutFailure;
