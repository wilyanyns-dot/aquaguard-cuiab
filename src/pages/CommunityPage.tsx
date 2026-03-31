import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, ThumbsUp, BookmarkPlus, Share2, Search, Lightbulb, X, Camera, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";

const categories = ["Economia de Água", "Reuso de Chuva", "Limpeza de Caixa d'Água", "Horta e Jardim"];

const tips = [
  { id: 1, author: "Maria Silva", bairro: "CPA II", title: "Água da Máquina de Lavar", desc: "Uso a água do último enxágue para lavar a calçada e o quintal. Economizo quase 100 litros por semana!", likes: 140, tags: ["Economia de Água"], badge: "Morador Engajado" },
  { id: 2, author: "João Santos", bairro: "Pedra 90", title: "Captação de Água da Chuva", desc: "Instalei calhas e um reservatório simples. Uso para regar plantas e lavar o carro.", likes: 89, tags: ["Reuso de Chuva"], badge: "Morador Engajado" },
  { id: 3, author: "Ana Costa", bairro: "Boa Esperança", title: "Horta com Gotejamento", desc: "Montei um sistema de gotejamento caseiro com garrafas PET. Economia de 60% na irrigação!", likes: 67, tags: ["Horta e Jardim", "Economia de Água"], badge: "" },
  { id: 4, author: "Carlos Lima", bairro: "CPA III", title: "Limpeza Semestral da Caixa d'Água", desc: "Faço a limpeza da caixa a cada 6 meses usando apenas água sanitária diluída. Evita contaminação e garante água limpa!", likes: 95, tags: ["Limpeza de Caixa d'Água"], badge: "Morador Engajado" },
  { id: 5, author: "Beatriz Souza", bairro: "Jardim Imperial", title: "Vedação da Caixa d'Água", desc: "Mantive a tampa sempre bem vedada para evitar entrada de insetos e sujeira. Simples e eficaz!", likes: 72, tags: ["Limpeza de Caixa d'Água"], badge: "" },
  { id: 6, author: "Roberto Alves", bairro: "Santa Rosa", title: "Como Limpar a Caixa d'Água", desc: "Passo a passo: 1) Feche o registro. 2) Esvazie. 3) Esfregue as paredes com escova. 4) Enxágue. 5) Adicione 1L de água sanitária para cada 1000L. 6) Aguarde 2h. 7) Esvazie e enxágue novamente.", likes: 128, tags: ["Limpeza de Caixa d'Água"], badge: "Morador Engajado" },
  { id: 7, author: "Fernanda Dias", bairro: "Morada do Ouro", title: "Sinais de Caixa Suja", desc: "Água com gosto de terra, cor amarelada ou cheiro forte? É hora de limpar sua caixa d'água! Isso evita doenças como hepatite e leptospirose.", likes: 53, tags: ["Limpeza de Caixa d'Água"], badge: "" },
];

const CommunityPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const catScrollRef = useRef<HTMLDivElement>(null);

  const filtered = tips.filter((t) => {
    const matchFilter = !filter || t.tags.includes(filter);
    const matchSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const handleNewPost = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    toast({ title: "Dica publicada! 🎉", description: "Obrigado por compartilhar!" });
    setShowNewPost(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} /></button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Dicas da Comunidade</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <div className="relative">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar dicas, autores, categorias..." className="w-full py-2.5 px-4 pr-10 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-body text-sm border-none outline-none" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" strokeWidth={1.5} />
        </div>
      </div>

      <div className="px-5 -mt-3">
        <div className="bg-card rounded-2xl shadow-card p-4 mb-4 border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-2"><Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} /><span className="text-xs font-display font-semibold text-primary">Dica da Semana</span></div>
          <p className="font-body text-sm text-foreground">Como ler seu hidrômetro corretamente</p>
        </div>

        {/* Horizontal scrollable categories with fade */}
        <div className="relative mb-4">
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div
            ref={catScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(filter === c ? null : c)} className={`px-3 py-1.5 rounded-full text-[10px] font-display font-medium whitespace-nowrap flex-shrink-0 transition-colors ${filter === c ? "gradient-primary text-primary-foreground" : "bg-card shadow-card text-cinza-medio"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((tip, i) => (
            <motion.div key={tip.id} className="bg-card rounded-2xl shadow-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"><span className="text-primary-foreground font-display font-bold text-xs">{tip.author[0]}</span></div>
                <div><p className="font-display font-semibold text-xs text-foreground">{tip.author}</p><span className="text-[10px] font-body text-cinza-medio">{tip.bairro}</span></div>
                {tip.badge && <span className="ml-auto px-2 py-0.5 rounded-full bg-verde-sucesso/10 text-verde-sucesso text-[9px] font-display font-medium">{tip.badge}</span>}
              </div>
              <h3 className="font-display font-bold text-sm text-foreground mb-1">{tip.title}</h3>
              <p className="font-body text-xs text-cinza-medio mb-3">{tip.desc}</p>
              <div className="flex gap-1 mb-3">
                {tip.tags.map((tag) => <span key={tag} className="text-[9px] font-body text-primary bg-primary/5 px-2 py-0.5 rounded-full">#{tag.replace(/ /g, "")}</span>)}
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs font-body text-cinza-medio hover:text-verde-sucesso transition-colors"><ThumbsUp className="w-4 h-4" strokeWidth={1.5} /> {tip.likes} Útil</button>
                <button className="flex items-center gap-1 text-xs font-body text-cinza-medio hover:text-primary transition-colors"><BookmarkPlus className="w-4 h-4" strokeWidth={1.5} /> Vou testar</button>
                <button className="ml-auto flex items-center gap-1 text-xs font-body text-cinza-medio hover:text-primary transition-colors" onClick={() => navigate("/conquistas")}>🏆</button>
                <button className="flex items-center gap-1 text-xs font-body text-cinza-medio"><Share2 className="w-4 h-4" strokeWidth={1.5} /></button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-cinza-medio font-body py-8">Nenhuma dica encontrada.</p>}
        </div>
      </div>

      {/* New post FAB */}
      <button onClick={() => setShowNewPost(true)} className="fixed bottom-20 right-5 w-14 h-14 rounded-full gradient-primary shadow-card-hover flex items-center justify-center z-30">
        <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
      </button>

      {/* New post modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/30 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewPost(false)}>
            <motion.div className="w-full bg-card rounded-t-3xl p-6" initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground text-lg">Nova Dica</h3>
                <button onClick={() => setShowNewPost(false)}><X className="w-5 h-5 text-cinza-medio" /></button>
              </div>
              <div className="space-y-3">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título da dica" className="w-full py-2.5 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none outline-none" />
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full py-2.5 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none outline-none">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Compartilhe sua dica..." className="w-full py-2.5 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none resize-none" style={{ minHeight: 80 }} />
                <button onClick={handleNewPost} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Publicar Dica
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;
