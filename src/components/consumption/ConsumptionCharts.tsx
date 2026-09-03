import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { dateKey, getConsumption, getHourly, getCreatedAt, isFuture } from "@/lib/consumption";

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface ConsumptionChartsProps {
  selectedDate: Date;
  consumptionHistory: Record<string, number>;
}

type TabType = "Diário" | "Mensal" | "Anual";

const ConsumptionCharts = ({ selectedDate, consumptionHistory }: ConsumptionChartsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("Diário");
  const dateStr = dateKey(selectedDate);

  const hourlyData = useMemo(() => getHourly(dateStr, consumptionHistory), [dateStr, consumptionHistory]);

  const tabData = useMemo(() => {
    if (activeTab === "Diário") {
      return hourlyData.map(d => ({ label: d.hour, value: d.value }));
    }
    if (activeTab === "Mensal") {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: days }, (_, i) => {
        const key = dateKey(new Date(year, month, i + 1));
        return { label: `${i + 1}`, value: isFuture(key) ? 0 : getConsumption(key, consumptionHistory) };
      });
    }
    // Anual: acumula desde a criação da conta até hoje, agrupado por mês
    const startKey = getCreatedAt();
    const startYear = Number(startKey.slice(0, 4));
    const year = selectedDate.getFullYear();
    const years = Array.from({ length: Math.max(year - startYear + 1, 1) }, (_, i) => startYear + i);
    const multiYear = years.length > 1;
    const rows: { label: string; value: number }[] = [];
    years.forEach(y => {
      for (let m = 0; m < 12; m++) {
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        let total = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const key = dateKey(new Date(y, m, d));
          if (key < startKey || isFuture(key)) continue;
          total += getConsumption(key, consumptionHistory);
        }
        if (total > 0 || !multiYear) {
          rows.push({ label: multiYear ? `${monthNames[m]}/${String(y).slice(2)}` : monthNames[m], value: total });
        }
      }
    });
    return rows;
  }, [activeTab, hourlyData, selectedDate, consumptionHistory]);

  const tabMax = Math.max(...tabData.map(d => d.value), 1);
  const hourlyMax = Math.max(...hourlyData.map(d => d.value), 1);
  const total = tabData.reduce((s, d) => s + d.value, 0);

  return (
    <>
      {/* Main chart */}
      <motion.div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-foreground text-sm">Histórico de Uso</h3>
          <div className="flex gap-1 bg-card/40 rounded-full p-0.5">
            {(["Diário", "Mensal", "Anual"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-display font-medium transition-all duration-200 ${activeTab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-[2px] h-32 px-1">
          {tabData.map((d, i) => (
            <div key={`${activeTab}-${i}`} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full relative" style={{ height: "110px" }}>
                <motion.div
                  className="absolute bottom-0 w-full rounded-t-md"
                  style={{ background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--accent) / 0.6))` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / tabMax) * 100}%` }}
                  transition={{ delay: i * 0.015, duration: 0.5, ease: "easeOut" }}
                />
              </div>
              {tabData.length <= 12 && (
                <span className="text-[6px] text-muted-foreground font-body truncate w-full text-center">{d.label}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-muted-foreground font-body">
            Total: {total.toLocaleString("pt-BR")} L · Média: {Math.round(total / Math.max(tabData.filter((d) => d.value > 0).length, 1))} L/{activeTab === "Anual" ? "mês" : activeTab === "Mensal" ? "dia" : "faixa"}
          </span>
        </div>
      </motion.div>

      {/* Hourly breakdown */}
      {activeTab === "Diário" && (
        <motion.div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-bold text-foreground text-sm mb-3">Consumo por Hora</h3>
          <div className="grid grid-cols-9 gap-1">
            {hourlyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-16 relative rounded-md overflow-hidden bg-card/30">
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-sm"
                    style={{ background: `linear-gradient(to top, hsl(var(--accent)), hsl(var(--primary) / 0.5))` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.value / hourlyMax) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  />
                </div>
                <span className="text-[7px] text-muted-foreground">{d.hour}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ConsumptionCharts;
