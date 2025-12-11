import React, { useState, useEffect } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import Button from './Button';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const showFavorites = location.pathname === '/imoveis' || location.pathname === '/favoritos';

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    
    // Handle internal routes (e.g., /imoveis)
    if (href.startsWith('/') && !href.startsWith('/#')) {
      navigate(href);
      return;
    }

    // Handle hash links (e.g., /#financial)
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (isHome) {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || !isHome ? 'bg-white/95 backdrop-blur-lg shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className={`text-3xl font-bold tracking-tighter ${scrolled || !isHome ? 'text-brand-primary' : 'text-white'}`}>
              fin<span className="text-brand-accent">House</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavigation(link.href)}
                className={`text-base font-semibold transition-colors hover:text-brand-accent bg-transparent border-none cursor-pointer ${
                  scrolled || !isHome ? 'text-gray-700' : 'text-gray-100'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            {/* Favorites Link - Only visible on Properties related pages */}
            {showFavorites && (
              <button
                  onClick={() => handleNavigation('/favoritos')}
                  className={`flex items-center gap-2 text-base font-semibold transition-colors hover:text-red-500 bg-transparent border-none cursor-pointer ${
                    scrolled || !isHome ? 'text-gray-700' : 'text-gray-100'
                  }`}
              >
                  <Heart size={20} className={location.pathname === '/favoritos' ? 'fill-red-500 text-red-500' : ''} />
                  Meus Favoritos
              </button>
            )}

            <Button 
              variant={scrolled || !isHome ? 'primary' : 'white'} 
              className="px-6 py-2.5 text-sm font-semibold"
              onClick={() => handleNavigation('/#contact')}
            >
              Fale Conosco
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {showFavorites && (
              <button
                onClick={() => handleNavigation('/favoritos')}
                className={`p-2 rounded-md ${scrolled || !isHome ? 'text-gray-700' : 'text-white'} hover:text-red-500 focus:outline-none`}
              >
                <Heart size={24} className={location.pathname === '/favoritos' ? 'fill-red-500 text-red-500' : ''} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${scrolled || !isHome ? 'text-gray-700' : 'text-brand-primary'} hover:text-brand-accent focus:outline-none`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} className={scrolled || !isHome ? '' : 'text-white'} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 ease-in-out transform origin-top ${
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0 overflow-hidden'
        }`}
      >
        <div className="px-4 pt-4 pb-8 space-y-2 sm:px-3 flex flex-col items-center">
          {NAV_LINKS.map((link) => (
             <button
              key={link.label}
              onClick={() => handleNavigation(link.href)}
              className="block px-3 py-4 text-lg font-bold text-gray-800 hover:text-brand-accent hover:bg-gray-50 w-full text-center rounded-xl bg-transparent border-none"
            >
              {link.label}
            </button>
          ))}
          <button
              onClick={() => handleNavigation('/favoritos')}
              className="block px-3 py-4 text-lg font-bold text-gray-800 hover:text-red-500 hover:bg-gray-50 w-full text-center rounded-xl bg-transparent border-none flex items-center justify-center gap-2"
            >
              <Heart size={20} /> Meus Favoritos
          </button>
          <div className="pt-6 w-full">
            <Button 
              fullWidth 
              onClick={() => handleNavigation('/#contact')}
            >
              Solicitar Contato
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;