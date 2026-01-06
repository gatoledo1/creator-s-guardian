import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
              <p className="text-muted-foreground mb-8">Última atualização: Janeiro de 2025</p>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
                  <p className="text-muted-foreground">
                    A DM Focus ("nós", "nosso" ou "Empresa") está comprometida em proteger sua privacidade. 
                    Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos 
                    suas informações quando você usa nosso serviço de gerenciamento de mensagens diretas do Instagram.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Informações que Coletamos</h2>
                  <p className="text-muted-foreground mb-3">Coletamos os seguintes tipos de informações:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Informações de conta:</strong> Nome, email e informações do perfil do Instagram.</li>
                    <li><strong>Mensagens diretas:</strong> Conteúdo das DMs recebidas através da integração com Instagram para classificação e análise.</li>
                    <li><strong>Dados de uso:</strong> Informações sobre como você usa nosso serviço, incluindo logs de acesso e interações.</li>
                    <li><strong>Informações de pagamento:</strong> Dados de cobrança processados por nossos parceiros de pagamento (Stripe/Mercado Pago).</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Como Usamos Suas Informações</h2>
                  <p className="text-muted-foreground mb-3">Utilizamos suas informações para:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Classificar e priorizar suas mensagens diretas usando inteligência artificial.</li>
                    <li>Gerar sugestões de respostas personalizadas.</li>
                    <li>Filtrar spam, mensagens de ódio e conteúdo indesejado.</li>
                    <li>Identificar oportunidades de parceria e mensagens importantes.</li>
                    <li>Melhorar nossos algoritmos e serviços.</li>
                    <li>Processar pagamentos e gerenciar sua assinatura.</li>
                    <li>Enviar comunicações sobre o serviço.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Integração com Instagram</h2>
                  <p className="text-muted-foreground">
                    Nossa aplicação se integra com a API do Instagram da Meta. Ao conectar sua conta, 
                    você autoriza o acesso às suas mensagens diretas recebidas. Não temos acesso às 
                    suas credenciais do Instagram. Respeitamos todas as políticas e diretrizes da 
                    Plataforma Meta para desenvolvedores.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Processamento por IA</h2>
                  <p className="text-muted-foreground">
                    Utilizamos modelos de inteligência artificial para analisar e classificar suas mensagens. 
                    Este processamento é realizado de forma automatizada para categorizar mensagens, 
                    determinar prioridades e gerar sugestões de resposta. O conteúdo das mensagens é 
                    processado de forma segura e não é compartilhado com terceiros para fins de treinamento de IA.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Compartilhamento de Informações</h2>
                  <p className="text-muted-foreground mb-3">
                    Não vendemos suas informações pessoais. Podemos compartilhar dados com:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Provedores de serviço:</strong> Empresas que nos ajudam a operar o serviço (hospedagem, processamento de pagamentos).</li>
                    <li><strong>Requisitos legais:</strong> Quando exigido por lei ou para proteger nossos direitos.</li>
                    <li><strong>Transferência de negócio:</strong> Em caso de fusão, aquisição ou venda de ativos.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Segurança dos Dados</h2>
                  <p className="text-muted-foreground">
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, 
                    incluindo criptografia de dados em trânsito e em repouso, controles de acesso rigorosos e 
                    monitoramento contínuo de segurança.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Retenção de Dados</h2>
                  <p className="text-muted-foreground">
                    Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário para 
                    fornecer nossos serviços. Você pode solicitar a exclusão de seus dados a qualquer momento, 
                    e processaremos sua solicitação em até 30 dias.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Seus Direitos (LGPD)</h2>
                  <p className="text-muted-foreground mb-3">
                    De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Confirmação da existência de tratamento de dados.</li>
                    <li>Acesso aos seus dados pessoais.</li>
                    <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                    <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                    <li>Portabilidade dos dados.</li>
                    <li>Eliminação dos dados tratados com seu consentimento.</li>
                    <li>Revogação do consentimento.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Cookies e Tecnologias Similares</h2>
                  <p className="text-muted-foreground">
                    Utilizamos cookies e tecnologias similares para manter sua sessão, lembrar suas preferências 
                    e analisar o uso do serviço. Você pode configurar seu navegador para recusar cookies, 
                    mas isso pode afetar a funcionalidade do serviço.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Alterações nesta Política</h2>
                  <p className="text-muted-foreground">
                    Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
                    por email ou através de aviso no serviço. O uso continuado após as alterações constitui 
                    aceitação da política revisada.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">12. Contato</h2>
                  <p className="text-muted-foreground">
                    Para dúvidas sobre esta Política de Privacidade ou para exercer seus direitos, entre em contato:
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Email:</strong> privacidade@dmfocus.com<br />
                    <strong>Encarregado de Dados (DPO):</strong> dpo@dmfocus.com
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 DM Focus. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
