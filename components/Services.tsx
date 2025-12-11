import React from 'react';
import { REAL_ESTATE_SERVICES, FINANCIAL_SERVICES } from '../constants';
import { ServiceItem } from '../types';

const ServiceCard: React.FC<{ item: ServiceItem; dark?: boolean }> = ({ item, dark }) => (
  <div className={`p-10 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
    dark 
      ? 'bg-brand-primary text-white border border-gray-800 hover:shadow-indigo-500/20 hover:shadow-2xl' 
      : 'bg-white text-gray-800 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl'
  }`}>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl ${
      dark ? 'bg-brand-accent text-white' : 'bg-brand-light text-brand-accent'
    }`}>
      <item.icon size={30} />
    </div>
    <h4 className="text-2xl font-bold mb-4 tracking-tight">{item.title}</h4>
    <p className={`${dark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
      {item.description}
    </p>
  </div>
);

const Services: React.FC = () => {
  return (
    <>
      {/* Real Estate Section */}
      <section id="real-estate" className="py-24 bg-brand-light scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-brand-accent font-bold tracking-wider uppercase text-sm mb-3">Imobiliária Digital</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
              Encontre. Compre. More.
            </h3>
            <div className="w-20 h-1.5 bg-brand-accent mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REAL_ESTATE_SERVICES.map((service, index) => (
              <ServiceCard key={index} item={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Financial Section */}
      <section id="financial" className="py-24 bg-brand-dark relative overflow-hidden scroll-mt-32">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-brand-accent font-bold tracking-wider uppercase text-sm mb-3">Soluções Financeiras</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Crédito Inteligente para Seus Planos
            </h3>
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg font-light">
              Desbloqueie o potencial do seu capital. Viabilizamos o seu negócio com tecnologia e as taxas mais competitivas do mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FINANCIAL_SERVICES.map((service, index) => (
              <ServiceCard key={index} item={service} dark />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;