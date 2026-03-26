import { useState } from "react";
import { Menu } from "lucide-react";
import ConsumptionCard from "@/components/ConsumptionCard";
import QuickActions from "@/components/QuickActions";
import PortalBanner from "@/components/PortalBanner";
import SidebarDrawer from "@/components/SidebarDrawer";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();
  const [greeted, setGreeted] = useState(false);

  useEffect(() => {
    if (user?.nome && !greeted) {
      setGreeted(true);
      toast({
        title: `Olá, ${user.nome.split(" ")[0]}! 👋`,
        description: "Seu consumo de hoje já está sendo monitorado.",
      });
    }
  }, [user, greeted]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSidebarOpen(true)} className="text-primary-foreground">
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Saneamento Cuiabá</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
        {user?.nome && (
          <p className="text-primary-foreground/80 text-sm font-body -mt-3 mb-2">
            Olá, {user.nome.split(" ")[0]}! 💧
          </p>
        )}
      </div>

      <div className="px-5 -mt-4 space-y-6">
        <ConsumptionCard />
        <QuickActions />
        <PortalBanner />
      </div>

      <SidebarDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};

export default HomePage;
