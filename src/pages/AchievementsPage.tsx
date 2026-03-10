import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Star, Shield, Droplets, Bug, Leaf, Sun, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const achievements = [
  { icon: Shield, name: "Pai de Família Consciente", desc: "Reduziu consumo por 3 meses seguidos", unlocked: true, color: "text-amarelo-alerta" },
  { icon: Bug, name: "Detetive de Vazamentos", desc: "Reportou um problema confirmado no mapa", unlocked: true, color: "text-vermelho-critico" },
  { icon: Leaf, name: "Mestre da Sustentabilidade", desc: "Aplicou 5 dicas da comunidade", unlocked: false, color: "text-verde-sucesso" },
  { icon: Sun, name: "Madrugador", desc: "Rega plantas nos horários de menor evaporação", unlocked: false, color: "text-amarelo-alerta" },
  { icon: Droplets, name: "Guardião do Pantanal", desc: "Top 10% de economia no bairro", unlocked: false, color: "text-primary" },
];

const benefits = [
  { label: "Bônus Conquista Nível 2", value: "-R$ 5,00" },
  { label: "Redução de Consumo Meta Mensal", value: "-R$ 12,50" },
];

const AchievementsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Minhas Conquistas</h1>
          <div className="w-5" />
        </div>
        {/* Hero stats */}
        <motion.div
          className="bg-primary-foreground/15 rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-primary-foreground/80 text-sm font-body mb-1">Você economizou</p>
          <p className="text-3xl font-display font-bold text-primary-foreground">15%</p>
          <p className="text-primary-foreground/70 text-xs font-body">de água este mês</p>
          <div className="mt-3 bg-primary-foreground/20 rounded-xl p-3">
            <p className="text-primary-foreground text-xs font-body">
              💰 Desconto estimado na próxima fatura: <span className="font-display font-bold">R$ 18,50</span>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        {/* XP Bar */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-sm text-foreground">Nível: Cidadão Prata</span>
            <span className="text-xs font-body text-cinza-medio">450 / 750 XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>
        </div>

        {/* Medals grid */}
        <div className="space-y-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.name}
              className={`flex items-center gap-3 p-3 rounded-xl ${a.unlocked ? "bg-card shadow-card" : "bg-muted/50"}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.unlocked ? "gradient-primary" : "bg-muted"}`}>
                <a.icon className={`w-5 h-5 ${a.unlocked ? "text-primary-foreground" : "text-cinza-claro"}`} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className={`font-display font-semibold text-sm ${a.unlocked ? "text-foreground" : "text-cinza-claro"}`}>{a.name}</p>
                <span className="text-[10px] font-body text-cinza-medio">{a.desc}</span>
              </div>
              {a.unlocked && <Star className="w-5 h-5 text-amarelo-alerta" strokeWidth={1.5} />}
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">Extrato de Benefícios</h3>
          {benefits.map((b) => (
            <div key={b.label} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="font-body text-xs text-cinza-medio">{b.label}</span>
              <span className="font-display font-bold text-sm text-verde-sucesso">{b.value}</span>
            </div>
          ))}
        </div>

        {/* Share button */}
        <button className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" strokeWidth={1.5} /> Compartilhar Vitória
        </button>
      </div>
    </div>
  );
};

export default AchievementsPage;
