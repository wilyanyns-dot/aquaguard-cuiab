import { useLocation, useNavigate } from "react-router-dom";
import { Home, Droplets, Map, Newspaper, Trophy } from "lucide-react";

const tabs = [
  { path: "/home", icon: Home, label: "Início" },
  { path: "/consumo", icon: Droplets, label: "Consumo" },
  { path: "/mapa", icon: Map, label: "Mapa" },
  { path: "/noticias", icon: Newspaper, label: "Notícias" },
  { path: "/ranking", icon: Trophy, label: "Ranking" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-card">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const isMap = tab.path === "/mapa";
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isMap ? "relative -mt-5" : ""
              }`}
            >
              {isMap ? (
                <div className={`w-14 h-14 rounded-full flex items-center justify-center gradient-primary shadow-card-hover`}>
                  <tab.icon className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
                </div>
              ) : (
                <tab.icon
                  className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-cinza-claro"}`}
                  strokeWidth={1.5}
                />
              )}
              <span className={`text-[10px] font-body ${isActive || isMap ? "text-primary font-medium" : "text-cinza-claro"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
