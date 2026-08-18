import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ThumbsUp, BookmarkPlus, Share2, Search, Lightbulb, X, Link2, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { useCommunity, TIP_CATEGORIES, Tip } from "@/contexts/CommunityContext";
import NewTipFlow from "@/components/community/NewTipFlow";

const APP_STORE_FALLBACK = "https://play.google.com/store/apps/details?id=br.com.saneamentocuiaba.app";

const TipActions = ({ tip, onShare }: { tip: Tip; onShare: (t: Tip) => void }) => {
  const { likedIds, savedIds, toggleLike, toggleSave } = useCommunity();
  const liked = likedIds.includes(tip.id);
  const saved = savedIds.includes(tip.id);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => toggleLike(tip.id)}
        aria-pressed={liked}
        aria-label={`Marcar dica como útil. ${tip.likes} pessoas acharam útil`}
        className={`flex items-center gap-1 text-xs font-body transition-colors ${liked ? "text-verde-sucesso font-semibold" : "text-cinza-medio"}`}
      >
        <ThumbsUp className="w-4 h-4" strokeWidth={1.5} fill={liked ? "currentColor" : "none"} /> {tip.likes} Útil
      </button>
      <button
        onClick={() => {
          toggleSave(tip.id);
          toast({
            title: saved ? "Removido dos salvos" : "Salvo no seu perfil ✅",
            description: saved ? undefined : "Veja em Perfil › Salvos da Comunidade.",
          });
        }}
        aria-pressed={saved}
        aria-label="Salvar dica para testar depois"
        className={`flex items-center gap-1 text-xs font-body transition-colors ${saved ? "text-primary font-semibold" : "text-cinza-medio"}`}
      >
        <BookmarkPlus className="w-4 h-4" strokeWidth={1.5} /> {saved ? "Salvo" : "Vou testar"}
      </button>
      <button onClick={() => onShare(tip)} aria-label="Compartilhar dica" className="ml-auto text-cinza-medio">
        <Share2 className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  );
};

const CommunityPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { tips, getTip } = useCommunity();

  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareTip, setShareTip] = useState<Tip | null>(null);
  const [openTip, setOpenTip] = useState<Tip | null>(() => {
    const deep = params.get("dica");
    return deep ? null : null;
  });

  // Deep link: /comunidade?dica=<id> opens the shared tip.
  const deepTipId = params.get("dica");
  const deepTip = deepTipId ? getTip(deepTipId) : undefined;
  const highlighted = openTip ?? deepTip ?? null;
  const weeklyTip = tips[0];

  const filtered = tips.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchFilter = !filter || t.tags.includes(filter);
    const matchSearch =
      !q ||
      [t.title, t.desc, t.author, t.bairro, ...t.tags].some((f) => f.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const shareUrl = (tip: Tip) => `${window.location.origin}/comunidade?dica=${tip.id}&fallback=${encodeURIComponent(APP_STORE_FALLBACK)}`;

  const handleNewPost = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (hasProfanity(`${newTitle} ${newDesc}`)) {
      toast({ title: "Seu texto contém palavras inadequadas", description: "Revise o conteúdo e tente novamente.", variant: "destructive" });
      return;
    }
    addTip({
      title: newTitle.trim(),
      desc: newDesc.trim(),
      category: newCategory,
      author: user?.nome || "Você",
      bairro: user?.endereco || "Cuiabá",
    });
    toast({ title: "Dica publicada! 🎉", description: "Ela já está no topo do feed." });
    setShowNewPost(false);
    setNewTitle("");
    setNewDesc("");
  };

  const shareTargets = (tip: Tip) => {
    const url = shareUrl(tip);
    const text = `${tip.title} — dica do app Saneamento Cuiabá`;
    return [
      { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, color: "bg-verde-sucesso" },
      { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: "bg-primary" },
      { label: "Instagram", href: `https://www.instagram.com/`, color: "bg-destructive" },
    ];
  };

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <header className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Dicas da Comunidade</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <div className="relative">
          <label htmlFor="busca-dicas" className="sr-only">Buscar dicas</label>
          <input
            id="busca-dicas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dicas, autores, categorias..."
            className="w-full py-2.5 px-4 pr-10 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-body text-sm border-none outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" strokeWidth={1.5} />
        </div>
      </header>

      <div className="px-5 -mt-3">
        {weeklyTip && (
          <button
            onClick={() => setOpenTip(weeklyTip)}
            className="w-full text-left bg-card rounded-2xl shadow-card p-4 mb-4 border-l-4 border-primary"
            aria-label={`Abrir dica da semana: ${weeklyTip.title}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <span className="text-xs font-display font-semibold text-primary">Dica da Semana</span>
              <ChevronRight className="w-4 h-4 text-cinza-claro ml-auto" />
            </div>
            <p className="font-body text-sm text-foreground">{weeklyTip.title}</p>
          </button>
        )}

        <div className="relative mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1">
            {TIP_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(filter === c ? null : c)}
                aria-pressed={filter === c}
                className={`px-3 py-1.5 rounded-full text-[10px] font-display font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                  filter === c ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-3">
          {filtered.map((tip, i) => (
            <motion.li
              key={tip.id}
              className="bg-card rounded-2xl shadow-card p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-xs">{tip.author[0]}</span>
                </div>
                <button onClick={() => navigate(`/comunidade/autor/${encodeURIComponent(tip.author)}`)} className="text-left">
                  <p className="font-display font-semibold text-xs text-foreground">{tip.author}</p>
                  <span className="text-[10px] font-body text-cinza-medio">{tip.bairro}</span>
                </button>
                {tip.badge && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-verde-sucesso/10 text-verde-sucesso text-[9px] font-display font-medium">
                    {tip.badge}
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-sm text-foreground mb-1">{tip.title}</h3>
              <p className="font-body text-xs text-cinza-medio mb-3 whitespace-pre-line">{tip.desc}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {tip.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-body text-primary bg-primary/5 px-2 py-0.5 rounded-full">#{tag.replace(/ /g, "")}</span>
                ))}
              </div>
              <TipActions tip={tip} onShare={setShareTip} />
            </motion.li>
          ))}
        </ul>
        {filtered.length === 0 && <p className="text-center text-sm text-cinza-medio font-body py-8">Nenhuma dica encontrada.</p>}
      </div>

      <NewTipFlow />

      {/* Full tip modal */}
      <AnimatePresence>
        {highlighted && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center px-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setOpenTip(null); if (deepTip) navigate("/comunidade", { replace: true }); }}
            role="dialog" aria-modal="true" aria-label={highlighted.title}
          >
            <motion.div className="w-full max-w-sm bg-card rounded-2xl p-5 shadow-card-hover" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-bold text-foreground text-base pr-3">{highlighted.title}</h3>
                <button onClick={() => { setOpenTip(null); if (deepTip) navigate("/comunidade", { replace: true }); }} aria-label="Fechar">
                  <X className="w-5 h-5 text-cinza-medio" />
                </button>
              </div>
              <p className="font-body text-sm text-cinza-medio mb-4 whitespace-pre-line">{highlighted.desc}</p>
              <p className="font-body text-xs text-foreground mb-4">
                <span className="font-semibold">{highlighted.author}</span> — {highlighted.bairro}
              </p>
              <button
                onClick={() => navigate(`/comunidade/autor/${encodeURIComponent(highlighted.author)}`)}
                className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold text-sm"
              >
                Mais desse usuário
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share bottom sheet */}
      <AnimatePresence>
        {shareTip && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShareTip(null)}>
            <motion.div className="w-full bg-card rounded-t-3xl p-6 pb-8" initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Compartilhar dica">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground text-base">Compartilhar dica</h3>
                <button onClick={() => setShareTip(null)} aria-label="Fechar"><X className="w-5 h-5 text-cinza-medio" /></button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {shareTargets(shareTip).map((t) => (
                  <a
                    key={t.label}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span className={`w-12 h-12 rounded-2xl ${t.color} flex items-center justify-center text-primary-foreground font-display font-bold`}>
                      {t.label[0]}
                    </span>
                    <span className="text-[10px] font-body text-cinza-medio">{t.label}</span>
                  </a>
                ))}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(shareUrl(shareTip));
                    toast({ title: "Link copiado!", description: "Quem não tiver o app é levado à loja de aplicativos." });
                    setShareTip(null);
                  }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-primary" />
                  </span>
                  <span className="text-[10px] font-body text-cinza-medio">Copiar link</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CommunityPage;
