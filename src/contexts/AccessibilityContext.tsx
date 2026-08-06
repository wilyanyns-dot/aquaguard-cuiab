import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type A11yPrefs = {
  /** Deficiência visual / baixa visão: alto contraste + espaçamento otimizado */
  baixaVisao: boolean;
  /** Escala global da fonte (1 = padrão) */
  fontScale: number;
  /** Comunidade surda: widget de tradução em LIBRAS */
  libras: boolean;
  /** Baixa audição: legendas, transcrições e alertas visuais/vibratórios */
  legendas: boolean;
  /** Baixa alfabetização: interface por ícones + leitura em voz alta */
  leitura: boolean;
};

export const DEFAULT_PREFS: A11yPrefs = {
  baixaVisao: false,
  fontScale: 1,
  libras: false,
  legendas: false,
  leitura: false,
};

const STORAGE_KEY = "saneamento-a11y";

const loadPrefs = (): A11yPrefs => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULT_PREFS, ...raw };
  } catch {
    return DEFAULT_PREFS;
  }
};

type Ctx = {
  prefs: A11yPrefs;
  setPref: <K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => void;
  toggle: (key: "baixaVisao" | "libras" | "legendas" | "leitura") => void;
  setPrefs: (next: Partial<A11yPrefs>) => void;
  reset: () => void;
  /** Lê um texto em voz alta (Web Speech API) quando a leitura está ativa */
  speak: (text: string, force?: boolean) => void;
  stopSpeaking: () => void;
  /** Alerta acessível: vibração + leitura, substituindo sons do sistema */
  alert: (message: string) => void;
};

const AccessibilityContext = createContext<Ctx | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefsState] = useState<A11yPrefs>(loadPrefs);

  // Persistência + aplicação instantânea no documento
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    const root = document.documentElement;
    root.classList.toggle("a11y-contrast", prefs.baixaVisao);
    root.classList.toggle("a11y-spacing", prefs.baixaVisao);
    root.classList.toggle("a11y-icons", prefs.leitura);
    root.classList.toggle("a11y-captions", prefs.legendas);
    root.style.fontSize = `${Math.round(16 * prefs.fontScale)}px`;
  }, [prefs]);

  const setPrefs = useCallback((next: Partial<A11yPrefs>) => {
    setPrefsState((p) => ({ ...p, ...next }));
  }, []);

  const setPref = useCallback<Ctx["setPref"]>((key, value) => {
    setPrefsState((p) => ({ ...p, [key]: value }));
  }, []);

  const toggle = useCallback<Ctx["toggle"]>((key) => {
    setPrefsState((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const reset = useCallback(() => setPrefsState(DEFAULT_PREFS), []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text: string, force = false) => {
      if (!text || (!prefs.leitura && !force)) return;
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim().slice(0, 240));
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    },
    [prefs.leitura],
  );

  const alertAccessible = useCallback(
    (message: string) => {
      // Alertas sonoros do sistema são substituídos por feedback visual/vibratório
      if (prefs.legendas && "vibrate" in navigator) navigator.vibrate?.([120, 60, 120]);
      speak(message);
    },
    [prefs.legendas, speak],
  );

  // Leitura ao clicar/focar/passar o cursor sobre elementos interativos
  useEffect(() => {
    if (!prefs.leitura) return;
    const readFrom = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>(
        "[data-speak], button, a, [role='button'], [role='switch'], label, h1, h2",
      );
      if (!el) return;
      const text = el.dataset.speak || el.getAttribute("aria-label") || el.innerText;
      speak(text);
    };
    const onPointer = (e: Event) => readFrom(e.target);
    const onFocus = (e: FocusEvent) => readFrom(e.target);
    document.addEventListener("click", onPointer, true);
    document.addEventListener("pointerover", onPointer, true);
    document.addEventListener("focusin", onFocus, true);
    return () => {
      document.removeEventListener("click", onPointer, true);
      document.removeEventListener("pointerover", onPointer, true);
      document.removeEventListener("focusin", onFocus, true);
      window.speechSynthesis?.cancel();
    };
  }, [prefs.leitura, speak]);

  const value = useMemo(
    () => ({ prefs, setPref, setPrefs, toggle, reset, speak, stopSpeaking, alert: alertAccessible }),
    [prefs, setPref, setPrefs, toggle, reset, speak, stopSpeaking, alertAccessible],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility precisa estar dentro de AccessibilityProvider");
  return ctx;
};
