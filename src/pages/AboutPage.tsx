import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, MapPin, Phone, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / 40;
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(start));
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display font-bold text-2xl text-primary">
        {count.toLocaleString()}{suffix}
      </p>
    </div>
  );
};

const timeline = [
  { year: "1970", desc: "Primeiras redes de água em Cuiabá" },
  { year: "1995", desc: "Expansão do tratamento de esgoto" },
  { year: "2010", desc: "Universalização do abastecimento" },
  { year: "2024", desc: "Digitalização: Waze do Saneamento" },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative h-56 gradient-header flex items-end">
        <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <div className="px-5 pb-6">
          <h1 className="font-display font-bold text-primary-foreground text-xl leading-tight">
            Cuidando da nossa água,<br />cuidando da nossa gente.
          </h1>
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">
        {/* Mission */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💧</span>
            <h2 className="font-display font-bold text-foreground">ODS 6 — Água e Saneamento</h2>
          </div>
          <p className="font-body text-sm text-cinza-medio leading-relaxed">
            Comprometidos com o Objetivo de Desenvolvimento Sustentável 6 da ONU, trabalhamos para garantir água potável e saneamento para todos os cuiabanos até 2030.
          </p>
        </motion.div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { target: 600, suffix: " mil", label: "Pessoas atendidas" },
            { target: 98, suffix: "%", label: "Cobertura de água" },
            { target: 1200, suffix: " km", label: "Rede monitorada" },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              className="bg-card rounded-2xl shadow-card p-4 flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Counter target={c.target} suffix={c.suffix} />
              <span className="text-[10px] font-body text-cinza-medio text-center mt-1">{c.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-4">Nossa História</h2>
          <div className="relative pl-6 border-l-2 border-primary/20 space-y-4">
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                className="relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute -left-[29px] w-4 h-4 rounded-full gradient-primary" />
                <p className="font-display font-bold text-sm text-primary">{t.year}</p>
                <p className="font-body text-xs text-cinza-medio">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* About text */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h2 className="font-display font-bold text-foreground mb-2">Saneamento Cuiabá</h2>
          <p className="font-body text-sm text-cinza-medio leading-relaxed">
            Somos mais que uma rede de canos; somos a saúde que chega à sua torneira. Este aplicativo foi criado para que você seja nosso maior fiscal e parceiro. Juntos, garantimos que Cuiabá continue sendo a Cidade Verde, protegendo nossos rios e o futuro das próximas gerações.
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          {[
            { icon: Globe, label: "Portal da Transparência", action: "Acessar" },
            { icon: MapPin, label: "Av. do CPA, 1000 - Cuiabá/MT", action: "" },
            { icon: Phone, label: "0800 123 4567", action: "Ligar" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-3 bg-card rounded-xl shadow-card p-3">
              <c.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <span className="flex-1 font-body text-sm text-cinza-medio">{c.label}</span>
              {c.action && <span className="text-xs font-display font-semibold text-primary">{c.action}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
