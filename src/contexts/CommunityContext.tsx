import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface Tip {
  id: string;
  author: string;
  bairro: string;
  title: string;
  desc: string;
  likes: number;
  tags: string[];
  badge?: string;
  createdAt: string;
  ts?: number;
  own?: boolean;
}

interface CommunityContextType {
  tips: Tip[];
  likedIds: string[];
  savedIds: string[];
  savedTips: Tip[];
  myTips: Tip[];
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  addTip: (t: { title: string; desc: string; category: string; author: string; bairro: string }) => void;
  removeTip: (id: string) => void;
  tipsByAuthor: (author: string) => Tip[];
  getTip: (id: string) => Tip | undefined;
  hasProfanity: (text: string) => boolean;
}

export const TIP_CATEGORIES = ["Economia de Água", "Reuso de Chuva", "Limpeza de Caixa d'Água", "Horta e Jardim"];

const seedTips: Tip[] = [
  { id: "1", author: "Maria Silva", bairro: "CPA II", title: "Água da Máquina de Lavar", desc: "Uso a água do último enxágue para lavar a calçada e o quintal. Economizo quase 100 litros por semana!", likes: 140, tags: ["Economia de Água"], badge: "Morador Engajado", createdAt: "2026-06-10" },
  { id: "2", author: "João Santos", bairro: "Pedra 90", title: "Captação de Água da Chuva", desc: "Instalei calhas e um reservatório simples. Uso para regar plantas e lavar o carro.", likes: 89, tags: ["Reuso de Chuva"], badge: "Morador Engajado", createdAt: "2026-06-12" },
  { id: "3", author: "Ana Costa", bairro: "Boa Esperança", title: "Horta com Gotejamento", desc: "Montei um sistema de gotejamento caseiro com garrafas PET. Economia de 60% na irrigação!", likes: 67, tags: ["Horta e Jardim", "Economia de Água"], createdAt: "2026-06-15" },
  { id: "4", author: "Carlos Lima", bairro: "CPA III", title: "Limpeza Semestral da Caixa d'Água", desc: "Faço a limpeza da caixa a cada 6 meses usando apenas água sanitária diluída. Evita contaminação e garante água limpa!", likes: 95, tags: ["Limpeza de Caixa d'Água"], badge: "Morador Engajado", createdAt: "2026-06-18" },
  { id: "5", author: "Beatriz Souza", bairro: "Jardim Imperial", title: "Vedação da Caixa d'Água", desc: "Mantive a tampa sempre bem vedada para evitar entrada de insetos e sujeira. Simples e eficaz!", likes: 72, tags: ["Limpeza de Caixa d'Água"], createdAt: "2026-06-20" },
  { id: "6", author: "Maria Silva", bairro: "CPA II", title: "Como Limpar a Caixa d'Água", desc: "Passo a passo: 1) Feche o registro. 2) Esvazie. 3) Esfregue as paredes com escova. 4) Enxágue. 5) Adicione 1L de água sanitária para cada 1000L. 6) Aguarde 2h. 7) Esvazie e enxágue novamente.", likes: 128, tags: ["Limpeza de Caixa d'Água"], badge: "Morador Engajado", createdAt: "2026-06-22" },
  { id: "7", author: "Fernanda Dias", bairro: "Morada do Ouro", title: "Sinais de Caixa Suja", desc: "Água com gosto de terra, cor amarelada ou cheiro forte? É hora de limpar sua caixa d'água! Isso evita doenças como hepatite e leptospirose.", likes: 53, tags: ["Limpeza de Caixa d'Água"], createdAt: "2026-06-25" },
];

const BAD_WORDS = [
  "merda", "porra", "caralho", "buceta", "foda", "fodase", "puta", "putaria", "viado",
  "bosta", "cuzao", "cuzão", "arrombado", "desgraçado", "desgracado", "otario", "otário",
  "idiota", "imbecil", "babaca", "vagabundo", "corno", "piranha", "fdp", "escroto", "burro",
];

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const CommunityContext = createContext<CommunityContextType | null>(null);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [tips, setTips] = useState<Tip[]>(() => load("saneamento-community-tips", seedTips));
  const [likedIds, setLikedIds] = useState<string[]>(() => load("saneamento-community-likes", [] as string[]));
  const [savedIds, setSavedIds] = useState<string[]>(() => load("saneamento-community-saved", [] as string[]));

  useEffect(() => { localStorage.setItem("saneamento-community-tips", JSON.stringify(tips)); }, [tips]);
  useEffect(() => { localStorage.setItem("saneamento-community-likes", JSON.stringify(likedIds)); }, [likedIds]);
  useEffect(() => { localStorage.setItem("saneamento-community-saved", JSON.stringify(savedIds)); }, [savedIds]);

  const toggleLike = (id: string) => {
    const liked = likedIds.includes(id);
    setLikedIds(liked ? likedIds.filter((x) => x !== id) : [...likedIds, id]);
    setTips((prev) => prev.map((t) => (t.id === id ? { ...t, likes: Math.max(0, t.likes + (liked ? -1 : 1)) } : t)));
  };

  const toggleSave = (id: string) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const hasProfanity = (text: string) => {
    const words = normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
    return words.some((w) => BAD_WORDS.includes(w));
  };

  const addTip: CommunityContextType["addTip"] = ({ title, desc, category, author, bairro }) => {
    const tip: Tip = {
      id: `u-${Date.now()}`,
      author,
      bairro,
      title,
      desc,
      likes: 0,
      tags: [category],
      createdAt: new Date().toISOString().split("T")[0],
      own: true,
    };
    setTips((prev) => [tip, ...prev]);
  };

  const removeTip = (id: string) => {
    setTips((prev) => prev.filter((t) => t.id !== id));
    setSavedIds((prev) => prev.filter((x) => x !== id));
  };

  const value = useMemo<CommunityContextType>(() => ({
    tips,
    likedIds,
    savedIds,
    savedTips: tips.filter((t) => savedIds.includes(t.id)),
    myTips: tips.filter((t) => t.own),
    toggleLike,
    toggleSave,
    addTip,
    removeTip,
    tipsByAuthor: (author: string) => tips.filter((t) => t.author === author),
    getTip: (id: string) => tips.find((t) => t.id === id),
    hasProfanity,
  }), [tips, likedIds, savedIds]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
};

export const useCommunity = () => {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
};
