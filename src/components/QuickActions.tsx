import { motion } from "framer-motion";
import { BookOpen, HandMetal, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: BookOpen, label: "Dicionário\nAmbiental", path: "/dicionario" },
  { icon: HandMetal, label: "Você no\nSaneamento", path: "/voce-saneamento" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <button
        onClick={() => navigate("/abastecimento")}
        aria-label="Horários que a água vai chegar"
        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left shadow-card hover:shadow-card-hover transition-shadow gradient-header"
      >
        <span className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <CalendarClock className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
        </span>
        <span className="flex-1">
          <span className="block font-display font-bold text-primary-foreground text-sm">
            Horários que a água vai chegar
          </span>
          <span className="block font-body text-primary-foreground/80 text-xs mt-0.5">
            Previsão, histórico e alertas do abastecimento
          </span>
        </span>
      </button>

      <div className="grid grid-cols-2 gap-4 justify-items-center">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            aria-label={action.label.replace("\n", " ")}
            className="flex flex-col items-center gap-2 w-full group"
          >
            <div className="w-full max-w-[150px] h-20 rounded-2xl bg-card shadow-card flex items-center justify-center group-hover:shadow-card-hover transition-shadow">
              <action.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-body text-primary text-center leading-tight whitespace-pre-line">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
