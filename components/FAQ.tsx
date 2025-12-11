import React, { useState } from 'react';
import { FAQS } from '../constants';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-brand-light scroll-mt-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
            Dúvidas Frequentes
          </h2>
        </div>

        <div className="space-y-5">
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-bold text-brand-primary text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-brand-accent" />
                ) : (
                  <ChevronDown className="text-gray-400" />
                )}
              </button>
              <div 
                className={`px-8 transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 opacity-100 pb-8' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed font-light">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;