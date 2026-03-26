import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Download, QrCode, Receipt, TrendingUp, TrendingDown, BarChart3, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const transactions = [
  { id: 1, title: "Fatura de Março", date: "15/03/2025", value: -85.9, type: "expense" },
  { id: 2, title: "Desconto Economia", date: "10/03/2025", value: 12.5, type: "income" },
  { id: 3, title: "Fatura de Fevereiro", date: "15/02/2025", value: -92.3, type: "expense" },
  { id: 4, title: "Bônus Conquista", date: "08/02/2025", value: 5.0, type: "income" },
  { id: 5, title: "Fatura de Janeiro", date: "15/01/2025", value: -78.5, type: "expense" },
];

const monthlyData = [
  { month: "Jan", value: 78.5 },
  { month: "Fev", value: 92.3 },
  { month: "Mar", value: 85.9 },
  { month: "Abr", value: 0 },
  { month: "Mai", value: 0 },
  { month: "Jun", value: 0 },
];

const PagamentosPage = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const balance = -85.9;
  const totalSaved = 17.5;

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const maxVal = Math.max(...monthlyData.map((d) => d.value), 1);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with gradient card */}
      <div className="gradient-header px-5 pt-12 pb-20 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Pagamentos</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/20"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-primary-foreground/70 text-xs font-body">Saldo Atual</span>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <Eye className="w-4 h-4 text-primary-foreground/70" strokeWidth={1.5} />
              ) : (
                <EyeOff className="w-4 h-4 text-primary-foreground/70" strokeWidth={1.5} />
              )}
            </button>
          </div>
          <p className="text-primary-foreground font-display font-bold text-3xl mb-3">
            {showBalance ? `R$ ${Math.abs(balance).toFixed(2)}` : "R$ •••••"}
          </p>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-vermelho-critico" />
                <span className="text-[10px] text-primary-foreground/60 font-body">Despesas</span>
              </div>
              <span className="text-primary-foreground font-display font-bold text-sm">R$ 256,70</span>
            </div>
            <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-verde-sucesso" />
                <span className="text-[10px] text-primary-foreground/60 font-body">Economizado</span>
              </div>
              <span className="text-primary-foreground font-display font-bold text-sm">R$ {totalSaved.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: QrCode, label: "Pagar Pix" },
              { icon: Download, label: "2ª Via" },
              { icon: Receipt, label: "Faturas" },
              { icon: BarChart3, label: "Histórico" },
            ].map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] text-primary-foreground/80 font-body">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Chart section */}
      <div className="px-5 -mt-8">
        <motion.div
          className="bg-card rounded-2xl shadow-card p-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-foreground text-sm">Estatísticas</h3>
            <span className="text-[10px] text-cinza-medio font-body bg-muted px-2 py-1 rounded-full">Mensal</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: "80px" }}>
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-lg gradient-primary"
                    initial={{ height: 0 }}
                    animate={{ height: d.value > 0 ? `${(d.value / maxVal) * 100}%` : "4px" }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{ opacity: d.value > 0 ? 1 : 0.2 }}
                  />
                </div>
                <span className="text-[9px] text-cinza-medio font-body">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transactions */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-foreground text-sm">Transações Recentes</h3>
          <span className="text-[10px] text-primary font-display font-medium">Ver tudo</span>
        </div>

        <div className="flex gap-2 mb-3">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-colors ${
                filter === f ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"
              }`}
            >
              {f === "all" ? "Todos" : f === "income" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              className="bg-card rounded-xl shadow-card p-3.5 flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                t.type === "income" ? "bg-verde-sucesso/10" : "bg-primary/10"
              }`}>
                {t.type === "income" ? (
                  <TrendingUp className="w-5 h-5 text-verde-sucesso" strokeWidth={1.5} />
                ) : (
                  <Receipt className="w-5 h-5 text-primary" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-foreground text-sm">{t.title}</p>
                <span className="text-[10px] text-cinza-medio font-body">{t.date}</span>
              </div>
              <span className={`font-display font-bold text-sm ${
                t.type === "income" ? "text-verde-sucesso" : "text-foreground"
              }`}>
                {t.type === "income" ? "+" : "-"} R$ {Math.abs(t.value).toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Pay button */}
        <motion.button
          className="w-full mt-4 py-3.5 rounded-full gradient-primary font-display font-semibold text-primary-foreground shadow-card-hover flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CreditCard className="w-5 h-5" strokeWidth={1.5} />
          Pagar Fatura com Pix
        </motion.button>
      </div>
    </div>
  );
};

export default PagamentosPage;
