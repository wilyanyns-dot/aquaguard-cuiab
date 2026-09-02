import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Plus, Mic, Globe, ChevronDown, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "audio";
  audioDuration?: string;
  sources?: { title: string; url: string }[];
}

const quickActions = [
  { label: "💧 Minha fatura", message: "Qual o valor da minha fatura atual?" },
  { label: "💡 Dicas de economia", message: "Me dê dicas para economizar água" },
  { label: "📅 Agendar visita", message: "Quero agendar uma visita técnica" },
  { label: "🔧 Pagamento falhou", message: "Meu pagamento falhou" },
  { label: "📍 Concessionária", message: "Qual a concessionária da minha região?" },
];

const concessionarias: Record<string, { nome: string; telefone: string; site: string }> = {
  SP: { nome: "Sabesp", telefone: "0800 055 0195", site: "sabesp.com.br" },
  RJ: { nome: "Cedae", telefone: "0800 282 4560", site: "cedae.com.br" },
  BA: { nome: "Embasa", telefone: "0800 055 0195", site: "embasa.ba.gov.br" },
  MG: { nome: "Copasa", telefone: "115", site: "copasa.com.br" },
  PR: { nome: "Sanepar", telefone: "0800 200 0115", site: "sanepar.com.br" },
  MT: { nome: "Águas Cuiabá", telefone: "0800 646 6115", site: "aguasdecuiaba.com.br" },
};

