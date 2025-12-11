import React from 'react';
import { TESTIMONIALS } from '../constants';
import { Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-white scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
            Histórias de Sucesso
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, index) => (
            <div key={index} className="bg-slate-50 p-10 rounded-3xl relative hover:bg-slate-100 transition-colors">
              <Quote className="absolute top-8 right-8 text-brand-accent/10 w-12 h-12" />
              <div className="flex items-center mb-8">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-accent"
                />
                <div className="ml-4">
                  <h5 className="font-bold text-brand-primary text-lg">{t.name}</h5>
                  <span className="text-xs text-brand-accent uppercase font-bold tracking-wider">{t.role}</span>
                </div>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">"{t.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;