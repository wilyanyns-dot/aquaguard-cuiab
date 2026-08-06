import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, User, MapPin, CreditCard, CheckCircle, Accessibility } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import ThemeToggle from "@/components/ThemeToggle";
import AccessibilityOptions from "@/components/a11y/AccessibilityOptions";


const banks = ["Nubank", "Itaú", "Bradesco", "Banco do Brasil", "Santander", "Inter", "Caixa", "Sicoob", "C6 Bank", "PicPay"];

function validateCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11; if (r === 10) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11; if (r === 10) r = 0;
  return r === parseInt(c[10]);
}

function maskCPF(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
}
function maskPhone(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
}
function maskCEP(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
}

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { setUser, generateConsumption } = useUser();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nome: "", email: "", cpf: "", telefone: "",
    cep: "", endereco: "", numero: "",
    matricula: "", bancoPreferencial: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    let v = value;
    if (field === "cpf") v = maskCPF(value);
    if (field === "telefone") v = maskPhone(value);
    if (field === "cep") v = maskCEP(value);
    setForm((f) => ({ ...f, [field]: v }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const fetchCEP = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({ ...f, endereco: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}` }));
      }
    } catch { /* ignore */ }
    setCepLoading(false);
  }, []);

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.nome.trim()) e.nome = "Nome é obrigatório";
      if (!form.email.includes("@")) e.email = "E-mail inválido";
      if (!validateCPF(form.cpf)) e.cpf = "CPF inválido";
      if (form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone inválido";
    } else if (step === 1) {
      if (form.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP inválido";
      if (!form.numero.trim()) e.numero = "Número é obrigatório";
    } else if (step === 2) {
      if (!form.matricula.trim()) e.matricula = "Matrícula é obrigatória";
      if (!form.bancoPreferencial) e.bancoPreferencial = "Selecione um banco";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 3)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    if (!validateStep()) return;
    const userData = { ...form, onboarded: true };
    setUser(userData);
    generateConsumption(form.cep);
    navigate("/home");
  };

  const steps = [
    { icon: User, title: "Identificação Pessoal" },
    { icon: MapPin, title: "Localização" },
    { icon: CreditCard, title: "Consumo e Pagamento" },
    { icon: Accessibility, title: "Acessibilidade" },
  ];


  const inputClass = (field: string) =>
    `w-full py-3 px-4 rounded-xl bg-card shadow-card font-body text-sm text-foreground border ${errors[field] ? "border-destructive" : "border-border"} outline-none focus:ring-2 focus:ring-primary/30 transition-all`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-5" />
          <h1 className="font-display font-bold text-primary-foreground text-lg">Cadastro</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${i <= step ? "bg-primary-foreground text-primary" : "bg-primary-foreground/20 text-primary-foreground/50"}`}>
                {i < step ? <CheckCircle className="w-5 h-5" strokeWidth={1.5} /> : <s.icon className="w-4 h-4" strokeWidth={1.5} />}
              </div>
              {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i < step ? "bg-primary-foreground" : "bg-primary-foreground/20"}`} />}
            </div>
          ))}
        </div>
        <p className="text-center text-primary-foreground/80 text-sm font-body mt-3">{steps[step].title}</p>
      </div>

      <div className="flex-1 px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-4">
            {step === 0 && (
              <>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Nome Completo</label>
                  <input className={inputClass("nome")} value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Seu nome completo" />
                  {errors.nome && <span className="text-destructive text-[10px] font-body mt-1">{errors.nome}</span>}
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">E-mail</label>
                  <input className={inputClass("email")} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="seuemail@exemplo.com" />
                  {errors.email && <span className="text-destructive text-[10px] font-body mt-1">{errors.email}</span>}
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">CPF</label>
                  <input className={inputClass("cpf")} value={form.cpf} onChange={(e) => update("cpf", e.target.value)} placeholder="000.000.000-00" />
                  {errors.cpf && <span className="text-destructive text-[10px] font-body mt-1">{errors.cpf}</span>}
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Telefone</label>
                  <input className={inputClass("telefone")} value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="(65) 99999-9999" />
                  {errors.telefone && <span className="text-destructive text-[10px] font-body mt-1">{errors.telefone}</span>}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">CEP</label>
                  <input className={inputClass("cep")} value={form.cep} onChange={(e) => { update("cep", e.target.value); if (e.target.value.replace(/\D/g, "").length === 8) fetchCEP(e.target.value); }} placeholder="78000-000" />
                  {errors.cep && <span className="text-destructive text-[10px] font-body mt-1">{errors.cep}</span>}
                  {cepLoading && <span className="text-primary text-[10px] font-body mt-1">Buscando endereço...</span>}
                </div>
                {form.endereco && (
                  <div className="bg-card rounded-xl shadow-card p-3">
                    <span className="text-xs font-body text-cinza-medio">📍 {form.endereco}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Número da Residência</label>
                  <input className={inputClass("numero")} value={form.numero} onChange={(e) => update("numero", e.target.value)} placeholder="123" />
                  {errors.numero && <span className="text-destructive text-[10px] font-body mt-1">{errors.numero}</span>}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Matrícula / Unidade Consumidora</label>
                  <input className={inputClass("matricula")} value={form.matricula} onChange={(e) => update("matricula", e.target.value)} placeholder="Ex: 123456-7" />
                  <p className="text-[10px] text-cinza-medio font-body mt-1">Este número é necessário para registrarmos seu consumo diário automaticamente.</p>
                  {errors.matricula && <span className="text-destructive text-[10px] font-body mt-1">{errors.matricula}</span>}
                </div>
                <div>
                  <label className="text-xs font-display font-semibold text-foreground mb-1 block">Banco Preferencial</label>
                  <select className={inputClass("bancoPreferencial")} value={form.bancoPreferencial} onChange={(e) => update("bancoPreferencial", e.target.value)}>
                    <option value="">Selecione seu banco</option>
                    {banks.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.bancoPreferencial && <span className="text-destructive text-[10px] font-body mt-1">{errors.bancoPreferencial}</span>}
                </div>
              </>
            )}
            {step === 3 && (
              <section aria-labelledby="a11y-title">
                <h2 id="a11y-title" className="font-display font-bold text-foreground text-lg">
                  Você precisa de recursos de acessibilidade?
                </h2>
                <p className="font-body text-xs text-muted-foreground mt-1 mb-4">
                  Toque nas opções que combinam com você. Tudo é aplicado na hora e fica salvo para os próximos acessos.
                  Se não precisar de nenhuma, é só concluir.
                </p>
                <AccessibilityOptions />
              </section>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom buttons */}
      <div className="px-5 pb-8 flex gap-3">
        {step > 0 && (
          <button onClick={prev} className="flex-1 py-3.5 rounded-full border border-primary text-primary font-display font-semibold flex items-center justify-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
        )}
        {step < 3 ? (
          <button onClick={next} className="flex-1 py-3.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-1 shadow-card-hover">
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={finish} className="flex-1 py-3.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-1 shadow-card-hover">
            <CheckCircle className="w-4 h-4" /> Concluir Cadastro
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
