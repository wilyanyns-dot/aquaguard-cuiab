import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface Video {
  id: string;
  title: string;
  category: "economia" | "reuso" | "dengue";
  meta: string;
  rating: string;
}

const categories = [
  { key: "todos", label: "Todos" },
  { key: "economia", label: "Economia de Água" },
  { key: "reuso", label: "Reutilização" },
  { key: "dengue", label: "Combate à Dengue" },
] as const;

const videos: Video[] = [
  { id: "4RVtzG8V-MA", title: "Como Eliminar os Focos do Mosquito da Dengue", category: "dengue", meta: "2026 · 8 min", rating: "4.9" },
  { id: "dT508S3-r4M", title: "Sintomas da Dengue e Cuidados Imediatos", category: "dengue", meta: "2026 · 6 min", rating: "4.8" },
  { id: "g26Wk4gpkws", title: "Ações Comunitárias Eficientes Contra o Aedes aegypti", category: "dengue", meta: "2025 · 11 min", rating: "4.7" },
  { id: "vW5-xrV3Bq4", title: "Guia Prático para Economizar Água no Dia a Dia", category: "economia", meta: "2026 · 9 min", rating: "4.8" },
  { id: "z0-gttl2Vbw", title: "Tecnologias Residenciais de Baixo Consumo de Água", category: "economia", meta: "2025 · 12 min", rating: "4.6" },
  { id: "hRZcupJbnpg", title: "Como Construir um Sistema de Cisterna Caseira", category: "reuso", meta: "2026 · 14 min", rating: "4.9" },
  { id: "3mUOOin1yjc", title: "Métodos Seguros para Reutilizar Água da Máquina de Lavar", category: "reuso", meta: "2025 · 10 min", rating: "4.5" },
  { id: "4iY9a3v4R0A", title: "Saneamento Básico: Panorama Geral", category: "economia", meta: "2025 · 15 min", rating: "4.4" },
];

const featured = [videos[0], videos[5]];

const glass = "bg-white/10 backdrop-blur-md border border-white/10";

const PortalPage = () => {
  const a11y = useAccessibility();
  const navigate = useNavigate();
  const [category, setCategory] = useState<(typeof categories)[number]["key"]>("todos");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos
      .filter((v) => category === "todos" || v.category === category)
      .filter((v) => !q || v.title.toLowerCase().includes(q));
  }, [category, query]);

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden relative bg-[#0a1220]">
      {/* Glow background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#12263f] via-[#0b1524] to-[#070d16]" />
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#22b8ff]/25 blur-[90px]" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-[#4f7cff]/20 blur-[110px]" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-[#12e0c4]/15 blur-[100px]" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Voltar" className={`w-10 h-10 rounded-2xl flex items-center justify-center ${glass}`}>
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.6} />
          </button>
          <h1 className="flex-1 font-display font-extrabold text-white text-2xl tracking-tight">Nosso Portal</h1>
          <button onClick={() => setShowSearch((s) => !s)} aria-label="Buscar vídeos" className={`w-10 h-10 rounded-2xl flex items-center justify-center ${glass}`}>
            <Search className="w-5 h-5 text-white" strokeWidth={1.6} />
          </button>
        </header>

        <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">

              {showSearch && (
                <div className="px-5 mb-4">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar vídeo"
                    aria-label="Buscar vídeo"
                    className={`w-full py-3 px-4 rounded-2xl text-sm font-body text-white placeholder:text-white/40 outline-none ${glass}`}
                  />
                </div>
              )}

              {/* Featured banners carousel */}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1 snap-x snap-mandatory">
                {featured.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVideo(v)}
                    className="relative flex-shrink-0 w-[82%] snap-start rounded-3xl overflow-hidden text-left border border-white/10"
                    aria-label={`Assistir agora: ${v.title}`}
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                      alt={`Capa do vídeo ${v.title}`}
                      loading="lazy"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04121e] via-[#04121e]/55 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h2 className="font-display font-bold text-white text-base leading-snug line-clamp-2 mb-3">{v.title}</h2>
                      <span className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-display font-semibold text-white ${glass}`}>
                        <Play className="w-3.5 h-3.5 fill-current" strokeWidth={0} /> Assistir Agora
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 mt-5 pb-1">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    aria-pressed={category === c.key}
                    className={`px-4 py-2 rounded-full text-[11px] font-display font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                      category === c.key
                        ? "bg-[#22b8ff]/25 border border-[#22b8ff]/70 text-[#8ee0ff] shadow-[0_0_18px_rgba(34,184,255,.35)] backdrop-blur-md"
                        : `${glass} text-white/65`
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="px-5 mt-4 grid grid-cols-2 gap-3">
                {list.map((v, i) => (
                  <motion.button
                    key={v.id}
                    onClick={() => setActiveVideo(v)}
                    aria-label={`Assistir: ${v.title}`}
                    className={`rounded-2xl overflow-hidden text-left group ${glass}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="relative aspect-video bg-black/40">
                      <img
                        src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                        alt={`Capa do vídeo ${v.title}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-3.5 h-3.5 text-white ml-0.5 fill-current" strokeWidth={0} />
                        </span>
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-display font-bold text-white text-xs leading-snug line-clamp-2 mb-1">{v.title}</p>
                      <span className="text-[10px] text-[#9fd8ef]/70 font-body">{v.rating} · {v.meta}</span>
                    </div>
                  </motion.button>
                ))}
                {list.length === 0 && (
                  <p className="col-span-2 text-center text-white/50 font-body text-xs py-8">Nenhum vídeo encontrado.</p>
                )}
              </div>

        </motion.div>

      </div>

      {/* Player modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activeVideo.title}
          >
            <motion.div
              className={`w-full max-w-lg rounded-3xl overflow-hidden ${glass} bg-[#0b1524]/90`}
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-display font-bold text-white text-sm pr-3 line-clamp-1">{activeVideo.title}</p>
                <button onClick={() => setActiveVideo(null)} aria-label="Fechar vídeo">
                  <X className="w-5 h-5 text-white/70" />
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
              {a11y.prefs.legendas && (
                <p className="px-4 py-3 font-body text-xs text-white/60">
                  Legendas automáticas ativadas. Use o botão "CC" do player para escolher o idioma da legenda e a
                  transcrição completa do vídeo.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortalPage;
