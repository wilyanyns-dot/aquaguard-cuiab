import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, BellOff, CalendarClock, Droplets, History, Moon, Sun, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Panel = "historico" | "previsao" | "alertas";

const ALERTS_KEY = "aguas-abastecimento-alertas";

const pad = (n: number) => String(n).padStart(2, "0");

const formatDay = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

/** Cronograma determinístico por dia (mesma residência = mesma janela). */
const scheduleFor = (d: Date) => {
  const seed = d.getDate() + d.getMonth() * 31 + d.getFullYear();
  const start = 5 + (seed % 4); // 05h a 08h
  const durationHours = 8 + (seed % 5); // 8h a 12h
  const end = Math.min(start + durationHours, 23);
  const pressure = ["Normal", "Boa", "Reduzida"][seed % 3];
  return {
    window: `${pad(start)}h — ${pad(end)}h`,
    pressure,
    liters: 900 + (seed % 7) * 130,
  };
};

const waveLayers = [
  { color: "hsl(200 85% 62% / 0.55)", delay: 0, height: 190 },
  { color: "hsl(205 75% 48% / 0.65)", delay: 0.4, height: 160 },
  { color: "hsl(210 70% 32% / 0.85)", delay: 0.8, height: 130 },
];

const AbastecimentoPage = () => {
  const navigate = useNavigate();
  const [intro, setIntro] = useState(true);
  const [introText, setIntroText] = useState<"ola" | "info">("ola");
  const [panel, setPanel] = useState<Panel>("previsao");
  const [alertsOn, setAlertsOn] = useState(() => localStorage.getItem(ALERTS_KEY) === "true");

  const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;

  useEffect(() => {
    const t1 = window.setTimeout(() => setIntroText("info"), 1800);
    const t2 = window.setTimeout(() => setIntro(false), 5200);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  const forecast = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return { date: d, ...scheduleFor(d) };
    });
  }, []);

  const history = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - (i + 1));
      return { date: d, ...scheduleFor(d) };
    });
  }, []);

  const toggleAlerts = () => {
    const next = !alertsOn;
    setAlertsOn(next);
    localStorage.setItem(ALERTS_KEY, String(next));
    toast[next ? "success" : "message"](
      next ? "Alertas de abastecimento ativados" : "Alertas de abastecimento desativados",
      { description: next ? "Avisaremos sobre faltas d'água e manutenções na sua região." : "Você não receberá mais avisos da rede." }
    );
  };

  const options: { key: Panel; icon: typeof History; label: string }[] = [
    { key: "historico", icon: History, label: "Histórico" },
    { key: "previsao", icon: Droplets, label: "Previsão" },
    { key: "alertas", icon: Bell, label: "Alertas" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden pb-24" style={{ background: "linear-gradient(180deg, hsl(198 85% 72%) 0%, hsl(205 70% 48%) 45%, hsl(212 75% 20%) 100%)" }}>
      {/* Sol / Lua */}
      <div className="absolute top-10 right-8 pointer-events-none" aria-hidden="true">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: isNight ? "hsl(210 40% 92% / 0.9)" : "hsl(48 100% 72%)", boxShadow: isNight ? "0 0 60px hsl(210 60% 90% / 0.6)" : "0 0 70px hsl(45 100% 70% / 0.7)" }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          {isNight ? <Moon className="w-8 h-8 text-[hsl(212,60%,30%)]" /> : <Sun className="w-8 h-8 text-[hsl(35,85%,45%)]" />}
        </motion.div>
      </div>

      {/* Ondas em camadas */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" aria-hidden="true">
        {waveLayers.map((layer, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-[200%]"
            style={{ height: layer.height }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 18 + i * 6, delay: layer.delay }}
          >
            <path fill={layer.color} d="M0,160 C240,240 480,80 720,160 C960,240 1200,80 1440,160 L1440,320 L0,320 Z" />
          </motion.svg>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="relative z-10">
        <header className="px-5 pt-12 pb-2 flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="font-display font-extrabold text-white text-2xl">Abastecimento</h1>
        </header>

        <div className="px-5 mt-3">
          <div className="rounded-3xl p-4 bg-white/15 backdrop-blur-md border border-white/25">
            <p className="font-body text-sm text-white/90 leading-relaxed">
              Acompanhe em tempo real a previsão e o histórico de chegada de água na sua região.
            </p>
          </div>
        </div>

        {/* Três botões circulares */}
        <div className="px-5 mt-6 grid grid-cols-3 gap-3">
          {options.map((o) => {
            const active = panel === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setPanel(o.key)}
                aria-pressed={active}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
                    active
                      ? "bg-white/85 border-white shadow-[0_10px_30px_hsl(200_80%_40%/0.45)] scale-105"
                      : "bg-white/15 border-white/30 backdrop-blur-md"
                  }`}
                >
                  <o.icon className={`w-7 h-7 ${active ? "text-[hsl(205,70%,40%)]" : "text-white"}`} strokeWidth={1.6} />
                </span>
                <span className={`font-display text-xs font-semibold ${active ? "text-white" : "text-white/70"}`}>{o.label}</span>
              </button>
            );
          })}
        </div>

        {/* Painéis */}
        <div className="px-5 mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={panel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-3xl p-4 bg-white/15 backdrop-blur-xl border border-white/25 space-y-3"
            >
              {panel === "previsao" && (
                <>
                  <h2 className="font-display font-bold text-white text-base">Próximos 7 dias</h2>
                  {forecast.map((f, i) => (
                    <div key={f.date.toISOString()} className="flex items-center gap-3 rounded-2xl bg-white/15 border border-white/20 p-3">
                      <CalendarClock className="w-5 h-5 text-white/80 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-white text-sm capitalize">
                          {i === 0 ? "Hoje" : formatDay(f.date)}
                        </p>
                        <p className="font-body text-[11px] text-white/70">Pressão {f.pressure.toLowerCase()} · ~{f.liters}L disponíveis</p>
                      </div>
                      <span className="font-display font-bold text-white text-xs whitespace-nowrap">{f.window}</span>
                    </div>
                  ))}
                </>
              )}

              {panel === "historico" && (
                <>
                  <h2 className="font-display font-bold text-white text-base">Registros anteriores</h2>
                  {history.map((h) => (
                    <div key={h.date.toISOString()} className="flex items-center gap-3 rounded-2xl bg-white/15 border border-white/20 p-3">
                      <History className="w-5 h-5 text-white/80 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-white text-sm capitalize">{formatDay(h.date)}</p>
                        <p className="font-body text-[11px] text-white/70">Chegada registrada · pressão {h.pressure.toLowerCase()}</p>
                      </div>
                      <span className="font-display font-bold text-white text-xs whitespace-nowrap">{h.window}</span>
                    </div>
                  ))}
                </>
              )}

              {panel === "alertas" && (
                <>
                  <h2 className="font-display font-bold text-white text-base">Avisos da rede</h2>
                  <button
                    onClick={toggleAlerts}
                    className="w-full flex items-center gap-3 rounded-2xl bg-white/20 border border-white/30 p-3 text-left"
                    aria-pressed={alertsOn}
                  >
                    {alertsOn ? <Bell className="w-5 h-5 text-white" /> : <BellOff className="w-5 h-5 text-white/70" />}
                    <span className="flex-1">
                      <span className="block font-display font-semibold text-white text-sm">
                        {alertsOn ? "Notificações ativadas" : "Ativar notificações"}
                      </span>
                      <span className="block font-body text-[11px] text-white/70">
                        Falta d'água, manutenções e retorno do abastecimento.
                      </span>
                    </span>
                    <span className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${alertsOn ? "bg-[hsl(122,52%,45%)]" : "bg-white/25"}`}>
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${alertsOn ? "translate-x-5" : ""}`} />
                    </span>
                  </button>
                  <div className="rounded-2xl bg-white/15 border border-white/20 p-3">
                    <p className="font-display font-semibold text-white text-sm">Manutenção programada</p>
                    <p className="font-body text-[11px] text-white/70 mt-1">
                      Rede do CPA e Coxipó: possível redução de pressão entre 13h e 16h de quinta-feira.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Animação de introdução */}
      <AnimatePresence>
        {intro && (
          <motion.div
            className="fixed inset-0 z-[1400] flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(180deg, hsl(200 80% 60%), hsl(212 75% 22%))" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            role="status"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="absolute rounded-full border border-white/40"
                style={{ width: 160, height: 160 }}
                initial={{ scale: 0.2, opacity: 0.7 }}
                animate={{ scale: [0.2, 3.2], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 3.4, delay: i * 0.85, ease: "easeOut" }}
              />
            ))}
            <AnimatePresence mode="wait">
              <motion.p
                key={introText}
                className="relative font-display font-bold text-white text-center px-10 text-2xl leading-snug"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
              >
                {introText === "ola" ? "Olá" : "Os horários da sua residência estão sendo registrados"}
              </motion.p>
            </AnimatePresence>
            <button
              onClick={() => setIntro(false)}
              aria-label="Pular animação"
              className="absolute bottom-12 w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AbastecimentoPage;
