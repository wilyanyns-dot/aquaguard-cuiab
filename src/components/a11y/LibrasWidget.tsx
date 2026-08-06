import { useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
  }
}

const SCRIPT_SRC = "https://vlibras.gov.br/app/vlibras-plugin.js";

/**
 * Tradutor automático de LIBRAS (avatar virtual VLibras).
 * Traduz os textos da tela para Língua Brasileira de Sinais.
 */
const LibrasWidget = () => {
  const { prefs } = useAccessibility();

  useEffect(() => {
    if (!prefs.libras) return;

    const start = () => {
      try {
        if (window.VLibras) new window.VLibras.Widget("https://vlibras.gov.br/app");
      } catch {
        /* widget indisponível offline */
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      start();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = start;
    document.body.appendChild(script);
  }, [prefs.libras]);

  if (!prefs.libras) return null;

  return (
    <div vw-="true" className="enabled" aria-label="Tradutor de LIBRAS">
      <div vw-access-button="true" className="active" />
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
};

export default LibrasWidget;
