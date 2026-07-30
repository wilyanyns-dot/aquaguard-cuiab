import { motion } from "framer-motion";
import { ArrowLeft, ThumbsUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useCommunity } from "@/contexts/CommunityContext";

const AuthorFeedPage = () => {
  const navigate = useNavigate();
  const { author = "" } = useParams();
  const name = decodeURIComponent(author);
  const { tipsByAuthor } = useCommunity();
  const authorTips = tipsByAuthor(name);

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <header className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Dicas de {name.split(" ")[0]}</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-lg">{name[0]}</span>
          </div>
          <div>
            <p className="font-display font-bold text-primary-foreground">{name}</p>
            <span className="text-primary-foreground/80 text-xs font-body">{authorTips.length} dica(s) publicada(s)</span>
          </div>
        </div>
      </header>

      <ul className="px-5 mt-5 space-y-3">
        {authorTips.map((tip, i) => (
          <motion.li
            key={tip.id}
            className="bg-card rounded-2xl shadow-card p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <h2 className="font-display font-bold text-sm text-foreground mb-1">{tip.title}</h2>
            <p className="font-body text-xs text-cinza-medio mb-2 whitespace-pre-line">{tip.desc}</p>
            <span className="flex items-center gap-1 text-[11px] font-body text-cinza-medio">
              <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} /> {tip.likes} acharam útil
            </span>
          </motion.li>
        ))}
        {authorTips.length === 0 && (
          <p className="text-center text-sm text-cinza-medio font-body py-8">Esse usuário ainda não publicou dicas.</p>
        )}
      </ul>
    </div>
  );
};

export default AuthorFeedPage;
