import React, { useState } from 'react';
import Button from './Button';
import { MapPin, Phone, Mail } from 'lucide-react';
import { COMPANY_PHONE, COMPANY_ADDRESS, COMPANY_EMAIL } from '../constants';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Financiamento'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá! Me chamo *${formData.name}*.\nTenho interesse em: *${formData.interest}*.\nMeu email é: ${formData.email}.\nGostaria de falar com um consultor.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodedText}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 bg-white scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Info Side */}
          <div className="flex flex-col justify-center">
            <h2 className="text-brand-accent font-bold tracking-wider uppercase text-sm mb-3">Fale com a Gente</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-brand-primary mb-8 tracking-tight">
              Vamos tomar um café na Faria Lima?
            </h3>
            <p className="text-gray-600 mb-10 text-lg font-light">
              Seja online ou presencialmente, estamos prontos para tirar suas dúvidas. Sem "financês", de forma clara e direta.
            </p>

            <div className="space-y-8">
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-light rounded-full flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
                  <MapPin className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="ml-5 text-base text-gray-600">
                  <p className="font-semibold text-brand-primary">Escritório Central</p>
                  <p>{COMPANY_ADDRESS.street}</p>
                  <p>{COMPANY_ADDRESS.suite}</p>
                  <p>{COMPANY_ADDRESS.city}, {COMPANY_ADDRESS.zip}</p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-light rounded-full flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
                  <Phone className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="ml-5 text-base text-gray-600">
                  <p className="font-semibold text-brand-primary">WhatsApp</p>
                  <p>(11) 95584-2951</p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-light rounded-full flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
                  <Mail className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="ml-5 text-base text-gray-600">
                  <p className="font-semibold text-brand-primary">Email</p>
                  <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-brand-accent">Clique para enviar email</a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full px-4 py-3.5 rounded-xl border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-gray-50 border transition-all"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  className="mt-1 block w-full px-4 py-3.5 rounded-xl border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-gray-50 border transition-all"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full px-4 py-3.5 rounded-xl border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-gray-50 border transition-all"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="interest" className="block text-sm font-semibold text-gray-700 mb-1">Como podemos ajudar?</label>
                <select
                  id="interest"
                  name="interest"
                  className="mt-1 block w-full px-4 py-3.5 rounded-xl border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-gray-50 border transition-all"
                  value={formData.interest}
                  onChange={handleChange}
                >
                  <option>Quero Comprar um Imóvel</option>
                  <option>Quero Vender meu Imóvel</option>
                  <option>Simular Financiamento</option>
                  <option>Simular Consórcio</option>
                  <option>Empréstimo com Garantia (Home Equity)</option>
                  <option>Outros Assuntos</option>
                </select>
              </div>

              <Button type="submit" fullWidth className="mt-4">
                Chamar no WhatsApp
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;