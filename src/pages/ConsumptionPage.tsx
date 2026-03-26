import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";

function generateDatesAround(center: Date, range: number) {
  const dates: Date[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function getConsumptionForDate(dateStr: string, history: Record<string, number>): number {
  if (history[dateStr]) return history[dateStr];
  const seed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);
  return Math.round(150 + rng() * 150);
}

function getHourlyData(dateStr: string) {
  const seed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);
  return ["6h", "8h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"].map((hour) => ({
    hour,
    value: Math.round(5 + rng() * 35),
  }));
}

const ConsumptionPage = () => {
  const navigate = useNavigate();
  const { consumptionHistory } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [centerDate, setCenterDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Semanal");
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => generateDatesAround(centerDate, 60), [centerDate]);

  const dateStr = selectedDate.toISOString().split("T")[0];
  const totalDay = getConsumptionForDate(dateStr, consumptionHistory);
  const hourlyData = getHourlyData(dateStr);
  const maxVal = Math.max(...hourlyData.map((d) => d.value));

  const visibleMonth = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  useEffect(() => {
    if (scrollRef.current) {
      const centerIdx = dates.findIndex((d) => d.toDateString() === selectedDate.toDateString());
      if (centerIdx >= 0) {
        const el = scrollRef.current.children[centerIdx] as HTMLElement;
        if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDate]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft < 100) {
      const newCenter = new Date(centerDate);
      newCenter.setDate(newCenter.getDate() - 30);
      setCenterDate(newCenter);
    } else if (scrollLeft > scrollWidth - clientWidth - 100) {
      const newCenter = new Date(centerDate);
      newCenter.setDate(newCenter.getDate() + 30);
      setCenterDate(newCenter);
    }
  };

  // Chart
  const chartW = 300;
  const chartH = 100;
  const points = hourlyData.map((d, i) => ({
    x: 20 + (i / (hourlyData.length - 1)) * (chartW - 40),
    y: 10 + (chartH - 20) - (d.value / maxVal) * (chartH - 30),
  }));
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    return `${acc} C${prev.x + (p.x - prev.x) * 0.4},${prev.y} ${prev.x + (p.x - prev.x) * 0.6},${p.y} ${p.x},${p.y}`;
  }, "");
  const areaD = `${pathD} L${points[points.length - 1].x},${chartH} L${points[0].x},${chartH} Z`;

  // Weekly data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - selectedDate.getDay() + i);
    const ds = d.toISOString().split("T")[0];
    return { label: dayNames[d.getDay()], value: getConsumptionForDate(ds, consumptionHistory) };
  });
  const weekMax = Math.max(...weeklyData.map((d) => d.value));
  const weekPoints = weeklyData.map((d, i) => ({
    x: 20 + (i / 6) * (chartW - 40),
    y: 10 + (80 - 20) - (d.value / weekMax) * (80 - 30),
  }));
  const weekPathD = weekPoints.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = weekPoints[i - 1];
    return `${acc} C${prev.x + (p.x - prev.x) * 0.4},${prev.y} ${prev.x + (p.x - prev.x) * 0.6},${p.y} ${p.x},${p.y}`;
  }, "");
  const weekAreaD = `${weekPathD} L${weekPoints[6].x},80 L${weekPoints[0].x},80 Z`;

  const generatePDFReport = () => {
    const lines = [
      "=== RELATÓRIO DE CONSUMO DE ÁGUA ===",
      `Data: ${selectedDate.toLocaleDateString("pt-BR")}`,
      `Consumo Total: ${totalDay} Litros`,
      "",
      "--- Consumo por Hora ---",
      ...hourlyData.map((h) => `${h.hour}: ${h.value}L`),
      "",
      "--- Consumo Semanal ---",
      ...weeklyData.map((w) => `${w.label}: ${w.value}L`),
      "",
      `Total Semanal: ${weeklyData.reduce((s, w) => s + w.value, 0)}L`,
      `Média Diária: ${Math.round(weeklyData.reduce((s, w) => s + w.value, 0) / 7)}L`,
      "",
      "Gerado pelo app Saneamento Cuiabá",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-consumo-${dateStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowReport(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Meu Consumo</h1>
          <ThemeToggle className="text-foreground" />
        </div>

        {/* Month indicator */}
        <p className="text-center text-xs font-display font-semibold text-primary mb-2">{visibleMonth}</p>

        {/* Infinite date selector */}
        <div ref={scrollRef} onScroll={handleScroll}
          className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollSnapType: "x mandatory" }}>
          {dates.map((d) => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <button key={d.toISOString()} onClick={() => setSelectedDate(new Date(d))}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-shrink-0 snap-center transition-all ${isSelected ? "bg-accent text-accent-foreground shadow-card-hover" : isToday ? "bg-primary/10" : ""}`}>
                <span className={`text-[10px] font-body ${isSelected ? "text-accent-foreground" : "text-cinza-claro"}`}>{dayNames[d.getDay()]}</span>
                <p className={`text-sm font-display font-bold ${isSelected ? "text-accent-foreground" : "text-cinza-medio"}`}>{d.getDate()}</p>
              </button>
            );
          })}
        </div>

        {/* Today hero */}
        <motion.div className="flex items-center gap-4 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <svg viewBox="0 0 60 78" className="w-14 h-18 flex-shrink-0">
            <defs><linearGradient id="cDropG" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="hsl(202,62%,50%)" /><stop offset="100%" stopColor="hsl(195,60%,70%)" /></linearGradient></defs>
            <path d="M30 3 C30 3 6 38 6 54 C6 68 17 78 30 78 C43 78 54 68 54 54 C54 38 30 3 30 3Z" fill="url(#cDropG)" />
            <text x="30" y="58" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">{totalDay}</text>
          </svg>
          <div>
            <p className="font-display font-bold text-foreground text-xl">{totalDay} Litros</p>
            <span className="font-body text-cinza-medio text-xs">{selectedDate.toLocaleDateString("pt-BR")}</span>
          </div>
        </motion.div>

        {/* Hourly chart */}
        <motion.div className="bg-card rounded-2xl shadow-card p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-display font-bold text-foreground text-sm mb-3">Consumo por Hora</h3>
          <svg viewBox={`0 0 ${chartW} ${chartH + 16}`} className="w-full" style={{ maxHeight: "140px" }}>
            <defs><linearGradient id="caFill" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="hsl(202,62%,55%)" stopOpacity="0.25" /><stop offset="100%" stopColor="hsl(202,62%,55%)" stopOpacity="0.02" /></linearGradient></defs>
            {[0,1,2,3,4].map((i) => <line key={i} x1="20" x2={chartW-20} y1={10+(chartH-20)*(i/4)} y2={10+(chartH-20)*(i/4)} stroke="hsl(200,15%,92%)" strokeWidth="0.5" />)}
            <path d={areaD} fill="url(#caFill)" />
            <path d={pathD} fill="none" stroke="hsl(202,62%,55%)" strokeWidth="2" strokeLinecap="round" />
            {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(202,62%,55%)" stroke="white" strokeWidth="1.5" />)}
            {hourlyData.map((d, i) => <text key={d.hour} x={points[i].x} y={chartH+12} textAnchor="middle" fontSize="7" fill="hsl(200,15%,55%)">{d.hour}</text>)}
          </svg>
        </motion.div>

        {/* Weekly chart */}
        <motion.div className="bg-card rounded-2xl shadow-card p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-foreground text-sm">Histórico de Uso</h3>
            <div className="flex gap-1">
              {["Semanal","Mensal","Anual"].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-display font-medium transition-colors ${activeTab === t ? "gradient-primary text-primary-foreground" : "bg-muted text-cinza-medio"}`}>{t}</button>
              ))}
            </div>
          </div>
          <svg viewBox={`0 0 ${chartW} 96`} className="w-full" style={{ maxHeight: "110px" }}>
            <defs><linearGradient id="wkFill" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="hsl(175,40%,55%)" stopOpacity="0.2" /><stop offset="100%" stopColor="hsl(175,40%,55%)" stopOpacity="0.02" /></linearGradient></defs>
            <path d={weekAreaD} fill="url(#wkFill)" />
            <path d={weekPathD} fill="none" stroke="hsl(175,40%,55%)" strokeWidth="2" strokeLinecap="round" />
            {weekPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(175,40%,55%)" stroke="white" strokeWidth="1.5" />)}
            {weeklyData.map((d, i) => <text key={d.label} x={weekPoints[i].x} y={92} textAnchor="middle" fontSize="8" fill="hsl(200,15%,55%)">{d.label}</text>)}
          </svg>
        </motion.div>

        {/* Report button */}
        <button onClick={() => setShowReport(true)} className="w-full py-3.5 rounded-full gradient-primary font-display font-semibold text-primary-foreground shadow-card-hover flex items-center justify-center gap-2">
          <FileDown className="w-5 h-5" /> Ver Relatório Completo
        </button>
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReport(false)}>
            <motion.div className="bg-card rounded-2xl shadow-card p-6 mx-6 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">Relatório de Consumo</h3>
              <p className="font-body text-sm text-cinza-medio mb-1">{selectedDate.toLocaleDateString("pt-BR")} — {totalDay}L consumidos</p>
              <p className="font-body text-xs text-cinza-claro mb-4">Semanal: {weeklyData.reduce((s, w) => s + w.value, 0)}L | Média: {Math.round(weeklyData.reduce((s, w) => s + w.value, 0) / 7)}L/dia</p>
              <div className="flex gap-3">
                <button onClick={generatePDFReport} className="flex-1 py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-1 text-sm">
                  <FileDown className="w-4 h-4" /> Gerar Relatório
                </button>
                <button onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-full border border-primary text-primary font-display font-semibold text-sm">Fechar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsumptionPage;
