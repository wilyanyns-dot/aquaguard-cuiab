import { useState } from "react";
import { Menu } from "lucide-react";
import ConsumptionCard from "@/components/ConsumptionCard";
import QuickActions from "@/components/QuickActions";
import PortalBanner from "@/components/PortalBanner";
import SidebarDrawer from "@/components/SidebarDrawer";
import ThemeToggle from "@/components/ThemeToggle";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSidebarOpen(true)} className="text-primary-foreground">
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 className="font-display font-bold text-primary-foreground text-lg">Saneamento Cuiabá</h1>
          <ThemeToggle className="text-primary-foreground" />
        </div>
      </div>

      {/* Content */}
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
