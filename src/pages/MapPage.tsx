import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Camera, CheckCircle, Filter, Crosshair, Plus, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const markers = [
  { id: 1, type: "vazamento", x: 35, y: 40, label: "Rua das Palmeiras", desc: "Vazamento médio", time: "Há 2 horas", confirms: 15, color: "bg-vermelho-critico" },
  { id: 2, type: "manutencao", x: 60, y: 55, label: "Av. CPA", desc: "Manutenção programada", time: "Amanhã 8h", confirms: 0, color: "bg-amarelo-alerta" },
  { id: 3, type: "normal", x: 50, y: 30, label: "Bairro Pedra 90", desc: "Abastecimento normal", time: "", confirms: 0, color: "bg-verde-sucesso" },
  { id: 4, type: "falta", x: 25, y: 65, label: "CPA III", desc: "Falta de água", time: "Retorno: 18h", confirms: 250, color: "bg-azul-falta" },
  { id: 5, type: "obra", x: 70, y: 45, label: "Bairro Boa Esperança", desc: "Obra em andamento", time: "Previsão: 30 dias", confirms: 0, color: "bg-roxo-obras" },
];

const MapPage = () => {
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState<typeof markers[0] | null>(null);
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Map area */}
      <div className="relative w-full h-[calc(100vh-4rem)] bg-muted overflow-hidden">
        {/* Simulated map background */}
        <svg viewBox="0 0 400 600" className="w-full h-full opacity-20" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="600" fill="hsl(200, 15%, 90%)" />
          {/* Grid lines as streets */}
          {[...Array(20)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 30} x2="400" y2={i * 30} stroke="hsl(200, 10%, 80%)" strokeWidth="1" />
          ))}
          {[...Array(15)].map((_, i) => (
            <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="600" stroke="hsl(200, 10%, 80%)" strokeWidth="1" />
          ))}
          {/* River */}
          <path d="M0 250 Q100 200 200 260 Q300 320 400 280" fill="none" stroke="hsl(202, 62%, 70%)" strokeWidth="8" />
        </svg>

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-5 z-10">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </button>
            <h1 className="font-display font-bold text-foreground text-lg">Mapa de Saneamento</h1>
            <div className="flex gap-2">
              <ThemeToggle className="text-foreground w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center" />
              <button className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center">
                <Filter className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Map markers */}
        {markers.map((m) => (
          <button
            key={m.id}
            className="absolute z-10"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            onClick={() => setSelectedMarker(m)}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center shadow-card`}>
                <MapPin className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
              </div>
              {m.type === "vazamento" && (
                <div className={`absolute inset-0 rounded-full ${m.color} opacity-30 animate-ripple`} />
              )}
            </div>
          </button>
        ))}

        {/* Center location button */}
        <button className="absolute right-5 bottom-40 z-10 w-12 h-12 rounded-full bg-card shadow-card-hover flex items-center justify-center">
          <Crosshair className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </button>

        {/* Report FAB */}
        <button
          onClick={() => setShowReport(true)}
          className="absolute right-5 bottom-24 z-10 px-5 py-3 rounded-full gradient-primary shadow-card-hover flex items-center gap-2"
        >
          <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          <span className="text-primary-foreground font-display font-semibold text-sm">Reportar</span>
        </button>

        {/* Legend */}
        <div className="absolute left-5 bottom-24 z-10 bg-card rounded-xl shadow-card p-3 space-y-1.5">
          {[
            { color: "bg-verde-sucesso", label: "Normal" },
            { color: "bg-amarelo-alerta", label: "Manutenção" },
            { color: "bg-vermelho-critico", label: "Vazamento" },
            { color: "bg-azul-falta", label: "Falta d'água" },
            { color: "bg-roxo-obras", label: "Obra" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${l.color}`} />
              <span className="text-[10px] font-body text-cinza-medio">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom sheet for selected marker */}
      {selectedMarker && (
        <motion.div
          className="absolute bottom-16 left-0 right-0 bg-card rounded-t-3xl shadow-card p-6 z-20"
          initial={{ y: 200 }}
          animate={{ y: 0 }}
        >
          <button onClick={() => setSelectedMarker(null)} className="absolute top-3 right-5 text-cinza-claro text-xl">×</button>
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full ${selectedMarker.color} flex items-center justify-center`}>
              <AlertTriangle className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">{selectedMarker.label}</h3>
              <p className="text-sm font-body text-cinza-medio">{selectedMarker.desc}</p>
              {selectedMarker.time && <p className="text-xs font-body text-cinza-claro mt-0.5">{selectedMarker.time}</p>}
            </div>
          </div>
          {selectedMarker.confirms > 0 && (
            <p className="text-xs font-body text-verde-sucesso mb-3 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
              {selectedMarker.confirms} pessoas confirmaram
            </p>
          )}
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold text-sm">
              Confirmar Problema
            </button>
            <button className="flex-1 py-2.5 rounded-full border border-primary text-primary font-display font-semibold text-sm flex items-center justify-center gap-1">
              <Camera className="w-4 h-4" strokeWidth={1.5} /> Foto
            </button>
          </div>
        </motion.div>
      )}

      {/* Report form modal */}
      {showReport && (
        <motion.div
          className="fixed inset-0 z-50 bg-foreground/30 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowReport(false)}
        >
          <motion.div
            className="w-full bg-card rounded-t-3xl p-6"
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-foreground text-lg mb-4">Reportar um Problema</h3>
            <div className="space-y-3">
              <select className="w-full py-3 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none">
                <option>Vazamento</option>
                <option>Falta de água</option>
                <option>Água suja</option>
                <option>Esgoto a céu aberto</option>
              </select>
              <textarea className="w-full py-3 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none resize-none h-20" placeholder="Descreva o problema..." />
              <button className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" strokeWidth={1.5} /> Tirar Foto e Enviar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MapPage;
