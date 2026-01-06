import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, TrendingUp, MessageSquare, Users, Clock, ArrowRight, Instagram } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Classificação com IA",
      description: "Mensagens categorizadas automaticamente: parcerias, fãs, perguntas, spam e mais."
    },
    {
      icon: TrendingUp,
      title: "Priorização Inteligente",
      description: "Saiba quais mensagens responder primeiro com nosso sistema de prioridades."
    },
    {
      icon: MessageSquare,
      title: "Respostas Sugeridas",
      description: "IA gera sugestões de resposta personalizadas para cada tipo de mensagem."
    },
    {
      icon: Clock,
      title: "Economize Tempo",
      description: "Reduza horas de triagem manual para minutos com automação inteligente."
    },
    {
      icon: Users,
      title: "Gestão de Parcerias",
      description: "Identifique oportunidades de negócio e nunca perca uma proposta importante."
    },
    {
      icon: Shield,
      title: "Filtro Anti-Hate",
      description: "Proteja sua saúde mental com filtros automáticos de mensagens negativas."
    }
  ];

  const testimonials = [
    {
      name: "Marina Silva",
      role: "Influenciadora Digital",
      followers: "850K seguidores",
      quote: "Finalmente consigo responder parcerias importantes sem me perder em centenas de DMs."
    },
    {
      name: "Pedro Henrique",
      role: "Creator de Conteúdo",
      followers: "1.2M seguidores",
      quote: "A classificação por IA mudou completamente minha rotina. Economizo 3 horas por dia."
    },
    {
      name: "Julia Costa",
      role: "Empresária Digital",
      followers: "500K seguidores",
      quote: "O filtro de hate speech é incrível. Minha saúde mental agradece!"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">DM Focus</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Preços</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/auth')} className="hidden sm:flex">
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6">
              <Instagram className="w-3 h-3 mr-1" />
              Integração com Instagram
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Suas DMs do Instagram,{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                organizadas com IA
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Pare de perder oportunidades de parceria. Nossa IA classifica, prioriza e sugere respostas para suas mensagens diretas automaticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/checkout')} className="text-lg px-8">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver Recursos
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ 7 dias grátis · ✓ Sem cartão de crédito · ✓ Cancele quando quiser
            </p>
          </motion.div>

          {/* App Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10 bg-card">
              {/* Mock Dashboard Preview */}
              <div className="bg-sidebar p-4 border-b border-border flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/50 rounded-lg px-4 py-1 text-sm text-muted-foreground">
                    app.dmfocus.com
                  </div>
                </div>
              </div>
              <div className="flex">
                {/* Sidebar Preview */}
                <div className="w-64 bg-sidebar border-r border-border p-4 hidden md:block">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Inbox</span>
                      <Badge className="ml-auto">24</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted/50">
                      <Users className="w-5 h-5" />
                      <span>Parcerias</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted/50">
                      <TrendingUp className="w-5 h-5" />
                      <span>Analytics</span>
                    </div>
                  </div>
                </div>
                {/* Messages Preview */}
                <div className="flex-1 p-6">
                  <div className="grid gap-4">
                    {/* Partnership Message */}
                    <div className="p-4 rounded-xl border border-partnership/30 bg-partnership/5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-partnership to-partnership/60" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">@marcagrande</span>
                            <Badge className="bg-partnership/20 text-partnership border-0 text-xs">Parceria</Badge>
                            <Badge variant="destructive" className="text-xs">Responder Agora</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Olá! Somos da Marca Grande e gostaríamos de propor uma parceria...</p>
                        </div>
                      </div>
                    </div>
                    {/* Fan Message */}
                    <div className="p-4 rounded-xl border border-fan/30 bg-fan/5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fan to-fan/60" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">@superfan123</span>
                            <Badge className="bg-fan/20 text-fan border-0 text-xs">Fã</Badge>
                            <Badge variant="secondary" className="text-xs">Pode Esperar</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Amo seu conteúdo! Você é minha maior inspiração...</p>
                        </div>
                      </div>
                    </div>
                    {/* Question Message */}
                    <div className="p-4 rounded-xl border border-question/30 bg-question/5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-question to-question/60" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">@curioso_oficial</span>
                            <Badge className="bg-question/20 text-question border-0 text-xs">Pergunta</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Qual câmera você usa para gravar seus vídeos?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Recursos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para dominar suas DMs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas inteligentes que transformam o caos das mensagens em oportunidades organizadas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Preços</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simples e transparente
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um plano único com tudo incluso. Sem surpresas, sem taxas escondidas.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto"
          >
            <Card className="relative overflow-hidden border-primary/50 shadow-xl shadow-primary/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Badge className="mb-4">Mais Popular</Badge>
                  <h3 className="text-2xl font-bold mb-2">Plano Pro</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">R$49</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    ou R$470/ano (economize 20%)
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Classificação ilimitada com IA",
                    "Priorização inteligente de mensagens",
                    "Respostas sugeridas por IA",
                    "Filtros anti-spam e anti-hate",
                    "Identificação de parcerias",
                    "Dashboard de analytics",
                    "Suporte prioritário",
                    "7 dias grátis para testar"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                  Começar 7 Dias Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Cancele quando quiser. Sem compromisso.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Depoimentos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Creators que transformaram sua rotina
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 backdrop-blur">
                  <CardContent className="p-6">
                    <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-xs text-primary">{testimonial.followers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para organizar suas DMs?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Junte-se a milhares de creators que já economizam horas por dia com o DM Focus.
              </p>
              <Button size="lg" onClick={() => navigate('/checkout')} className="text-lg px-8">
                Começar Agora — É Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">DM Focus</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <a href="mailto:contato@dmfocus.com" className="text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 DM Focus. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
