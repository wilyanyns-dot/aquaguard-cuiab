import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileDown, ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

function generateDatesAround(center: Date, range: number) {
  const dates: Date[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const dayNamesShort = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
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
  const { consumptionHistory, user } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [centerDate, setCenterDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"Semanal" | "Mensal" | "Anual">("Semanal");
  const [showReport, setShowReport] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const scrollRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => generateDatesAround(centerDate, 60), [centerDate]);

  const dateStr = selectedDate.toISOString().split("T")[0];
  const hasData = Object.keys(consumptionHistory).length > 0;
  const totalDay = hasData ? getConsumptionForDate(dateStr, consumptionHistory) : 0;
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
  }, [selectedDate, dates]);

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

  // Chart helpers
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

  // Data for tabs
  const getTabData = useCallback(() => {
    if (activeTab === "Semanal") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - selectedDate.getDay() + i);
        const ds = d.toISOString().split("T")[0];
        return { label: dayNamesShort[d.getDay()], value: getConsumptionForDate(ds, consumptionHistory) };
      });
    } else if (activeTab === "Mensal") {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
        if (d.getMonth() !== selectedDate.getMonth()) return null;
        const ds = d.toISOString().split("T")[0];
        return { label: `${i + 1}`, value: getConsumptionForDate(ds, consumptionHistory) };
      }).filter(Boolean) as { label: string; value: number }[];
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const month = monthNames[i].substring(0, 3);
        let total = 0;
        const daysInMonth = new Date(selectedDate.getFullYear(), i + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const ds = new Date(selectedDate.getFullYear(), i, d).toISOString().split("T")[0];
          total += getConsumptionForDate(ds, consumptionHistory);
        }
        return { label: month, value: Math.round(total / daysInMonth) };
      });
    }
  }, [activeTab, selectedDate, consumptionHistory]);

  const tabData = getTabData();
  const tabMax = Math.max(...tabData.map((d) => d.value), 1);

  // Calendar grid for modal
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevDays = new Date(calendarYear, calendarMonth, 0).getDate();
    const grid: { day: number; currentMonth: boolean; date: Date }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push({ day: prevDays - i, currentMonth: false, date: new Date(calendarYear, calendarMonth - 1, prevDays - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({ day: i, currentMonth: true, date: new Date(calendarYear, calendarMonth, i) });
    }
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({ day: i, currentMonth: false, date: new Date(calendarYear, calendarMonth + 1, i) });
    }
    return grid;
  }, [calendarMonth, calendarYear]);

  const selectFromCalendar = (date: Date) => {
    setSelectedDate(date);
    setCenterDate(date);
    setShowCalendarModal(false);
  };

  // PDF generation
  const generatePDF = () => {
    if (!hasData) {
      toast({ title: "Sem dados", description: "Não há registros de consumo para exportar.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Header
    doc.setFillColor(79, 167, 214);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Saneamento Cuiabá", 15, 15);
    doc.setFontSize(11);
    doc.text("Relatório de Consumo de Água", 15, 25);

    // Client info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Cliente: ${user?.nome || "Usuário"}`, 15, 45);
    doc.text(`Período: ${monthNames[month]} / ${year}`, 15, 52);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 15, 59);

    // Table header
    doc.setFillColor(240, 245, 250);
    doc.rect(15, 68, 180, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Data", 20, 74);
    doc.text("Consumo (Litros)", 130, 74);

    // Table rows
    let y = 82;
    let totalMonth = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = new Date(year, month, d).toISOString().split("T")[0];
      const val = getConsumptionForDate(ds, consumptionHistory);
      totalMonth += val;
      if (d % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y - 5, 180, 7, "F");
      }
      doc.setTextColor(60, 60, 60);
      doc.text(`${String(d).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`, 20, y);
      doc.text(`${val} L`, 140, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    // Summary
    y += 5;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(79, 167, 214);
    doc.rect(15, y - 5, 180, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`Consumo Total: ${totalMonth.toLocaleString("pt-BR")} Litros`, 20, y + 3);
    doc.text(`Média Diária: ${Math.round(totalMonth / daysInMonth)} Litros`, 20, y + 11);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Gerado pelo app Saneamento Cuiabá — ODS 6", 15, 290);

    doc.save(`relatorio_consumo_${String(month + 1).padStart(2, "0")}_${year}.pdf`);
    toast({ title: "PDF gerado!", description: "O download foi iniciado." });
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

        {/* Month indicator - clickable to open calendar */}
        <button onClick={() => { setCalendarMonth(selectedDate.getMonth()); setCalendarYear(selectedDate.getFullYear()); setShowCalendarModal(true); }} className="mx-auto block text-center text-xs font-display font-semibold text-primary mb-2 flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3" /> {visibleMonth}
        </button>

        {/* Infinite date selector */}
        <div ref={scrollRef} onScroll={handleScroll}
          className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
          {dates.map((d) => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <button key={d.toISOString()} onClick={() => setSelectedDate(new Date(d))}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-shrink-0 snap-center transition-all ${isSelected ? "bg-accent text-accent-foreground shadow-card-hover" : isToday ? "bg-primary/10" : ""}`}>
                <span className={`text-[10px] font-body ${isSelected ? "text-accent-foreground" : "text-cinza-claro"}`}>{dayNamesShort[d.getDay()]}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-accent-foreground/20" : ""}`}>
                  <p className={`text-sm font-display font-bold ${isSelected ? "text-accent-foreground" : "text-cinza-medio"}`}>{d.getDate()}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Today hero */}
        {hasData ? (
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
        ) : (
          <div className="text-center py-8 mb-4">
            <p className="font-display font-semibold text-cinza-medio">Sem dados anteriores</p>
          </div>
        )}

        {/* Hourly chart */}
        {hasData && (
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
        )}

        {/* History chart with functional tabs */}
        {hasData && (
          <motion.div className="bg-card rounded-2xl shadow-card p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground text-sm">Histórico de Uso</h3>
              <div className="flex gap-1">
                {(["Semanal", "Mensal", "Anual"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-display font-medium transition-colors ${activeTab === t ? "gradient-primary text-primary-foreground" : "bg-muted text-cinza-medio"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-1 h-28">
              {tabData.map((d, i) => (
                <div key={`${activeTab}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "90px" }}>
                    <motion.div
                      className="absolute bottom-0 w-full rounded-t-lg"
                      style={{ background: "linear-gradient(to top, hsl(175,40%,45%), hsl(175,40%,60%))" }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.value / tabMax) * 100}%` }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                    />
                  </div>
                  <span className="text-[7px] text-cinza-medio font-body truncate w-full text-center">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-cinza-medio font-body">
                Total: {tabData.reduce((s, d) => s + d.value, 0).toLocaleString("pt-BR")} L | Média: {Math.round(tabData.reduce((s, d) => s + d.value, 0) / tabData.length)} L/{activeTab === "Anual" ? "mês" : "dia"}
              </span>
            </div>
          </motion.div>
        )}

        {/* Report button */}
        <button onClick={() => setShowReport(true)} className="w-full py-3.5 rounded-full gradient-primary font-display font-semibold text-primary-foreground shadow-card-hover flex items-center justify-center gap-2">
          <FileDown className="w-5 h-5" /> Ver Relatório Completo
        </button>
      </div>

      {/* Calendar grid modal */}
      <AnimatePresence>
        {showCalendarModal && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCalendarModal(false)}>
            <motion.div className="bg-card rounded-2xl shadow-card p-5 mx-5 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }}>
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <span className="font-display font-bold text-foreground">{monthNames[calendarMonth]} {calendarYear}</span>
                <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }}>
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNamesShort.map(d => <span key={d} className="text-[9px] font-display font-semibold text-cinza-medio text-center">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cd, i) => {
                  const isSelected = cd.date.toDateString() === selectedDate.toDateString();
                  const isToday = cd.date.toDateString() === new Date().toDateString();
                  return (
                    <button key={i} onClick={() => selectFromCalendar(cd.date)} className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-display transition-colors ${!cd.currentMonth ? "opacity-30" : ""} ${isSelected ? "bg-accent text-accent-foreground" : isToday ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>
                      {cd.day}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setShowCalendarModal(false)} className="w-full mt-4 py-2.5 rounded-full border border-border text-foreground font-display font-medium text-sm">Fechar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReport(false)}>
            <motion.div className="bg-card rounded-2xl shadow-card p-6 mx-6 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">Relatório de Consumo</h3>
              <p className="font-body text-sm text-cinza-medio mb-1">{selectedDate.toLocaleDateString("pt-BR")} — {totalDay}L consumidos</p>
              <p className="font-body text-xs text-cinza-claro mb-4">
                {activeTab}: {tabData.reduce((s, d) => s + d.value, 0).toLocaleString("pt-BR")}L | Média: {Math.round(tabData.reduce((s, d) => s + d.value, 0) / tabData.length)}L/dia
              </p>
              <div className="flex gap-3">
                <button onClick={generatePDF} className="flex-1 py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-1 text-sm">
                  <FileDown className="w-4 h-4" /> Gerar PDF
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
