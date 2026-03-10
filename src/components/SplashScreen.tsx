import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const WaterDrop = () => (
  <svg viewBox="0 0 120 160" className="w-28 h-36">
    <defs>
      <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(202, 62%, 65%)" />
        <stop offset="100%" stopColor="hsl(202, 62%, 50%)" />
      </linearGradient>
    </defs>
    <path
      d="M60 10 C60 10 15 75 15 105 C15 130 35 155 60 155 C85 155 105 130 105 105 C105 75 60 10 60 10Z"
      fill="url(#dropGrad)"
    />
    <path
      d="M42 70 C42 70 38 95 40 110 C41 118 44 122 48 118"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

const Bubble = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
  <motion.div
    className="absolute rounded-full border border-primary-foreground/30"
    style={{ left: `${x}%`, bottom: 0, width: size, height: size }}
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: -400, opacity: [0, 0.5, 0] }}
    transition={{ duration: 2.5, delay, ease: "easeOut" }}
  />
);

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"idle" | "pulse" | "rise" | "exit">("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("pulse"), 800);
    const t2 = setTimeout(() => setPhase("rise"), 3000);
    const t3 = setTimeout(() => setPhase("exit"), 4500);
    const t4 = setTimeout(onComplete, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(200, 20%, 98%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Water drop */}
          <motion.div
            className={phase === "pulse" ? "animate-drop-pulse" : ""}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <WaterDrop />
          </motion.div>

          {/* Waves at bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <motion.div
              animate={phase === "rise" ? { y: "-100vh" } : { y: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              {/* Wave layer 1 */}
              <svg viewBox="0 0 1440 320" className="w-full animate-wave-slow" preserveAspectRatio="none" style={{ height: "120px", marginBottom: "-2px" }}>
                <path fill="hsl(202, 62%, 55%)" fillOpacity="0.3" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,186.7C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z" />
              </svg>
              <svg viewBox="0 0 1440 320" className="w-full animate-wave-medium -mt-16" preserveAspectRatio="none" style={{ height: "120px", marginBottom: "-2px" }}>
                <path fill="hsl(175, 40%, 55%)" fillOpacity="0.5" d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,234.7C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z" />
              </svg>
              {/* Solid wave fill */}
              <div className="gradient-primary w-full" style={{ height: "100vh" }}>
                {/* Bubbles */}
                {phase === "rise" && (
                  <>
                    <Bubble delay={0} x={20} size={12} />
                    <Bubble delay={0.2} x={45} size={8} />
                    <Bubble delay={0.4} x={70} size={14} />
                    <Bubble delay={0.6} x={30} size={10} />
                    <Bubble delay={0.8} x={80} size={6} />
                    <Bubble delay={0.3} x={55} size={11} />
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Enter button */}
          <motion.button
            className="absolute bottom-20 z-10 px-12 py-3 rounded-full bg-card shadow-card-hover font-display font-semibold text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === "rise" ? 0 : 1, y: phase === "rise" ? 40 : 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={() => { setPhase("rise"); setTimeout(() => setPhase("exit"), 1500); setTimeout(onComplete, 2000); }}
          >
            Entrar
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
