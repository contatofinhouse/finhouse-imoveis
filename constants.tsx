import { 
  Home, 
  Key, 
  PiggyBank, 
  Percent, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Users,
  Scale
} from 'lucide-react';
import { NavItem, ServiceItem, TestimonialItem, FAQItem } from './types';

export const COMPANY_NAME = "finHouse";
export const COMPANY_PHONE = "5511955842951"; 
export const COMPANY_EMAIL = "rafael.fernandes@finhousebr.com.br";
export const COMPANY_CNPJ = "60.806.192/0001-50";

export const COMPANY_ADDRESS = {
  street: "Avenida Brig. Faria Lima, 1811",
  suite: "Sala 1119 - Jardim Paulistano",
  city: "São Paulo - SP",
  zip: "01452-001"
};

export const NAV_LINKS: NavItem[] = [
  { label: 'Imóveis à Venda', href: '/imoveis' },
  { label: 'Soluções Financeiras', href: '/#financial' },
  { label: 'Indique um Imóvel', href: '/indique' },
  { label: 'Seja um Consultor', href: '/consultor' },
];

export const REAL_ESTATE_SERVICES: ServiceItem[] = [
  {
    title: "Compra e Venda Ágil",
    description: "Encontramos o imóvel certo para o seu momento de vida. Usamos dados para garantir que você pague o preço justo.",
    icon: Home
  },
  {
    title: "Gestão de Aluguel",
    description: "Cuidamos do seu imóvel como se fosse nosso. Vistoria digital, repasse garantido e zero dor de cabeça.",
    icon: Key
  },
  {
    title: "Segurança Jurídica",
    description: "Fique tranquilo. Cada contrato passa por uma rigorosa revisão jurídica para garantir a segurança total do seu patrimônio.",
    icon: Scale
  }
];

export const FINANCIAL_SERVICES: ServiceItem[] = [
  {
    title: "Consórcio Planejado",
    description: "A melhor forma de poupar e conquistar bens sem pagar juros. Planos flexíveis que cabem no bolso da sua família.",
    icon: PiggyBank
  },
  {
    title: "Financiamento Facilitado",
    description: "Comparamos as taxas de todos os bancos para você. Aprovamos seu crédito com rapidez e transparência.",
    icon: Percent
  },
  {
    title: "Crédito com Garantia",
    description: "Use seu imóvel para conseguir crédito barato (Home Equity) e invista no seu negócio ou reforme sua casa.",
    icon: TrendingUp
  }
];

export const BENEFITS: ServiceItem[] = [
  {
    title: "Moderno e Simples",
    description: "Assinaturas digitais e processos online para você não perder tempo em cartório, sem perder a segurança.",
    icon: ShieldCheck
  },
  {
    title: "Revisão Jurídica Total",
    description: "Segurança não é opcional. Todos os contratos são auditados por nosso corpo jurídico especializado.",
    icon: Scale
  },
  {
    title: "Solução Completa",
    description: "Resolvemos a documentação, o crédito e a entrega das chaves. Tudo em um só lugar.",
    icon: TrendingUp
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Ricardo Silva",
    role: "Morador da Zona Sul",
    content: "A finHouse facilitou demais. Consegui vender meu apartamento antigo e financiar o novo com uma taxa ótima, tudo muito rápido.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Mariana Costa",
    role: "Primeiro Imóvel",
    content: "Eu não entendia nada de burocracia. A equipe me explicou tudo e o consórcio foi a melhor escolha para o meu bolso.",
    image: "https://images.unsplash.com/photo-1573496359-7013ac2bebb6?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Carlos Eduardo",
    role: "Comerciante Local",
    content: "Usei minha casa para pegar crédito e reformar minha loja. O processo foi digital, mas o atendimento foi muito próximo.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "O que é Home Equity na finHouse?",
    answer: "É uma modalidade onde seu imóvel próprio serve de garantia para um empréstimo com juros muito baixos (a partir de 0.99% a.m.). É ideal para quem quer reformar, viajar ou investir no próprio negócio."
  },
  {
    question: "Vocês atendem presencialmente?",
    answer: "Sim! Somos uma empresa 'tech' para facilitar a burocracia, mas adoramos receber nossos clientes para um café em nosso escritório na Faria Lima."
  },
  {
    question: "O processo é seguro?",
    answer: "Totalmente. Utilizamos plataformas criptografadas para seus dados e temos uma equipe jurídica humana que analisa cada detalhe do contrato."
  },
  {
    question: "Ajudam a conseguir financiamento?",
    answer: "Com certeza. Somos parceiros dos principais bancos (Caixa, Itaú, Bradesco, etc) e buscamos a menor taxa para o seu perfil."
  }
];