const getAIResponse = (message: string, user: any, consumptionHistory: Record<string, number>, conversationContext: Message[]): string => {
  const lower = message.toLowerCase();
  const today = new Date().toISOString().split("T")[0];
  const todayConsumption = consumptionHistory[today] || 0;
  const userName = user?.nome?.split(" ")[0] || "usuário";

  // Payment failure decision tree
  if (lower.includes("pagamento falhou") || lower.includes("erro no pagamento") || lower.includes("não consegui pagar")) {
    return `Entendi, ${userName}. Vou te ajudar a resolver! Qual dessas situações se aplica?\n\n**A)** Erro na leitura do código de barras/QR Code\n**B)** Erro após digitar a senha\n**C)** Apareceu uma mensagem de erro específica\n\nDigite a letra da opção.`;
  }
  if (lower.trim() === "a" || lower.includes("leitura do código") || lower.includes("câmera não lê")) {
    return `📸 **Tutorial para leitura do código:**\n\n1. Limpe a lente da câmera do celular\n2. Posicione o código em boa iluminação\n3. Mantenha a câmera a ~15cm de distância\n4. Se não funcionar, use a **digitação manual** dos 48 dígitos\n\n💡 Dica: O código de barras fica na parte inferior da sua fatura.`;
  }
  if (lower.trim() === "b" || lower.includes("erro após a senha")) {
    return `🔐 **Possíveis causas:**\n\n1. **Saldo insuficiente** — verifique seu extrato bancário\n2. **Conexão instável** — tente em uma rede Wi-Fi\n3. **Limite excedido** — entre em contato com seu banco\n4. **Manutenção do sistema** — tente novamente em 30 minutos\n\nSe o problema persistir, deseja falar com um **atendente humano**?`;
  }
  if (lower.trim() === "c" || lower.includes("mensagem de erro")) {
    return `📝 Qual mensagem apareceu?\n\n• **"Boleto já pago"** — Verifique seu extrato. Se foi duplicado, o crédito será aplicado na próxima fatura.\n• **"Erro de comunicação"** — Problema de rede. Tente em 15 min.\n• **"Limite excedido"** — Contate seu banco para aumentar o limite.\n• **"Código inválido"** — Redigite os 48 números manualmente.\n\nQual dessas mensagens apareceu?`;
  }

  // Payment questions
  if (lower.includes("como pagar") || lower.includes("pagar minha conta")) {
    return `${userName}, aqui está o passo a passo para pagar sua conta:\n\n1️⃣ Acesse **Pagamentos** no menu inferior\n2️⃣ Clique em **Pagar Pix**\n3️⃣ Escaneie o QR Code ou copie o código\n4️⃣ Cole no app do seu banco\n5️⃣ Confirme o pagamento e aguarde o comprovante\n\n💡 Você também pode usar a **2ª Via** para gerar um novo boleto.`;
  }
  if (lower.includes("conta vencida") || lower.includes("vencimento")) {
    return `Sim, ${userName}! Você pode pagar contas vencidas. Os juros são calculados automaticamente:\n\n📊 **Multa:** 2% sobre o valor\n📊 **Juros:** 0,033% ao dia\n\nAcesse **Pagamentos > Faturas > Pendentes** para ver suas contas em aberto.`;
  }
  if (lower.includes("comprovante")) {
    return `Seus comprovantes ficam disponíveis em:\n\n📁 **Pagamentos > Histórico** — todos os comprovantes\n📁 **Pagamentos > Faturas > Pagas** — faturas quitadas\n\nVocê pode baixar o comprovante em PDF a qualquer momento!`;
  }
  if (lower.includes("compensar") || lower.includes("tempo leva")) {
    return `⏱️ O prazo para compensação é de até **2 dias úteis**.\n\nSe após esse prazo o pagamento não constar, entre em contato:\n📞 0800 646 6115 (Águas Cuiabá)`;
  }
  if (lower.includes("paguei duas vezes") || lower.includes("duplicado") || lower.includes("mesma conta duas")) {
    return `😮 Não se preocupe, ${userName}! Em caso de pagamento duplicado:\n\n1. O valor será **creditado automaticamente** na próxima fatura\n2. Ou entre em contato com a concessionária para **estorno**\n\n📞 Águas Cuiabá: 0800 646 6115\n📧 atendimento@aguasdecuiaba.com.br`;
  }
  if (lower.includes("débito automático") || lower.includes("cancelar débito")) {
    return `Para gerenciar o débito automático:\n\n1. Acesse **Pagamentos > Configurações**\n2. Selecione **Débito Automático**\n3. Escolha a conta e clique em **Excluir**\n\n⚠️ O cancelamento é efetivo a partir do próximo ciclo de faturamento.`;
  }
  if (lower.includes("avisa antes") || lower.includes("notificação") || lower.includes("vencimento")) {
    return `✅ Sim! O app envia notificações **2 dias antes do vencimento**.\n\nPara ativar:\n1. Acesse **Configurações > Notificações**\n2. Ative **Alertas de Fatura**\n3. Escolha o canal: Push, E-mail ou SMS`;
  }

  // Location / concessionária
  if (lower.includes("concessionária") || lower.includes("qual empresa") || lower.includes("minha região")) {
    const userState = user?.endereco?.includes("Cuiabá") ? "MT" : null;
    if (userState && concessionarias[userState]) {
      const c = concessionarias[userState];
      return `📍 Sua concessionária é a **${c.nome}**!\n\n📞 Telefone: ${c.telefone}\n🌐 Site: ${c.site}\n\nPrecisa de mais alguma informação?`;
    }
    return `De qual cidade/estado é sua conta? Com essa informação posso encontrar sua concessionária.\n\nExemplos: SP, RJ, MG, BA, PR, MT`;
  }
  // Check if user replied with a state code
  const stateCode = lower.trim().toUpperCase();
  if (concessionarias[stateCode]) {
    const c = concessionarias[stateCode];
    return `📍 A concessionária do **${stateCode}** é a **${c.nome}**!\n\n📞 Telefone: ${c.telefone}\n🌐 Site: ${c.site}\n\nDeseja que eu te ajude com a **2ª via** da sua fatura?`;
  }

  // Consumption queries
  if (lower.includes("fatura") || lower.includes("conta") || lower.includes("pagar")) {
    return `${userName}, sua fatura atual é de **R$ 85,90** referente a Março/2025, com vencimento em 15/03. Você pode pagar via Pix na seção de **Pagamentos**. Deseja que eu te direcione?`;
  }
  if (lower.includes("consumo") || lower.includes("gastei") || lower.includes("litros") || lower.includes("ontem")) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayVal = consumptionHistory[yesterdayStr] || 0;
    return `Seu consumo de hoje é de **${todayConsumption} litros**. Ontem você consumiu **${yesterdayVal} litros**. ${todayConsumption > 250 ? "⚠️ Atenção: seu consumo está acima da média!" : "✅ Dentro da média esperada."}`;
  }
  if (lower.includes("meta") || lower.includes("dentro da meta")) {
    return `📊 ${userName}, seu consumo de hoje é **${todayConsumption}L**.\n\n${todayConsumption <= 50 ? "✅ Você está **dentro da meta** diária!" : `⚠️ Você ultrapassou a meta em **${todayConsumption - 50}L**. Tente reduzir o tempo de banho!`}`;
  }
  if (lower.includes("compare") || lower.includes("mês anterior") || lower.includes("comparação")) {
    return `📈 **Comparação de consumo:**\n\nMês atual: ~${todayConsumption * 30}L estimados\nMês anterior: ~${Math.round(todayConsumption * 30 * 0.9)}L\n\n${todayConsumption * 30 > todayConsumption * 30 * 0.9 ? "📈 Aumento de ~10% em relação ao mês anterior." : "📉 Redução no consumo. Parabéns!"}`;
  }
  if (lower.includes("dica") || lower.includes("economia") || lower.includes("economizar")) {
    return `Aqui vão algumas dicas, ${userName}:\n\n💧 **Banho rápido**: Reduza para 5 minutos e economize até 90 litros.\n🚿 **Feche a torneira**: Ao escovar os dentes, economize 12 litros.\n🌧️ **Reuse água da chuva**: Ideal para regar plantas.\n🔧 **Conserte vazamentos**: Um gotejamento desperdiça até 46 litros/dia.\n🌙 **Regue à noite**: Menos evaporação = mais economia.\n\nVisite a seção **Dicas da Comunidade** para mais!`;
  }
  if (lower.includes("agendar") || lower.includes("visita")) {
    return `Para agendar uma visita, acesse **"Você no Saneamento"**. Lá você pode:\n\n1. Visitar uma ETA/ETE ou receber um profissional\n2. Selecionar data e horário\n3. Informar quantidade de participantes\n\nDeseja que eu te direcione para lá?`;
  }
  if (lower.includes("vazamento") || lower.includes("reportar")) {
    return `Para reportar um vazamento, acesse o **Mapa** na barra inferior:\n\n1. Selecione o tipo de problema\n2. Descreva a situação\n3. Tire uma foto\n4. Envie o relatório\n\nSua denúncia ajuda toda a comunidade! 🗺️`;
  }
  if (lower.includes("ranking") || lower.includes("posição") || lower.includes("nível")) {
    return `Você está no **Nível Prata** do AquaMaster com 450 XP. Para subir ao Ouro, economize mais 10%. Continue assim, ${userName}! 🏅`;
  }
  if (lower.includes("atendente") || lower.includes("humano") || lower.includes("suporte")) {
    return `📞 **Canais de atendimento humano:**\n\n• **Telefone:** 0800 646 6115 (24h)\n• **WhatsApp:** (65) 3645-6115\n• **E-mail:** atendimento@aguasdecuiaba.com.br\n• **Presencial:** Av. CPA, Centro\n\nHorário: Seg-Sex, 8h às 17h`;
  }
  if (lower.includes("olá") || lower.includes("oi") || lower.includes("bom dia") || lower.includes("boa tarde") || lower.includes("boa noite")) {
    return `Olá, ${userName}! 👋🌊 Sou a **LUNA**, sua assistente oceânica.\n\nPosso te ajudar com:\n• 💰 Pagamentos e faturas\n• 💧 Consumo e metas\n• 🔧 Problemas com pagamento\n• 📍 Informações da concessionária\n• 💡 Dicas de economia\n• 📅 Agendamentos\n\nComo posso te ajudar?`;
  }
  return `${userName}, essa é uma ótima pergunta! Posso te ajudar com:\n\n• **💰 Pagamentos** — faturas, Pix, comprovantes\n• **💧 Consumo** — histórico e metas\n• **🔧 Problemas** — erros de pagamento\n• **📍 Concessionária** — contatos e 2ª via\n• **💡 Dicas** — economizar água\n\nDeseja falar com um **atendente humano**? 📞`;
};

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, consumptionHistory } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const trimmed = text.trim();
    const userMsg: Message = { id: Date.now(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    const context = JSON.stringify({
      user: user ? { nome: user.nome, cidade: user.endereco, cep: user.cep } : null,
      consumo: consumptionHistory,
      conversa: nextMessages.slice(-8).map(({ role, content }) => ({ role, content })),
      buscaAtualizadaSolicitada: webSearchEnabled,
    });

    try {
      const { data, error } = await supabase.functions.invoke("maya-chat", {
        body: { message: trimmed, context },
      });
      if (error) throw error;
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: data?.text || "Não consegui formular uma resposta agora.",
        sources: data?.sources,
      }]);
    } catch (error) {
      const fallback = getAIResponse(trimmed, user, consumptionHistory, messages).replace(/LUNA/g, "Maya");
      const errorMessage = error instanceof Error ? error.message : "Falha temporária na conexão";
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: `${fallback}

_Nota: a IA avançada está indisponível agora (${errorMessage})._`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FAB — glassmorphism */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, hsl(202 62% 35%), hsl(190 50% 45%))", boxShadow: "0 8px 32px hsl(202 62% 35% / 0.4)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window — glassmorphism Deep Ocean */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-36 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl overflow-hidden flex flex-col border border-white/20"
            style={{
              height: "min(70vh, 520px)",
              background: "linear-gradient(180deg, hsl(210 60% 13% / 0.85), hsl(205 55% 17% / 0.9))",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px hsl(210 60% 10% / 0.5)",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10" style={{ background: "linear-gradient(135deg, hsl(210 70% 10% / 0.9), hsl(200 60% 15% / 0.9))" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(202 62% 45%), hsl(190 50% 55%))" }}>
                <Sparkles className="w-5 h-5 text-cyan-200" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-white text-sm">Maya — Assistente de Saneamento</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-white/50 font-body">Online · Pagamentos, consumo e dicas</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-10 h-10 text-cyan-200 mx-auto mb-2" />
                  <p className="font-display font-bold text-white/80 text-sm mb-1">Olá! Sou a Maya</p>
                  <p className="font-body text-[11px] text-white/40">Sua assistente inteligente de saneamento</p>
                </div>
              )}
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ background: "linear-gradient(135deg, hsl(202 62% 45%), hsl(190 50% 55%))" }}>
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs font-body whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md text-white"
                      : "rounded-bl-md text-white/90"
                  }`}
                  style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, hsl(202 62% 40% / 0.7), hsl(190 50% 45% / 0.7))"
                      : "hsl(205 55% 20% / 0.6)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid hsl(200 50% 50% / 0.15)",
                  }}>
                    {msg.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="text-cyan-300">{part}</strong> : <span key={i}>{part}</span>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                        <span className="block text-[10px] text-white/50">Fontes consultadas</span>
                        {msg.sources.slice(0, 3).map((source) => (
                          <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block text-[10px] text-cyan-200 underline truncate">
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ background: "linear-gradient(135deg, hsl(220 60% 35%), hsl(210 50% 45%))" }}>
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div className="flex justify-start gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(202 62% 45%), hsl(190 50% 55%))" }}>
                    <Sparkles className="w-3 h-3 text-cyan-200" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5" style={{ background: "hsl(205 55% 20% / 0.6)", border: "1px solid hsl(200 50% 50% / 0.15)" }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length === 0 && (
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
                {quickActions.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => void sendMessage(qa.message)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-display font-medium whitespace-nowrap flex-shrink-0 transition-colors"
                    style={{ background: "hsl(202 62% 40% / 0.3)", border: "1px solid hsl(200 50% 50% / 0.2)", color: "hsl(192 80% 80%)" }}
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 border-t border-white/10 flex items-center gap-2">
              <button className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(202 62% 40% / 0.3)" }}>
                <Plus className="w-4 h-4 text-cyan-300" />
              </button>
              <div className="flex-1 flex items-center rounded-full px-3 py-2" style={{ background: "hsl(210 50% 20% / 0.6)", border: "1px solid hsl(200 50% 50% / 0.15)" }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent font-body text-sm text-white placeholder-white/30 outline-none"
                />
                <button
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`ml-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${webSearchEnabled ? "bg-cyan-500/40" : "bg-white/5"}`}
                  title="Busca na web"
                >
                  <Globe className="w-3 h-3 text-cyan-300" />
                </button>
              </div>
              {input.trim() ? (
                <motion.button
                  onClick={() => void sendMessage(input)}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(202 62% 45%), hsl(190 50% 55%))" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              ) : (
                <button className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(202 62% 40% / 0.3)" }}>
                  <Mic className="w-4 h-4 text-cyan-300" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;
