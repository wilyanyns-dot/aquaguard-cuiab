import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const daysOfWeek = [
  { day: "Seg", num: 8 },
  { day: "Ter", num: 9 },
  { day: "Qua", num: 10 },
  { day: "Qui", num: 11 },
  { day: "Sex", num: 12 },
  { day: "Sáb", num: 13 },
  { day: "Dom", num: 14 },
];

const hourlyDataSets: Record<number, { hour: string; value: number }[]> = {
  0: [{ hour: "7h", value: 4 }, { hour: "9h", value: 15 }, { hour: "11h", value: 28 }, { hour: "13h", value: 22 }, { hour: "15h", value: 30 }, { hour: "17h", value: 18 }, { hour: "19h", value: 25 }, { hour: "21h", value: 10 }],
  1: [{ hour: "7h", value: 6 }, { hour: "9h", value: 20 }, { hour: "11h", value: 35 }, { hour: "13h", value: 25 }, { hour: "15h", value: 28 }, { hour: "17h", value: 32 }, { hour: "19h", value: 18 }, { hour: "21h", value: 8 }],
  2: [{ hour: "7h", value: 3 }, { hour: "9h", value: 12 }, { hour: "11h", value: 20 }, { hour: "13h", value: 30 }, { hour: "15h", value: 25 }, { hour: "17h", value: 15 }, { hour: "19h", value: 22 }, { hour: "21h", value: 12 }],
  3: [{ hour: "7h", value: 8 }, { hour: "9h", value: 25 }, { hour: "11h", value: 40 }, { hour: "13h", value: 32 }, { hour: "15h", value: 20 }, { hour: "17h", value: 28 }, { hour: "19h", value: 35 }, { hour: "21h", value: 15 }],
  4: [{ hour: "7h", value: 5 }, { hour: "9h", value: 18 }, { hour: "11h", value: 22 }, { hour: "13h", value: 28 }, { hour: "15h", value: 35 }, { hour: "17h", value: 20 }, { hour: "19h", value: 15 }, { hour: "21h", value: 6 }],
  5: [{ hour: "7h", value: 10 }, { hour: "9h", value: 22 }, { hour: "11h", value: 30 }, { hour: "13h", value: 38 }, { hour: "15h", value: 28 }, { hour: "17h", value: 20 }, { hour: "19h", value: 15 }, { hour: "21h", value: 8 }],
  6: [{ hour: "7h", value: 2 }, { hour: "9h", value: 8 }, { hour: "11h", value: 15 }, { hour: "13h", value: 18 }, { hour: "15h", value: 12 }, { hour: "17h", value: 10 }, { hour: "19h", value: 8 }, { hour: "21h", value: 5 }],
};

const weeklyData = [
  { label: "Seg", value: 24 },
  { label: "Ter", value: 32 },
  { label: "Qua", value: 22 },
  { label: "Qui", value: 40 },
  { label: "Sex", value: 28 },
  { label: "Sáb", value: 35 },
  { label: "Dom", value: 14 },
];

const tabs = ["Semanal", "Mensal", "Anual"];

