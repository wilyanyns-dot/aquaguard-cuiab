import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Clock, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const categories = [
  { label: "Todos", key: null },
  { label: "Obras e Expansão", key: "Obras", color: "bg-roxo-obras" },
  { label: "Abastecimento", key: "Abastecimento", color: "bg-primary" },
  { label: "Meio Ambiente / ODS 6", key: "Meio Ambiente", color: "bg-verde-sucesso" },
  { label: "Manutenção", key: "Manutenção", color: "bg-amarelo-alerta" },
];

const news = [
  { id: 1, cat: "Abastecimento", title: "Manutenção na ETA Central afetará 15 bairros", desc: "A concessionária realizará melhorias preventivas no sistema de tratamento...", time: "Há 10 min", read: "2 min" },
  { id: 2, cat: "Obras", title: "Nova rede de esgoto chega ao bairro Pedra 90", desc: "Investimento de R$ 15 milhões beneficiará 20 mil moradores com saneamento completo...", time: "Há 2h", read: "3 min" },
  { id: 3, cat: "Meio Ambiente", title: "Cuiabá atinge 98% de cobertura de água potável", desc: "Marco histórico no saneamento da capital mato-grossense, alinhado à ODS 6...", time: "Há 5h", read: "4 min" },
  { id: 4, cat: "Manutenção", title: "Interrupção programada no CPA II nesta sexta", desc: "Obras de ampliação da rede exigem interrupção temporária do fornecimento...", time: "Há 1 dia", read: "2 min" },
  { id: 5, cat: "Obras", title: "Ampliação da rede de esgoto na região sul", desc: "Mais 12 km de rede serão implantados nos próximos 6 meses...", time: "Há 2 dias", read: "3 min" },
  { id: 6, cat: "Meio Ambiente", title: "Programa de educação ambiental nas escolas", desc: "Parceria com a Secretaria de Educação leva palestras sobre ODS 6 para 50 escolas...", time: "Há 3 dias", read: "5 min" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const catScrollRef = useRef<HTMLDivElement>(null);

  const filtered = news.filter(n => {
    const matchFilter = !filter || n.cat === filter;
    const matchSearch = !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.cat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Notícias</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <div className="relative">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar notícias..." className="w-full py-2.5 px-4 pr-10 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-body text-sm border-none outline-none" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" strokeWidth={1.5} />
        </div>
      </div>

      <div className="px-5 -mt-3">
        {/* Horizontal scrollable category tags with fade */}
        <div className="relative mb-4">
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div
            ref={catScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((c) => (
              <button
                key={c.label}
                onClick={() => setFilter(c.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium whitespace-nowrap flex-shrink-0 transition-colors ${filter === c.key ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}
              >
                {c.color && <div className={`w-2 h-2 rounded-full ${c.color}`} />}
                {c.label}
              </button>
            ))}
          </div>
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
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-display font-medium text-primary-foreground ${catColor[item.cat] || "bg-muted"}`}>
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
          {filtered.length === 0 && <p className="text-center text-sm text-cinza-medio font-body py-8">Nenhuma notícia encontrada.</p>}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
