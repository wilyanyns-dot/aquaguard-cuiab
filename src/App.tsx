import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import BottomTabBar from "@/components/BottomTabBar";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import ConsumptionPage from "./pages/ConsumptionPage";
import MapPage from "./pages/MapPage";
import NewsPage from "./pages/NewsPage";
import RankingPage from "./pages/RankingPage";
import DictionaryPage from "./pages/DictionaryPage";
import CommunityPage from "./pages/CommunityPage";
import AchievementsPage from "./pages/AchievementsPage";
import PortalPage from "./pages/PortalPage";
import PagamentosPage from "./pages/PagamentosPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showTabs = location.pathname !== "/";

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/consumo" element={<ConsumptionPage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/noticias" element={<NewsPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/dicionario" element={<DictionaryPage />} />
        <Route path="/comunidade" element={<CommunityPage />} />
        <Route path="/conquistas" element={<AchievementsPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/pagamentos" element={<PagamentosPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showTabs && <BottomTabBar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