const ConsumptionPage = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(3);
  const [activeTab, setActiveTab] = useState("Semanal");

  const hourlyData = hourlyDataSets[selectedDay] || hourlyDataSets[0];
  const maxVal = Math.max(...hourlyData.map((d) => d.value));
  const totalDay = hourlyData.reduce((s, d) => s + d.value, 0);

  const chartW = 300;
  const chartH = 100;
  const points = hourlyData.map((d, i) => ({
    x: 20 + (i / (hourlyData.length - 1)) * (chartW - 40),
    y: 10 + (chartH - 20) - (d.value / maxVal) * (chartH - 30),
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = prev.x + (p.x - prev.x) * 0.6;
    return `${acc} C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaD = `${pathD} L${points[points.length - 1].x},${chartH} L${points[0].x},${chartH} Z`;

  // Weekly chart
  const weekMax = Math.max(...weeklyData.map((d) => d.value));
  const weekChartW = 300;
  const weekChartH = 80;
  const weekPoints = weeklyData.map((d, i) => ({
    x: 20 + (i / (weeklyData.length - 1)) * (weekChartW - 40),
    y: 10 + (weekChartH - 20) - (d.value / weekMax) * (weekChartH - 30),
  }));
  const weekPathD = weekPoints.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = weekPoints[i - 1];
    return `${acc} C${prev.x + (p.x - prev.x) * 0.4},${prev.y} ${prev.x + (p.x - prev.x) * 0.6},${p.y} ${p.x},${p.y}`;
  }, "");
  const weekAreaD = `${weekPathD} L${weekPoints[weekPoints.length - 1].x},${weekChartH} L${weekPoints[0].x},${weekChartH} Z`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Meu Consumo</h1>
          <ThemeToggle className="text-foreground" />
        </div>

        {/* Today's usage hero */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg viewBox="0 0 60 78" className="w-16 h-20">
            <defs>
              <linearGradient id="consumeDropGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(202, 62%, 50%)" />
                <stop offset="100%" stopColor="hsl(195, 60%, 70%)" />
              </linearGradient>
            </defs>
            <path d="M30 3 C30 3 6 38 6 54 C6 68 17 78 30 78 C43 78 54 68 54 54 C54 38 30 3 30 3Z" fill="url(#consumeDropGrad)" />
            <text x="30" y="58" textAnchor="middle" fontSize="14" fontWeight="700" fill="white" className="font-display">{totalDay}L</text>
          </svg>
          <div>
            <p className="font-display font-bold text-foreground text-2xl">{totalDay} Litros</p>
            <span className="font-body text-cinza-medio text-sm">Uso de hoje</span>
          </div>
        </motion.div>

        {/* Day selector */}
        <div className="flex items-center justify-between gap-1 mb-6">
          {daysOfWeek.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl transition-all ${
                i === selectedDay ? "bg-primary shadow-card-hover" : ""
              }`}
            >
              <span className={`text-[10px] font-body ${i === selectedDay ? "text-primary-foreground" : "text-cinza-claro"}`}>
                {d.day}
              </span>
              <p className={`text-sm font-display font-bold ${i === selectedDay ? "text-primary-foreground" : "text-cinza-medio"}`}>
                {d.num}
              </p>
            </button>
          ))}
        </div>

        {/* Hourly Consumption chart */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-4 mb-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-display font-bold text-foreground text-sm mb-3">Consumo por Hora</h3>
          <svg viewBox={`0 0 ${chartW} ${chartH + 16}`} className="w-full h-auto">
            <defs>
              <linearGradient id="consumeAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(202, 62%, 55%)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="hsl(202, 62%, 55%)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="20" x2={chartW - 20} y1={10 + (chartH - 20) * (i / 4)} y2={10 + (chartH - 20) * (i / 4)} stroke="hsl(200, 15%, 92%)" strokeWidth="0.5" />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <text key={i} x="14" y={14 + (chartH - 20) * (i / 4)} textAnchor="end" fontSize="7" fill="hsl(200, 15%, 60%)" className="font-body">
                {Math.round(maxVal - (maxVal * i) / 4)}L
              </text>
            ))}
            <path d={areaD} fill="url(#consumeAreaFill)" />
            <path d={pathD} fill="none" stroke="hsl(202, 62%, 55%)" strokeWidth="2" strokeLinecap="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="hsl(202, 62%, 55%)" stroke="white" strokeWidth="2" />
            ))}
            {hourlyData.map((d, i) => (
              <text key={d.hour} x={points[i].x} y={chartH + 12} textAnchor="middle" fontSize="8" fill="hsl(200, 15%, 55%)" className="font-body">{d.hour}</text>
            ))}
            {(() => {
              const peakIdx = hourlyData.findIndex((d) => d.value === maxVal);
              const peak = points[peakIdx];
              return (
                <g>
                  <rect x={peak.x - 18} y={peak.y - 20} width="36" height="14" rx="4" fill="hsl(202, 62%, 55%)" />
                  <text x={peak.x} y={peak.y - 10} textAnchor="middle" fontSize="8" fontWeight="600" fill="white">{maxVal}L</text>
                </g>
              );
            })()}
          </svg>
        </motion.div>

        {/* Usage History */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-4 mb-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-foreground text-sm">Histórico de Uso</h3>
            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-display font-medium transition-colors ${
                    activeTab === t ? "gradient-primary text-primary-foreground" : "bg-muted text-cinza-medio"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <svg viewBox={`0 0 ${weekChartW} ${weekChartH + 16}`} className="w-full h-auto">
            <defs>
              <linearGradient id="weekAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(175, 40%, 55%)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(175, 40%, 55%)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="20" x2={weekChartW - 20} y1={10 + (weekChartH - 20) * (i / 3)} y2={10 + (weekChartH - 20) * (i / 3)} stroke="hsl(200, 15%, 92%)" strokeWidth="0.5" />
            ))}
            <path d={weekAreaD} fill="url(#weekAreaFill)" />
            <path d={weekPathD} fill="none" stroke="hsl(175, 40%, 55%)" strokeWidth="2" strokeLinecap="round" />
            {weekPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(175, 40%, 55%)" stroke="white" strokeWidth="1.5" />
            ))}
            {weeklyData.map((d, i) => (
              <text key={d.label} x={weekPoints[i].x} y={weekChartH + 12} textAnchor="middle" fontSize="8" fill="hsl(200, 15%, 55%)" className="font-body">{d.label}</text>
            ))}
          </svg>
        </motion.div>

        {/* Report button */}
        <button className="w-full py-3.5 rounded-full gradient-primary font-display font-semibold text-primary-foreground shadow-card-hover">
          Ver Relatório Completo
        </button>
      </div>
    </div>
  );
};

export default ConsumptionPage;
