import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Download, QrCode, Receipt, TrendingUp, TrendingDown, BarChart3, Eye, EyeOff, Copy, Check, ExternalLink, X, Loader2, ChevronLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

const allTransactions = [
  { id: 1, title: "Fatura de Março", date: "15/03/2025", value: -85.9, type: "expense" },
  { id: 2, title: "Desconto Economia", date: "10/03/2025", value: 17.5, type: "income" },
  { id: 3, title: "Fatura de Fevereiro", date: "15/02/2025", value: -92.3, type: "expense" },
  { id: 4, title: "Bônus Conquista", date: "08/02/2025", value: 5.0, type: "income" },
  { id: 5, title: "Fatura de Janeiro", date: "15/01/2025", value: -78.5, type: "expense" },
  { id: 6, title: "Desconto Ranking Prata", date: "05/01/2025", value: 8.0, type: "income" },
  { id: 7, title: "Fatura de Dezembro", date: "15/12/2024", value: -95.0, type: "expense" },
  { id: 8, title: "Bônus Comunidade", date: "20/12/2024", value: 3.5, type: "income" },
];

const monthlyData = [
  { month: "Out", expense: 88, saving: 10 }, { month: "Nov", expense: 90, saving: 12 },
  { month: "Dez", expense: 95, saving: 8 }, { month: "Jan", expense: 78.5, saving: 13 },
  { month: "Fev", expense: 92.3, saving: 10 }, { month: "Mar", expense: 85.9, saving: 17.5 },
];

const banks = [
  { name: "Nubank", color: "#8B5CF6", url: "https://nubank.com.br" },
  { name: "Itaú", color: "#FF6600", url: "https://itau.com.br" },
  { name: "Inter", color: "#FF7A00", url: "https://bancointer.com.br" },
  { name: "Santander", color: "#CC0000", url: "https://santander.com.br" },
  { name: "Bradesco", color: "#CC092F", url: "https://bradesco.com.br" },
  { name: "Banco do Brasil", color: "#FFCC00", url: "https://bb.com.br" },
];

const faturas = [
  { id: 1, mes: "Março/2025", valor: 85.9, venc: "15/03/2025", status: "pendente" },
  { id: 2, mes: "Fevereiro/2025", valor: 92.3, venc: "15/02/2025", status: "paga" },
  { id: 3, mes: "Janeiro/2025", valor: 78.5, venc: "15/01/2025", status: "paga" },
  { id: 4, mes: "Dezembro/2024", valor: 95.0, venc: "15/12/2024", status: "paga" },
];

type SubPage = "main" | "pix" | "segunda_via" | "faturas" | "historico" | "todas_transacoes" | "comprovante";

const PagamentosPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [subPage, setSubPage] = useState<SubPage>("main");
  const [pixCopied, setPixCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pixCode] = useState(() => `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${(85.9).toFixed(2)}5802BR`);
  const [faturaTab, setFaturaTab] = useState<"pendente" | "paga">("pendente");

  const balance = 85.9;
  const totalSaved = 17.5;
  const filtered = filter === "all" ? allTransactions.slice(0, 5) : allTransactions.filter((t) => t.type === filter).slice(0, 5);

  const copyPix = async () => {
    try { await navigator.clipboard.writeText(pixCode); } catch { /* fallback */ }
    setPixCopied(true);
    toast({ title: "Chave Pix copiada!", description: "Cole no app do seu banco." });
    setTimeout(() => setPixCopied(false), 3000);
  };

  const confirmPayment = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); setSubPage("comprovante"); }, 2000);
  };

  const downloadFatura = (mes: string) => {
    toast({ title: "PDF gerado com sucesso!", description: `Fatura de ${mes} pronta para download.` });
  };

  // Sub-page header
  const SubHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="px-5 pt-12 pb-4 flex items-center justify-between">
      <button onClick={onBack}><ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} /></button>
      <h1 className="font-display font-bold text-foreground text-lg">{title}</h1>
      <ThemeToggle />
    </div>
  );

  // PIX page
  if (subPage === "pix") return (
    <div className="min-h-screen bg-background pb-20">
      <SubHeader title="Pagar com Pix" onBack={() => setSubPage("main")} />
      <div className="px-5 space-y-4">
        <div className="bg-card rounded-2xl shadow-card p-5 text-center">
          <div className="w-40 h-40 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
            <QrCode className="w-24 h-24 text-primary" strokeWidth={1} />
          </div>
          <p className="font-display font-bold text-foreground text-lg mb-1">R$ {balance.toFixed(2)}</p>
          <p className="font-body text-xs text-cinza-medio">Fatura de Março/2025</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-4">
          <label className="text-xs font-display font-semibold text-foreground mb-2 block">Pix Copia e Cola</label>
          <div className="bg-muted rounded-xl p-3 mb-3"><p className="font-body text-xs text-cinza-medio break-all">{pixCode}</p></div>
          <button onClick={copyPix} className={`w-full py-3 rounded-full font-display font-semibold flex items-center justify-center gap-2 transition-all ${pixCopied ? "bg-accent text-accent-foreground" : "gradient-primary text-primary-foreground"}`}>
            {pixCopied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Código</>}
          </button>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-4">
          <label className="text-xs font-display font-semibold text-foreground mb-3 block">Ir para o meu Banco</label>
          <div className="grid grid-cols-3 gap-2">
            {banks.map((b) => (
              <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                  <ExternalLink className="w-3.5 h-3.5" style={{ color: b.color }} />
                </div>
                <span className="text-[9px] font-body text-foreground">{b.name}</span>
              </a>
            ))}
          </div>
        </div>
        <button onClick={confirmPayment} disabled={paying} className="w-full py-3.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2">
          {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          {paying ? "Verificando pagamento..." : "Já realizei o pagamento"}
        </button>
        <button onClick={() => setSubPage("main")} className="w-full py-3 rounded-full border border-destructive text-destructive font-display font-semibold text-sm">
          Cancelar e Voltar
        </button>
      </div>
    </div>
  );

  // Comprovante
  if (subPage === "comprovante") return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <motion.div className="text-center w-full max-w-sm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-20 h-20 rounded-full bg-verde-sucesso/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-verde-sucesso" />
        </div>
        <h2 className="font-display font-bold text-foreground text-xl mb-2">Pagamento Confirmado!</h2>
        <div className="bg-card rounded-2xl shadow-card p-4 mb-6 text-left">
          <div className="flex justify-between py-2 border-b border-border"><span className="text-xs text-cinza-medio font-body">Valor</span><span className="font-display font-bold text-sm text-foreground">R$ {balance.toFixed(2)}</span></div>
          <div className="flex justify-between py-2 border-b border-border"><span className="text-xs text-cinza-medio font-body">Referência</span><span className="font-display font-bold text-sm text-foreground">Março/2025</span></div>
          <div className="flex justify-between py-2"><span className="text-xs text-cinza-medio font-body">Data</span><span className="font-display font-bold text-sm text-foreground">{new Date().toLocaleDateString("pt-BR")}</span></div>
        </div>
        <button onClick={() => setSubPage("main")} className="w-full py-3.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold">Voltar aos Pagamentos</button>
      </motion.div>
    </div>
  );

  // 2ª Via
  if (subPage === "segunda_via") return (
    <div className="min-h-screen bg-background pb-20">
      <SubHeader title="2ª Via de Fatura" onBack={() => setSubPage("main")} />
      <div className="px-5 space-y-3">
        {faturas.filter((f) => f.status === "pendente").map((f) => (
          <div key={f.id} className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm text-foreground">{f.mes}</p>
              <span className="text-[10px] text-cinza-medio font-body">Venc: {f.venc} — R$ {f.valor.toFixed(2)}</span>
            </div>
            <button onClick={() => downloadFatura(f.mes)} className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"><Download className="w-4 h-4 text-primary" /></button>
          </div>
        ))}
        {faturas.filter((f) => f.status === "pendente").length === 0 && <p className="text-center text-sm text-cinza-medio font-body py-8">Nenhuma fatura em aberto</p>}
      </div>
    </div>
  );

  // Faturas
  if (subPage === "faturas") return (
    <div className="min-h-screen bg-background pb-20">
      <SubHeader title="Faturas" onBack={() => setSubPage("main")} />
      <div className="px-5">
        <div className="flex gap-2 mb-4">
          {(["pendente", "paga"] as const).map((t) => (
            <button key={t} onClick={() => setFaturaTab(t)} className={`flex-1 py-2.5 rounded-full text-xs font-display font-medium transition-colors ${faturaTab === t ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}>
              {t === "pendente" ? "Pendentes" : "Pagas"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {faturas.filter((f) => f.status === faturaTab).map((f) => (
            <motion.div key={f.id} className="bg-card rounded-2xl shadow-card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-bold text-foreground">{f.mes}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-display ${f.status === "paga" ? "bg-verde-sucesso/10 text-verde-sucesso" : "bg-amarelo-alerta/10 text-amarelo-alerta"}`}>
                  {f.status === "paga" ? "Paga" : "Pendente"}
                </span>
              </div>
              <p className="font-display font-bold text-lg text-foreground">R$ {f.valor.toFixed(2)}</p>
              <p className="text-[10px] text-cinza-medio font-body">Vencimento: {f.venc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // Histórico (chart)
  if (subPage === "historico") {
    const maxE = Math.max(...monthlyData.map((d) => d.expense));
    return (
      <div className="min-h-screen bg-background pb-20">
        <SubHeader title="Histórico" onBack={() => setSubPage("main")} />
        <div className="px-5">
          <div className="bg-card rounded-2xl shadow-card p-4">
            <h3 className="font-display font-bold text-foreground text-sm mb-4">Despesas vs Economia (6 meses)</h3>
            <div className="flex items-end gap-3 h-40">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "120px" }}>
                    <motion.div className="absolute bottom-0 w-full rounded-t-lg bg-destructive/20" initial={{ height: 0 }} animate={{ height: `${(d.expense / maxE) * 100}%` }} transition={{ delay: 0.2 }} />
                    <motion.div className="absolute bottom-0 w-2/3 left-1/6 rounded-t-lg bg-verde-sucesso/60" initial={{ height: 0 }} animate={{ height: `${(d.saving / maxE) * 100}%` }} transition={{ delay: 0.4 }} />
                  </div>
                  <span className="text-[9px] text-cinza-medio font-body">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive/20" /><span className="text-[10px] text-cinza-medio font-body">Despesas</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-verde-sucesso/60" /><span className="text-[10px] text-cinza-medio font-body">Economia</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Todas as transações
  if (subPage === "todas_transacoes") return (
    <div className="min-h-screen bg-background pb-20">
      <SubHeader title="Todas as Transações" onBack={() => setSubPage("main")} />
      <div className="px-5">
        <div className="flex gap-2 mb-3">
          {(["all", "income", "expense"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-colors ${filter === f ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}>
              {f === "all" ? "Todos" : f === "income" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {(filter === "all" ? allTransactions : allTransactions.filter((t) => t.type === filter)).map((t, i) => (
            <motion.div key={t.id} className="bg-card rounded-xl shadow-card p-3.5 flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-verde-sucesso/10" : "bg-primary/10"}`}>
                {t.type === "income" ? <TrendingUp className="w-5 h-5 text-verde-sucesso" /> : <Receipt className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1"><p className="font-display font-bold text-foreground text-sm">{t.title}</p><span className="text-[10px] text-cinza-medio font-body">{t.date}</span></div>
              <span className={`font-display font-bold text-sm ${t.type === "income" ? "text-verde-sucesso" : "text-foreground"}`}>{t.type === "income" ? "+" : "-"} R$ {Math.abs(t.value).toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // MAIN page
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-20 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Pagamentos</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-primary-foreground/70 text-xs font-body">Saldo Atual</span>
            <button onClick={() => setShowBalance(!showBalance)}>{showBalance ? <Eye className="w-4 h-4 text-primary-foreground/70" /> : <EyeOff className="w-4 h-4 text-primary-foreground/70" />}</button>
          </div>
          <p className="text-primary-foreground font-display font-bold text-3xl mb-3">{showBalance ? `R$ ${balance.toFixed(2)}` : "R$ ••••"}</p>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1"><TrendingDown className="w-3 h-3 text-vermelho-critico" /><span className="text-[10px] text-primary-foreground/60 font-body">Despesas</span></div>
              <span className="text-primary-foreground font-display font-bold text-sm">{showBalance ? "R$ 256,70" : "••••"}</span>
            </div>
            <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1"><TrendingUp className="w-3 h-3 text-verde-sucesso" /><span className="text-[10px] text-primary-foreground/60 font-body">Economizado</span></div>
              <span className="text-primary-foreground font-display font-bold text-sm">{showBalance ? `R$ ${totalSaved.toFixed(2)}` : "••••"}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: QrCode, label: "Pagar Pix", action: () => setSubPage("pix") },
              { icon: Download, label: "2ª Via", action: () => setSubPage("segunda_via") },
              { icon: Receipt, label: "Faturas", action: () => setSubPage("faturas") },
              { icon: BarChart3, label: "Histórico", action: () => setSubPage("historico") },
            ].map((a) => (
              <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-1.5 group">
                <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center group-hover:bg-primary-foreground/25 transition-colors">
                  <a.icon className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] text-primary-foreground/80 font-body">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5 -mt-8">
        <motion.div className="bg-card rounded-2xl shadow-card p-4 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-foreground text-sm">Estatísticas</h3>
            <span className="text-[10px] text-cinza-medio font-body bg-muted px-2 py-1 rounded-full">Mensal</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {monthlyData.map((d) => {
              const maxE = Math.max(...monthlyData.map((m) => m.expense));
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "80px" }}>
                    <motion.div className="absolute bottom-0 w-full rounded-t-lg gradient-primary" initial={{ height: 0 }} animate={{ height: `${(d.expense / maxE) * 100}%` }} transition={{ delay: 0.3 }} />
                  </div>
                  <span className="text-[9px] text-cinza-medio font-body">{d.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-foreground text-sm">Transações Recentes</h3>
          <button onClick={() => setSubPage("todas_transacoes")} className="text-[10px] text-primary font-display font-medium">Ver tudo</button>
        </div>
        <div className="flex gap-2 mb-3">
          {(["all", "income", "expense"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-colors ${filter === f ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}>
              {f === "all" ? "Todos" : f === "income" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((t, i) => (
            <motion.div key={t.id} className="bg-card rounded-xl shadow-card p-3.5 flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-verde-sucesso/10" : "bg-primary/10"}`}>
                {t.type === "income" ? <TrendingUp className="w-5 h-5 text-verde-sucesso" /> : <Receipt className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1"><p className="font-display font-bold text-foreground text-sm">{t.title}</p><span className="text-[10px] text-cinza-medio font-body">{t.date}</span></div>
              <span className={`font-display font-bold text-sm ${t.type === "income" ? "text-verde-sucesso" : "text-foreground"}`}>{t.type === "income" ? "+" : "-"} R$ {Math.abs(t.value).toFixed(2)}</span>
            </motion.div>
          ))}
        </div>

        <motion.button onClick={() => setSubPage("pix")} className="w-full mt-4 py-3.5 rounded-full gradient-primary font-display font-semibold text-primary-foreground shadow-card-hover flex items-center justify-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <CreditCard className="w-5 h-5" /> Pagar Fatura com Pix
        </motion.button>
      </div>
    </div>
  );
};

export default PagamentosPage;
