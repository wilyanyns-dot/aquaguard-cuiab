import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Home, Droplets, Map, Users, Trophy, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TOUR_KEY = "saneamento-app-tour-seen";

const tourSteps = [
  { icon: Home, title: "Início", text: "Acompanhe seu consumo do dia, a meta e os atalhos principais." },
  { icon: Droplets, title: "Consumo", text: "Consulte a gota de progresso, edite sua meta e explore o histórico." },
  { icon: Map, title: "Mapa", text: "Encontre ocorrências em Cuiabá, confirme problemas ou registre um novo relato." },
  { icon: Users, title: "Comunidade", text: "Veja dicas de outros moradores, salve as melhores e compartilhe suas ideias." },
  { icon: Trophy, title: "Ranking", text: "Conquiste XP economizando água e acompanhe suas insígnias e benefícios." },
  { icon: Sparkles, title: "Maya", text: "Converse com a assistente para tirar dúvidas sobre consumo, contas e saneamento." },
];

const AppTour = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(() => localStorage.getItem(TOUR_KEY) !== "true");

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step === tourSteps.length - 1) {
      dismiss();
      return;
    }
    setStep((current) => current + 1);
  };

  const goToSection = () => {
    const paths = ["/home", "/consumo", "/mapa", "/comunidade", "/ranking", "/home"];
    navigate(paths[step]);
  };

  const current = tourSteps[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[1500] flex items-end justify-center bg-foreground/45 px-4 pb-24 pt-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Tutorial de uso do aplicativo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card/95 p-5 shadow-card-hover backdrop-blur-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
          >
            <button
              onClick={dismiss}
              aria-label="Fechar tutorial"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-border"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 flex items-center gap-2">
              <span className="text-xs font-display font-semibold text-primary">TUTORIAL DO APLICATIVO</span>
              <span className="text-xs text-muted-foreground">{step + 1}/{tourSteps.length}</span>
            </div>
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-card">
              <Icon className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">{current.title}</h2>
            <p className="mt-2 min-h-12 font-body text-sm leading-relaxed text-muted-foreground">{current.text}</p>
            <div className="mt-5 flex gap-1.5" aria-label={`Etapa ${step + 1} de ${tourSteps.length}`}>
              {tourSteps.map((item, index) => (
                <span key={item.title} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button onClick={goToSection} className="font-body text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline">
                Ver agora
              </button>
              <button onClick={next} className="flex items-center gap-1 rounded-full gradient-primary px-5 py-3 font-display text-sm font-semibold text-primary-foreground shadow-card-hover">
                {step === tourSteps.length - 1 ? "Começar" : "Próximo"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppTour;
