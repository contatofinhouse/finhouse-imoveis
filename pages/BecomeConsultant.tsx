import React from 'react';
import Button from '../components/Button';
import { TrendingUp, Users, Laptop, Briefcase } from 'lucide-react';
import { COMPANY_PHONE } from '../constants';

const BecomeConsultant: React.FC = () => {
  const handleJoinClick = () => {
    const text = "Olá! Quero saber mais sobre como ser um consultor finHouse.";
    window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 mb-20">
        <div className="md:w-1/2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-light text-brand-accent font-medium text-sm mb-6">
            Carreira Imobiliária 4.0
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-primary mb-6 leading-tight">
            Seja um Consultor <span className="text-brand-accent">finHouse</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Una sua experiência comercial com nossa tecnologia de ponta. Leads qualificados, burocracia zero e as melhores comissões do mercado.
          </p>
          <Button onClick={handleJoinClick} className="px-8 py-4 text-lg">
            Quero fazer parte do time
          </Button>
        </div>
        <div className="md:w-1/2 relative">
           <div className="absolute -top-4 -right-4 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl"></div>
           <img 
             src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800" 
             alt="Consultores em reunião" 
             className="rounded-3xl shadow-2xl relative z-10"
           />
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-brand-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Por que a finHouse?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-brand-dark/50 rounded-2xl border border-gray-700">
              <TrendingUp className="w-10 h-10 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Comissões Agressivas</h3>
              <p className="text-gray-400 text-sm">Estrutura de partnership que valoriza quem traz resultado.</p>
            </div>
            <div className="p-6 bg-brand-dark/50 rounded-2xl border border-gray-700">
              <Users className="w-10 h-10 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Leads Qualificados</h3>
              <p className="text-gray-400 text-sm">Esqueça a lista telefônica. Nosso marketing digital entrega o cliente pronto.</p>
            </div>
            <div className="p-6 bg-brand-dark/50 rounded-2xl border border-gray-700">
              <Laptop className="w-10 h-10 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Plataforma Tech</h3>
              <p className="text-gray-400 text-sm">CRM próprio, gestão de contratos digital e dados de mercado em tempo real.</p>
            </div>
            <div className="p-6 bg-brand-dark/50 rounded-2xl border border-gray-700">
              <Briefcase className="w-10 h-10 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Suporte Total</h3>
              <p className="text-gray-400 text-sm">Jurídico e administrativo cuidam da papelada para você focar em vender.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-4">
        <h2 className="text-3xl font-bold text-brand-primary mb-6">Pronto para escalar seus resultados?</h2>
        <Button onClick={handleJoinClick} variant="outline" className="px-10 py-4">
          Falar com Gestor de Expansão
        </Button>
      </section>
    </div>
  );
};

export default BecomeConsultant;