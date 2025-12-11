import React from 'react';
import { COMPANY_NAME } from '../constants';

const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-10 rounded-3xl shadow-sm">
        <h1 className="text-3xl font-bold text-brand-primary mb-8">Termos de Uso</h1>
        
        <div className="prose text-gray-600">
          <p className="mb-4">
            Bem-vindo à <strong>{COMPANY_NAME}</strong>. Ao acessar nosso site e utilizar nossos serviços, você concorda com os termos descritos abaixo.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">1. Objeto</h2>
          <p className="mb-4">
            A {COMPANY_NAME} atua como intermediadora de negócios imobiliários e correspondente bancário, facilitando a compra, venda e financiamento de imóveis.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">2. Responsabilidades</h2>
          <p className="mb-4">
            A {COMPANY_NAME} empenha-se em manter as informações dos imóveis atualizadas, mas não se responsabiliza por eventuais alterações de preço ou disponibilidade por parte dos proprietários sem aviso prévio.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">3. Uso do Site</h2>
          <p className="mb-4">
            É proibido utilizar o site para fins ilegais, tentar invadir áreas restritas ou copiar conteúdo sem autorização prévia.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">4. Simulações Financeiras</h2>
          <p className="mb-4">
            As simulações de crédito apresentadas no site são estimativas baseadas nas taxas de mercado vigentes e não garantem a aprovação do crédito, que está sujeita à análise das instituições financeiras parceiras.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">5. Alterações</h2>
          <p className="mb-4">
            A {COMPANY_NAME} reserva-se o direito de alterar estes termos a qualquer momento. Recomendamos a consulta periódica desta página.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;