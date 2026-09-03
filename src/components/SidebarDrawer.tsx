import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Droplets, CreditCard, Building2, Info, LogOut, Trophy, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Início", path: "/home" },
  { icon: Droplets, label: "Meu Consumo", path: "/consumo" },
  { icon: Trophy, label: "Conquistas", path: "/conquistas" },
  { icon: CreditCard, label: "Pagamentos", path: "/pagamentos" },
  { icon: Building2, label: "Nosso Portal", path: "/portal" },
  { icon: Info, label: "Sobre Nós", path: "/sobre" },
];


const SidebarDrawer = ({ open, onClose }: SidebarDrawerProps) => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const handleNav = (path: string) => { navigate(path); onClose(); };

  const handleLogout = () => {
    localStorage.removeItem("saneamento-user");
    localStorage.removeItem("saneamento-consumption");
    window.location.href = "/";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-foreground/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-xs bg-card flex flex-col border-r border-border"
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}>
            {/* Header */}
            <div className="gradient-header flex items-center justify-between p-6 pt-12">
              <button onClick={onClose} className="text-primary-foreground font-display font-medium flex items-center gap-1">
                <X className="w-5 h-5" strokeWidth={1.5} /> Voltar
              </button>
              <ThemeToggle className="text-primary-foreground" />
            </div>

            {/* User info */}
            <div className="px-6 py-4 border-b border-border">
              <button
                onClick={() => handleNav("/perfil")}
                aria-label="Abrir sessão do usuário"
                className="flex items-center gap-3 w-full text-left"
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-sm">{user?.nome?.[0] || "U"}</span>
                </div>
                <div>
                  <p className="font-display font-bold text-foreground text-sm">{user?.nome || "Usuário"}</p>
                  <span className="text-[10px] font-body text-cinza-medio">{user?.email || ""}</span>
                </div>
              </button>
            </div>

            {/* Menu items */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button key={item.path} onClick={() => handleNav(item.path)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors">
                  <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  <span className="font-body text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Ranking section */}
            <div className="px-6 py-4 border-t border-border">
              <button onClick={() => handleNav("/ranking")} className="flex items-center gap-3 w-full">
                <Trophy className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <div className="text-left">
                  <span className="text-foreground text-sm font-body">Ranking</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-amarelo-alerta text-2xl font-display font-bold">24</span>
                    <Star className="w-4 h-4 text-amarelo-alerta" strokeWidth={1.5} />
                  </div>
                </div>
              </button>
            </div>

            {/* Logout */}
            <div className="px-6 py-6 border-t border-border">
              <button onClick={handleLogout} className="flex items-center gap-3 text-destructive">
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-body text-sm">Sair da Conta</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarDrawer;
