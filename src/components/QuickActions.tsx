import { motion } from "framer-motion";
import { Gamepad2, BookOpen, Glasses, HandMetal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: Gamepad2, label: "Educa\nSaneamento", path: "/educa" },
  { icon: BookOpen, label: "Dicionário\nAmbiental", path: "/dicionario" },
  { icon: Glasses, label: "Tour\nVirtual", path: "/tour" },
  { icon: HandMetal, label: "Você no\nSaneamento", path: "/voce-saneamento" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex justify-between gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {actions.map((action) => (
        <button
          key={action.path}
          onClick={() => navigate(action.path)}
          className="flex flex-col items-center gap-1.5 flex-1 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-card shadow-card flex items-center justify-center group-hover:shadow-card-hover transition-shadow">
            <action.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-body text-primary text-center leading-tight whitespace-pre-line">
            {action.label}
          </span>
        </button>
      ))}
    </motion.div>
  );
};

export default QuickActions;
