import React from 'react';
import { COMPANY_NAME, COMPANY_CNPJ, COMPANY_ADDRESS, COMPANY_EMAIL } from '../constants';
import { Instagram, Linkedin, Mail, MapPin } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollLink = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-3xl font-bold mb-6 tracking-tighter">fin<span className="text-brand-accent">House</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light mb-4">
              Reinventando o acesso ao crédito e a imóveis com tecnologia e segurança jurídica.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-semibold">{COMPANY_NAME}</p>
              <p>CNPJ: {COMPANY_CNPJ}</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Navegação</h4>
            <ul className="space-y-3">
              <li><Link to="/imoveis" className="text-gray-400 hover:text-brand-accent text-sm transition-colors">Imóveis à Venda</Link></li>
              <li><Link to="/indique" className="text-gray-400 hover:text-brand-accent text-sm transition-colors">Indique um Imóvel</Link></li>
              <li><Link to="/consultor" className="text-gray-400 hover:text-brand-accent text-sm transition-colors">Seja um Consultor</Link></li>
              <li><button onClick={(e) => handleScrollLink(e, 'contact')} className="text-gray-400 hover:text-brand-accent text-sm transition-colors bg-transparent border-none cursor-pointer p-0">Fale Conosco</button></li>
            </ul>
          </div>

          {/* Services (Links to Landing Page) */}
          <div>
            <h4 className="font-bold text-lg mb-6">Soluções</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><button onClick={(e) => handleScrollLink(e, 'real-estate')} className="hover:text-brand-accent transition-colors bg-transparent border-none cursor-pointer p-0 text-left">Compra e Venda</button></li>
              <li><button onClick={(e) => handleScrollLink(e, 'financial')} className="hover:text-brand-accent transition-colors bg-transparent border-none cursor-pointer p-0 text-left">Consórcio Inteligente</button></li>
              <li><button onClick={(e) => handleScrollLink(e, 'financial')} className="hover:text-brand-accent transition-colors bg-transparent border-none cursor-pointer p-0 text-left">Financiamento Imobiliário</button></li>
              <li><button onClick={(e) => handleScrollLink(e, 'financial')} className="hover:text-brand-accent transition-colors bg-transparent border-none cursor-pointer p-0 text-left">Home Equity (CGI)</button></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="shrink-0 w-5 h-5 text-brand-accent" />
                <span>
                  {COMPANY_ADDRESS.street}<br/>
                  {COMPANY_ADDRESS.suite}<br/>
                  {COMPANY_ADDRESS.city}<br/>
                  CEP: {COMPANY_ADDRESS.zip}
                </span>
              </li>
              
              <li className="flex items-center gap-3">
                <Mail className="shrink-0 w-5 h-5 text-brand-accent" />
                <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-brand-accent transition-colors" title="Enviar Email">
                   <span className="sr-only">Enviar Email</span>
                   Email de Contato
                </a>
              </li>
            </ul>
            
            <div className="flex space-x-4 mt-8">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform"><Instagram size={22}/></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform"><Linkedin size={22}/></a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-light gap-4 border-t border-gray-800">
          <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
          <div className="flex gap-6">
             <Link to="/privacidade" className="hover:text-brand-accent transition-colors">Política de Privacidade</Link>
             <span className="text-gray-700">•</span>
             <Link to="/termos" className="hover:text-brand-accent transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;