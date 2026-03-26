import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, X, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

interface Hotspot { id: number; x: number; y: number; label: string; info: string; type: "info" | "nav"; nextScene?: number; }
interface Scene { id: number; name: string; step: string; bgColor: string; hotspots: Hotspot[]; }

const etaScenes: Scene[] = [
  { id: 0, name: "Captação", step: "Etapa 1", bgColor: "hsl(202,50%,55%)", hotspots: [
    { id: 1, x: 30, y: 40, label: "Bomba de captação", info: "As bombas captam água bruta do rio e enviam para a estação de tratamento.", type: "info" },
    { id: 2, x: 70, y: 50, label: "Ir para Coagulação →", info: "", type: "nav", nextScene: 1 },
  ]},
  { id: 1, name: "Coagulação e Floculação", step: "Etapa 2", bgColor: "hsl(195,50%,55%)", hotspots: [
    { id: 3, x: 40, y: 35, label: "Tanque de mistura", info: "O sulfato de alumínio é adicionado para agrupar impurezas em flocos maiores.", type: "info" },
    { id: 4, x: 75, y: 55, label: "Ir para Decantação →", info: "", type: "nav", nextScene: 2 },
  ]},
  { id: 2, name: "Decantação", step: "Etapa 3", bgColor: "hsl(190,45%,50%)", hotspots: [
    { id: 5, x: 50, y: 40, label: "Decantador", info: "Os flocos de sujeira se depositam no fundo do tanque por gravidade.", type: "info" },
    { id: 6, x: 80, y: 50, label: "Ir para Filtração →", info: "", type: "nav", nextScene: 3 },
  ]},
  { id: 3, name: "Filtração e Cloração", step: "Etapa 4", bgColor: "hsl(175,40%,50%)", hotspots: [
    { id: 7, x: 35, y: 45, label: "Filtros de areia", info: "A água passa por camadas de areia e carvão ativado para remover partículas restantes.", type: "info" },
    { id: 8, x: 65, y: 35, label: "Cloração", info: "O cloro elimina bactérias e vírus, tornando a água segura para consumo.", type: "info" },
  ]},
];

const eteScenes: Scene[] = [
  { id: 0, name: "Gradeamento", step: "Etapa 1", bgColor: "hsl(210,40%,40%)", hotspots: [
    { id: 1, x: 35, y: 40, label: "Grades", info: "Grades metálicas retêm sólidos grandes como galhos e plásticos.", type: "info" },
    { id: 2, x: 70, y: 55, label: "Ir para Desarenação →", info: "", type: "nav", nextScene: 1 },
  ]},
  { id: 1, name: "Desarenação", step: "Etapa 2", bgColor: "hsl(200,35%,42%)", hotspots: [
    { id: 3, x: 40, y: 40, label: "Caixa de areia", info: "A velocidade do fluxo é reduzida para que areia e sedimentos se depositem.", type: "info" },
    { id: 4, x: 75, y: 50, label: "Ir para Tratamento Biológico →", info: "", type: "nav", nextScene: 2 },
  ]},
  { id: 2, name: "Tratamento Biológico", step: "Etapa 3", bgColor: "hsl(195,30%,38%)", hotspots: [
    { id: 5, x: 45, y: 40, label: "Tanque de aeração", info: "Bactérias benéficas consomem a matéria orgânica presente no esgoto.", type: "info" },
    { id: 6, x: 80, y: 50, label: "Ir para Descarte →", info: "", type: "nav", nextScene: 3 },
  ]},
  { id: 3, name: "Descarte Tratado", step: "Etapa 4", bgColor: "hsl(175,35%,40%)", hotspots: [
    { id: 7, x: 50, y: 45, label: "Saída tratada", info: "A água tratada é devolvida ao rio com qualidade segura para o meio ambiente.", type: "info" },
  ]},
];

