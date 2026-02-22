import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/30 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Community</h4>
          <div className="flex flex-col gap-3">
            <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Discord</a>
            <a href="https://farcaster.cast" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Farcaster</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Platform</h4>
          <div className="flex flex-col gap-3">
            <Link to="/drops" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Drops</Link>
            <Link to="/creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Creators</Link>
            <Link to="/cocreate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Co-Create</Link>
          </div>
        </div>
        <div>
          <span className="font-display text-lg font-extrabold gradient-text">THE POP UP</span>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Physical art meets onchain ownership. Build on Base.
          </p>
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
