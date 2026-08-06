import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { UserProvider } from "@/contexts/UserContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import BottomTabBar from "@/components/BottomTabBar";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import ConsumptionPage from "./pages/ConsumptionPage";
import MapPage from "./pages/MapPage";
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
import ProfilePage from "./pages/ProfilePage";
import AuthorFeedPage from "./pages/AuthorFeedPage";
import NotFound from "./pages/NotFound";
import AIChatAssistant from "./components/AIChatAssistant";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import LibrasWidget from "@/components/a11y/LibrasWidget";


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
        <Route path="/noticias" element={<Navigate to="/home" replace />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/dicionario" element={<DictionaryPage />} />
        <Route path="/comunidade" element={<CommunityPage />} />
        <Route path="/comunidade/autor/:author" element={<AuthorFeedPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
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
      {!hideTabs && <AIChatAssistant />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <CommunityProvider>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </CommunityProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
