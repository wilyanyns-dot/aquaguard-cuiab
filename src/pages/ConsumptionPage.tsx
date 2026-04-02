import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileDown, ChevronLeft, ChevronRight, X, Calendar, Target, Droplets } from "lucide-react";
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
  return Math.round(20 + rng() * 40);
}

function getHourlyData(dateStr: string) {
  const seed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}h`,
    value: Math.round(rng() * 8),
  }));
}

const ConsumptionPage = () => {
  const navigate = useNavigate();
  const { consumptionHistory, user } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [centerDate, setCenterDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"Diário" | "Mensal" | "Anual">("Diário");
  const [showReport, setShowReport] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [dailyGoal, setDailyGoal] = useState<number>(50);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalInputVal, setGoalInputVal] = useState("50");
  const scrollRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => generateDatesAround(centerDate, 60), [centerDate]);

  const dateStr = selectedDate.toISOString().split("T")[0];
  const hasData = Object.keys(consumptionHistory).length > 0;
  const totalDay = hasData ? getConsumptionForDate(dateStr, consumptionHistory) : 0;
  const hourlyData = getHourlyData(dateStr);
  const fillPercent = dailyGoal > 0 ? Math.min((totalDay / dailyGoal) * 100, 100) : 0;

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

  const getTabData = useCallback(() => {
    if (activeTab === "Diário") {
      // Show hourly data for selected day
      return hourlyData.filter((_, i) => i % 3 === 0).map(d => ({ label: d.hour, value: d.value }));
    } else if (activeTab === "Mensal") {
      return Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => {
        const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
        const ds = d.toISOString().split("T")[0];
        return { label: `${i + 1}`, value: getConsumptionForDate(ds, consumptionHistory) };
      });
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
  }, [activeTab, selectedDate, consumptionHistory, hourlyData]);

  const tabData = getTabData();
  const tabMax = Math.max(...tabData.map((d) => d.value), 1);

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

  const generatePDF = () => {
    if (!hasData) {
      toast({ title: "Sem dados", description: "Não há registros de consumo para exportar.", variant: "destructive" });
      return;
    }
    const doc = new jsPDF();
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Saneamento Cuiabá", 15, 15);
    doc.setFontSize(11);
    doc.text("Relatório de Consumo de Água", 15, 25);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Cliente: ${user?.nome || "Usuário"}`, 15, 45);
    doc.text(`Período: ${monthNames[month]} / ${year}`, 15, 52);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 15, 59);
    doc.setFillColor(240, 245, 250);
    doc.rect(15, 68, 180, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Data", 20, 74);
    doc.text("Consumo (Litros)", 130, 74);
    let y = 82;
    let totalMonth = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = new Date(year, month, d).toISOString().split("T")[0];
      const val = getConsumptionForDate(ds, consumptionHistory);
      totalMonth += val;
      if (d % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(15, y - 5, 180, 7, "F"); }
      doc.setTextColor(60, 60, 60);
      doc.text(`${String(d).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`, 20, y);
      doc.text(`${val} L`, 140, y);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    }
    y += 5;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(0, 180, 216);
    doc.rect(15, y - 5, 180, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`Consumo Total: ${totalMonth.toLocaleString("pt-BR")} Litros`, 20, y + 3);
    doc.text(`Média Diária: ${Math.round(totalMonth / daysInMonth)} Litros`, 20, y + 11);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Gerado pelo app Saneamento Cuiabá — ODS 6", 15, 290);
    doc.save(`relatorio_consumo_${String(month + 1).padStart(2, "0")}_${year}.pdf`);
    toast({ title: "PDF gerado!", description: "O download foi iniciado." });
    setShowReport(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      {/* Deep Ocean animated background */}
      <div className="fixed inset-0 z-0" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(202 62% 45% / 0.15) 50%, hsl(190 50% 50% / 0.1) 100%)" }} />
      
      {/* Animated wave layers */}
      <svg className="fixed bottom-0 left-0 w-full z-0 opacity-20" viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ height: "200px" }}>
        <path className="animate-wave-slow" d="M0,120 C360,60 720,180 1440,100 L1440,200 L0,200Z" fill="hsl(var(--primary) / 0.4)" />
        <path className="animate-wave-medium" d="M0,140 C480,80 960,180 1440,120 L1440,200 L0,200Z" fill="hsl(var(--accent) / 0.3)" />
        <path className="animate-wave-fast" d="M0,160 C320,120 800,190 1440,140 L1440,200 L0,200Z" fill="hsl(var(--primary) / 0.2)" />
      </svg>
      <svg className="fixed top-0 left-0 w-full z-0 opacity-10 rotate-180" viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ height: "100px" }}>
        <path className="animate-wave-medium" d="M0,60 C360,20 720,80 1440,40 L1440,100 L0,100Z" fill="hsl(var(--primary) / 0.5)" />
      </svg>

      <div className="relative z-10 px-5 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card/40 backdrop-blur-md border border-border/30 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Meu Consumo</h1>
          <ThemeToggle className="text-foreground" />
        </div>

        {/* Month indicator - glassmorphism */}
        <button
          onClick={() => { setCalendarMonth(selectedDate.getMonth()); setCalendarYear(selectedDate.getFullYear()); setShowCalendarModal(true); }}
          className="mx-auto block text-center mb-3 px-4 py-1.5 rounded-full bg-card/40 backdrop-blur-md border border-border/30"
        >
          <span className="text-xs font-display font-semibold text-primary flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> {visibleMonth}
          </span>
        </button>

        {/* Infinite horizontal date selector */}
        <div className="relative mb-5">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {dates.map((d) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(new Date(d))}
                  className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl flex-shrink-0 snap-center transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-card-hover scale-105"
                      : isToday
                      ? "bg-card/50 backdrop-blur-md border border-primary/30"
                      : "bg-card/20 backdrop-blur-sm border border-border/20"
                  }`}
                >
                  <span className={`text-[9px] font-display font-semibold ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {dayNamesShort[d.getDay()]}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-primary-foreground/20" : ""}`}>
                    <p className={`text-sm font-display font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>{d.getDate()}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Water drop central + goal */}
        {hasData ? (
          <motion.div className="flex flex-col items-center mb-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative mb-3">
              {/* Ripple rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-primary/10 animate-ripple" />
              </div>
              {/* Water drop SVG with animated fill */}
              <svg viewBox="0 0 100 130" className="w-28 h-36 animate-drop-pulse drop-shadow-lg">
                <defs>
                  <clipPath id="dropClip">
                    <path d="M50 5 C50 5 10 60 10 85 C10 107 28 125 50 125 C72 125 90 107 90 85 C90 60 50 5 50 5Z" />
                  </clipPath>
                  <linearGradient id="dropBg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary) / 0.15)" />
                    <stop offset="100%" stopColor="hsl(var(--primary) / 0.3)" />
                  </linearGradient>
                  <linearGradient id="waterFill" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="50%" stopColor="hsl(var(--accent))" />
                    <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
                  </linearGradient>
                </defs>
                {/* Drop outline */}
                <path d="M50 5 C50 5 10 60 10 85 C10 107 28 125 50 125 C72 125 90 107 90 85 C90 60 50 5 50 5Z" fill="url(#dropBg)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
                {/* Animated water fill */}
                <g clipPath="url(#dropClip)">
                  <motion.rect
                    x="5" width="90" height="130"
                    fill="url(#waterFill)"
                    initial={{ y: 130 }}
                    animate={{ y: 130 - (fillPercent / 100) * 120 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  {/* Mini wave on water surface */}
                  <motion.path
                    d="M5,0 Q27,-6 50,0 Q73,6 95,0 L95,10 L5,10Z"
                    fill="hsl(var(--accent) / 0.4)"
                    className="animate-wave-fast"
                    animate={{ y: 130 - (fillPercent / 100) * 120 - 5 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </g>
                {/* Text inside drop */}
                <text x="50" y="85" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" className="drop-shadow">{totalDay}L</text>
                <text x="50" y="100" textAnchor="middle" fontSize="8" fill="white" opacity="0.7">de {dailyGoal}L</text>
              </svg>
            </div>
            <p className="font-display font-bold text-foreground text-lg">{totalDay} Litros</p>
            <span className="font-body text-muted-foreground text-xs mb-2">{selectedDate.toLocaleDateString("pt-BR")}</span>
            
            {/* Goal section */}
            <div className="flex items-center gap-2">
              {!showGoalInput ? (
                <button onClick={() => setShowGoalInput(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/40 backdrop-blur-md border border-border/30 text-xs font-display text-muted-foreground hover:text-primary transition-colors">
                  <Target className="w-3 h-3" />
                  Meta: {dailyGoal}L/dia
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-border/30 rounded-full px-3 py-1.5">
                  <Target className="w-3 h-3 text-primary" />
                  <input
                    type="number"
                    value={goalInputVal}
                    onChange={e => setGoalInputVal(e.target.value)}
                    className="w-14 bg-transparent text-xs font-display text-foreground outline-none text-center"
                    autoFocus
                  />
                  <span className="text-xs text-muted-foreground">L</span>
                  <button
                    onClick={() => { setDailyGoal(Number(goalInputVal) || 50); setShowGoalInput(false); }}
                    className="text-[10px] text-primary font-semibold"
                  >OK</button>
                </div>
              )}
            </div>
            {fillPercent >= 100 && (
              <span className="mt-1 text-[10px] text-destructive font-display font-semibold animate-pulse">⚠️ Meta diária atingida!</span>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-10 mb-4">
            <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="font-display font-semibold text-muted-foreground">Sem dados anteriores</p>
          </div>
        )}

        {/* Charts section — glassmorphism cards */}
        {hasData && (
          <motion.div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground text-sm">Histórico de Uso</h3>
              <div className="flex gap-1 bg-card/40 rounded-full p-0.5">
                {(["Diário", "Mensal", "Anual"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-display font-medium transition-all duration-200 ${activeTab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
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
        )}

        {/* Hourly breakdown - only for Diário */}
        {hasData && activeTab === "Diário" && (
          <motion.div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-4 mb-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Consumo por Hora</h3>
            <div className="grid grid-cols-8 gap-1">
              {hourlyData.filter((_, i) => i % 3 === 0).map((d, i) => (
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

        {/* Report button */}
        <button
          onClick={() => setShowReport(true)}
          className="w-full py-3.5 rounded-2xl bg-primary/90 backdrop-blur-md border border-primary/30 font-display font-semibold text-primary-foreground shadow-card-hover flex items-center justify-center gap-2 hover:bg-primary transition-colors"
        >
          <FileDown className="w-5 h-5" /> Ver Relatório Completo
        </button>
      </div>

      {/* Calendar grid modal */}
      <AnimatePresence>
        {showCalendarModal && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCalendarModal(false)}>
            <motion.div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-card-hover p-5 mx-5 w-full max-w-sm" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }} className="w-8 h-8 rounded-full bg-card/50 flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <span className="font-display font-bold text-foreground">{monthNames[calendarMonth]} {calendarYear}</span>
                <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }} className="w-8 h-8 rounded-full bg-card/50 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNamesShort.map(d => <span key={d} className="text-[9px] font-display font-semibold text-muted-foreground text-center">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cd, i) => {
                  const isSelected = cd.date.toDateString() === selectedDate.toDateString();
                  const isToday = cd.date.toDateString() === new Date().toDateString();
                  return (
                    <button key={i} onClick={() => selectFromCalendar(cd.date)} className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-display transition-all ${!cd.currentMonth ? "opacity-20" : ""} ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : isToday ? "bg-primary/15 text-primary" : "text-foreground hover:bg-card/50"}`}>
                      {cd.day}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setShowCalendarModal(false)} className="w-full mt-4 py-2.5 rounded-full border border-border/30 text-foreground font-display font-medium text-sm bg-card/30 backdrop-blur-sm">Fechar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReport(false)}>
            <motion.div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-card-hover p-6 mx-6 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">Relatório de Consumo</h3>
              <p className="font-body text-sm text-muted-foreground mb-1">{selectedDate.toLocaleDateString("pt-BR")} — {totalDay}L consumidos</p>
              <p className="font-body text-xs text-muted-foreground mb-4">
                {activeTab}: {tabData.reduce((s, d) => s + d.value, 0).toLocaleString("pt-BR")}L · Média: {Math.round(tabData.reduce((s, d) => s + d.value, 0) / tabData.length)}L/dia
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
