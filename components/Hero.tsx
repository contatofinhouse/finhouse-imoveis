
import React from 'react';
import Button from './Button';
import { ArrowRight, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2000" 
          alt="Família feliz em casa nova" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left pt-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-brand-accent text-white font-semibold text-sm mb-6 shadow-lg animate-fade-in-up">
          Tecnologia para morar melhor
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up tracking-tight">
          Sua conquista,<br/>
          <span className="text-white">Inteligente</span> e <span className="text-white">Segura</span>.
        </h1>
        <p className="text-lg sm:text-xl text-gray-100 mb-10 max-w-2xl animate-fade-in-up animation-delay-200 font-light">
          Unimos a facilidade digital com o conhecimento de quem entende do seu bairro. 
          Do financiamento às chaves na mão, simplificamos tudo para você.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
          <Button 
            onClick={() => navigate('/imoveis')}
            className="flex items-center justify-center gap-2"
          >
            Ver Imóveis <ArrowRight size={18} />
          </Button>
          <Button 
            variant="white" 
            className="flex items-center justify-center gap-2"
            onClick={() => navigate('/anunciar')}
          >
             <UploadCloud size={18} /> Anuncie seu Imóvel
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
