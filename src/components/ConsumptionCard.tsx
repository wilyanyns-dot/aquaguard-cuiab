import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const hourlyData = [
  { hour: "6h", value: 5 },
  { hour: "8h", value: 18 },
  { hour: "10h", value: 32 },
  { hour: "12h", value: 28 },
  { hour: "14h", value: 35 },
  { hour: "16h", value: 22 },
  { hour: "18h", value: 30 },
  { hour: "20h", value: 15 },
  { hour: "22h", value: 8 },
];

const ConsumptionCard = () => {
  const navigate = useNavigate();
  const todayUsage = 20;
  const maxVal = Math.max(...hourlyData.map((d) => d.value));

  // Build SVG path for line chart
  const chartW = 280;
  const chartH = 80;
  const points = hourlyData.map((d, i) => ({
    x: (i / (hourlyData.length - 1)) * chartW,
    y: chartH - (d.value / maxVal) * (chartH - 10),
  }));

  // Smooth curve
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = prev.x + (p.x - prev.x) * 0.6;
    return `${acc} C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaD = `${pathD} L${chartW},${chartH} L0,${chartH} Z`;

  return (
    <motion.div
      className="bg-card rounded-2xl shadow-card p-5 cursor-pointer hover:shadow-card-hover transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onClick={() => navigate("/consumo")}
    >
      {/* Header with drop and usage */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-foreground text-base">Consumo de Hoje</h3>
          <span className="text-cinza-medio font-body text-xs">Meta diária: 40L</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Water drop icon */}
          <svg viewBox="0 0 40 52" className="w-10 h-12">
            <defs>
              <linearGradient id="homeDropFill" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(202, 62%, 55%)" />
                <stop offset="100%" stopColor="hsl(195, 60%, 70%)" />
              </linearGradient>
            </defs>
            <path d="M20 2 C20 2 4 26 4 36 C4 45 11 52 20 52 C29 52 36 45 36 36 C36 26 20 2 20 2Z" fill="url(#homeDropFill)" opacity="0.9" />
            <text x="20" y="38" textAnchor="middle" className="font-display" fontSize="11" fontWeight="700" fill="white">{todayUsage}L</text>
          </svg>
        </div>
      </div>

      {/* Line chart */}
      <div className="w-full">
        <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full h-auto">
          <defs>
            <linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(202, 62%, 55%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(202, 62%, 55%)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2={chartW} y1={chartH * (i / 3)} y2={chartH * (i / 3)} stroke="hsl(200, 15%, 90%)" strokeWidth="0.5" />
          ))}
          {/* Area */}
          <path d={areaD} fill="url(#areaFill)" />
          {/* Line */}
          <path d={pathD} fill="none" stroke="hsl(202, 62%, 55%)" strokeWidth="2" strokeLinecap="round" />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(202, 62%, 55%)" stroke="white" strokeWidth="1.5" />
          ))}
          {/* X labels */}
          {hourlyData.map((d, i) => (
            <text key={d.hour} x={points[i].x} y={chartH + 14} textAnchor="middle" fontSize="8" fill="hsl(200, 15%, 55%)" className="font-body">{d.hour}</text>
          ))}
          {/* Tooltip on peak */}
          {(() => {
            const peakIdx = hourlyData.findIndex((d) => d.value === maxVal);
            const peak = points[peakIdx];
            return (
              <g>
                <rect x={peak.x - 20} y={peak.y - 22} width="40" height="16" rx="4" fill="hsl(202, 62%, 55%)" />
                <text x={peak.x} y={peak.y - 11} textAnchor="middle" fontSize="8" fontWeight="600" fill="white">{maxVal}L</text>
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="mt-2 text-center">
        <span className="text-[10px] text-cinza-medio font-body">Toque para ver detalhes</span>
      </div>
    </motion.div>
  );
};

export default ConsumptionCard;
