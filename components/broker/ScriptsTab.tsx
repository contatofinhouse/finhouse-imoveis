
import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Copy } from 'lucide-react';
import { supabase, Property } from '../../supabaseClient';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const ScriptsTab: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [pitch, setPitch] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from('properties').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setProperties(data as Property[]); });
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prop = properties.find(p => p.id === parseInt(e.target.value));
    if (prop) {
      setPitch(`🚀 PITCH ESTRATÉGICO finHouse\n\nImóvel: ${prop.title}\nBairro: ${prop.neighborhood}\nValor: ${formatCurrency(prop.price)}\n\nAbordagem Sugerida: "Olá, vi seu interesse no imóvel em ${prop.neighborhood}. Ele está com uma excelente condição de financiamento pela finHouse, com taxas exclusivas de ${prop.taxa || '9.5'}% AA. O custo efetivo total está imbatível. Vamos agendar uma visita amanhã às 10h?"`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up">
      <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><Sparkles size={16} /> Gerador de Scripts</h3>
        <select className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-bold" onChange={handleSelect}>
          <option value="">Selecione um imóvel...</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>)}
        </select>
      </div>
      <div className="lg:col-span-7 bg-brand-primary p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-2xl font-black uppercase tracking-tighter">Script Sugerido</h3>
          <button onClick={() => {navigator.clipboard.writeText(pitch); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className="bg-white text-brand-primary px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</button>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl font-mono text-xs whitespace-pre-wrap leading-relaxed relative z-10 h-64 overflow-y-auto uppercase no-scrollbar">
          {pitch || "Selecione um imóvel ao lado para gerar o roteiro..."}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>
    </div>
  );
};

export default ScriptsTab;
