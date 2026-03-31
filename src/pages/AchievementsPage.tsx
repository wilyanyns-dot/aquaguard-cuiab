import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Star, Shield, Droplets, Bug, Leaf, Sun, Share2, Lock, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";

const achievements = [
  { icon: Shield, name: "Pai de Família Consciente", desc: "Reduziu consumo por 3 meses seguidos", unlocked: true, color: "text-amarelo-alerta" },
  { icon: Bug, name: "Detetive de Vazamentos", desc: "Reportou um problema no mapa que foi confirmado", unlocked: true, color: "text-vermelho-critico" },
  { icon: Leaf, name: "Mestre da Sustentabilidade", desc: "Aplicou 5 dicas da comunidade", unlocked: false, color: "text-verde-sucesso" },
  { icon: Sun, name: "Madrugador", desc: "Rega plantas nos horários de menor evaporação", unlocked: false, color: "text-amarelo-alerta" },
  { icon: Droplets, name: "Guardião do Pantanal", desc: "Top 5% da comunidade por 3 meses", unlocked: false, color: "text-primary" },
];

const totalSaved = 17.5;

const benefits = [
  { label: "Bônus Conquista Nível 2", value: "-R$ 5,00" },
  { label: "Redução de Consumo Meta Mensal", value: "-R$ 12,50" },
];

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAllMedals, setShowAllMedals] = useState(false);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleShare = (platform: string) => {
    const text = `🏆 Conquistei ${unlockedCount} medalhas no Saneamento Cuiabá e economizei R$ ${totalSaved.toFixed(2)} na minha conta de água! #SaneamentoCuiabá #ODS6`;
    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case "instagram":
        navigator.clipboard.writeText(text);
        toast({ title: "Texto copiado!", description: "Cole no Instagram para compartilhar." });
        setShowShareModal(false);
        return;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: "Minhas Conquistas", text }).catch(() => {});
          setShowShareModal(false);
          return;
        }
        navigator.clipboard.writeText(text);
        toast({ title: "Texto copiado!" });
        setShowShareModal(false);
        return;
    }
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Minhas Conquistas</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <motion.div className="bg-primary-foreground/15 rounded-2xl p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary-foreground/80 text-sm font-body mb-1">Você economizou</p>
          <p className="text-3xl font-display font-bold text-primary-foreground">15%</p>
          <p className="text-primary-foreground/70 text-xs font-body">de água este mês</p>
          <div className="mt-3 bg-primary-foreground/20 rounded-xl p-3">
            <p className="text-primary-foreground text-xs font-body">
              💰 Desconto estimado na próxima fatura: <span className="font-display font-bold">R$ {totalSaved.toFixed(2)}</span>
            </p>
            <p className="text-primary-foreground/60 text-[10px] font-body mt-1">
              Este valor está refletido em "Economizado" nos Pagamentos
            </p>
          </div>
        </motion.div>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-sm text-foreground">Nível: Cidadão Prata</span>
            <span className="text-xs font-body text-cinza-medio">450 / 750 XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full gradient-primary" initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ delay: 0.3, duration: 0.8 }} />
          </div>
        </div>

        {/* Medals section */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-foreground">Medalhas ({unlockedCount}/{achievements.length})</h3>
            <button onClick={() => setShowAllMedals(!showAllMedals)} className="text-[10px] text-primary font-display font-medium">
              {showAllMedals ? "Menos" : "Ver todas"}
            </button>
          </div>
          <div className="space-y-2">
            {(showAllMedals ? achievements : achievements.slice(0, 3)).map((a, i) => (
              <motion.div key={a.name} className={`flex items-center gap-3 p-3 rounded-xl ${a.unlocked ? "bg-muted/50" : "bg-muted/20 opacity-60"}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: a.unlocked ? 1 : 0.6, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.unlocked ? "gradient-primary" : "bg-muted"}`}>
                  {a.unlocked ? <a.icon className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /> : <Lock className="w-4 h-4 text-cinza-claro" strokeWidth={1.5} />}
                </div>
                <div className="flex-1">
                  <p className={`font-display font-semibold text-sm ${a.unlocked ? "text-foreground" : "text-cinza-claro"}`}>{a.name}</p>
                  <span className="text-[10px] font-body text-cinza-medio">{a.desc}</span>
                </div>
                {a.unlocked ? <Star className="w-5 h-5 text-amarelo-alerta" strokeWidth={1.5} /> : <Lock className="w-4 h-4 text-cinza-claro" strokeWidth={1.5} />}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">Extrato de Benefícios</h3>
          {benefits.map((b) => (
            <div key={b.label} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="font-body text-xs text-cinza-medio">{b.label}</span>
              <span className="font-display font-bold text-sm text-verde-sucesso">{b.value}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 mt-1 bg-verde-sucesso/5 rounded-lg px-2">
            <span className="font-body text-xs font-semibold text-verde-sucesso">Total Economizado</span>
            <span className="font-display font-bold text-sm text-verde-sucesso">-R$ {totalSaved.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={() => setShowShareModal(true)} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" strokeWidth={1.5} /> Compartilhar Vitória
        </button>
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareModal(false)}>
            <motion.div className="bg-card rounded-2xl shadow-card p-6 mx-6 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground text-lg">Compartilhar</h3>
                <button onClick={() => setShowShareModal(false)}><X className="w-5 h-5 text-cinza-medio" /></button>
              </div>
              <p className="font-body text-xs text-cinza-medio mb-4">Compartilhe suas conquistas nas redes sociais!</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "WhatsApp", platform: "whatsapp", color: "bg-[#25D366]" },
                  { label: "Instagram", platform: "instagram", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
                  { label: "Twitter / X", platform: "twitter", color: "bg-foreground" },
                  { label: "Facebook", platform: "facebook", color: "bg-[#1877F2]" },
                ].map(s => (
                  <button key={s.platform} onClick={() => handleShare(s.platform)} className={`${s.color} text-primary-foreground py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2`}>
                    <ExternalLink className="w-4 h-4" /> {s.label}
                  </button>
                ))}
              </div>
              <button onClick={() => handleShare("other")} className="w-full mt-3 py-2.5 rounded-xl border border-border text-foreground font-display font-medium text-sm flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" /> Outros meios
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementsPage;
