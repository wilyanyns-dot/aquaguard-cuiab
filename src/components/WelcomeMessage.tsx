import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets } from "lucide-react";

const SESSION_KEY = "welcomeMessageShown";

interface WelcomeMessageProps {
  name?: string;
}

const WelcomeMessage = ({ name }: WelcomeMessageProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!name) return;
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 5000);

    // Leaving the screen before the 5s mark also consumes the message.
    return () => {
      clearTimeout(timer);
      sessionStorage.setItem(SESSION_KEY, "true");
      setVisible(false);
    };
  }, [name]);

  useEffect(() => {
    if (!visible) return;
    return () => sessionStorage.setItem(SESSION_KEY, "true");
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 left-4 z-50 max-w-sm ml-auto rounded-2xl bg-card shadow-card-hover border border-border px-4 py-3 flex items-center gap-3"
          initial={{ x: "120%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "120%", opacity: 0 }}
          transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
        >
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-display font-bold text-foreground text-sm">
              Olá, {name?.split(" ")[0]}! 👋
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Seu consumo de hoje já está sendo monitorado.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeMessage;
