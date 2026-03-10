import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Droplets, Heart, Settings, Newspaper, Building2, Info, LogOut, Trophy, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Início", path: "/home" },
  { icon: Droplets, label: "Meu Consumo", path: "/consumo" },
  { icon: Heart, label: "Dicas da Comunidade", path: "/comunidade" },
  { icon: Trophy, label: "Conquistas", path: "/conquistas" },
  { icon: Newspaper, label: "Notícias", path: "/noticias" },
  { icon: Building2, label: "Nosso Portal", path: "/portal" },
  { icon: Info, label: "Sobre Nós", path: "/sobre" },
];

const SidebarDrawer = ({ open, onClose }: SidebarDrawerProps) => {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-xs gradient-primary flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pt-12">
              <button onClick={onClose} className="text-primary-foreground font-display font-medium flex items-center gap-1">
                <X className="w-5 h-5" strokeWidth={1.5} />
                Voltar
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/40" />
              </div>
            </div>

            {/* Menu items */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-primary-foreground/90 hover:bg-primary-foreground/10 transition-colors"
                >
                  <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="font-body text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Ranking section */}
            <div className="px-6 py-4 border-t border-primary-foreground/20">
              <button onClick={() => handleNav("/ranking")} className="flex items-center gap-3 w-full">
                <Trophy className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
                <div className="text-left">
                  <span className="text-primary-foreground text-sm font-body">Ranking</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-amarelo-alerta text-2xl font-display font-bold">24</span>
                    <Star className="w-4 h-4 text-amarelo-alerta" strokeWidth={1.5} />
                  </div>
                </div>
              </button>
            </div>

            {/* Logout */}
            <div className="px-6 py-6">
              <button className="flex items-center gap-3 text-primary-foreground/80">
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
