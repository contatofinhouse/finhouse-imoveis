
import React, { useState } from 'react';
import { Users, ImageIcon, Sparkles, ClipboardList, Calculator, FileText } from 'lucide-react';

// Importação dos componentes modulares
import LeadsTab from '../components/broker/LeadsTab';
import MarketingTab from '../components/broker/MarketingTab';
import ScriptsTab from '../components/broker/ScriptsTab';
import VistoriaTab from '../components/broker/VistoriaTab';
import SimuladorTab from '../components/broker/SimuladorTab';
import ChecklistTab from '../components/broker/ChecklistTab';

const BrokerTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'marketing' | 'pitch' | 'vistoria' | 'calculator' | 'checklist'>('leads');

  const tabs = [
    { id: 'leads', label: 'Leads (CRM)', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: ImageIcon },
    { id: 'pitch', label: 'Scripts', icon: Sparkles },
    { id: 'vistoria', label: 'Vistoria', icon: ClipboardList },
    { id: 'calculator', label: 'Simulador', icon: Calculator },
    { id: 'checklist', label: 'Checklist', icon: FileText },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'leads': return <LeadsTab />;
      case 'marketing': return <MarketingTab />;
      case 'pitch': return <ScriptsTab />;
      case 'vistoria': return <VistoriaTab />;
      case 'calculator': return <SimuladorTab />;
      case 'checklist': return <ChecklistTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="bg-brand-primary rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-8">
          <div className="relative z-10 text-center xl:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/30 text-brand-accent border border-brand-accent/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4">CÉLULA DE INTELIGÊNCIA</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">finHouse <span className="text-brand-accent">OS</span></h1>
            <p className="text-gray-400 text-sm max-w-md font-light">Ferramentas de alta performance integradas em um único ecossistema.</p>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl flex flex-wrap justify-center gap-2 relative z-10 backdrop-blur-xl border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default BrokerTools;
