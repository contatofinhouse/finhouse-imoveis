import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle } from 'lucide-react';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { 
      label: 'Home', 
      icon: Home, 
      href: '/',
      active: location.pathname === '/' 
    },
    { 
      label: 'Buscar', 
      icon: Search, 
      href: '/imoveis',
      active: location.pathname === '/imoveis' || location.pathname === '/favoritos'
    },
    { 
      label: 'Anuncie', 
      icon: PlusCircle, 
      href: '/anunciar',
      active: location.pathname === '/anunciar' 
    }
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px]">
      <nav className="bg-brand-primary/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl flex justify-between items-center">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              item.active 
              ? 'text-brand-accent scale-110' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            <item.icon size={22} className={item.active ? 'fill-brand-accent/20' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
        
        {/* Decorative mini-logo separator or brand touch */}
        <div className="h-8 w-px bg-white/10 mx-1"></div>
        
        <Link to="/" className="flex items-center">
             <span className="text-white font-black text-sm tracking-tighter">f<span className="text-brand-accent">H</span></span>
        </Link>
      </nav>
    </div>
  );
};

export default MobileNav;