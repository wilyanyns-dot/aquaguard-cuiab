import { motion } from "framer-motion";
import { BookOpen, HandMetal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: BookOpen, label: "Dicionário\nAmbiental", path: "/dicionario" },
  { icon: HandMetal, label: "Você no\nSaneamento", path: "/voce-saneamento" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 justify-items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
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
    </motion.div>
  );
};

export default QuickActions;
