import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfUse = () => {
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
              <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
              <p className="text-muted-foreground mb-8">Última atualização: Janeiro de 2025</p>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
                  <p className="text-muted-foreground">
                    Ao acessar ou usar o serviço DM Focus ("Serviço"), você concorda em estar vinculado a estes 
                    Termos de Uso ("Termos"). Se você não concorda com qualquer parte dos termos, você não pode 
                    acessar o Serviço.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
                  <p className="text-muted-foreground">
                    O DM Focus é uma plataforma de gerenciamento de mensagens diretas do Instagram que utiliza 
                    inteligência artificial para classificar, priorizar e sugerir respostas para suas mensagens. 
                    O Serviço requer integração com sua conta do Instagram através da API oficial da Meta.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Elegibilidade</h2>
                  <p className="text-muted-foreground">
                    Para usar o Serviço, você deve:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
                    <li>Ter pelo menos 18 anos de idade.</li>
                    <li>Possuir uma conta profissional ou de criador no Instagram.</li>
                    <li>Ter capacidade legal para celebrar um contrato vinculante.</li>
                    <li>Não estar impedido de usar o Serviço de acordo com as leis aplicáveis.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Conta do Usuário</h2>
                  <p className="text-muted-foreground">
                    Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em 
                    notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta. Não nos 
                    responsabilizamos por perdas decorrentes do uso não autorizado de sua conta.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Integração com Instagram</h2>
                  <p className="text-muted-foreground mb-3">
                    Ao conectar sua conta do Instagram ao nosso Serviço, você:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Autoriza o acesso às suas mensagens diretas recebidas.</li>
                    <li>Confirma que tem autoridade para conceder esse acesso.</li>
                    <li>Concorda em cumprir os Termos de Serviço do Instagram/Meta.</li>
                    <li>Reconhece que podemos perder acesso se o Instagram modificar sua API.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Uso Aceitável</h2>
                  <p className="text-muted-foreground mb-3">
                    Você concorda em não usar o Serviço para:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Violar qualquer lei ou regulamento aplicável.</li>
                    <li>Infringir direitos de propriedade intelectual de terceiros.</li>
                    <li>Transmitir vírus, malware ou código malicioso.</li>
                    <li>Realizar engenharia reversa ou tentar acessar nossos sistemas.</li>
                    <li>Usar automação não autorizada ou bots.</li>
                    <li>Coletar dados de outros usuários sem consentimento.</li>
                    <li>Enviar spam ou mensagens em massa através de nossa plataforma.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Assinatura e Pagamento</h2>
                  <p className="text-muted-foreground mb-3">
                    <strong>7.1 Período de Teste:</strong> Oferecemos 7 dias de teste gratuito para novos usuários.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    <strong>7.2 Cobrança:</strong> Após o período de teste, você será cobrado automaticamente 
                    de acordo com o plano escolhido (mensal ou anual). Os pagamentos são processados por 
                    nossos parceiros (Stripe e/ou Mercado Pago).
                  </p>
                  <p className="text-muted-foreground mb-3">
                    <strong>7.3 Renovação:</strong> Sua assinatura será renovada automaticamente no final de 
                    cada período de cobrança, a menos que você cancele antes da data de renovação.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>7.4 Reembolso:</strong> Pagamentos não são reembolsáveis, exceto quando exigido 
                    por lei. Você pode cancelar sua assinatura a qualquer momento, e continuará tendo acesso 
                    até o final do período pago.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Cancelamento</h2>
                  <p className="text-muted-foreground">
                    Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. 
                    O cancelamento entrará em vigor no final do período de cobrança atual. Após o cancelamento, 
                    você perderá acesso às funcionalidades premium, mas poderá exportar seus dados antes do 
                    encerramento.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Propriedade Intelectual</h2>
                  <p className="text-muted-foreground">
                    O Serviço, incluindo seu design, código, funcionalidades e conteúdo, é propriedade da 
                    DM Focus e está protegido por leis de propriedade intelectual. Você recebe uma licença 
                    limitada, não exclusiva e não transferível para usar o Serviço de acordo com estes Termos.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Conteúdo do Usuário</h2>
                  <p className="text-muted-foreground">
                    Você mantém todos os direitos sobre suas mensagens e dados. Ao usar o Serviço, você nos 
                    concede uma licença limitada para processar suas mensagens com o único propósito de 
                    fornecer o Serviço (classificação, priorização, sugestões de resposta).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Limitação de Responsabilidade</h2>
                  <p className="text-muted-foreground">
                    O Serviço é fornecido "como está" e "conforme disponível". Não garantimos que o Serviço 
                    será ininterrupto, seguro ou livre de erros. Em nenhuma circunstância seremos responsáveis 
                    por danos indiretos, incidentais, especiais ou consequentes resultantes do uso ou 
                    impossibilidade de uso do Serviço.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">12. Isenção de Garantias</h2>
                  <p className="text-muted-foreground">
                    Não garantimos a precisão das classificações de IA ou sugestões de resposta. As decisões 
                    finais sobre como responder às mensagens são de sua exclusiva responsabilidade. 
                    Recomendamos sempre revisar as sugestões antes de enviá-las.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">13. Indenização</h2>
                  <p className="text-muted-foreground">
                    Você concorda em indenizar e isentar a DM Focus, seus diretores, funcionários e afiliados 
                    de qualquer reclamação, dano, perda ou despesa decorrente de: (a) seu uso do Serviço; 
                    (b) violação destes Termos; (c) violação de direitos de terceiros.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">14. Modificações do Serviço</h2>
                  <p className="text-muted-foreground">
                    Reservamos o direito de modificar, suspender ou descontinuar o Serviço a qualquer momento, 
                    com ou sem aviso prévio. Não seremos responsáveis por qualquer modificação, suspensão ou 
                    descontinuação do Serviço.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">15. Alterações nos Termos</h2>
                  <p className="text-muted-foreground">
                    Podemos modificar estes Termos a qualquer momento. Notificaremos sobre mudanças 
                    significativas por email ou através de aviso no Serviço. O uso continuado após as 
                    alterações constitui aceitação dos Termos revisados.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">16. Lei Aplicável e Foro</h2>
                  <p className="text-muted-foreground">
                    Estes Termos são regidos pelas leis do Brasil. Qualquer disputa será submetida à 
                    jurisdição exclusiva dos tribunais da comarca de São Paulo, SP, Brasil.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">17. Disposições Gerais</h2>
                  <p className="text-muted-foreground">
                    Se qualquer disposição destes Termos for considerada inválida, as demais disposições 
                    permanecerão em pleno vigor. A falha em exercer qualquer direito não constitui renúncia. 
                    Estes Termos constituem o acordo integral entre você e a DM Focus.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">18. Contato</h2>
                  <p className="text-muted-foreground">
                    Para dúvidas sobre estes Termos de Uso, entre em contato:
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Email:</strong> juridico@dmfocus.com<br />
                    <strong>Suporte:</strong> suporte@dmfocus.com
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

export default TermsOfUse;
