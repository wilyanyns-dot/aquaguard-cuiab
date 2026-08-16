import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileDown, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { generateConsumptionPDF, type ReportScope, type ReportRow } from "@/lib/pdfReport";

import WaveBackground from "@/components/consumption/WaveBackground";
import WaterDrop from "@/components/consumption/WaterDrop";
import MonthPicker from "@/components/consumption/MonthPicker";
import InfiniteWeekScroll from "@/components/consumption/InfiniteWeekScroll";
import ConsumptionCharts from "@/components/consumption/ConsumptionCharts";
import GoalSetter from "@/components/consumption/GoalSetter";

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function getConsumptionForDate(dateStr: string, history: Record<string, number>): number {
  if (history[dateStr]) return history[dateStr];
  const seed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round(20 + seededRandom(seed)() * 40);
}

const ConsumptionPage = () => {
  const navigate = useNavigate();
  const { consumptionHistory, user } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoal, setDailyGoal] = useState(50);
  const [showReport, setShowReport] = useState(false);
  const [scope, setScope] = useState<ReportScope>("Mensal");

  const hasData = Object.keys(consumptionHistory).length > 0;
  const dateStr = selectedDate.toISOString().split("T")[0];
  const totalDay = hasData ? getConsumptionForDate(dateStr, consumptionHistory) : 0;

  const buildRows = (s: ReportScope): { rows: ReportRow[]; period: string } => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    if (s === "Anual") {
      const rows = monthNames.map((name, m) => {
        const days = new Date(year, m + 1, 0).getDate();
        let total = 0;
        for (let d = 1; d <= days; d++) {
          total += getConsumptionForDate(new Date(year, m, d).toISOString().split("T")[0], consumptionHistory);
        }
        return { label: `${name} / ${year}`, liters: total };
      });
      return { rows, period: `Ano de ${year}` };
    }

    if (s === "Diário") {
      const rows: ReportRow[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(year, month, selectedDate.getDate() - i);
        rows.push({
          label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }),
          liters: getConsumptionForDate(d.toISOString().split("T")[0], consumptionHistory),
        });
      }
      return { rows, period: `Últimos 7 dias até ${selectedDate.toLocaleDateString("pt-BR")}` };
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        label: d.toLocaleDateString("pt-BR"),
        liters: getConsumptionForDate(d.toISOString().split("T")[0], consumptionHistory),
      };
    });
    return { rows, period: `${monthNames[month]} / ${year}` };
  };

  const generatePDF = () => {
    if (!hasData) {
      toast({ title: "Sem dados", description: "Não há registros de consumo para exportar.", variant: "destructive" });
      return;
    }
    const { rows, period } = buildRows(scope);
    const doc = generateConsumptionPDF({
      scope,
      clientName: user?.nome || "Usuário",
      periodLabel: period,
      rows,
    });
    const stamp = scope === "Anual"
      ? `${selectedDate.getFullYear()}`
      : `${String(selectedDate.getMonth() + 1).padStart(2, "0")}_${selectedDate.getFullYear()}`;
    doc.save(`relatorio_consumo_${scope.toLowerCase()}_${stamp}.pdf`);
    toast({ title: "PDF gerado!", description: "O download foi iniciado." });
    setShowReport(false);
  };


  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      <WaveBackground />

      <div className="relative z-10 px-5 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card/40 backdrop-blur-md border border-border/30 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Meu Consumo</h1>
          <ThemeToggle className="text-foreground" />
        </div>

        {/* Month picker (opens calendar modal) */}
        <MonthPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Infinite horizontal date scroller */}
        <InfiniteWeekScroll selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Water drop */}
        {hasData ? (
          <motion.div className="flex flex-col items-center mb-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <WaterDrop liters={totalDay} goal={dailyGoal} dateLabel={selectedDate.toLocaleDateString("pt-BR")} />
            <GoalSetter goal={dailyGoal} onSetGoal={setDailyGoal} />
          </motion.div>
        ) : (
          <div className="text-center py-10 mb-4">
            <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="font-display font-semibold text-muted-foreground">Sem dados anteriores</p>
          </div>
        )}

        {/* Charts */}
        {hasData && (
          <ConsumptionCharts selectedDate={selectedDate} consumptionHistory={consumptionHistory} />
        )}

        {/* Report button */}
        <button
          onClick={() => setShowReport(true)}
          className="w-full py-3.5 rounded-2xl bg-primary/90 backdrop-blur-md border border-primary/30 font-display font-semibold text-primary-foreground shadow-card-hover flex items-center justify-center gap-2 hover:bg-primary transition-colors"
        >
          <FileDown className="w-5 h-5" /> Ver Relatório Completo
        </button>
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReport(false)}>
            <motion.div className="bg-card/90 backdrop-blur-xl border border-border/30 rounded-2xl shadow-card-hover p-6 mx-6 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">Relatório de Consumo</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">{selectedDate.toLocaleDateString("pt-BR")} — {totalDay}L consumidos</p>

              <p className="font-display text-xs font-semibold text-foreground mb-2">Escopo do relatório</p>
              <div className="flex gap-1 bg-card/40 rounded-full p-0.5 mb-4" role="group" aria-label="Escopo do relatório">
                {(["Diário", "Mensal", "Anual"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    aria-pressed={scope === s}
                    className={`flex-1 py-2 rounded-full text-[11px] font-display font-medium transition-all ${scope === s ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="font-body text-[11px] text-muted-foreground mb-4">
                {scope === "Anual" ? "Totais agrupados por mês do ano selecionado." : scope === "Mensal" ? "Detalhamento dia a dia do mês selecionado." : "Detalhamento dos últimos 7 dias."}
              </p>

              <div className="flex gap-3">
                <button onClick={generatePDF} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-1 text-sm">
                  <FileDown className="w-4 h-4" /> Gerar PDF
                </button>
                <button onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-full border border-border/30 text-foreground font-display font-semibold text-sm bg-card/30">Fechar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsumptionPage;
