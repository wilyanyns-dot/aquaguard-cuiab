import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

type Phase = "drop" | "half" | "full" | "exit";

const WaterDrop = () => (
  <svg viewBox="0 0 120 160" className="w-20 h-28" aria-hidden="true">
    <defs>
      <linearGradient id="splashDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(202, 70%, 65%)" />
        <stop offset="100%" stopColor="hsl(210, 70%, 45%)" />
      </linearGradient>
    </defs>
    <path
      d="M60 10 C60 10 15 75 15 105 C15 130 35 155 60 155 C85 155 105 130 105 105 C105 75 60 10 60 10Z"
      fill="url(#splashDropGrad)"
    />
    <path
      d="M42 70 C42 70 38 95 40 110 C41 118 44 122 48 118"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const Bubble = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
  <motion.div
    className="absolute rounded-full border border-white/40"
    style={{ left: `${x}%`, bottom: 0, width: size, height: size }}
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: -420, opacity: [0, 0.6, 0] }}
    transition={{ duration: 2.4, delay, ease: "easeOut", repeat: Infinity }}
  />
);

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<Phase>("drop");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("half"), 1400),
      setTimeout(() => setPhase("full"), 2900),
      setTimeout(() => setPhase("exit"), 4300),
      setTimeout(onComplete, 4900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const waveHeight = phase === "drop" ? "0%" : phase === "half" ? "50%" : "120%";

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-white"
          role="status"
          aria-label="Carregando o aplicativo Saneamento Cuiabá"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Drop falling to the centre and merging with the liquid */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: -160 }}
              animate={
                phase === "drop"
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 1.6, y: 40 }
              }
              transition={{ duration: phase === "drop" ? 1.1 : 0.6, ease: "easeOut" }}
            >
              <WaterDrop />
            </motion.div>
          </div>

          {/* Impact ripple */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {phase !== "drop" && (
              <motion.span
                className="block rounded-full border-2 border-[hsl(202,62%,55%)]"
                initial={{ width: 40, height: 40, opacity: 0.7 }}
                animate={{ width: 320, height: 320, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            )}
          </div>

          {/* Liquid that rises: half of the screen, then the whole viewport */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            initial={{ height: "0%" }}
            animate={{ height: waveHeight }}
            transition={{ duration: 1.5, ease: [0.45, 0, 0.2, 1] }}
          >
            <div className="absolute bottom-full left-0 w-full h-[40px] overflow-hidden">
              <motion.svg
                viewBox="0 0 2880 100"
                className="absolute top-0 left-0 h-full"
                style={{ width: "200%" }}
                preserveAspectRatio="none"
                aria-hidden="true"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 6, ease: "linear", repeat: Infinity }}
              >
                <path
                  d="M0,60 C240,10 480,90 720,40 C960,0 1200,70 1440,60 C1680,10 1920,90 2160,40 C2400,0 2640,70 2880,60 L2880,100 L0,100Z"
                  fill="hsl(202, 62%, 55%)"
                />
              </motion.svg>
            </div>

            <div
              className="w-full h-full relative overflow-hidden"
              style={{ background: "linear-gradient(180deg, hsl(202, 62%, 55%) 0%, hsl(210, 70%, 35%) 100%)" }}
            >
              <Bubble delay={0} x={15} size={10} />
              <Bubble delay={0.4} x={35} size={14} />
              <Bubble delay={0.8} x={55} size={8} />
              <Bubble delay={0.2} x={75} size={12} />
              <Bubble delay={0.6} x={90} size={6} />
            </div>
          </motion.div>

          {/* Brand reveal once the liquid fills the screen */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "full" ? 1 : 0 }}
            transition={{ duration: 0.8, delay: phase === "full" ? 0.6 : 0 }}
          >
            <p className="font-display font-bold text-2xl text-white tracking-wide">
              Saneamento Cuiabá
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
