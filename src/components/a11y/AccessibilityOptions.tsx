import { Eye, HandHelping, Captions, Volume2, Minus, Plus, Check } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

const options = [
  {
    key: "baixaVisao",
    icon: Eye,
    title: "Enxergo pouco",
    desc: "Alto contraste, letras maiores e mais espaço entre os itens.",
  },
  {
    key: "libras",
    icon: HandHelping,
    title: "Uso LIBRAS",
    desc: "Avatar tradutor de Língua Brasileira de Sinais em todas as telas.",
  },
  {
    key: "legendas",
    icon: Captions,
    title: "Ouço pouco",
    desc: "Legendas e transcrições em vídeos e avisos por vibração, sem sons.",
  },
  {
    key: "leitura",
    icon: Volume2,
    title: "Prefiro ouvir",
    desc: "Ícones grandes e leitura em voz alta dos botões ao tocar neles.",
  },
] as const;

const AccessibilityOptions = () => {
  const { prefs, toggle, setPref, speak } = useAccessibility();

  const changeScale = (delta: number) => {
    const next = Math.min(1.5, Math.max(0.9, Number((prefs.fontScale + delta).toFixed(2))));
    setPref("fontScale", next);
    speak(`Tamanho da letra ${Math.round(next * 100)} por cento`, true);
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-3" role="group" aria-label="Perfis de acessibilidade">
        {options.map((o) => {
          const active = prefs[o.key];
          return (
            <li key={o.key}>
              <button
                type="button"
                role="switch"
                aria-checked={active}
                aria-label={`${o.title}. ${o.desc}`}
                onClick={() => {
                  toggle(o.key);
                  speak(`${o.title} ${active ? "desativado" : "ativado"}`, true);
                }}
                className={`w-full min-h-16 flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  active ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span
                  className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                    active ? "gradient-primary text-primary-foreground" : "bg-muted text-primary"
                  }`}
                  aria-hidden="true"
                >
                  <o.icon className="w-6 h-6" strokeWidth={1.75} />
                </span>
                <span className="flex-1">
                  <span className="block font-display font-bold text-foreground text-base">{o.title}</span>
                  <span className="block font-body text-xs text-muted-foreground mt-0.5">{o.desc}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    active ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {active && <Check className="w-4 h-4" strokeWidth={3} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-muted">
        <span className="font-display font-semibold text-foreground text-sm">
          Tamanho da letra
          <span className="block font-body text-xs text-muted-foreground">{Math.round(prefs.fontScale * 100)}%</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeScale(-0.1)}
            aria-label="Diminuir tamanho da letra"
            className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-foreground"
          >
            <Minus className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => changeScale(0.1)}
            aria-label="Aumentar tamanho da letra"
            className="w-11 h-11 rounded-full gradient-primary text-primary-foreground flex items-center justify-center"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityOptions;
