import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, Accessibility, Bookmark, FileText, Bell, KeyRound, Trash2, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import { useCommunity } from "@/contexts/CommunityContext";
import { toast } from "@/hooks/use-toast";

import AccessibilityOptions from "@/components/a11y/AccessibilityOptions";


const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { savedTips, myTips, removeTip } = useCommunity();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem("saneamento-avatar"));
  const [form, setForm] = useState({
    nome: user?.nome || "",
    email: user?.email || "",
    telefone: user?.telefone || "",
    endereco: user?.endereco || "",
  });
  const [a11y, setA11y] = useState<A11yPrefs>(loadA11y);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("saneamento-notif") !== "false");

  const saveProfile = () => {
    setUser({ ...(user ?? ({} as never)), ...form });
    toast({ title: "Dados salvos!", description: "Seu perfil foi atualizado." });
  };


  const toggleA11y = (key: keyof A11yPrefs) => {
    const next = { ...a11y, [key]: !a11y[key] };
    setA11y(next);
    localStorage.setItem(A11Y_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("a11y-prefs-changed", { detail: next }));
  };

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result);
      setAvatar(data);
      localStorage.setItem("saneamento-avatar", data);
      toast({ title: "Foto atualizada!" });
    };
    reader.readAsDataURL(file);
  };

  const deleteAccount = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const fields: { key: keyof typeof form; label: string; type: string }[] = [
    { key: "nome", label: "Nome completo", type: "text" },
    { key: "email", label: "E-mail", type: "email" },
    { key: "telefone", label: "Telefone", type: "tel" },
    { key: "endereco", label: "Endereço / Bairro", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <header className="gradient-header px-5 pt-12 pb-10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Sessão do Usuário</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        <div className="flex flex-col items-center">
          <button onClick={() => fileRef.current?.click()} aria-label="Alterar foto de perfil" className="relative">
            <span className="w-24 h-24 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/40 flex items-center justify-center overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground font-display font-bold text-3xl">{user?.nome?.[0] || "U"}</span>
              )}
            </span>
            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-card">
              <Camera className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} aria-label="Selecionar nova foto" />
          <p className="font-display font-bold text-primary-foreground text-lg mt-3">{user?.nome || "Usuário"}</p>
          <span className="font-body text-primary-foreground/80 text-xs">{user?.email}</span>
        </div>
      </header>

      <main className="px-5 -mt-5 space-y-4">
        {/* Dados pessoais */}
        <motion.section className="bg-card rounded-2xl shadow-card p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display font-bold text-foreground text-base mb-3">Dados Pessoais</h2>
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label htmlFor={`campo-${f.key}`} className="block font-body text-[11px] text-cinza-medio mb-1">{f.label}</label>
                <input
                  id={`campo-${f.key}`}
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full py-2.5 px-4 rounded-xl bg-muted font-body text-sm text-foreground border-none outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            ))}
            <button onClick={saveProfile} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-display font-semibold text-sm flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </motion.section>

        {/* Acessibilidade */}
        <section className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Accessibility className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h2 className="font-display font-bold text-foreground text-base">Preferências de Acessibilidade</h2>
          </div>
          <div className="space-y-2">
            {([
              { key: "baixaVisao", label: "Modo Baixa Visão / Alto Contraste" },
              { key: "libras", label: "Modo LIBRAS e Legendas" },
              { key: "leitura", label: "Leitura de tela (Text-to-Speech)" },
            ] as const).map((o) => (
              <button
                key={o.key}
                onClick={() => toggleA11y(o.key)}
                role="switch"
                aria-checked={a11y[o.key]}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted"
              >
                <span className="font-body text-sm text-foreground text-left">{o.label}</span>
                <span className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${a11y[o.key] ? "bg-primary" : "bg-cinza-claro/40"}`}>
                  <span className={`w-5 h-5 rounded-full bg-card transition-transform ${a11y[o.key] ? "translate-x-5" : ""}`} />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Salvos */}
        <section className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h2 className="font-display font-bold text-foreground text-base">Salvos da Comunidade</h2>
          </div>
          {savedTips.length === 0 ? (
            <p className="font-body text-xs text-cinza-medio">Você ainda não salvou dicas. Use "Vou testar" nas Dicas da Comunidade.</p>
          ) : (
            <ul className="space-y-2">
              {savedTips.map((t) => (
                <li key={t.id}>
                  <button onClick={() => navigate(`/comunidade?dica=${t.id}`)} className="w-full text-left px-3 py-2.5 rounded-xl bg-muted">
                    <p className="font-display font-semibold text-xs text-foreground">{t.title}</p>
                    <span className="font-body text-[10px] text-cinza-medio">{t.author} — {t.bairro}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Minhas postagens */}
        <section className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h2 className="font-display font-bold text-foreground text-base">Minhas Postagens</h2>
          </div>
          {myTips.length === 0 ? (
            <p className="font-body text-xs text-cinza-medio">Você ainda não publicou dicas na comunidade.</p>
          ) : (
            <ul className="space-y-2">
              {myTips.map((t) => (
                <li key={t.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-xs text-foreground truncate">{t.title}</p>
                    <span className="flex items-center gap-1 font-body text-[10px] text-cinza-medio">
                      <ThumbsUp className="w-3 h-3" /> {t.likes} Útil
                    </span>
                  </div>
                  <button
                    onClick={() => { removeTip(t.id); toast({ title: "Postagem excluída" }); }}
                    aria-label={`Excluir postagem ${t.title}`}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Configurações */}
        <section className="bg-card rounded-2xl shadow-card p-4">
          <h2 className="font-display font-bold text-foreground text-base mb-3">Configurações da Conta</h2>
          <button
            onClick={() => toast({ title: "Alteração de senha", description: "Enviamos um link de redefinição para o seu e-mail." })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted mb-2"
          >
            <KeyRound className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="font-body text-sm text-foreground">Alterar senha</span>
          </button>
          <button
            onClick={() => {
              const next = !notifications;
              setNotifications(next);
              localStorage.setItem("saneamento-notif", String(next));
            }}
            role="switch"
            aria-checked={notifications}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted mb-4"
          >
            <span className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <span className="font-body text-sm text-foreground">Notificações do monitoramento diário</span>
            </span>
            <span className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${notifications ? "bg-primary" : "bg-cinza-claro/40"}`}>
              <span className={`w-5 h-5 rounded-full bg-card transition-transform ${notifications ? "translate-x-5" : ""}`} />
            </span>
          </button>
          <button
            onClick={deleteAccount}
            className="w-full py-3 rounded-full bg-destructive text-destructive-foreground font-display font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Excluir Conta
          </button>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
