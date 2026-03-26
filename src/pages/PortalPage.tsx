import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, ExternalLink, Clock, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const categories = ["Todos", "Projetos", "Educação", "Sustentabilidade", "Notícias"];

const projects = [
  {
    id: 1,
    cat: "Projetos",
    title: "Nova ETE do Rio Coxipó beneficiará 80 mil moradores",
    desc: "Projeto de expansão da estação de tratamento de esgoto vai aumentar a capacidade de tratamento em 40%...",
    image: "🏗️",
    time: "Há 2 dias",
  },
  {
    id: 2,
    cat: "Sustentabilidade",
    title: "Programa de Reuso de Água nas Escolas de Cuiabá",
    desc: "Iniciativa piloto ensina alunos a reaproveitar água da chuva para irrigação de hortas escolares...",
    image: "🌱",
    time: "Há 3 dias",
  },
  {
    id: 3,
    cat: "Notícias",
    title: "Cuiabá atinge meta de 98% de cobertura de água potável",
    desc: "Marco histórico coloca a capital entre as cidades com melhor índice de abastecimento do Centro-Oeste...",
    image: "💧",
    time: "Há 1 semana",
  },
  {
    id: 4,
    cat: "Projetos",
    title: "Modernização da rede de distribuição no CPA",
    desc: "Investimento de R$ 25 milhões substituirá tubulações antigas por materiais de última geração...",
    image: "🔧",
    time: "Há 1 semana",
  },
];

const videos = [
  {
    id: 1,
    title: "Como funciona o tratamento de água?",
    channel: "Saneamento Cuiabá",
    duration: "12:30",
    thumbnail: "💧🏭",
  },
  {
    id: 2,
    title: "O ciclo da água e o saneamento básico",
    channel: "Educação Ambiental MT",
    duration: "8:45",
    thumbnail: "🌍💧",
  },
  {
    id: 3,
    title: "Dicas para economizar água em casa",
    channel: "Saneamento Cuiabá",
    duration: "6:20",
    thumbnail: "🏠💡",
  },
  {
    id: 4,
    title: "ETA e ETE: entenda as diferenças",
    channel: "Ciência & Água",
    duration: "15:10",
    thumbnail: "🔬📚",
  },
];

const PortalPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Todos");

  const filtered = filter === "Todos" ? projects : projects.filter((p) => p.cat === filter);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Nosso Portal</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <p className="text-primary-foreground/80 text-sm font-body text-center">
          Notícias, projetos e educação ambiental
        </p>
      </div>

      <div className="px-5 -mt-3 space-y-5">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-display font-medium whitespace-nowrap transition-colors ${
                filter === c ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Featured project */}
        {filtered[0] && (
          <motion.div
            className="bg-card rounded-2xl shadow-card overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="h-32 gradient-primary flex items-center justify-center">
              <span className="text-5xl">{filtered[0].image}</span>
            </div>
            <div className="p-4">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-medium text-primary-foreground bg-primary mb-2 inline-block">
                {filtered[0].cat}
              </span>
              <h3 className="font-display font-bold text-foreground text-base mb-1">{filtered[0].title}</h3>
              <p className="font-body text-xs text-cinza-medio line-clamp-2 mb-2">{filtered[0].desc}</p>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-cinza-claro" strokeWidth={1.5} />
                <span className="text-[10px] text-cinza-claro font-body">{filtered[0].time}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Video section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foreground text-base">Vídeos Educativos</h2>
            <span className="text-[10px] text-primary font-display font-medium">Ver todos</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {videos.map((v, i) => (
              <motion.button
                key={v.id}
                className="min-w-[200px] bg-card rounded-xl shadow-card overflow-hidden text-left"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="h-24 bg-muted flex items-center justify-center relative">
                  <span className="text-3xl">{v.thumbnail}</span>
                  <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary-foreground/90 flex items-center justify-center shadow-card">
                      <Play className="w-4 h-4 text-primary ml-0.5" strokeWidth={2} fill="currentColor" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 bg-foreground/70 text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-body">
                    {v.duration}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-foreground text-xs line-clamp-2 mb-1">{v.title}</p>
                  <span className="text-[10px] text-cinza-medio font-body">{v.channel}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* More projects */}
        <div>
          <h2 className="font-display font-bold text-foreground text-base mb-3">Projetos e Informações</h2>
          <div className="space-y-3">
            {filtered.slice(1).map((p, i) => (
              <motion.div
                key={p.id}
                className="bg-card rounded-xl shadow-card p-4 flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{p.image}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-display font-medium text-primary-foreground bg-primary inline-block mb-1">
                    {p.cat}
                  </span>
                  <h3 className="font-display font-bold text-foreground text-sm line-clamp-1">{p.title}</h3>
                  <p className="font-body text-[10px] text-cinza-medio line-clamp-1">{p.desc}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Bookmark className="w-4 h-4 text-cinza-claro" strokeWidth={1.5} />
                  <span className="text-[9px] text-cinza-claro font-body">{p.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