const TourVirtualPage = () => {
  const navigate = useNavigate();
  const [unit, setUnit] = useState<"eta" | "ete" | null>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [infoPanel, setInfoPanel] = useState<Hotspot | null>(null);

  const scenes = unit === "eta" ? etaScenes : eteScenes;
  const scene = unit ? scenes[sceneIdx] : null;

  if (!unit) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
            <h1 className="font-display font-bold text-primary-foreground text-lg">Tour Virtual 360°</h1>
            <ThemeToggle className="text-primary-foreground" />
          </div>
          <p className="text-primary-foreground/80 text-sm font-body text-center">Escolha a unidade para explorar</p>
        </div>
        <div className="px-5 mt-6 space-y-4">
          {[{ id: "eta" as const, title: "Explorar ETA", desc: "Estação de Tratamento de Água", emoji: "💧" }, { id: "ete" as const, title: "Explorar ETE", desc: "Estação de Tratamento de Esgoto", emoji: "🏭" }].map((u, i) => (
            <motion.button key={u.id} onClick={() => { setUnit(u.id); setSceneIdx(0); }} className="w-full bg-card rounded-2xl shadow-card p-6 flex items-center gap-4 text-left hover:shadow-card-hover transition-shadow" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <span className="text-4xl">{u.emoji}</span>
              <div><h3 className="font-display font-bold text-foreground text-lg">{u.title}</h3><p className="font-body text-sm text-cinza-medio">{u.desc}</p></div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={() => setUnit(null)}><ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} /></button>
        <h1 className="font-display font-bold text-foreground text-sm">{scene?.name}</h1>
        <div className="flex gap-2">
          <button onClick={() => setUnit(unit === "eta" ? "ete" : "eta")} className="p-2 rounded-full bg-card shadow-card"><RefreshCw className="w-4 h-4 text-primary" strokeWidth={1.5} /></button>
          <ThemeToggle />
        </div>
      </div>

      {/* Scene viewer */}
      <div className="flex-1 mx-5 rounded-2xl overflow-hidden relative" style={{ minHeight: "50vh" }}>
        <div style={{ transform: `scale(${zoom})`, transition: "transform 0.3s", transformOrigin: "center" }} className="w-full h-full relative">
          <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="300" fill={scene?.bgColor} />
            <rect x="50" y="80" width="120" height="80" rx="8" fill="rgba(255,255,255,0.15)" />
            <rect x="230" y="100" width="100" height="60" rx="8" fill="rgba(255,255,255,0.1)" />
            <circle cx="110" cy="120" r="25" fill="rgba(255,255,255,0.1)" />
            <path d="M0 250 Q100 230 200 250 Q300 270 400 240 L400 300 L0 300Z" fill="rgba(255,255,255,0.08)" />
            <text x="200" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.6">{scene?.step}: {scene?.name}</text>
          </svg>
          {/* Hotspots */}
          {scene?.hotspots.map((h) => (
            <button key={h.id} className={`absolute ${h.type === "nav" ? "bg-primary-foreground/80 hover:bg-primary-foreground" : "bg-primary-foreground/60 hover:bg-primary-foreground/80"} rounded-full px-2.5 py-1.5 flex items-center gap-1 transition-all`}
              style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => h.type === "nav" && h.nextScene !== undefined ? setSceneIdx(h.nextScene) : setInfoPanel(h)}>
              {h.type === "info" ? <Info className="w-3 h-3 text-primary" /> : <ChevronRight className="w-3 h-3 text-primary" />}
              <span className="text-[9px] font-display font-semibold text-primary whitespace-nowrap">{h.label}</span>
            </button>
          ))}
        </div>
        {/* Zoom controls */}
        <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
          <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2))} className="w-8 h-8 rounded-full bg-card shadow-card flex items-center justify-center"><ZoomIn className="w-4 h-4 text-foreground" /></button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))} className="w-8 h-8 rounded-full bg-card shadow-card flex items-center justify-center"><ZoomOut className="w-4 h-4 text-foreground" /></button>
        </div>
      </div>

      {/* Mini-map */}
      <div className="px-5 mt-3">
        <div className="bg-card rounded-xl shadow-card p-3 flex gap-2 overflow-x-auto">
          {scenes.map((s, i) => (
            <button key={s.id} onClick={() => setSceneIdx(i)} className={`px-3 py-1.5 rounded-full text-[10px] font-display font-medium whitespace-nowrap transition-colors ${i === sceneIdx ? "gradient-primary text-primary-foreground" : "bg-muted text-cinza-medio"}`}>
              {s.step}
            </button>
          ))}
        </div>
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {infoPanel && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/40 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInfoPanel(null)}>
            <motion.div className="w-full bg-card rounded-t-3xl p-6" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground">{infoPanel.label}</h3>
                <button onClick={() => setInfoPanel(null)}><X className="w-5 h-5 text-cinza-claro" /></button>
              </div>
              <p className="font-body text-sm text-cinza-medio">{infoPanel.info}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TourVirtualPage;
