import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Trophy, Users, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

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

  const leaderboard = tab === "semana" ? rankingSemanal : rankingMensal;
  const userEntry = leaderboard.find((u) => (u as any).isUser);
  const userRank = userEntry?.rank || 24;
  const userSavings = userEntry?.savings || "15%";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">AquaMaster</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <motion.div className="bg-primary-foreground/15 rounded-2xl p-4 backdrop-blur-sm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-primary-foreground/70 text-xs font-body">Sua posição</span>
              <p className="text-3xl font-display font-bold text-primary-foreground">#{userRank}</p>
              <span className="text-primary-foreground/70 text-xs font-body">Nível: {userEntry?.level || "Prata"}</span>
            </div>
            <div className="text-right">
              <span className="text-primary-foreground/70 text-xs font-body">Economia</span>
              <p className="text-2xl font-display font-bold text-primary-foreground">{userSavings}</p>
              <span className="text-primary-foreground/70 text-xs font-body">Desconto: R$ 17,50</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-primary-foreground/60 font-body mb-1"><span>Prata</span><span>Ouro</span></div>
            <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary-foreground" initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ delay: 0.3, duration: 0.8 }} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 -mt-3">
        <div className="flex gap-2 mb-4">
          {(["semana", "mes"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-display font-medium transition-colors ${tab === t ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}>
              {t === "semana" ? "Esta Semana" : "Este Mês"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} className="space-y-2 mb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {leaderboard.map((user, i) => (
              <motion.div key={`${tab}-${user.rank}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${(user as any).isUser ? "bg-primary/10 border border-primary/20" : "bg-card shadow-card"}`}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                layout>
                <span className="text-lg w-8 text-center">{user.avatar}</span>
                <div className="flex-1">
                  <p className={`font-display font-semibold text-sm ${(user as any).isUser ? "text-primary" : "text-foreground"}`}>{user.name}</p>
                  <span className="text-[10px] font-body text-cinza-medio">{user.level}</span>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-sm text-foreground">{user.savings}</p>
                  <span className="text-[10px] font-body text-cinza-claro">#{user.rank}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

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
