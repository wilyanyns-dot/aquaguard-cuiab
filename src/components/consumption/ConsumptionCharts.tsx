import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function getConsumption(dateStr: string, history: Record<string, number>): number {
  if (history[dateStr]) return history[dateStr];
  const seed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round(20 + seededRandom(seed)() * 40);
}

function getHourlyData(dateStr: string) {
  const seed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}h`,
    value: Math.round(rng() * 8),
  }));
}

interface ConsumptionChartsProps {
  selectedDate: Date;
  consumptionHistory: Record<string, number>;
}

type TabType = "Diário" | "Mensal" | "Anual";

const ConsumptionCharts = ({ selectedDate, consumptionHistory }: ConsumptionChartsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("Diário");
  const dateStr = selectedDate.toISOString().split("T")[0];

  const tabData = useMemo(() => {
    if (activeTab === "Diário") {
      return getHourlyData(dateStr).filter((_, i) => i % 3 === 0).map(d => ({ label: d.hour, value: d.value }));
    } else if (activeTab === "Mensal") {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(year, month, i + 1);
        return { label: `${i + 1}`, value: getConsumption(d.toISOString().split("T")[0], consumptionHistory) };
      });
    } else {
      const year = selectedDate.getFullYear();
      return Array.from({ length: 12 }, (_, i) => {
        const daysInMonth = new Date(year, i + 1, 0).getDate();
        let total = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          total += getConsumption(new Date(year, i, d).toISOString().split("T")[0], consumptionHistory);
        }
        return { label: monthNames[i], value: Math.round(total / daysInMonth) };
      });
    }
  }, [activeTab, dateStr, selectedDate, consumptionHistory]);

  const tabMax = Math.max(...tabData.map(d => d.value), 1);

  const hourlyData = useMemo(() => {
    if (activeTab !== "Diário") return [];
    return getHourlyData(dateStr).filter((_, i) => i % 3 === 0);
  }, [activeTab, dateStr]);

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
            Total: {tabData.reduce((s, d) => s + d.value, 0).toLocaleString("pt-BR")} L · Média: {Math.round(tabData.reduce((s, d) => s + d.value, 0) / tabData.length)} L/{activeTab === "Anual" ? "mês" : "dia"}
          </span>
        </div>
      </motion.div>

      {/* Hourly breakdown */}
      {activeTab === "Diário" && (
        <motion.div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-bold text-foreground text-sm mb-3">Consumo por Hora</h3>
          <div className="grid grid-cols-8 gap-1">
            {hourlyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-16 relative rounded-md overflow-hidden bg-card/30">
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-sm"
                    style={{ background: `linear-gradient(to top, hsl(var(--accent)), hsl(var(--primary) / 0.5))` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.value / 8) * 100}%` }}
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
