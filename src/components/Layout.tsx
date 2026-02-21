import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      {isHome && <Footer />}
    </div>
  );
};

export default Layout;
