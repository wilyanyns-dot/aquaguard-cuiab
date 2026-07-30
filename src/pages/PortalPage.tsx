import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, X, Target, Eye, HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

interface Video {
  id: string;
  title: string;
  channel: string;
}

const videos: Video[] = [
  { id: "4RVtzG8V-MA", title: "Como funciona o tratamento de água", channel: "Water Treatment" },
  { id: "vW5-xrV3Bq4", title: "O Ciclo da Água (Ciclo Hidrológico)", channel: "Educação Ambiental" },
  { id: "hRZcupJbnpg", title: "Animação sobre Tratamento de Água", channel: "Ciência & Água" },
  { id: "z0-gttl2Vbw", title: "Saneamento básico: tratamento de água", channel: "QuimTec" },
  { id: "dT508S3-r4M", title: "Saneamento básico | Rioeduca na TV", channel: "Rioeduca" },
  { id: "3mUOOin1yjc", title: "Minidocumentário: Sobre as Águas", channel: "Dia Mundial da Água" },
  { id: "4iY9a3v4R0A", title: "Saneamento Básico — panorama geral", channel: "Basic Sanitation" },
  { id: "g26Wk4gpkws", title: "O ciclo da água explicado", channel: "Educação Ambiental" },
];

const institucional = [
  {
    icon: Target,
    title: "Missão",
    text: "Aproximar cada morador de Cuiabá do saneamento básico, transformando dados de consumo em consciência ambiental e cuidado diário com a água.",
  },
  {
    icon: Eye,
    title: "Visão",
    text: "Ser a principal ponte digital entre a população e os serviços de água e esgoto, reduzindo o desperdício na cidade e ampliando o impacto social da ODS 6.",
  },
  {
    icon: HeartHandshake,
    title: "Valores",
    text: "Sustentabilidade em cada gota, inclusão e acessibilidade para todos os perfis de usuários, e transparência total nas informações que exibimos.",
  },
];

const PortalPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"videos" | "quem-somos">("videos");
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <header className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" className="absolute bottom-0 left-0 w-full h-16 opacity-25">
          <path d="M0,60 C240,10 480,90 720,40 C960,0 1200,70 1440,30 L1440,120 L0,120Z" fill="white" />
        </svg>
        <div className="relative flex items-center justify-between">
          <button onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg drop-shadow">Nosso Portal</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
      </header>

      <div className="px-5 -mt-4">
        <div className="bg-card rounded-2xl shadow-card p-1 grid grid-cols-2 gap-1" role="tablist" aria-label="Seções do portal">
          {[
            { key: "videos", label: "Vídeos Educativos" },
            { key: "quem-somos", label: "Quem Somos" },
          ].map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`py-2.5 rounded-xl text-xs font-display font-semibold transition-colors ${
                tab === t.key ? "gradient-primary text-primary-foreground" : "text-cinza-medio"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        {tab === "videos" ? (
          <div className="grid grid-cols-2 gap-3">
            {videos.map((v, i) => (
              <motion.button
                key={v.id}
                onClick={() => setActiveVideo(v)}
                aria-label={`Assistir: ${v.title}`}
                className="bg-card rounded-xl shadow-card overflow-hidden text-left group"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={`Capa do vídeo ${v.title}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-primary-foreground/90 flex items-center justify-center shadow-card group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" strokeWidth={2} />
                    </span>
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-foreground text-xs line-clamp-2 mb-1">{v.title}</p>
                  <span className="text-[10px] text-cinza-medio font-body">{v.channel}</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {institucional.map((b, i) => (
              <motion.section
                key={b.title}
                className="bg-card rounded-2xl shadow-card p-4 border-l-4 border-primary"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                    <b.icon className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
                  </span>
                  <h2 className="font-display font-bold text-foreground text-base">{b.title}</h2>
                </div>
                <p className="font-body text-xs text-cinza-medio leading-relaxed">{b.text}</p>
              </motion.section>
            ))}
          </div>
        )}
      </div>

      {/* Embedded YouTube player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activeVideo.title}
          >
            <motion.div
              className="w-full max-w-lg bg-card rounded-2xl overflow-hidden shadow-card-hover"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-display font-bold text-foreground text-sm pr-3 line-clamp-1">{activeVideo.title}</p>
                <button onClick={() => setActiveVideo(null)} aria-label="Fechar vídeo">
                  <X className="w-5 h-5 text-cinza-medio" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0&cc_load_policy=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortalPage;
