import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, ExternalLink, Clock, Bookmark, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const categories = ["Todos", "Projetos", "Educação", "Sustentabilidade", "Notícias"];

const projects = [
  { id: 1, cat: "Projetos", title: "Nova ETE do Rio Coxipó beneficiará 80 mil moradores", desc: "Projeto de expansão da estação de tratamento de esgoto vai aumentar a capacidade de tratamento em 40%.", image: "🏗️", time: "Há 2 dias", org: "Prefeitura de Cuiabá" },
  { id: 2, cat: "Sustentabilidade", title: "Programa de Reuso de Água nas Escolas de Cuiabá", desc: "Iniciativa piloto ensina alunos a reaproveitar água da chuva para irrigação de hortas escolares.", image: "🌱", time: "Há 3 dias", org: "Secretaria de Meio Ambiente" },
  { id: 3, cat: "Notícias", title: "Cuiabá atinge meta de 98% de cobertura de água potável", desc: "Marco histórico coloca a capital entre as cidades com melhor índice de abastecimento.", image: "💧", time: "Há 1 semana", org: "Águas Cuiabá" },
  { id: 4, cat: "Projetos", title: "Modernização da rede de distribuição no CPA", desc: "Investimento de R$ 25 milhões substituirá tubulações antigas.", image: "🔧", time: "Há 1 semana", org: "Águas Cuiabá" },
  { id: 5, cat: "Projetos", title: "Revitalização do Rio Cuiabá - Fase 2", desc: "Parceria entre prefeitura e governo estadual para despoluição e reflorestamento das margens.", image: "🏞️", time: "Há 2 semanas", org: "Governo do Estado de MT" },
  { id: 6, cat: "Projetos", title: "Ampliação da ETA Norte", desc: "Obra de ampliação da Estação de Tratamento de Água para atender novos bairros.", image: "🏭", time: "Há 3 semanas", org: "SANECAP" },
];

const allVideos = [
  { id: 1, title: "Como funciona o tratamento de água?", channel: "Saneamento Cuiabá", duration: "12:30", thumbnail: "💧🏭" },
  { id: 2, title: "O ciclo da água e o saneamento básico", channel: "Educação Ambiental MT", duration: "8:45", thumbnail: "🌍💧" },
  { id: 3, title: "Dicas para economizar água em casa", channel: "Saneamento Cuiabá", duration: "6:20", thumbnail: "🏠💡" },
  { id: 4, title: "ETA e ETE: entenda as diferenças", channel: "Ciência & Água", duration: "15:10", thumbnail: "🔬📚" },
  { id: 5, title: "Como ler seu hidrômetro", channel: "Saneamento Cuiabá", duration: "4:15", thumbnail: "📊💧" },
  { id: 6, title: "Reuso de água: guia completo", channel: "Sustenta MT", duration: "10:00", thumbnail: "♻️💧" },
  { id: 7, title: "Esgoto a céu aberto: riscos e soluções", channel: "Saúde Pública", duration: "7:30", thumbnail: "⚠️🏙️" },
  { id: 8, title: "Captação de água da chuva caseira", channel: "DIY Sustentável", duration: "9:45", thumbnail: "🌧️🏠" },
];

const PortalPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Todos");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (filter === "Todos" ? projects : projects.filter((p) => p.cat === filter))
    .filter((p) => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayVideos = showAllVideos ? allVideos : allVideos.slice(0, 4);
  const displayProjects = showAllProjects ? filtered.slice(1) : filtered.slice(1, 4);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Nosso Portal</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <p className="text-primary-foreground/80 text-sm font-body text-center mb-3">Notícias, projetos e educação ambiental</p>
        <div className="relative">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar projetos e notícias..." className="w-full py-2.5 px-4 pr-10 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-body text-sm border-none outline-none" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" />
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-display font-medium whitespace-nowrap transition-colors ${filter === c ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}>{c}</button>
          ))}
        </div>

        {filtered[0] && (
          <motion.div className="bg-card rounded-2xl shadow-card overflow-hidden" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="h-32 gradient-primary flex items-center justify-center"><span className="text-5xl">{filtered[0].image}</span></div>
            <div className="p-4">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-medium text-primary-foreground bg-primary mb-2 inline-block">{filtered[0].cat}</span>
              <h3 className="font-display font-bold text-foreground text-base mb-1">{filtered[0].title}</h3>
              <p className="font-body text-xs text-cinza-medio line-clamp-2 mb-2">{filtered[0].desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-cinza-claro" /><span className="text-[10px] text-cinza-claro font-body">{filtered[0].time}</span></div>
                <span className="text-[10px] text-cinza-medio font-body">{filtered[0].org}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foreground text-base">Vídeos Educativos</h2>
            <button onClick={() => setShowAllVideos(!showAllVideos)} className="text-[10px] text-primary font-display font-medium">{showAllVideos ? "Ver menos" : "Ver todos"}</button>
          </div>
          <div className={showAllVideos ? "grid grid-cols-2 gap-3" : "flex gap-3 overflow-x-auto pb-2"}>
            {displayVideos.map((v, i) => (
              <motion.button key={v.id} className={`${showAllVideos ? "" : "min-w-[200px]"} bg-card rounded-xl shadow-card overflow-hidden text-left`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="h-24 bg-muted flex items-center justify-center relative">
                  <span className="text-3xl">{v.thumbnail}</span>
                  <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary-foreground/90 flex items-center justify-center shadow-card"><Play className="w-4 h-4 text-primary ml-0.5" strokeWidth={2} fill="currentColor" /></div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 bg-foreground/70 text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-body">{v.duration}</span>
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-foreground text-xs line-clamp-2 mb-1">{v.title}</p>
                  <span className="text-[10px] text-cinza-medio font-body">{v.channel}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foreground text-base">Projetos e Informações</h2>
            <button onClick={() => setShowAllProjects(!showAllProjects)} className="text-[10px] text-primary font-display font-medium">{showAllProjects ? "Ver menos" : "Ver todos"}</button>
          </div>
          <div className="space-y-3">
            {displayProjects.map((p, i) => (
              <motion.div key={p.id} className="bg-card rounded-xl shadow-card p-4 flex gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"><span className="text-2xl">{p.image}</span></div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-display font-medium text-primary-foreground bg-primary inline-block mb-1">{p.cat}</span>
                  <h3 className="font-display font-bold text-foreground text-sm line-clamp-1">{p.title}</h3>
                  <p className="font-body text-[10px] text-cinza-medio line-clamp-1">{p.org}</p>
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
