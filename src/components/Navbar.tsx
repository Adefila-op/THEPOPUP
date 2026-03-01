import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnect from "@/components/WalletConnect";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
    <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
      <Link to="/" className="font-display text-lg font-extrabold tracking-tight gradient-text">
        THE POP UP
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="px-2">
            <LayoutDashboard className="w-4 h-4" />
          </Button>
        </Link>
        <WalletConnect />
      </div>
    </div>
  </nav>
);

export default Navbar;
