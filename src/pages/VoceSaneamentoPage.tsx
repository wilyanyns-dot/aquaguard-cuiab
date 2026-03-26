import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Building2, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";

const horarios = ["Matutino (8h - 12h)", "Vespertino (13h - 17h)"];

const VoceSaneamentoPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    instituicao: "", tipo: "", localizacao: "",
    modalidade: "", // visitar | receber
    tipoVisita: "", // educacional | tecnica | palestra | treinamento
    participantes: "",
    data: "",
    horario: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.instituicao && form.tipo && form.localizacao && form.modalidade;
    if (step === 1) return form.tipoVisita && form.participantes;
    if (step === 2) return form.data && form.horario;
    return false;
  };

  const generateDays = () => {
    const days: { date: string; label: string; disabled: boolean }[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dow = d.getDay();
      days.push({
        date: d.toISOString().split("T")[0],
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        disabled: dow === 0 || dow === 6,
      });
    }
    return days;
  };

  const handleSubmit = () => setSuccess(true);

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-full bg-verde-sucesso/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-verde-sucesso" />
          </div>
          <h2 className="font-display font-bold text-foreground text-xl mb-3">Solicitação enviada!</h2>
          <p className="font-body text-sm text-cinza-medio mb-6 leading-relaxed">
            Um e-mail de confirmação será enviado para <span className="text-primary font-semibold">{user?.email || "seu e-mail"}</span> assim que o pedido for aprovado pela equipe técnica.
          </p>
          <button onClick={() => navigate("/home")} className="w-full py-3.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold">
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { icon: Building2, title: "Identificação" },
    { icon: Users, title: "Detalhes do Serviço" },
    { icon: Calendar, title: "Data e Horário" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Você no Saneamento</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= step ? "bg-primary-foreground text-primary" : "bg-primary-foreground/20 text-primary-foreground/50"}`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" strokeWidth={1.5} />}
              </div>
              {i < 2 && <div className={`w-6 h-0.5 ${i < step ? "bg-primary-foreground" : "bg-primary-foreground/20"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            {step === 0 && (
              <>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Nome da Instituição/Empresa</label>
                  <input className="w-full py-3 px-4 rounded-xl bg-card shadow-card font-body text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30" value={form.instituicao} onChange={(e) => update("instituicao", e.target.value)} placeholder="Ex: Escola Municipal CPA" />
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Tipo de Entidade</label>
                  <div className="flex gap-2">
                    {["Pública", "Privada"].map((t) => (
                      <button key={t} onClick={() => update("tipo", t)} className={`flex-1 py-3 rounded-xl font-display font-medium text-sm transition-all ${form.tipo === t ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-foreground"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Localização (Cidade/Estado)</label>
                  <input className="w-full py-3 px-4 rounded-xl bg-card shadow-card font-body text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30" value={form.localizacao} onChange={(e) => update("localizacao", e.target.value)} placeholder="Ex: Cuiabá/MT" />
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">O que deseja?</label>
                  <div className="space-y-2">
                    {[{ v: "visitar", l: "Desejo visitar uma unidade (ETA/ETE)" }, { v: "receber", l: "Desejo receber um profissional" }].map((o) => (
                      <button key={o.v} onClick={() => update("modalidade", o.v)} className={`w-full py-3 px-4 rounded-xl text-left font-body text-sm transition-all ${form.modalidade === o.v ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-foreground"}`}>{o.l}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">
                    {form.modalidade === "visitar" ? "Tipo de Visita" : "Tipo de Serviço"}
                  </label>
                  <div className="space-y-2">
                    {(form.modalidade === "visitar"
                      ? [{ v: "educacional", l: "Visita Educacional (Escolas)" }, { v: "tecnica", l: "Visita Técnica (Universidades/Profissionais)" }]
                      : [{ v: "palestra", l: "Palestra Educativa" }, { v: "treinamento", l: "Treinamento Técnico" }]
                    ).map((o) => (
                      <button key={o.v} onClick={() => update("tipoVisita", o.v)} className={`w-full py-3 px-4 rounded-xl text-left font-body text-sm transition-all ${form.tipoVisita === o.v ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-foreground"}`}>{o.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Número de Participantes</label>
                  <input type="number" className="w-full py-3 px-4 rounded-xl bg-card shadow-card font-body text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30" value={form.participantes} onChange={(e) => update("participantes", e.target.value)} placeholder="Ex: 30" />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-2 block">Selecione uma data disponível</label>
                  <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                    {generateDays().map((d) => (
                      <button key={d.date} disabled={d.disabled} onClick={() => update("data", d.date)}
                        className={`py-2 rounded-lg text-xs font-display font-medium transition-all ${d.disabled ? "bg-muted text-cinza-claro cursor-not-allowed" : form.data === d.date ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-foreground hover:shadow-card-hover"}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Horário</label>
                  <div className="flex gap-2">
                    {horarios.map((h) => (
                      <button key={h} onClick={() => update("horario", h)} className={`flex-1 py-3 rounded-xl font-body text-xs transition-all ${form.horario === h ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-foreground"}`}>{h}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 pb-8 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3.5 rounded-full border border-primary text-primary font-display font-semibold flex items-center justify-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
        )}
        {step < 2 ? (
          <button onClick={() => canNext() && setStep((s) => s + 1)} disabled={!canNext()} className={`flex-1 py-3.5 rounded-full font-display font-semibold flex items-center justify-center gap-1 transition-all ${canNext() ? "gradient-primary text-primary-foreground shadow-card-hover" : "bg-muted text-cinza-claro"}`}>
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!canNext()} className={`flex-1 py-3.5 rounded-full font-display font-semibold flex items-center justify-center gap-1 transition-all ${canNext() ? "gradient-primary text-primary-foreground shadow-card-hover" : "bg-muted text-cinza-claro"}`}>
            <CheckCircle className="w-4 h-4" /> Enviar Solicitação
          </button>
        )}
      </div>
    </div>
  );
};

export default VoceSaneamentoPage;
