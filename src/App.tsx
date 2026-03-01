import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DropsPage from "./pages/DropsPage";
import CreatorsPage from "./pages/CreatorsPage";
import CreatorProfilePage from "./pages/CreatorProfilePage";
import DropDetailPage from "./pages/DropDetailPage";
import CampaignsPage from "./pages/CampaignsPage";
import MarketplacePage from "./pages/MarketplacePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  return (
    <TooltipProvider>
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/drops" element={<DropsPage />} />
          <Route path="/drops/:id" element={<DropDetailPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/creators/:id" element={<CreatorProfilePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
