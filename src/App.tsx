import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { UserProvider } from "@/contexts/UserContext";
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
import OnboardingPage from "./pages/OnboardingPage";
import EducaSaneamentoPage from "./pages/EducaSaneamentoPage";
import TourVirtualPage from "./pages/TourVirtualPage";
import VoceSaneamentoPage from "./pages/VoceSaneamentoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideTabs = ["/", "/onboarding"].includes(location.pathname);

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
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
        <Route path="/educa" element={<EducaSaneamentoPage />} />
        <Route path="/tour" element={<TourVirtualPage />} />
        <Route path="/voce-saneamento" element={<VoceSaneamentoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideTabs && <BottomTabBar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
