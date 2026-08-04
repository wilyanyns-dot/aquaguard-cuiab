import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Camera, CheckCircle, Crosshair, Plus, AlertTriangle, Search, Send, X, Droplets, Wrench, HardHat, CloudRain, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import LeafletMap, { MapPoint } from "@/components/map/LeafletMap";

const CUIABA: [number, number] = [-15.601, -56.0974];

const svgIcon = (path: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const typeConfig: Record<string, { color: string; hex: string; icon: typeof Droplets; label: string; svg: string }> = {
  vazamento: { color: "bg-vermelho-critico", hex: "#e04434", icon: Droplets, label: "Vazamento", svg: svgIcon('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>') },
  manutencao: { color: "bg-amarelo-alerta", hex: "#e8a013", icon: Wrench, label: "Manutenção", svg: svgIcon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>') },
  normal: { color: "bg-verde-sucesso", hex: "#2e9e5b", icon: CheckCircle, label: "Normal", svg: svgIcon('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>') },
  falta: { color: "bg-primary", hex: "#1e88c7", icon: CloudRain, label: "Falta d'água", svg: svgIcon('<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>') },
  obra: { color: "bg-roxo-obras", hex: "#7a4fd1", icon: HardHat, label: "Obra", svg: svgIcon('<path d="M2 18h20"/><path d="M4 18v-3a8 8 0 0 1 16 0v3"/><path d="M10 4h4v4h-4z"/>') },
  esgoto: { color: "bg-[hsl(80,40%,35%)]", hex: "#6b8f2e", icon: AlertTriangle, label: "Esgoto a céu aberto", svg: svgIcon('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>') },
};

const initialMarkers: MapPoint[] = [
  { id: 1, type: "vazamento", lat: -15.5936, lng: -56.0925, label: "Rua das Palmeiras — Centro", desc: "Vazamento médio na via", time: "Há 2 horas", confirms: 15 },
  { id: 2, type: "manutencao", lat: -15.5711, lng: -56.0783, label: "Av. Historiador Rubens de Mendonça (CPA)", desc: "Manutenção programada", time: "Amanhã 8h", confirms: 0 },
  { id: 3, type: "normal", lat: -15.6684, lng: -56.0357, label: "Pedra 90", desc: "Abastecimento normal", time: "", confirms: 0 },
  { id: 4, type: "falta", lat: -15.5559, lng: -56.0705, label: "CPA III", desc: "Falta de água no bairro", time: "Retorno: 18h", confirms: 250 },
  { id: 5, type: "obra", lat: -15.6218, lng: -56.1246, label: "Bairro Boa Esperança", desc: "Obra de rede coletora", time: "Previsão: 30 dias", confirms: 0 },
  { id: 6, type: "esgoto", lat: -15.6402, lng: -56.0821, label: "Rua Antônio Dorileo — Coxipó", desc: "Esgoto a céu aberto", time: "Há 5 horas", confirms: 8 },
];

const filterTypes = [
  { key: "all", label: "Todos", color: "bg-cinza-medio" },
  { key: "vazamento", label: "Vazamentos", color: "bg-vermelho-critico" },
  { key: "falta", label: "Falta d'água", color: "bg-primary" },
  { key: "manutencao", label: "Manutenção", color: "bg-amarelo-alerta" },
  { key: "obra", label: "Obras", color: "bg-roxo-obras" },
  { key: "esgoto", label: "Esgoto", color: "bg-[hsl(80,40%,35%)]" },
];

const MapPage = () => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState<MapPoint[]>(initialMarkers);
  const [selectedMarker, setSelectedMarker] = useState<MapPoint | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [center, setCenter] = useState<[number, number]>(CUIABA);
  const [gpsActive, setGpsActive] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [confirmed, setConfirmed] = useState<number[]>([]);
  const [reportType, setReportType] = useState("Vazamento");
  const [reportDesc, setReportDesc] = useState("");
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const filteredMarkers = markers.filter(m => activeFilter === "all" || m.type === activeFilter);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    const local = markers.find(m => m.label.toLowerCase().includes(q.toLowerCase()) || m.desc.toLowerCase().includes(q.toLowerCase()));
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

  const handleCenterLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setGpsActive(true);
          setUserLocation(loc);
          setCenter(loc);
          toast({ title: "Localização detectada via GPS", description: "Sua posição foi centralizada no mapa." });
        },
        () => {
          toast({ title: "GPS desativado", description: "Ative a localização nas configurações do aparelho.", variant: "destructive" });
        }
      );
    } else {
      toast({ title: "GPS não disponível", description: "Seu dispositivo não suporta geolocalização.", variant: "destructive" });
    }
  };

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) setReportPhotos(prev => [...prev, ev.target!.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleConfirm = (m: MapPoint) => {
    if (confirmed.includes(m.id)) {
      toast({ title: "Você já confirmou este problema" });
      return;
    }
    setConfirmed(prev => [...prev, m.id]);
    setMarkers(prev => prev.map(p => p.id === m.id ? { ...p, confirms: p.confirms + 1 } : p));
    toast({ title: "Problema confirmado! ✅", description: "Sua validação ajuda a priorizar o reparo." });
    setSelectedMarker(null);
  };

  const handleSubmitReport = () => {
    if (!reportDesc.trim()) {
      toast({ title: "Descrição necessária", description: "Por favor, descreva o problema.", variant: "destructive" });
      return;
    }
    const typeKey = reportType === "Vazamento" ? "vazamento" : reportType === "Falta de água" ? "falta" : reportType === "Esgoto a céu aberto" ? "esgoto" : "manutencao";
    const base = userLocation || center;
    setMarkers(prev => [...prev, {
      id: Date.now(),
      type: typeKey,
      lat: base[0] + (Math.random() - 0.5) * 0.004,
      lng: base[1] + (Math.random() - 0.5) * 0.004,
      label: reportType,
      desc: reportDesc,
      time: "Agora",
      confirms: 1,
    }]);
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReport(false);
      setReportSubmitted(false);
      setReportPhotos([]);
      setReportDesc("");
      toast({ title: "Problema relatado com sucesso! ✅", description: "Obrigado pela colaboração. Sua denúncia será analisada." });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <div className="relative w-full h-[calc(100vh-4rem)] bg-muted overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LeafletMap
            points={filteredMarkers}
            center={center}
            userLocation={userLocation}
            iconFor={(t) => { const c = typeConfig[t] || typeConfig.normal; return { color: c.hex, svg: c.svg }; }}
            onSelect={setSelectedMarker}
          />
        </div>

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-5 z-[1000] space-y-3 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </button>
            <h1 className="font-display font-bold text-foreground text-lg px-3 py-1 rounded-full bg-card/80 backdrop-blur-md shadow-card">Mapa de Saneamento</h1>
            <ThemeToggle className="text-foreground w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center" />
          </div>

          {/* Search bar */}
          <div className="relative pointer-events-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Pesquisar endereço em Cuiabá..."
              className="w-full py-2.5 px-4 pr-10 rounded-xl bg-card shadow-card font-body text-sm text-foreground border-none outline-none"
            />
            <button onClick={handleSearch} aria-label="Buscar" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className={`w-4 h-4 text-cinza-medio ${searching ? "animate-pulse" : ""}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* Filter pills */}
          <div className="relative pointer-events-auto">
            <div
              ref={filterScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1"
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            >
              {filterTypes.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-display font-medium whitespace-nowrap flex-shrink-0 transition-colors snap-start ${activeFilter === f.key ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${f.color}`} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center location button */}
        <button onClick={handleCenterLocation} aria-label="Centralizar no GPS" className="absolute right-5 bottom-40 z-[1000] w-12 h-12 rounded-full bg-card shadow-card-hover flex items-center justify-center hover:bg-accent transition-colors">
          <Crosshair className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </button>

        {/* Report FAB */}
        <button onClick={() => setShowReport(true)} className="absolute right-5 bottom-24 z-[1000] px-5 py-3 rounded-full gradient-primary shadow-card-hover flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          <span className="text-primary-foreground font-display font-semibold text-sm">Reportar</span>
        </button>

        {/* Legend */}
        <div className="absolute left-5 bottom-24 z-[1000] bg-card/90 backdrop-blur-md rounded-xl shadow-card p-3 space-y-1.5">
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
              <span className="text-[10px] font-body text-cinza-medio">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleFileChange} />

      {/* Bottom sheet for selected marker */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div className="fixed bottom-16 left-0 right-0 bg-card rounded-t-3xl shadow-card p-6 z-[1100]" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}>
            <button onClick={() => setSelectedMarker(null)} aria-label="Fechar" className="absolute top-3 right-5 text-cinza-claro text-xl">×</button>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${typeConfig[selectedMarker.type]?.color || "bg-muted"} flex items-center justify-center`}>
                {(() => { const Icon = typeConfig[selectedMarker.type]?.icon || MapPin; return <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />; })()}
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">{selectedMarker.label}</h3>
                <p className="text-sm font-body text-cinza-medio">{selectedMarker.desc}</p>
                {selectedMarker.time && <p className="text-xs font-body text-cinza-claro mt-0.5">{selectedMarker.time}</p>}
              </div>
            </div>
            {selectedMarker.confirms > 0 && (
              <p className="text-xs font-body text-verde-sucesso mb-3 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" strokeWidth={1.5} /> {selectedMarker.confirms} pessoas confirmaram
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => handleConfirm(selectedMarker)} className="flex-1 py-2.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold text-sm">
                {confirmed.includes(selectedMarker.id) ? "Confirmado" : "Confirmar Problema"}
              </button>
              <button onClick={handleCameraClick} className="flex-1 py-2.5 rounded-full border border-primary text-primary font-display font-semibold text-sm flex items-center justify-center gap-1">
                <Camera className="w-4 h-4" strokeWidth={1.5} /> Foto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report form modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div className="fixed inset-0 z-[1200] bg-foreground/30 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!reportSubmitted) setShowReport(false); }}>
            <motion.div className="w-full bg-card rounded-t-3xl p-6" initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} onClick={(e) => e.stopPropagation()}>
              {reportSubmitted ? (
                <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-16 h-16 rounded-full bg-verde-sucesso/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-verde-sucesso" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-1">Problema Relatado!</h3>
                  <p className="font-body text-sm text-cinza-medio">Obrigado pela colaboração.</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-foreground text-lg">Reportar um Problema</h3>
                    <button onClick={() => setShowReport(false)} aria-label="Fechar"><X className="w-5 h-5 text-cinza-medio" /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-display font-semibold text-foreground mb-1.5 block">Tipo de Problema</label>
                      <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full py-3 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none outline-none">
                        <option>Vazamento</option>
                        <option>Falta de água</option>
                        <option>Água suja</option>
                        <option>Esgoto a céu aberto</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-display font-semibold text-foreground mb-1.5 block">Descrição</label>
                      <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} className="w-full py-3 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none resize-none" style={{ minHeight: 80 }} placeholder="Descreva o problema detalhadamente..." />
                    </div>

                    {reportPhotos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {reportPhotos.map((photo, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                            <button onClick={() => setReportPhotos(prev => prev.filter((_, j) => j !== i))} aria-label="Remover foto" className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-foreground/60 flex items-center justify-center">
                              <X className="w-2.5 h-2.5 text-primary-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {reportPhotos.length === 0 ? (
                      <button onClick={handleCameraClick} className="w-full py-3 rounded-full border-2 border-dashed border-primary/30 text-primary font-display font-semibold flex items-center justify-center gap-2 text-sm">
                        <Camera className="w-5 h-5" strokeWidth={1.5} /> Tirar Foto
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleCameraClick} className="flex-1 py-3 rounded-full border border-primary text-primary font-display font-semibold flex items-center justify-center gap-1 text-sm">
                          <Image className="w-4 h-4" /> Mais fotos
                        </button>
                        <button onClick={handleSubmitReport} className="flex-1 py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-1 text-sm">
                          <Send className="w-4 h-4" /> Enviar
                        </button>
                      </div>
                    )}

                    {reportPhotos.length === 0 && (
                      <button onClick={handleSubmitReport} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2 text-sm">
                        <Send className="w-5 h-5" /> Enviar Relatório
                      </button>
                    )}

                    {!gpsActive && (
                      <p className="text-[10px] text-amarelo-alerta font-body text-center flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" /> GPS desativado —
                        <button onClick={handleCenterLocation} className="underline font-semibold">Ativar agora</button>
                      </p>
                    )}
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
