import React from 'react';
import Button from '../components/Button';
import { Gift, CheckCircle, DollarSign, Send } from 'lucide-react';
import { COMPANY_PHONE } from '../constants';

const ReferProperty: React.FC = () => {
  const handleReferClick = () => {
    const text = "Olá! Gostaria de indicar um imóvel para a finHouse.";
    window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="inline-block p-3 rounded-full bg-brand-light text-brand-accent mb-6">
          <Gift size={32} />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-brand-primary mb-6">
          Indique e Ganhe
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Conhece alguém querendo vender um imóvel? Indique para a <span className="font-bold text-brand-accent">finHouse</span> e ganhe uma recompensa em dinheiro se o negócio for fechado!
        </p>
        <Button onClick={handleReferClick} className="px-10 py-4 text-lg shadow-xl shadow-indigo-200">
          Quero Indicar Agora
        </Button>
      </section>

      {/* How it works */}
      <section className="bg-brand-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-brand-primary mb-12">Como Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center">
              <div className="w-12 h-12 bg-indigo-100 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-4">Você Indica</h3>
              <p className="text-gray-600">Envie o contato do proprietário e os dados do imóvel pelo nosso WhatsApp.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center">
              <div className="w-12 h-12 bg-indigo-100 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-4">Nós Trabalhamos</h3>
              <p className="text-gray-600">Nossa equipe entra em contato, faz a avaliação, fotos profissionais e anuncia o imóvel.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center">
              <div className="w-12 h-12 bg-indigo-100 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-4">Você Recebe</h3>
              <p className="text-gray-600">Assim que a venda for concretizada e a comissão paga, você recebe sua parte!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-brand-primary mb-6">Termos e Condições Simplificados</h3>
        <ul className="space-y-4 text-gray-600">
          <li className="flex items-start gap-3">
            <CheckCircle className="shrink-0 text-brand-accent w-5 h-5 mt-1" />
            <span>O proprietário não pode estar já em negociação com a finHouse.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="shrink-0 text-brand-accent w-5 h-5 mt-1" />
            <span>A indicação é válida por 12 meses.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="shrink-0 text-brand-accent w-5 h-5 mt-1" />
            <span>O pagamento é feito via PIX ou transferência bancária após o recebimento da comissão imobiliária pela finHouse.</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default ReferProperty;