import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/30 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <span className="font-display text-xl font-extrabold gradient-text">THE POP UP</span>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Physical art meets onchain ownership. Subscribe. Collect. Earn.
          </p>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/drops" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Drops</Link>
            <Link to="/creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Creators</Link>
            <Link to="/campaigns" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Campaigns</Link>
            <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Resources</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Docs</span>
            <span className="text-sm text-muted-foreground">FAQ</span>
            <span className="text-sm text-muted-foreground">Support</span>
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Community</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Twitter</span>
            <span className="text-sm text-muted-foreground">Discord</span>
            <span className="text-sm text-muted-foreground">Farcaster</span>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">© 2026 The POP Up by Swagclub. Built on Base.</p>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">Base Mainnet</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
