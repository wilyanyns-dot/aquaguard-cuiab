// Filtro estrito de linguagem ofensiva para transcrição de voz.
// Regras: correspondência por palavra inteira (nunca por substring), lista curta e
// inequívoca (evita falsos positivos como "computador", "pinto" (ave), "rola" (verbo)).

const OFFENSIVE_TERMS = [
  // Palavrões inequívocos
  "merda", "porra", "caralho", "caraio", "buceta", "boceta", "xoxota", "piroca",
  "foda", "fodase", "foda-se", "fuder", "foder", "fodido", "fodida",
  "puta", "putaria", "putinha", "puto", "cuzao", "cuzão", "arrombado", "arrombada",
  "escroto", "escrota", "punheta", "punheteiro", "vadia", "vagabunda", "filho da puta", "filha da puta",
  "desgraçado", "desgracado", "otário", "otario", "otária", "otaria", "babaca", "imbecil", "idiota",
  "retardado", "retardada", "mongoloide", "mongolóide",
  // Termos de ódio / discriminação
  "viado", "boiola", "sapatão", "sapatao", "traveco", "crioulo", "macaco imundo", "preto imundo",
  // Abreviações de xingamento (netlingo)
  "fdp", "lfdp", "tnc", "vtnc", "vsf", "vtmnc", "vtc", "pqp", "krl", "crl", "pnc", "tmnc", "fdc",
];

const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeWord = (s: string) => stripAccents(s.toLowerCase()).replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

const TERMS = OFFENSIVE_TERMS.map(normalizeWord).filter(Boolean);
const PHRASES = TERMS.filter((t) => t.includes(" "));
const SINGLE = new Set(TERMS.filter((t) => !t.includes(" ")));

export interface ProfanityResult {
  blocked: boolean;
  term?: string;
}

/** Detecta xingamentos por palavra inteira, além de palavras mascaradas pelo reconhecedor (ex.: "p****"). */
export function detectProfanity(text: string): ProfanityResult {
  if (!text) return { blocked: false };

  // Navegadores mascaram palavrões com asteriscos; consideramos 2+ asteriscos como bloqueio.
  if (/\*{2,}/.test(text)) return { blocked: true, term: "palavra mascarada" };

  const clean = normalizeWord(text);
  const words = clean.split(" ").filter(Boolean);

  for (const w of words) {
    if (SINGLE.has(w)) return { blocked: true, term: w };
    // "foda-se" pode vir como duas palavras separadas por hífen
    const hyphenless = w.replace(/-/g, "");
    if (SINGLE.has(hyphenless)) return { blocked: true, term: hyphenless };
  }

  const padded = ` ${clean} `;
  for (const phrase of PHRASES) {
    if (padded.includes(` ${phrase} `)) return { blocked: true, term: phrase };
  }

  return { blocked: false };
}
