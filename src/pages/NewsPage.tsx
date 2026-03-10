import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Filter, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  { label: "Manutenção", color: "bg-amarelo-alerta" },
  { label: "Abastecimento", color: "bg-primary" },
  { label: "Meio Ambiente", color: "bg-verde-sucesso" },
  { label: "Obras", color: "bg-roxo-obras" },
];

const news = [
  { id: 1, cat: "Abastecimento", title: "Manutenção na ETA Central afetará 15 bairros", desc: "A concessionária realizará melhorias preventivas no sistema...", time: "Há 10 min", read: "2 min" },
  { id: 2, cat: "Obras", title: "Nova rede de esgoto chega ao bairro Pedra 90", desc: "Investimento de R$ 15 milhões beneficiará 20 mil moradores...", time: "Há 2h", read: "3 min" },
  { id: 3, cat: "Meio Ambiente", title: "Cuiabá atinge 98% de cobertura de água potável", desc: "Marco histórico no saneamento da capital mato-grossense...", time: "Há 5h", read: "4 min" },
  { id: 4, cat: "Manutenção", title: "Interrupção programada no CPA II nesta sexta", desc: "Obras de ampliação da rede exigem interrupção temporária...", time: "Há 1 dia", read: "2 min" },
];

const catColor: Record<string, string> = {
  "Manutenção": "bg-amarelo-alerta",
  "Abastecimento": "bg-primary",
  "Meio Ambiente": "bg-verde-sucesso",
  "Obras": "bg-roxo-obras",
};

const NewsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? news.filter((n) => n.cat === filter) : news;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Notícias</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-5 -mt-3">
        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-medium whitespace-nowrap transition-colors ${!filter ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.label}
              onClick={() => setFilter(filter === c.label ? null : c.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-display font-medium whitespace-nowrap transition-colors ${filter === c.label ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* News feed */}
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className="bg-card rounded-2xl shadow-card p-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-display font-medium text-primary-foreground ${catColor[item.cat]}`}>
                  {item.cat}
                </span>
                <button><Bookmark className="w-4 h-4 text-cinza-claro" strokeWidth={1.5} /></button>
              </div>
              <h3 className="font-display font-bold text-foreground text-sm mb-1">{item.title}</h3>
              <p className="font-body text-xs text-cinza-medio mb-2 line-clamp-2">{item.desc}</p>
              <div className="flex items-center gap-3 text-cinza-claro">
                <span className="flex items-center gap-1 text-[10px] font-body">
                  <Clock className="w-3 h-3" strokeWidth={1.5} /> {item.time}
                </span>
                <span className="text-[10px] font-body">{item.read} de leitura</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
