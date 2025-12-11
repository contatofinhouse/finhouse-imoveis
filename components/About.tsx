import React from 'react';
import { BENEFITS, COMPANY_NAME } from '../constants';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="relative">
            {/* Soft decorative elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800" 
              alt="Consultoria humanizada" 
              className="rounded-3xl shadow-2xl w-full object-cover h-[450px]"
            />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-brand-primary/5 rounded-full blur-2xl -z-10"></div>
          </div>
          <div>
            <h2 className="text-brand-accent font-bold tracking-wider uppercase text-sm mb-3">Nossa Essência</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6 tracking-tight leading-tight">
              Tecnologia que aproxima, <br/>experiência que resolve.
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg font-light">
              Na {COMPANY_NAME}, acreditamos que por trás de cada transação imobiliária existe uma história de vida. Não somos apenas um aplicativo; somos seus vizinhos e consultores.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg font-light">
              Trouxemos a tecnologia para acabar com a papelada chata e as filas de cartório, permitindo que nossa equipe foque no que realmente importa: entender o que você e sua família precisam.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {BENEFITS.map((item, index) => (
            <div key={index} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-brand-accent/5 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-brand-accent shadow-sm group-hover:scale-110 transition-transform">
                <item.icon size={28} />
              </div>
              <h4 className="text-xl font-bold text-brand-primary mb-3">{item.title}</h4>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;