import React from 'react';
import { COMPANY_NAME, COMPANY_CNPJ, COMPANY_EMAIL } from '../constants';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-10 rounded-3xl shadow-sm">
        <h1 className="text-3xl font-bold text-brand-primary mb-8">Política de Privacidade</h1>
        
        <div className="prose text-gray-600">
          <p className="mb-4">
            A <strong>{COMPANY_NAME}</strong> (CNPJ: {COMPANY_CNPJ}) valoriza a privacidade de seus usuários e se compromete a proteger seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">1. Coleta de Dados</h2>
          <p className="mb-4">
            Coletamos informações pessoais fornecidas voluntariamente por você ao preencher formulários de contato, simulações de financiamento ou cadastro de imóveis. Isso pode incluir nome, e-mail, telefone, renda aproximada e dados do imóvel.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">2. Uso das Informações</h2>
          <p className="mb-4">
            Seus dados são utilizados exclusivamente para:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Entrar em contato para atendimento comercial solicitado.</li>
            <li>Realizar análises de crédito e simulações (quando autorizado).</li>
            <li>Enviar oportunidades de imóveis relevantes ao seu perfil.</li>
            <li>Formalização de contratos e cumprimento de obrigações legais.</li>
          </ul>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">3. Compartilhamento de Dados</h2>
          <p className="mb-4">
            Não vendemos seus dados. O compartilhamento ocorre apenas com parceiros essenciais para a prestação do serviço (ex: bancos para aprovação de financiamento, seguradoras ou cartórios), sempre sob estrito sigilo.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">4. Segurança</h2>
          <p className="mb-4">
            Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados. Além disso, todos os nossos contratos passam por revisão jurídica para garantir a segurança das transações.
          </p>

          <h2 className="text-xl font-bold text-brand-primary mt-6 mb-3">5. Seus Direitos</h2>
          <p className="mb-4">
            Você pode solicitar a qualquer momento a confirmação, correção, exclusão ou portabilidade de seus dados através do e-mail: {COMPANY_EMAIL}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;