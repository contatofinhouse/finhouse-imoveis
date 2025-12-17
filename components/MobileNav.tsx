
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, PlusCircle } from 'lucide-react';

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
      active: location.pathname === '/imoveis'
    },
    { 
      label: 'Favoritos', 
      icon: Heart, 
      href: '/favoritos',
      active: location.pathname === '/favoritos'
    },
    { 
      label: 'Anunciar', 
      icon: PlusCircle, 
      href: '/anunciar',
      active: location.pathname === '/anunciar' 
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-[100] bg-white border-t border-gray-100">
      <nav className="flex justify-around items-center h-16 pb-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`flex flex-col items-center justify-center h-full w-full transition-all duration-300 ${
              item.active 
              ? 'text-brand-accent' 
              : 'text-gray-400'
            }`}
          >
            <item.icon 
              size={22} 
              className={`transition-all`} 
              strokeWidth={item.active ? 2.5 : 2}
            />
            <span className={`text-[10px] mt-0.5 font-medium ${item.active ? 'text-brand-dark' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MobileNav;
