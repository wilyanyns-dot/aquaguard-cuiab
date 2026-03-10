import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PortalBanner = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="font-display font-bold text-primary text-lg mb-3">Nosso Portal</h2>
      <button
        onClick={() => navigate("/portal")}
        className="w-full rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
      >
        <div className="relative h-36 w-full gradient-primary">
          {/* Landscape illustration */}
          <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            {/* Sky */}
            <rect width="400" height="150" fill="hsl(195, 70%, 80%)" />
            {/* Clouds */}
            <ellipse cx="80" cy="40" rx="30" ry="12" fill="white" opacity="0.8" />
            <ellipse cx="100" cy="38" rx="20" ry="10" fill="white" opacity="0.8" />
            <ellipse cx="300" cy="50" rx="25" ry="10" fill="white" opacity="0.6" />
            {/* Hills */}
            <path d="M0 120 Q50 70 120 100 Q180 65 250 90 Q320 60 400 100 L400 150 L0 150Z" fill="hsl(140, 40%, 55%)" />
            <path d="M0 130 Q80 95 160 120 Q240 90 320 115 Q380 95 400 110 L400 150 L0 150Z" fill="hsl(140, 45%, 45%)" />
            {/* Water */}
            <path d="M0 140 Q100 135 200 140 Q300 145 400 138 L400 150 L0 150Z" fill="hsl(202, 62%, 55%)" opacity="0.5" />
          </svg>
          <div className="absolute inset-0 flex items-end p-4">
            <span className="text-primary-foreground font-display font-bold text-sm drop-shadow-sm">
              Notícias, projetos e informações
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

export default PortalBanner;
