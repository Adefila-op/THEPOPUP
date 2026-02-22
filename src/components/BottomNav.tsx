import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Users, ShoppingBag, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/cocreate', icon: Zap, label: 'Co-Create' },
    { path: '/drops', icon: ShoppingBag, label: 'Drops' },
    { path: '/creators', icon: Users, label: 'Creators' },
    { path: '/dashboard', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all ${
                active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
