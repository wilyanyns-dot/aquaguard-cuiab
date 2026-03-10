import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const days = [
  { label: "Seg", value: 11.9 },
  { label: "Ter", value: 13.3 },
  { label: "Qua", value: 11.9 },
  { label: "Qui", value: 21.4 },
  { label: "Sex", value: 12.8 },
  { label: "Sáb", value: 16.6 },
  { label: "Dom", value: 7.1 },
];

const ConsumptionCard = () => {
  const navigate = useNavigate();
  const total = 95.2;

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
          <h3 className="font-display font-bold text-foreground text-base">Gráfico de Consumo</h3>
          <span className="text-cinza-medio font-body text-sm">Meta semanal: 2000L</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Day circles */}
        <div className="flex-1 grid grid-cols-4 gap-2">
          {days.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <span className="text-[9px] font-display font-bold text-primary">{day.value}%</span>
              </div>
              <span className="text-[9px] font-body text-cinza-medio">{day.label}</span>
            </div>
          ))}
        </div>

        {/* Water drop gauge */}
        <div className="relative w-20 h-24 flex-shrink-0">
          <svg viewBox="0 0 80 100" className="w-full h-full">
            <defs>
              <clipPath id="dropClip">
                <path d="M40 5 C40 5 10 50 10 70 C10 87 23 100 40 100 C57 100 70 87 70 70 C70 50 40 5 40 5Z" />
              </clipPath>
              <linearGradient id="waterFill" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(202, 62%, 55%)" />
                <stop offset="100%" stopColor="hsl(175, 40%, 55%)" />
              </linearGradient>
            </defs>
            <path d="M40 5 C40 5 10 50 10 70 C10 87 23 100 40 100 C57 100 70 87 70 70 C70 50 40 5 40 5Z" fill="hsl(202, 62%, 55%)" fillOpacity="0.1" />
            <g clipPath="url(#dropClip)">
              <rect x="0" y={100 - total} width="80" height={total} fill="url(#waterFill)" opacity="0.8" />
            </g>
            <text x="40" y="65" textAnchor="middle" className="font-display" fontSize="14" fontWeight="700" fill="hsl(235, 80%, 15%)">{total}%</text>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsumptionCard;
