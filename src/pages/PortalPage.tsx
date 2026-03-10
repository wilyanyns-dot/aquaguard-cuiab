import { motion } from "framer-motion";
import { ArrowLeft, FileText, History, RefreshCw, Droplets, MessageCircle, CreditCard, Download, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  { icon: FileText, label: "2ª Via de Conta", color: "text-primary" },
  { icon: History, label: "Histórico de Consumo", color: "text-primary" },
  { icon: RefreshCw, label: "Troca de Titularidade", color: "text-primary" },
  { icon: Droplets, label: "Religar Água", color: "text-verde-sucesso" },
  { icon: Droplets, label: "Qualidade da Água", color: "text-primary" },
  { icon: MessageCircle, label: "Atendimento", color: "text-verde-sucesso" },
];

const PortalPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Nosso Portal</h1>
          <div className="w-5" />
        </div>
        <p className="text-primary-foreground/80 text-sm font-body">Olá, Usuário! 👋</p>
        <p className="text-primary-foreground/60 text-xs font-body">Unidade: 123456-7</p>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        {/* Bill card */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-body text-xs text-cinza-medio">Fatura de Março</p>
              <p className="font-display font-bold text-2xl text-foreground">R$ 85,90</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-amarelo-alerta/10 text-amarelo-alerta text-[10px] font-display font-medium">Vence em 15/03</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-full gradient-primary text-primary-foreground font-display font-semibold text-sm flex items-center justify-center gap-1">
              <CreditCard className="w-4 h-4" strokeWidth={1.5} /> Pagar com Pix
            </button>
            <button className="flex-1 py-2.5 rounded-full border border-primary text-primary font-display font-semibold text-sm flex items-center justify-center gap-1">
              <Download className="w-4 h-4" strokeWidth={1.5} /> Ver PDF
            </button>
          </div>
          <div className="mt-3 p-2 rounded-lg bg-verde-sucesso/5">
            <p className="text-[10px] font-body text-verde-sucesso text-center">✅ Nenhuma pendência anterior</p>
          </div>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-3 gap-3">
          {services.map((s, i) => (
            <motion.button
              key={s.label}
              className="bg-card rounded-2xl shadow-card p-4 flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <s.icon className={`w-6 h-6 ${s.color}`} strokeWidth={1.5} />
              <span className="font-body text-[10px] text-center text-cinza-medio">{s.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Support */}
        <button className="w-full bg-card rounded-2xl shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-verde-sucesso/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-verde-sucesso" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-display font-bold text-sm text-foreground">Atendimento ao Cliente</p>
            <span className="text-xs font-body text-cinza-medio">Chat em tempo real ou WhatsApp</span>
          </div>
          <ExternalLink className="w-4 h-4 text-cinza-claro" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default PortalPage;
