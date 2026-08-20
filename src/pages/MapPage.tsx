import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Camera, CheckCircle, Crosshair, Plus, AlertTriangle,
  Search, X, Droplets, Wrench, HardHat, CloudRain, Image as ImageIcon, Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import LeafletMap, { MapPoint } from "@/components/map/LeafletMap";

const CUIABA: [number, number] = [-15.601, -56.0974];

const svgIcon = (path: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const typeConfig: Record<string, { color: string; hex: string; icon: typeof Droplets; label: string; svg: string }> = {
  vazamento: { color: "bg-vermelho-critico", hex: "#e04434", icon: Droplets, label: "Vazamento", svg: svgIcon('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>') },
  manutencao: { color: "bg-amarelo-alerta", hex: "#e8a013", icon: Wrench, label: "Manutenção", svg: svgIcon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>') },
  normal: { color: "bg-verde-sucesso", hex: "#2e9e5b", icon: CheckCircle, label: "Normal", svg: svgIcon('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>') },
  falta: { color: "bg-primary", hex: "#38bdf8", icon: CloudRain, label: "Falta d'água", svg: svgIcon('<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>') },
  obra: { color: "bg-roxo-obras", hex: "#7a4fd1", icon: HardHat, label: "Obra", svg: svgIcon('<path d="M2 18h20"/><path d="M4 18v-3a8 8 0 0 1 16 0v3"/><path d="M10 4h4v4h-4z"/>') },
  esgoto: { color: "bg-[hsl(80,40%,35%)]", hex: "#6b8f2e", icon: AlertTriangle, label: "Esgoto a céu aberto", svg: svgIcon('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>') },
};

/** Bairros de Cuiabá com coordenadas aproximadas */
const bairros: { nome: string; lat: number; lng: number; ruas: string[] }[] = [
  { nome: "Centro", lat: -15.5989, lng: -56.0949, ruas: ["Rua das Palmeiras", "Av. Getúlio Vargas", "Rua Barão de Melgaço"] },
  { nome: "CPA", lat: -15.5605, lng: -56.0762, ruas: ["Av. Historiador Rubens de Mendonça", "Rua das Acácias", "Av. do CPA"] },
  { nome: "Pedra 90", lat: -15.6684, lng: -56.0357, ruas: ["Av. Principal", "Rua Vinte e Cinco", "Rua Sete"] },
  { nome: "Boa Esperança", lat: -15.6218, lng: -56.1246, ruas: ["Rua Beija-Flor", "Av. Fernando Corrêa", "Rua das Orquídeas"] },
  { nome: "Coxipó", lat: -15.6402, lng: -56.0821, ruas: ["Rua Antônio Dorileo", "Av. Fernando Corrêa da Costa", "Rua Aclimação"] },
  { nome: "Dom Aquino", lat: -15.6035, lng: -56.0842, ruas: ["Rua Comandante Costa", "Rua Pedro Celestino", "Av. Tenente Coronel Duarte"] },
  { nome: "Jardim Cuiabá", lat: -15.5836, lng: -56.0791, ruas: ["Rua Estevão de Mendonça", "Rua Marechal Rondon", "Av. Miguel Sutil"] },
  { nome: "Santa Rosa", lat: -15.5893, lng: -56.0836, ruas: ["Av. Mato Grosso", "Rua Barão", "Rua Presidente Marques"] },
  { nome: "Porto", lat: -15.6104, lng: -56.1006, ruas: ["Av. 15 de Novembro", "Rua Ipiranga", "Rua Cuiabá"] },
  { nome: "Morada do Ouro", lat: -15.5675, lng: -56.0942, ruas: ["Av. das Torres", "Rua das Palmas", "Rua Turmalina"] },
  { nome: "Tijucal", lat: -15.6549, lng: -56.0592, ruas: ["Av. Rubens Meirelles", "Rua Dez", "Rua Trinta"] },
  { nome: "Jardim Leblon", lat: -15.6303, lng: -56.0424, ruas: ["Rua das Garças", "Av. Leblon", "Rua Copacabana"] },
  { nome: "Planalto", lat: -15.5758, lng: -56.0518, ruas: ["Rua Alfa", "Rua Beta", "Av. Planalto"] },
  { nome: "Verdão", lat: -15.6169, lng: -56.0885, ruas: ["Av. Beira Rio", "Rua Verdão", "Rua Cinco"] },
];

const problemTypes = ["vazamento", "manutencao", "normal", "falta", "obra", "esgoto"];

const descFor: Record<string, string[]> = {
  vazamento: ["Vazamento médio na via", "Vazamento na calçada", "Cano rompido em frente ao imóvel"],
  manutencao: ["Manutenção programada da rede", "Equipe trabalhando na tubulação", "Troca de registro"],
  normal: ["Abastecimento normal", "Rede operando sem ocorrências", "Pressão adequada"],
  falta: ["Falta de água no trecho", "Sem abastecimento desde a manhã", "Reservatório em recuperação"],
  obra: ["Obra de rede coletora", "Obra de ampliação do sistema", "Obra de recapeamento após reparo"],
  esgoto: ["Esgoto a céu aberto", "Refluxo de esgoto na rua", "Boca de lobo com esgoto"],
};

function rng(seed: number) {
  let s = seed || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function buildMarkers(): MapPoint[] {
  const r = rng(4242);
  const out: MapPoint[] = [];
  let id = 1;
  bairros.forEach((b, bi) => {
    const count = 9 + Math.floor(r() * 5);
    for (let i = 0; i < count; i++) {
      const type = problemTypes[Math.floor(r() * problemTypes.length)];
      const rua = b.ruas[Math.floor(r() * b.ruas.length)];
      const hours = 1 + Math.floor(r() * 12);
      out.push({
        id: id++,
        type,
        lat: b.lat + (r() - 0.5) * 0.018,
        lng: b.lng + (r() - 0.5) * 0.022,
        label: type === "normal" || type === "obra" ? `Bairro ${b.nome}` : `${rua} — ${b.nome}`,
        desc: descFor[type][Math.floor(r() * 3)],
        time: type === "normal" ? "" : type === "obra" ? "Previsão: 30 dias" : `Há ${hours} ${hours === 1 ? "hora" : "horas"}`,
        confirms: type === "normal" ? 0 : Math.floor(r() * 40),
      });
    }
    // âncoras fixas descritas no fluxo
    if (bi === 0) out.push({ id: id++, type: "vazamento", lat: -15.5936, lng: -56.0925, label: "Rua das Palmeiras", desc: "Vazamento médio", time: "Há 2 horas", confirms: 15 });
  });
  out.push({ id: id++, type: "normal", lat: -15.6684, lng: -56.0357, label: "Bairro Pedra 90", desc: "Abastecimento normal", time: "", confirms: 0 });
  out.push({ id: id++, type: "obra", lat: -15.6218, lng: -56.1246, label: "Bairro Boa Esperança", desc: "Obra em andamento", time: "Previsão: 30 dias", confirms: 0 });
  out.push({ id: id++, type: "esgoto", lat: -15.6402, lng: -56.0821, label: "Rua Antônio Dorileo", desc: "Esgoto a céu aberto", time: "Há 5 horas", confirms: 8 });
  return out;
}

const filterTypes = [
  { key: "all", label: "Todos", hex: "#94a3b8" },
  { key: "vazamento", label: "Vazamentos", hex: typeConfig.vazamento.hex },
  { key: "falta", label: "Falta d'água", hex: typeConfig.falta.hex },
  { key: "manutencao", label: "Manutenção", hex: typeConfig.manutencao.hex },
  { key: "obra", label: "Obras", hex: typeConfig.obra.hex },
  { key: "esgoto", label: "Esgoto", hex: typeConfig.esgoto.hex },
  { key: "normal", label: "Normal", hex: typeConfig.normal.hex },
];

const reportOptions = [
  { key: "vazamento", label: "Vazamento" },
  { key: "falta", label: "Falta d'água" },
  { key: "manutencao", label: "Manutenção" },
  { key: "obra", label: "Obra" },
  { key: "esgoto", label: "Esgoto a céu aberto" },
];

const MapPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const { user } = useUser();

  const [markers, setMarkers] = useState<MapPoint[]>(() => buildMarkers());
  const [selectedMarker, setSelectedMarker] = useState<MapPoint | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showHereLabel, setShowHereLabel] = useState(false);
  const [confirmed, setConfirmed] = useState<number[]>([]);
  const [reportType, setReportType] = useState("vazamento");
  const [reportDesc, setReportDesc] = useState("");
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Centro inicial: bairro derivado do CEP do usuário, senão centro de Cuiabá
  const initialCenter = useMemo<[number, number]>(() => {
    const cep = (user?.cep || "").replace(/\D/g, "");
    if (cep.length >= 5) {
      const idx = parseInt(cep.slice(-3), 10) % bairros.length;
      const b = bairros[idx];
      return [b.lat, b.lng];
    }
    return CUIABA;
  }, [user?.cep]);

  const [center, setCenter] = useState<[number, number]>(initialCenter);

  const glass = dark
    ? "bg-white/10 border border-white/15 backdrop-blur-xl text-white"
    : "bg-white/70 border border-black/5 backdrop-blur-xl text-foreground";
  const sheet = dark
    ? "bg-[hsl(210,45%,10%)]/90 border-t border-white/10 backdrop-blur-2xl text-white"
    : "bg-white/95 border-t border-black/5 backdrop-blur-2xl text-foreground";
  const subtle = dark ? "text-white/60" : "text-cinza-medio";

  const filteredMarkers = markers.filter((m) => activeFilter === "all" || m.type === activeFilter);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    const local = markers.find((m) => m.label.toLowerCase().includes(q.toLowerCase()));
    if (local) {
      setCenter([local.lat, local.lng]);
      setSelectedMarker(local);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q + ", Cuiabá, Mato Grosso")}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        toast({ title: "Local encontrado", description: data[0].display_name });
      } else {
        toast({ title: "Endereço não encontrado", description: "Tente outro termo em Cuiabá.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Falha na busca", description: "Verifique sua conexão.", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const applyLocation = (loc: [number, number]) => {
    setUserLocation(loc);
    setCenter(loc);
    setShowHereLabel(true);
    setTimeout(() => setShowHereLabel(false), 5000);
    toast({ title: "Localização detectada via GPS", description: "Sua posição foi centralizada no mapa." });
  };

  const handleCenterLocation = () => {
    if (!navigator.geolocation) {
      applyLocation(initialCenter);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => applyLocation([pos.coords.latitude, pos.coords.longitude]),
      () => applyLocation(initialCenter),
      { timeout: 6000 }
    );
  };

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setReportPhotos((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleConfirm = (m: MapPoint) => {
    if (confirmed.includes(m.id)) {
      toast({ title: "Você já confirmou este problema" });
      return;
    }
    setConfirmed((prev) => [...prev, m.id]);
    setMarkers((prev) => prev.map((p) => (p.id === m.id ? { ...p, confirms: p.confirms + 1 } : p)));
    toast({ title: "Problema confirmado", description: "Sua validação ajuda a priorizar o reparo." });
    setSelectedMarker(null);
  };

  const handleSubmitReport = () => {
    if (!reportDesc.trim()) {
      toast({ title: "Descrição necessária", description: "Por favor, descreva o problema.", variant: "destructive" });
      return;
    }
    const base = userLocation || center;
    const lat = base[0] + (Math.random() - 0.5) * 0.004;
    const lng = base[1] + (Math.random() - 0.5) * 0.004;
    setMarkers((prev) => [...prev, {
      id: Date.now(),
      type: reportType,
      lat, lng,
      label: typeConfig[reportType].label,
      desc: reportDesc,
      time: "Agora",
      confirms: 1,
    }]);
    setCenter([lat, lng]);
    setReportSubmitted(true);
    toast({ title: "Problema relatado!", description: "Obrigado pela colaboração." });
    setTimeout(() => {
      setShowReport(false);
      setReportSubmitted(false);
      setReportPhotos([]);
      setReportDesc("");
      toast({ title: "Problema relatado com sucesso!", description: "Obrigado pela colaboração. Sua denúncia será analisada." });
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LeafletMap
            points={filteredMarkers}
            center={center}
            userLocation={userLocation}
            dark={dark}
            iconFor={(t) => { const c = typeConfig[t] || typeConfig.normal; return { color: c.hex, svg: c.svg }; }}
            onSelect={setSelectedMarker}
          />
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-4 z-[1000] space-y-2.5 pointer-events-none">
          <div className="flex items-center justify-between gap-2 pointer-events-auto">
            <button onClick={() => navigate(-1)} aria-label="Voltar" className={`w-10 h-10 rounded-2xl flex items-center justify-center ${glass}`}>
              <ArrowLeft className="w-5 h-5" strokeWidth={1.6} />
            </button>
            <h1 className={`font-display font-bold text-sm px-4 py-2.5 rounded-2xl ${glass}`}>Mapa de Saneamento</h1>
            <ThemeToggle className={`w-10 h-10 rounded-2xl flex items-center justify-center ${glass}`} />
          </div>

          <div className={`relative pointer-events-auto rounded-2xl ${glass}`}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Pesquisar rua ou bairro em Cuiabá"
              aria-label="Pesquisar endereço em Cuiabá"
              className="w-full py-3 px-4 pr-11 bg-transparent font-body text-sm outline-none placeholder:opacity-60"
            />
            <button onClick={handleSearch} aria-label="Buscar" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className={`w-4 h-4 ${searching ? "animate-pulse" : ""}`} strokeWidth={1.6} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pointer-events-auto">
            {filterTypes.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                aria-pressed={activeFilter === f.key}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-display font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  activeFilter === f.key
                    ? "bg-[#22b8ff]/25 border border-[#22b8ff]/70 text-[#0891b2] dark:text-[#7dd3fc] shadow-[0_0_18px_rgba(34,184,255,.35)] backdrop-blur-xl"
                    : glass
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: f.hex }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className={`absolute left-4 bottom-24 z-[1000] rounded-2xl p-3 space-y-1.5 ${glass}`}>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.hex }} />
              <span className="text-[10px] font-body opacity-80">{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* GPS */}
        <button onClick={handleCenterLocation} aria-label="Centralizar no GPS" className={`absolute right-4 bottom-44 z-[1000] w-12 h-12 rounded-2xl flex items-center justify-center ${glass}`}>
          <Crosshair className="w-5 h-5 text-[#22b8ff]" strokeWidth={1.6} />
        </button>

        <AnimatePresence>
          {showHereLabel && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`absolute left-1/2 -translate-x-1/2 bottom-44 z-[1000] px-3 py-1.5 rounded-full text-[11px] font-display font-semibold ${glass}`}
            >
              Você está aqui
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Reportar */}
        <button
          onClick={() => setShowReport(true)}
          className="absolute right-4 bottom-24 z-[1000] px-5 py-3.5 rounded-2xl flex items-center gap-2 bg-[#22b8ff] shadow-[0_8px_28px_rgba(34,184,255,.5)]"
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={2} />
          <span className="text-white font-display font-semibold text-sm">Reportar</span>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleFileChange} />

      {/* Bottom sheet */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            className={`fixed bottom-16 left-0 right-0 rounded-t-[28px] p-6 z-[1100] shadow-[0_-10px_40px_rgba(0,0,0,.25)] ${sheet}`}
            initial={{ y: 260 }} animate={{ y: 0 }} exit={{ y: 260 }} transition={{ type: "spring", damping: 26, stiffness: 260 }}
          >
            <div className={`mx-auto mb-4 h-1 w-10 rounded-full ${dark ? "bg-white/25" : "bg-black/15"}`} />
            <button onClick={() => setSelectedMarker(null)} aria-label="Fechar" className="absolute top-4 right-5 opacity-60">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: typeConfig[selectedMarker.type]?.hex }}>
                {(() => { const Icon = typeConfig[selectedMarker.type]?.icon || MapPin; return <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />; })()}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-base">{selectedMarker.label}</h3>
                <p className={`text-sm font-body ${subtle}`}>{selectedMarker.desc}</p>
                {selectedMarker.time && (
                  <span className={`inline-block mt-1.5 px-2.5 py-1 rounded-full text-[10px] font-display ${dark ? "bg-white/10" : "bg-black/5"}`}>
                    {selectedMarker.time}
                  </span>
                )}
              </div>
            </div>
            {selectedMarker.confirms > 0 && (
              <p className="text-xs font-body text-verde-sucesso mb-3 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.8} /> {selectedMarker.confirms} pessoas confirmaram
              </p>
            )}
            {selectedMarker.type === "normal" ? (
              <div className="flex items-center gap-2 py-2 text-verde-sucesso">
                <CheckCircle className="w-7 h-7" strokeWidth={1.8} />
                <span className="font-display font-semibold text-sm">Abastecimento normal</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirm(selectedMarker)}
                  className="flex-1 py-3 rounded-full bg-[#22b8ff] text-white font-display font-semibold text-sm shadow-[0_6px_20px_rgba(34,184,255,.4)]"
                >
                  {confirmed.includes(selectedMarker.id) ? "Confirmado" : "Confirmar Problema"}
                </button>
                <button onClick={handleCameraClick} className="px-5 py-3 rounded-full border border-[#22b8ff]/60 text-[#22b8ff] font-display font-semibold text-sm flex items-center justify-center gap-1">
                  <Camera className="w-4 h-4" strokeWidth={1.6} /> Foto
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm flex items-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { if (!reportSubmitted) setShowReport(false); }}
          >
            <motion.div
              className={`w-full rounded-t-[28px] p-6 ${sheet}`}
              initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              {reportSubmitted ? (
                <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-16 h-16 rounded-full bg-verde-sucesso/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-verde-sucesso" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1">Problema relatado!</h3>
                  <p className={`font-body text-sm ${subtle}`}>Obrigado pela colaboração.</p>
                </motion.div>
              ) : (
                <>
                  <div className={`mx-auto mb-4 h-1 w-10 rounded-full ${dark ? "bg-white/25" : "bg-black/15"}`} />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">Reportar um Problema</h3>
                    <button onClick={() => setShowReport(false)} aria-label="Fechar"><X className="w-5 h-5 opacity-60" /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="tipo-problema" className="text-xs font-display font-semibold mb-1.5 block">Tipo de Problema</label>
                      <select
                        id="tipo-problema"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className={`w-full py-3 px-4 rounded-2xl font-body text-sm outline-none ${dark ? "bg-white/10 border border-white/15 text-white" : "bg-black/5 border border-black/5"}`}
                      >
                        {reportOptions.map((o) => (
                          <option key={o.key} value={o.key} className="text-foreground">{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="descricao" className="text-xs font-display font-semibold mb-1.5 block">Descrição</label>
                      <textarea
                        id="descricao"
                        value={reportDesc}
                        onChange={(e) => setReportDesc(e.target.value)}
                        placeholder="Descreva o problema detalhadamente"
                        className={`w-full py-3 px-4 rounded-2xl font-body text-sm outline-none resize-none placeholder:opacity-50 ${dark ? "bg-white/10 border border-white/15 text-white" : "bg-black/5 border border-black/5"}`}
                        style={{ minHeight: 88 }}
                      />
                    </div>

                    {reportPhotos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {reportPhotos.map((photo, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                            <img src={photo} alt={`Foto ${i + 1} do problema relatado`} className="w-full h-full object-cover" />
                            <button onClick={() => setReportPhotos((prev) => prev.filter((_, j) => j !== i))} aria-label="Remover foto" className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center">
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={handleCameraClick} className="flex-1 py-3 rounded-full border border-dashed border-[#22b8ff]/50 text-[#22b8ff] font-display font-semibold flex items-center justify-center gap-2 text-sm">
                        {reportPhotos.length === 0 ? <Camera className="w-5 h-5" strokeWidth={1.6} /> : <ImageIcon className="w-4 h-4" strokeWidth={1.6} />}
                        {reportPhotos.length === 0 ? "Tirar Foto" : "Mais fotos"}
                      </button>
                    </div>

                    <button
                      onClick={handleSubmitReport}
                      className="w-full py-3.5 rounded-full bg-[#22b8ff] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(34,184,255,.45)]"
                    >
                      <Send className="w-4 h-4" strokeWidth={1.8} /> Enviar Relatório
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;
