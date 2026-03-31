import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Camera, CheckCircle, Crosshair, Plus, AlertTriangle, Search, Send, X, Navigation, Droplets, Wrench, HardHat, CloudRain, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";

const typeConfig: Record<string, { color: string; icon: typeof Droplets; label: string }> = {
  vazamento: { color: "bg-vermelho-critico", icon: Droplets, label: "Vazamento" },
  manutencao: { color: "bg-amarelo-alerta", icon: Wrench, label: "Manutenção" },
  normal: { color: "bg-verde-sucesso", icon: CheckCircle, label: "Normal" },
  falta: { color: "bg-primary", icon: CloudRain, label: "Falta d'água" },
  obra: { color: "bg-roxo-obras", icon: HardHat, label: "Obra" },
  esgoto: { color: "bg-[hsl(80,40%,35%)]", icon: AlertTriangle, label: "Esgoto a céu aberto" },
};

const initialMarkers = [
  { id: 1, type: "vazamento", x: 35, y: 40, label: "Rua das Palmeiras", desc: "Vazamento médio", time: "Há 2 horas", confirms: 15 },
  { id: 2, type: "manutencao", x: 60, y: 55, label: "Av. CPA", desc: "Manutenção programada", time: "Amanhã 8h", confirms: 0 },
  { id: 3, type: "normal", x: 50, y: 30, label: "Bairro Pedra 90", desc: "Abastecimento normal", time: "", confirms: 0 },
  { id: 4, type: "falta", x: 25, y: 65, label: "CPA III", desc: "Falta de água", time: "Retorno: 18h", confirms: 250 },
  { id: 5, type: "obra", x: 70, y: 45, label: "Bairro Boa Esperança", desc: "Obra em andamento", time: "Previsão: 30 dias", confirms: 0 },
  { id: 6, type: "esgoto", x: 45, y: 72, label: "Rua Antônio Dorileo", desc: "Esgoto a céu aberto", time: "Há 5 horas", confirms: 8 },
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
  const [markers] = useState(initialMarkers);
  const [selectedMarker, setSelectedMarker] = useState<typeof initialMarkers[0] | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gpsActive, setGpsActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const [reportType, setReportType] = useState("Vazamento");
  const [reportDesc, setReportDesc] = useState("");
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const filteredMarkers = markers.filter(m => {
    const matchFilter = activeFilter === "all" || m.type === activeFilter;
    const matchSearch = !searchQuery || m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleCenterLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setGpsActive(true);
          setUserLocation({ x: 48, y: 50 });
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

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setReportPhotos(prev => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmitReport = () => {
    if (!reportDesc.trim()) {
      toast({ title: "Descrição necessária", description: "Por favor, descreva o problema.", variant: "destructive" });
      return;
    }
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
        {/* Simulated map */}
        <svg viewBox="0 0 400 600" className="w-full h-full opacity-20" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="600" fill="hsl(200, 15%, 90%)" />
          {[...Array(20)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 30} x2="400" y2={i * 30} stroke="hsl(200, 10%, 80%)" strokeWidth="1" />)}
          {[...Array(15)].map((_, i) => <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="600" stroke="hsl(200, 10%, 80%)" strokeWidth="1" />)}
          <path d="M0 250 Q100 200 200 260 Q300 320 400 280" fill="none" stroke="hsl(202, 62%, 70%)" strokeWidth="8" />
        </svg>

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-5 z-10 space-y-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </button>
            <h1 className="font-display font-bold text-foreground text-lg">Mapa de Saneamento</h1>
            <ThemeToggle className="text-foreground w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center" />
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar endereço..."
              className="w-full py-2.5 px-4 pr-10 rounded-xl bg-card shadow-card font-body text-sm text-foreground border-none outline-none"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-medio" strokeWidth={1.5} />
          </div>

          {/* Filter pills - horizontal draggable */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />
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

        {/* Map markers */}
        {filteredMarkers.map((m) => {
          const cfg = typeConfig[m.type] || typeConfig.normal;
          const Icon = cfg.icon;
          return (
            <button key={m.id} className="absolute z-10" style={{ left: `${m.x}%`, top: `${m.y}%` }} onClick={() => setSelectedMarker(m)}>
              <div className="relative">
                <div className={`w-8 h-8 rounded-full ${cfg.color} flex items-center justify-center shadow-card`}>
                  <Icon className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
                </div>
                {m.type === "vazamento" && <div className={`absolute inset-0 rounded-full ${cfg.color} opacity-30 animate-ripple`} />}
              </div>
            </button>
          );
        })}

        {/* User GPS pin */}
        {gpsActive && userLocation && (
          <div className="absolute z-10" style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}>
            <div className="relative flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground shadow-card flex items-center justify-center">
                <Navigation className="w-3 h-3 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-5 bg-primary/90 px-2 py-0.5 rounded text-[8px] font-display text-primary-foreground whitespace-nowrap">Você está aqui</div>
              <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary opacity-20 animate-ping" />
            </div>
          </div>
        )}

        {/* Center location button */}
        <button onClick={handleCenterLocation} className="absolute right-5 bottom-40 z-10 w-12 h-12 rounded-full bg-card shadow-card-hover flex items-center justify-center hover:bg-accent transition-colors">
          <Crosshair className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </button>

        {/* Report FAB */}
        <button onClick={() => setShowReport(true)} className="absolute right-5 bottom-24 z-10 px-5 py-3 rounded-full gradient-primary shadow-card-hover flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          <span className="text-primary-foreground font-display font-semibold text-sm">Reportar</span>
        </button>

        {/* Legend */}
        <div className="absolute left-5 bottom-24 z-10 bg-card rounded-xl shadow-card p-3 space-y-1.5">
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
          <motion.div className="absolute bottom-16 left-0 right-0 bg-card rounded-t-3xl shadow-card p-6 z-20" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}>
            <button onClick={() => setSelectedMarker(null)} className="absolute top-3 right-5 text-cinza-claro text-xl">×</button>
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
              <button onClick={() => { toast({ title: "Problema confirmado!" }); setSelectedMarker(null); }} className="flex-1 py-2.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold text-sm">Confirmar Problema</button>
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
          <motion.div className="fixed inset-0 z-50 bg-foreground/30 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!reportSubmitted) setShowReport(false); }}>
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
                    <button onClick={() => setShowReport(false)}><X className="w-5 h-5 text-cinza-medio" /></button>
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

                    {/* Photo preview */}
                    {reportPhotos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {reportPhotos.map((photo, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                            <button onClick={() => setReportPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-foreground/60 flex items-center justify-center">
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
