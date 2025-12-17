import React, { useState } from 'react';
import { Menu, X, UploadCloud } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import Button from './Button';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    
    if (href.startsWith('/') && !href.startsWith('/#')) {
      navigate(href);
      return;
    }

    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (location.pathname === '/') {
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
    <header className="fixed w-full z-50 bg-white border-b border-gray-100 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="text-2xl font-bold tracking-tighter"
            >
              <span className="bg-gradient-to-r from-brand-accent to-[#D70466] bg-clip-text text-transparent">fin</span>
              <span className="text-brand-dark">House</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavigation(link.href)}
                className="text-sm font-medium transition-colors hover:text-gray-900 text-brand-dark bg-transparent border-none cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            
            <Button 
              variant="primary" 
              className="px-5 py-2 text-xs font-bold uppercase"
              onClick={() => handleNavigation('/#contact')}
            >
              Fale Conosco
            </Button>
          </nav>

          {/* Mobile Actions Area */}
          <div className="md:hidden flex items-center gap-2">
            <Link 
              to="/anunciar"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold bg-brand-accent text-white active:scale-95 transition-transform"
            >
              <UploadCloud size={12} />
              Anuncie
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-md text-brand-dark hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
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
        <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col items-center">
          {NAV_LINKS.map((link) => (
             <button
              key={link.label}
              onClick={() => handleNavigation(link.href)}
              className="block px-3 py-3 text-base font-medium text-brand-dark hover:bg-gray-50 w-full text-center rounded-xl bg-transparent border-none"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 w-full px-4">
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