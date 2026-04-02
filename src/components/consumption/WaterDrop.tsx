import { motion } from "framer-motion";

interface WaterDropProps {
  liters: number;
  goal: number;
  dateLabel: string;
}

const WaterDrop = ({ liters, goal, dateLabel }: WaterDropProps) => {
  const fillPercent = goal > 0 ? Math.min((liters / goal) * 100, 100) : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-primary/10 animate-ripple" />
        </div>
        <svg viewBox="0 0 100 130" className="w-28 h-36 animate-drop-pulse drop-shadow-lg">
          <defs>
            <clipPath id="dropClipMain">
              <path d="M50 5 C50 5 10 60 10 85 C10 107 28 125 50 125 C72 125 90 107 90 85 C90 60 50 5 50 5Z" />
            </clipPath>
            <linearGradient id="dropBgMain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.15)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.3)" />
            </linearGradient>
            <linearGradient id="waterFillMain" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
            </linearGradient>
          </defs>
          <path d="M50 5 C50 5 10 60 10 85 C10 107 28 125 50 125 C72 125 90 107 90 85 C90 60 50 5 50 5Z" fill="url(#dropBgMain)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
          <g clipPath="url(#dropClipMain)">
            <motion.rect
              x="5" width="90" height="130"
              fill="url(#waterFillMain)"
              initial={{ y: 130 }}
              animate={{ y: 130 - (fillPercent / 100) * 120 }}
              transition={{ duration: 1, ease: "easeOut" }}
              key={liters}
            />
            <motion.path
              d="M5,0 Q27,-6 50,0 Q73,6 95,0 L95,10 L5,10Z"
              fill="hsl(var(--accent) / 0.4)"
              className="animate-wave-fast"
              animate={{ y: 130 - (fillPercent / 100) * 120 - 5 }}
              transition={{ duration: 1, ease: "easeOut" }}
              key={`wave-${liters}`}
            />
          </g>
          <text x="50" y="85" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" className="drop-shadow">{liters}L</text>
          <text x="50" y="100" textAnchor="middle" fontSize="8" fill="white" opacity="0.7">de {goal}L</text>
        </svg>
      </div>
      <p className="font-display font-bold text-foreground text-lg">{liters} Litros</p>
      <span className="font-body text-muted-foreground text-xs mb-2">{dateLabel}</span>
      {fillPercent >= 100 && (
        <span className="mt-1 text-[10px] text-destructive font-display font-semibold animate-pulse">⚠️ Meta diária atingida!</span>
      )}
    </div>
  );
};

export default WaterDrop;
