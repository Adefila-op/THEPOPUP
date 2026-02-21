import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DropsPage from "./pages/DropsPage";
import CreatorsPage from "./pages/CreatorsPage";
import CreatorProfilePage from "./pages/CreatorProfilePage";
import DropDetailPage from "./pages/DropDetailPage";
import CampaignsPage from "./pages/CampaignsPage";
import MarketplacePage from "./pages/MarketplacePage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [setFrameReady, isFrameReady]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/drops" element={<DropsPage />} />
          <Route path="/drops/:id" element={<DropDetailPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/creators/:id" element={<CreatorProfilePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
