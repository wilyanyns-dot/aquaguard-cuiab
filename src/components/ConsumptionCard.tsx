import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { todayKey } from "@/lib/consumption";

const ConsumptionCard = () => {
  const navigate = useNavigate();
  const { getHourlyForDate, getGoalForDate } = useUser();
  const today = todayKey();

  const hourlyData = getHourlyForDate(today);
  const todayUsage = hourlyData.reduce((s, d) => s + d.value, 0);
  const goal = getGoalForDate(today);

  const maxVal = Math.max(...hourlyData.map((d) => d.value), 1);
  // A largura excedente mantém as primeiras horas legíveis e permite arrastar até o fim.
  const chartW = 560;
  const chartH = 80;
  const points = hourlyData.map((d, i) => ({
    x: (i / Math.max(hourlyData.length - 1, 1)) * chartW,
    y: chartH - (d.value / maxVal) * (chartH - 10),
  }));
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    return `${acc} C${prev.x + (p.x - prev.x) * 0.4},${prev.y} ${prev.x + (p.x - prev.x) * 0.6},${p.y} ${p.x},${p.y}`;
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-foreground text-base">Consumo de Hoje</h3>
          <span className="text-cinza-medio font-body text-xs">Meta diária: {goal}L</span>
        </div>
        <svg viewBox="0 0 40 52" className="w-10 h-12">
          <defs><linearGradient id="homeDropFill" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="hsl(202,62%,55%)" /><stop offset="100%" stopColor="hsl(195,60%,70%)" /></linearGradient></defs>
          <path d="M20 2 C20 2 4 26 4 36 C4 45 11 52 20 52 C29 52 36 45 36 36 C36 26 20 2 20 2Z" fill="url(#homeDropFill)" opacity="0.9" />
          <text x="20" y="38" textAnchor="middle" className="font-display" fontSize="10" fontWeight="700" fill="white">{todayUsage}L</text>
        </svg>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide" style={{ maxHeight: "100px" }} aria-label="Gráfico de consumo por horário, arraste para ver o restante">
        <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="h-auto min-w-[560px]" style={{ maxHeight: "100px", width: `${chartW}px` }}>
          <defs><linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="hsl(202,62%,55%)" stopOpacity="0.3" /><stop offset="100%" stopColor="hsl(202,62%,55%)" stopOpacity="0.02" /></linearGradient></defs>
          {[0,1,2,3].map((i) => <line key={i} x1="0" x2={chartW} y1={chartH*(i/3)} y2={chartH*(i/3)} stroke="hsl(200,15%,90%)" strokeWidth="0.5" />)}
          <path d={areaD} fill="url(#areaFill)" />
          <path d={pathD} fill="none" stroke="hsl(202,62%,55%)" strokeWidth="2" strokeLinecap="round" />
          {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(202,62%,55%)" stroke="white" strokeWidth="1.5" />)}
          {hourlyData.map((d, i) => <text key={d.hour} x={points[i].x} y={chartH+14} textAnchor="middle" fontSize="8" fill="hsl(200,15%,55%)">{d.hour}</text>)}
        </svg>
      </div>
      <div className="mt-2 text-center">
        <span className="text-[10px] text-cinza-medio font-body">Toque para ver detalhes</span>
      </div>
    </motion.div>
  );
};

export default ConsumptionCard;
