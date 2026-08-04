export interface Level {
  key: string;
  name: string;
  minXp: number;
  discount: number; // % automático na fatura
  color: string;
}

export const LEVELS: Level[] = [
  { key: "bronze", name: "Bronze", minXp: 0, discount: 2, color: "text-amarelo-alerta" },
  { key: "prata", name: "Prata", minXp: 300, discount: 5, color: "text-cinza-medio" },
  { key: "ouro", name: "Ouro", minXp: 750, discount: 8, color: "text-amarelo-alerta" },
  { key: "platina", name: "Platina", minXp: 1500, discount: 12, color: "text-primary" },
  { key: "aquamaster", name: "AquaMaster", minXp: 3000, discount: 15, color: "text-verde-sucesso" },
];

/** XP = economia (%) acumulada * 25 + confirmações no mapa * 10 */
export const xpFromSavings = (savingsPercent: number, contributions = 0) =>
  Math.round(savingsPercent * 25 + contributions * 10);

export const levelForXp = (xp: number): Level =>
  [...LEVELS].reverse().find((l) => xp >= l.minXp) || LEVELS[0];

export const nextLevelForXp = (xp: number): Level | null =>
  LEVELS.find((l) => l.minXp > xp) || null;

export const levelProgress = (xp: number) => {
  const cur = levelForXp(xp);
  const next = nextLevelForXp(xp);
  if (!next) return 100;
  return Math.min(100, Math.round(((xp - cur.minXp) / (next.minXp - cur.minXp)) * 100));
};

export interface Coupon {
  id: string;
  title: string;
  desc: string;
  value: number; // R$ de desconto na fatura
  costXp: number;
  levelRequired: string;
}

export const COUPONS: Coupon[] = [
  { id: "c1", title: "R$ 5 na próxima fatura", desc: "Desconto direto aplicado no próximo vencimento.", value: 5, costXp: 150, levelRequired: "bronze" },
  { id: "c2", title: "R$ 10 na próxima fatura", desc: "Para quem manteve a meta por 30 dias.", value: 10, costXp: 300, levelRequired: "prata" },
  { id: "c3", title: "Isenção de taxa de religação", desc: "Vale uma religação sem custo.", value: 25, costXp: 600, levelRequired: "ouro" },
  { id: "c4", title: "R$ 40 em créditos", desc: "Exclusivo para o topo do ranking.", value: 40, costXp: 1200, levelRequired: "platina" },
];

export interface Badge {
  id: string;
  name: string;
  desc: string;
  minXp: number;
  emoji: string;
}

export const BADGES: Badge[] = [
  { id: "b1", name: "Primeira Gota", desc: "Iniciou o monitoramento de consumo", minXp: 0, emoji: "💧" },
  { id: "b2", name: "Vigilante", desc: "Validou problemas no mapa", minXp: 200, emoji: "🔎" },
  { id: "b3", name: "Economista da Água", desc: "Atingiu 15% de economia", minXp: 375, emoji: "📉" },
  { id: "b4", name: "Guardião do Pantanal", desc: "Manteve economia por 3 meses", minXp: 900, emoji: "🌿" },
  { id: "b5", name: "AquaMaster", desc: "Chegou ao nível máximo", minXp: 3000, emoji: "🏆" },
];

const KEY = "sc_gamification";

export interface GamificationState {
  redeemed: string[];
  contributions: number;
}

export const loadGamification = (): GamificationState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { redeemed: [], contributions: 0, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { redeemed: [], contributions: 0 };
};

export const saveGamification = (state: GamificationState) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* ignore */ }
};
