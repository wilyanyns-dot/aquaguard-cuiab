import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Droplets, Leaf, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";

const filters = [
  { icon: Droplets, label: "Água" },
  { icon: Leaf, label: "Sustentabilidade" },
  { icon: Building, label: "Saneamento" },
];

const terms = [
  { id: 1, title: "Saneamento Básico", desc: "Conjunto de serviços que garantem o acesso à água potável, coleta e tratamento de esgoto, manejo de resíduos e drenagem urbana.", cat: "Saneamento", featured: true },
  { id: 2, title: "Tratamento de Água", desc: "Processo de limpeza da água antes de chegar às casas.", cat: "Água" },
  { id: 3, title: "Reuso de Água", desc: "Prática de reaproveitar água para reduzir desperdício.", cat: "Sustentabilidade" },
  { id: 4, title: "Ciclo da Água", desc: "Evaporação, condensação, precipitação e infiltração.", cat: "Água" },
  { id: 5, title: "Bacia Hidrográfica", desc: "Área de drenagem de um rio principal e seus afluentes.", cat: "Água" },
  { id: 6, title: "ETA", desc: "Estação de Tratamento de Água — onde a água bruta é tratada.", cat: "Saneamento" },
  { id: 7, title: "ETE", desc: "Estação de Tratamento de Esgoto — onde o esgoto é tratado.", cat: "Saneamento" },
  { id: 8, title: "Consumo Consciente", desc: "Uso racional dos recursos hídricos no dia a dia.", cat: "Sustentabilidade" },
  { id: 9, title: "Pegada Hídrica", desc: "Volume total de água utilizado por pessoa ou produto.", cat: "Sustentabilidade" },
];

const DictionaryPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<typeof terms[0] | null>(null);

  const filtered = terms.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !activeFilter || t.cat === activeFilter;
    return matchSearch && matchFilter;
  });

  const featured = filtered.find((t) => t.featured);
  const rest = filtered.filter((t) => !t.featured);

  if (selectedTerm) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedTerm(null)}>
              <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
            </button>
            <h1 className="font-display font-bold text-primary-foreground text-lg">{selectedTerm.title}</h1>
          </div>
        </div>
        <div className="px-5 mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="font-body text-foreground leading-relaxed">{selectedTerm.desc}</p>
            <div className="bg-card rounded-2xl shadow-card p-4">
              <h3 className="font-display font-bold text-sm text-foreground mb-2">💡 Curiosidade</h3>
              <p className="font-body text-xs text-cinza-medio">
                O conceito de {selectedTerm.title.toLowerCase()} está diretamente relacionado ao ODS 6 da ONU, que busca garantir água potável e saneamento para todos até 2030.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Dicionário Ambiental</h1>
          <div className="w-5" />
        </div>
        {/* Search */}
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar termo..."
            className="w-full py-3 px-4 pr-10 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-body text-sm border-none outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50" strokeWidth={1.5} />
        </div>
      </div>

      <div className="px-5 -mt-3">
        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(activeFilter === f.label ? null : f.label)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-colors ${
                activeFilter === f.label ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"
              }`}
            >
              <f.icon className="w-3 h-3" strokeWidth={1.5} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Featured + side cards */}
        {featured && (
          <div className="flex gap-3 mb-4">
            <motion.button
              onClick={() => setSelectedTerm(featured)}
              className="flex-[2] bg-card rounded-2xl shadow-card p-4 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-display font-bold text-foreground text-base mb-2">{featured.title}</h3>
              <p className="font-body text-xs text-cinza-medio mb-3 line-clamp-3">{featured.desc}</p>
              <span className="text-xs font-display font-semibold text-primary">Saiba mais →</span>
            </motion.button>
            <div className="flex-1 flex flex-col gap-3">
              {rest.slice(0, 2).map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setSelectedTerm(t)}
                  className="bg-card rounded-2xl shadow-card p-3 text-left flex-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-display font-bold text-xs text-foreground mb-1">{t.title}</h4>
                  <p className="font-body text-[10px] text-cinza-medio line-clamp-2">{t.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {rest.slice(featured ? 2 : 0).map((t, i) => (
            <motion.button
              key={t.id}
              onClick={() => setSelectedTerm(t)}
              className="bg-card rounded-2xl shadow-card p-4 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <h4 className="font-display font-bold text-sm text-foreground mb-1">{t.title}</h4>
              <p className="font-body text-xs text-cinza-medio line-clamp-2">{t.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DictionaryPage;
