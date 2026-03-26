import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const WaterDrop = () => (
  <svg viewBox="0 0 120 160" className="w-24 h-32">
    <defs>
      <linearGradient id="splashDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(202, 70%, 65%)" />
        <stop offset="100%" stopColor="hsl(202, 62%, 50%)" />
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
    animate={{ y: -500, opacity: [0, 0.6, 0] }}
    transition={{ duration: 2, delay, ease: "easeOut" }}
  />
);

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"idle" | "pulse" | "rise" | "exit">("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("pulse"), 600);
    const t2 = setTimeout(() => setPhase("rise"), 2800);
    const t3 = setTimeout(() => setPhase("exit"), 4200);
    const t4 = setTimeout(onComplete, 4700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* White top half */}
          <div className="absolute inset-0" style={{ background: "#F9FBFC" }} />

          {/* Blue bottom half with wave separator — sits behind the drop */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "50%" }}>
            <svg viewBox="0 0 1440 120" className="absolute -top-[60px] left-0 w-full animate-wave-slow" preserveAspectRatio="none" style={{ height: "60px" }}>
              <path d="M0,40 C180,80 360,0 540,40 C720,80 900,10 1080,50 C1200,70 1320,30 1440,50 L1440,120 L0,120Z" fill="hsl(202, 62%, 55%)" />
            </svg>
            <div className="w-full h-full" style={{ background: "linear-gradient(180deg, hsl(202, 62%, 55%) 0%, hsl(210, 70%, 40%) 100%)" }} />
          </div>

          {/* Water drop centered */}
          <motion.div
            className={`relative z-10 ${phase === "pulse" ? "animate-drop-pulse" : ""}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <WaterDrop />
          </motion.div>

          {/* Rising wave overlay */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20"
            initial={{ y: "100%" }}
            animate={phase === "rise" ? { y: "-10%" } : { y: "100%" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          >
            {/* Wave crest */}
            <svg viewBox="0 0 1440 100" className="w-full" preserveAspectRatio="none" style={{ height: "50px", display: "block" }}>
              <path d="M0,60 C240,10 480,90 720,40 C960,0 1200,70 1440,30 L1440,100 L0,100Z" fill="hsl(202, 62%, 55%)" />
            </svg>
            <div className="w-full" style={{ height: "120vh", background: "linear-gradient(180deg, hsl(202, 62%, 55%) 0%, hsl(210, 70%, 35%) 100%)" }}>
              {phase === "rise" && (
                <>
                  <Bubble delay={0} x={15} size={10} />
                  <Bubble delay={0.15} x={35} size={14} />
                  <Bubble delay={0.3} x={55} size={8} />
                  <Bubble delay={0.45} x={75} size={12} />
                  <Bubble delay={0.2} x={90} size={6} />
                  <Bubble delay={0.5} x={25} size={9} />
                </>
              )}
            </div>
          </motion.div>

          {/* Enter button */}
          <motion.button
            className="absolute bottom-24 z-30 px-14 py-3 rounded-full bg-white shadow-lg font-display font-semibold text-primary text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === "rise" ? 0 : 1, y: phase === "rise" ? 40 : 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={() => {
              setPhase("rise");
              setTimeout(() => setPhase("exit"), 1400);
              setTimeout(onComplete, 1900);
            }}
          >
            Entrar
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
