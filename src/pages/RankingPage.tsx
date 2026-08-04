import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Ticket, Check, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import {
  BADGES, COUPONS, LEVELS, levelForXp, levelProgress, loadGamification,
  nextLevelForXp, saveGamification, xpFromSavings,
} from "@/lib/gamification";

const rankingSemanal = [
  { rank: 1, name: "AquaMaria", level: "AquaMaster", savings: "38%", avatar: "🥇" },
  { rank: 2, name: "LucasSustentável", level: "Platina", savings: "32%", avatar: "🥈" },
  { rank: 3, name: "JoãoEco", level: "Ouro", savings: "25%", avatar: "🥉" },
  { rank: 20, name: "PedroVerde", level: "Ouro", savings: "18%", avatar: "💧" },
  { rank: 21, name: "AnaConsciente", level: "Prata", savings: "17%", avatar: "💧" },
  { rank: 22, name: "Você", level: "Prata", savings: "16%", avatar: "⭐", isUser: true },
  { rank: 23, name: "CarlosEco", level: "Prata", savings: "15%", avatar: "💧" },
  { rank: 24, name: "BeatrizÁgua", level: "Bronze", savings: "13%", avatar: "💧" },
];

const rankingMensal = [
  { rank: 1, name: "AquaMaria", level: "AquaMaster", savings: "32%", avatar: "🥇" },
  { rank: 2, name: "JoãoEco", level: "Platina", savings: "28%", avatar: "🥈" },
  { rank: 3, name: "LucasSustentável", level: "Ouro", savings: "22%", avatar: "🥉" },
  { rank: 22, name: "PedroVerde", level: "Ouro", savings: "16%", avatar: "💧" },
  { rank: 23, name: "AnaConsciente", level: "Prata", savings: "15.5%", avatar: "💧" },
  { rank: 24, name: "Você", level: "Prata", savings: "15%", avatar: "⭐", isUser: true },
  { rank: 25, name: "CarlosEco", level: "Prata", savings: "14.8%", avatar: "💧" },
  { rank: 26, name: "BeatrizÁgua", level: "Bronze", savings: "12%", avatar: "💧" },
];

const RankingPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"semana" | "mes">("mes");
  const [state, setState] = useState(() => loadGamification());

  useEffect(() => saveGamification(state), [state]);

  const leaderboard = tab === "semana" ? rankingSemanal : rankingMensal;
  const userEntry = leaderboard.find((u) => (u as any).isUser);
  const userRank = userEntry?.rank || 24;
  const userSavings = userEntry?.savings || "15%";

  const savingsPct = parseFloat(userSavings);
  const xp = xpFromSavings(savingsPct, state.contributions);
  const level = levelForXp(xp);
  const next = nextLevelForXp(xp);
  const progress = levelProgress(xp);
  const spentXp = state.redeemed.reduce((sum, id) => sum + (COUPONS.find(c => c.id === id)?.costXp || 0), 0);
  const availableXp = Math.max(0, xp - spentXp);
  const savedMoney = state.redeemed.reduce((sum, id) => sum + (COUPONS.find(c => c.id === id)?.value || 0), 0);

  const redeem = (id: string) => {
    const coupon = COUPONS.find(c => c.id === id)!;
    if (state.redeemed.includes(id)) return;
    if (availableXp < coupon.costXp) {
      toast({ title: "XP insuficiente", description: `Você precisa de ${coupon.costXp} XP para resgatar.`, variant: "destructive" });
      return;
    }
    setState(s => ({ ...s, redeemed: [...s.redeemed, id] }));
    toast({ title: "Cupom resgatado! 🎟️", description: `${coupon.title} será abatido na sua próxima fatura.` });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} aria-label="Voltar"><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">AquaMaster</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <motion.div className="bg-primary-foreground/15 rounded-2xl p-4 backdrop-blur-sm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-primary-foreground/70 text-xs font-body">Sua posição</span>
              <p className="text-3xl font-display font-bold text-primary-foreground">#{userRank}</p>
              <span className="text-primary-foreground/70 text-xs font-body">Nível: {level.name} · {xp} XP</span>
            </div>
            <div className="text-right">
              <span className="text-primary-foreground/70 text-xs font-body">Economia</span>
              <p className="text-2xl font-display font-bold text-primary-foreground">{userSavings}</p>
              <span className="text-primary-foreground/70 text-xs font-body">Desconto automático: {level.discount}%</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-primary-foreground/60 font-body mb-1">
              <span>{level.name}</span>
              <span>{next ? `${next.name} · faltam ${next.minXp - xp} XP` : "Nível máximo"}</span>
            </div>
            <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary-foreground" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.3, duration: 0.8 }} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        <div className="flex gap-2">
          {(["semana", "mes"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-display font-medium transition-colors ${tab === t ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}>
              {t === "semana" ? "Esta Semana" : "Este Mês"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} className="space-y-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {leaderboard.map((user, i) => (
              <motion.div key={`${tab}-${user.rank}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${(user as any).isUser ? "bg-primary/10 border border-primary/20" : "bg-card shadow-card"}`}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                layout>
                <span className="text-lg w-8 text-center">{user.avatar}</span>
                <div className="flex-1">
                  <p className={`font-display font-semibold text-sm ${(user as any).isUser ? "text-primary" : "text-foreground"}`}>{user.name}</p>
                  <span className="text-[10px] font-body text-cinza-medio">{(user as any).isUser ? `${level.name} · ${xp} XP` : user.level}</span>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-sm text-foreground">{user.savings}</p>
                  <span className="text-[10px] font-body text-cinza-claro">#{user.rank}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Insígnias */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h3 className="font-display font-bold text-sm text-foreground">Insígnias</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {BADGES.map(b => {
              const unlocked = xp >= b.minXp;
              return (
                <div key={b.id} title={`${b.name} — ${b.desc}`} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${unlocked ? "bg-primary/10" : "bg-muted/40 opacity-50"}`}>
                  <span className="text-lg">{unlocked ? b.emoji : "🔒"}</span>
                  <span className="text-[8px] font-body text-center leading-tight text-cinza-medio">{b.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cupons */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-verde-sucesso" strokeWidth={1.5} />
              <h3 className="font-display font-bold text-sm text-foreground">Cupons de Desconto</h3>
            </div>
            <span className="text-[10px] font-display text-primary">{availableXp} XP disponíveis</span>
          </div>
          <p className="text-[10px] font-body text-cinza-medio mb-3">
            Troque seu XP por descontos reais na fatura. Já resgatado: <span className="text-verde-sucesso font-semibold">R$ {savedMoney.toFixed(2)}</span>
          </p>
          <div className="space-y-2">
            {COUPONS.map(c => {
              const levelOk = LEVELS.findIndex(l => l.key === level.key) >= LEVELS.findIndex(l => l.key === c.levelRequired);
              const done = state.redeemed.includes(c.id);
              const disabled = done || !levelOk || availableXp < c.costXp;
              return (
                <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl ${done ? "bg-verde-sucesso/10" : "bg-muted/50"}`}>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-xs text-foreground">{c.title}</p>
                    <span className="text-[10px] font-body text-cinza-medio">{c.desc}</span>
                    <span className="block text-[10px] font-body text-cinza-claro">{c.costXp} XP · nível {c.levelRequired}</span>
                  </div>
                  <button
                    onClick={() => redeem(c.id)}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-full text-[10px] font-display font-semibold flex items-center gap-1 ${done ? "bg-verde-sucesso text-primary-foreground" : disabled ? "bg-muted text-cinza-claro" : "gradient-primary text-primary-foreground"}`}
                  >
                    {done ? <><Check className="w-3 h-3" /> Resgatado</> : !levelOk ? <><Lock className="w-3 h-3" /> Bloqueado</> : "Resgatar"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-verde-sucesso" strokeWidth={1.5} />
            <span className="font-display font-bold text-sm text-foreground">Meta da Comunidade</span>
          </div>
          <p className="text-xs font-body text-cinza-medio mb-2">Vizinhos, falta apenas 2% para liberarmos o desconto comunitário de 5%!</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-verde-sucesso" initial={{ width: 0 }} animate={{ width: "98%" }} transition={{ delay: 0.5, duration: 1 }} />
          </div>
          <span className="text-[10px] font-body text-verde-sucesso mt-1 block">98% concluído!</span>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
