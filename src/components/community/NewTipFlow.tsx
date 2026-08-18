import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Send, AlertTriangle } from "lucide-react";
import { useCommunity, TIP_CATEGORIES } from "@/contexts/CommunityContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

const MODERATION_MSG =
  "Sua publicação não pôde ser enviada porque contém termos inadequados, abreviações ofensivas ou linguagem que viola nossas diretrizes de respeito e segurança. Por favor, revise seu texto.";

/**
 * Fluxo de criação de dicas — renderizado APENAS na página Dicas da Comunidade.
 * FAB estendido (encolhe ao rolar para baixo) + modal de formulário com moderação.
 */
const NewTipFlow = () => {
  const { addTip, hasProfanity } = useCommunity();
  const { user } = useUser();

  const [expanded, setExpanded] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<string>(TIP_CATEGORIES[0]);
  const [error, setError] = useState<null | "campos" | "moderacao">(null);
  const [shake, setShake] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extended FAB: encolhe ao rolar para baixo, expande ao rolar para cima
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 8) {
        setExpanded(y < last || y < 24);
        last = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fechar com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-resize do textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [desc, open]);

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const reset = () => {
    setTitle("");
    setDesc("");
    setCategory(TIP_CATEGORIES[0]);
    setError(null);
  };

  const submit = () => {
    if (!title.trim() || !desc.trim()) {
      setError("campos");
      setShake((s) => s + 1);
      toast({ title: "Preencha o título e o texto da dica", variant: "destructive" });
      return;
    }
    if (hasProfanity(`${title} ${desc}`)) {
      setError("moderacao");
      setShake((s) => s + 1);
      toast({ title: "Conteúdo bloqueado", description: MODERATION_MSG, variant: "destructive" });
      return;
    }
    addTip({
      title: title.trim(),
      desc: desc.trim(),
      category,
      author: user?.nome || "Você",
      bairro: user?.endereco || "Cuiabá",
    });
    toast({ title: "Dica publicada! 🎉", description: "Ela já está no topo do feed." });
    reset();
    setOpen(false);
  };

  const invalid = error !== null;

  return (
    <>
      {/* FAB estendido — acima do assistente de IA (z-50) no eixo vertical e de camada */}
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Criar nova dica"
        layout
        className="fixed bottom-40 right-5 z-[60] h-14 rounded-full gradient-primary shadow-card-hover flex items-center justify-center gap-2 px-4 text-primary-foreground font-display font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
      >
        <Plus className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
        <motion.span
          initial={false}
          animate={{ width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden whitespace-nowrap"
        >
          Criar Nova Dica
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-md flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              key={shake}
              role="dialog"
              aria-modal="true"
              aria-label="Compartilhe sua Dica com a Comunidade"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1, x: shake ? [0, -8, 8, -6, 6, 0] : 0 }}
              exit={{ y: 60, scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-display font-bold text-foreground text-base pr-4">
                  Compartilhe sua Dica com a Comunidade
                </h2>
                <button onClick={close} aria-label="Fechar formulário">
                  <X className="w-5 h-5 text-cinza-medio" />
                </button>
              </div>

              {error === "moderacao" && (
                <div
                  role="alert"
                  className="flex gap-2 items-start mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/40"
                >
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-destructive leading-relaxed">{MODERATION_MSG}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="nova-dica-titulo" className="block font-display font-semibold text-xs text-foreground mb-1.5">
                    Título
                  </label>
                  <input
                    id="nova-dica-titulo"
                    required
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(null); }}
                    placeholder="Ex: Como reaproveitar a água da máquina de lavar"
                    className={`w-full py-2.5 px-4 rounded-xl bg-muted font-body text-sm text-foreground outline-none border transition-colors ${
                      invalid ? "border-destructive" : "border-transparent focus:border-primary"
                    }`}
                  />
                </div>

                <div>
                  <span className="block font-display font-semibold text-xs text-foreground mb-1.5">Categoria</span>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Categoria da dica">
                    {TIP_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        aria-pressed={category === c}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-display font-medium transition-colors ${
                          category === c
                            ? "gradient-primary text-primary-foreground"
                            : "bg-muted text-cinza-medio"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="nova-dica-texto" className="block font-display font-semibold text-xs text-foreground mb-1.5">
                    Sua dica
                  </label>
                  <textarea
                    id="nova-dica-texto"
                    ref={textareaRef}
                    required
                    value={desc}
                    onChange={(e) => { setDesc(e.target.value); setError(null); }}
                    placeholder="Conte com detalhes como a sua dica funciona no dia a dia..."
                    className={`w-full py-2.5 px-4 rounded-xl bg-muted font-body text-sm text-foreground outline-none resize-none overflow-hidden border transition-colors ${
                      invalid ? "border-destructive" : "border-transparent focus:border-primary"
                    }`}
                    style={{ minHeight: 110 }}
                  />
                </div>

                <button
                  onClick={submit}
                  className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" /> Publicar Dica
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewTipFlow;
