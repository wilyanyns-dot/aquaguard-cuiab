import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { label: "Minha fatura", message: "Qual o valor da minha fatura atual?" },
  { label: "Dicas de economia", message: "Me dê dicas para economizar água" },
  { label: "Agendar visita", message: "Quero agendar uma visita técnica" },
];

const getAIResponse = (message: string, user: any, consumptionHistory: Record<string, number>): string => {
  const lower = message.toLowerCase();
  const today = new Date().toISOString().split("T")[0];
  const todayConsumption = consumptionHistory[today] || 0;
  const userName = user?.nome?.split(" ")[0] || "usuário";

  if (lower.includes("fatura") || lower.includes("conta") || lower.includes("pagar")) {
    return `${userName}, sua fatura atual é de **R$ 85,90** referente a Março/2025, com vencimento em 15/03. Você pode pagar via Pix na seção de **Pagamentos**. Deseja que eu te direcione?`;
  }
  if (lower.includes("consumo") || lower.includes("gastei") || lower.includes("litros") || lower.includes("água ontem") || lower.includes("agua ontem")) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayVal = consumptionHistory[yesterdayStr] || 0;
    return `Seu consumo de hoje é de **${todayConsumption} litros**. Ontem você consumiu **${yesterdayVal} litros**. ${todayConsumption > 250 ? "⚠️ Atenção: seu consumo está acima da média!" : "✅ Dentro da média esperada."}`;
  }
  if (lower.includes("dica") || lower.includes("economia") || lower.includes("economizar")) {
    return `Aqui vão algumas dicas para economizar água, ${userName}:\n\n💧 **Banho rápido**: Reduza para 5 minutos e economize até 90 litros.\n🚿 **Feche a torneira**: Ao escovar os dentes, economize 12 litros.\n🌧️ **Reuse água da chuva**: Ideal para regar plantas e lavar calçadas.\n🔧 **Conserte vazamentos**: Um gotejamento desperdiça até 46 litros/dia.\n\nVisite a seção **Dicas da Comunidade** para mais sugestões!`;
  }
  if (lower.includes("agendar") || lower.includes("visita")) {
    return `Para agendar uma visita técnica ou educacional, acesse a página **"Você no Saneamento"**. Lá você pode:\n\n1. Escolher entre visitar uma ETA/ETE ou receber um profissional\n2. Selecionar data e horário\n3. Informar quantidade de participantes\n\nDeseja que eu te direcione para lá?`;
  }
  if (lower.includes("vazamento") || lower.includes("reportar")) {
    return `Para reportar um vazamento, acesse o **Mapa de Saneamento** na barra inferior. Clique em "Reportar" e:\n\n1. Selecione o tipo de problema\n2. Descreva a situação\n3. Tire uma foto\n4. Envie o relatório\n\nSua denúncia ajuda toda a comunidade! 🗺️`;
  }
  if (lower.includes("ranking") || lower.includes("posição") || lower.includes("nível")) {
    return `Você está no **Nível Prata** do AquaMaster com 450 XP. Para subir ao Nível Ouro, você precisa economizar mais 10% de água. Continue assim, ${userName}! 🏅`;
  }
  if (lower.includes("olá") || lower.includes("oi") || lower.includes("bom dia") || lower.includes("boa tarde")) {
    return `Olá, ${userName}! 👋 Sou a assistente LUNA do Saneamento Cuiabá. Posso te ajudar com:\n\n• Informações sobre sua fatura e consumo\n• Dicas de economia de água\n• Agendamento de visitas\n• Reportar problemas\n• Tirar dúvidas sobre saneamento\n\nComo posso te ajudar?`;
  }
  return `${userName}, essa é uma ótima pergunta! Infelizmente não tenho essa informação específica no momento. Posso te ajudar com:\n\n• **Consumo e faturas** — consultar valores e histórico\n• **Dicas de economia** — reduzir sua conta\n• **Agendamentos** — visitas técnicas\n• **Mapa** — reportar problemas\n\nDigite sua dúvida e farei o possível para ajudar! 💧`;
};

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, consumptionHistory } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(text, user, consumptionHistory);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full shadow-card-hover flex items-center justify-center transition-transform hover:scale-105"
        style={{ background: "linear-gradient(135deg, hsl(202,62%,35%), hsl(190,50%,45%))" }}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-36 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm bg-card rounded-2xl shadow-card-hover overflow-hidden flex flex-col"
            style={{ height: "min(70vh, 500px)" }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, hsl(210,80%,13%), hsl(200,60%,20%))" }}>
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-white text-sm">Suporte Inteligente LUNA</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-verde-sucesso animate-pulse" />
                  <span className="text-[10px] text-white/60 font-body">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Bot className="w-10 h-10 text-primary mx-auto mb-2 opacity-50" />
                  <p className="font-body text-xs text-cinza-medio">Olá! Como posso ajudar?</p>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-body whitespace-pre-wrap ${msg.role === "user" ? "bg-primary/80 text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                    {msg.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-md flex items-center gap-1">
                    <Loader2 className="w-3 h-3 text-cinza-medio animate-spin" />
                    <span className="text-[10px] text-cinza-medio font-body">Digitando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length === 0 && (
              <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-hide">
                {quickActions.map(qa => (
                  <button key={qa.label} onClick={() => sendMessage(qa.message)} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-display font-medium whitespace-nowrap flex-shrink-0">{qa.label}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
                placeholder="Digite sua dúvida..."
                className="flex-1 py-2 px-3 rounded-xl bg-muted font-body text-sm text-foreground border-none outline-none"
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center disabled:opacity-50">
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;
