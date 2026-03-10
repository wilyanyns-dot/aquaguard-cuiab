import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const daysOfWeek = [
  { day: "Sex", num: 14 },
  { day: "Sáb", num: 13 },
  { day: "Dom", num: 12 },
  { day: "Seg", num: 8, selected: true },
  { day: "Ter", num: 9 },
  { day: "Qua", num: 10 },
  { day: "Qui", num: 11 },
];

const WaveCard = ({ level, label }: { level: number; label: string }) => (
  <div className="bg-card rounded-2xl shadow-card p-4 flex flex-col items-center gap-2 relative overflow-hidden">
    <div className="w-8 h-8 rounded-full gradient-primary opacity-80" />
    <div className="relative w-full h-16">
      <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
        <path
          d={`M0 ${40 - level * 3} Q50 ${30 - level * 2} 100 ${35 - level * 2.5} Q150 ${40 - level * 3} 200 ${32 - level * 2} L200 60 L0 60Z`}
          fill="hsl(202, 62%, 55%)"
          fillOpacity="0.2"
        />
        <path
          d={`M0 ${40 - level * 3} Q50 ${30 - level * 2} 100 ${35 - level * 2.5} Q150 ${40 - level * 3} 200 ${32 - level * 2}`}
          fill="none"
          stroke="hsl(202, 62%, 55%)"
          strokeWidth="2"
        />
      </svg>
    </div>
    <span className="text-xs font-body text-cinza-medio">{label}</span>
  </div>
);

const ConsumptionPage = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(3);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Meu Consumo</h1>
          <div className="w-5" />
        </div>

        {/* Day selector */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {daysOfWeek.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                i === selectedDay
                  ? "bg-primary shadow-card-hover"
                  : ""
              }`}
              style={i === selectedDay ? { transform: "rotate(45deg)" } : {}}
            >
              <div style={i === selectedDay ? { transform: "rotate(-45deg)" } : {}}>
                <span className={`text-[10px] font-body ${i === selectedDay ? "text-primary-foreground" : "text-cinza-claro"}`}>
                  {d.day}
                </span>
                <p className={`text-sm font-display font-bold ${i === selectedDay ? "text-primary-foreground" : "text-cinza-medio"}`}>
                  {d.num}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Wave cards grid */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <WaveCard level={3} label="Cozinha" />
          <WaveCard level={7} label="Banheiro" />
          <WaveCard level={5} label="Lavanderia" />
          <WaveCard level={2} label="Jardim" />
          <WaveCard level={4} label="Piscina" />
          <WaveCard level={6} label="Geral" />
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
