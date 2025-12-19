
import React, { useState } from 'react';
import { Calculator, PieChart, Landmark, ArrowRight } from 'lucide-react';
import Button from '../Button';
import { COMPANY_PHONE } from '../../constants';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const SimuladorTab: React.FC = () => {
  const [calcData, setCalcData] = useState({ 
    propertyValue: 500000, 
    downPayment: 100000, 
    interestRate: 9.5, 
    years: 30,
    itbiRate: 3.0 
  });

  const estimatedEscritura = (val: number) => Math.min(val * 0.005, 6500);
  const estimatedRegistro = (val: number) => Math.min(val * 0.003, 3500);

  const calculatedInstallment = () => {
    const principal = calcData.propertyValue - calcData.downPayment;
    if (principal <= 0) return 0;
    const months = Math.max(calcData.years, 1) * 12;
    const monthlyRate = (calcData.interestRate / 100) / 12;
    const amortization = principal / months;
    const interest = principal * monthlyRate;
    return amortization + interest;
  };

  const totalFees = () => {
    const itbi = calcData.propertyValue * (calcData.itbiRate / 100);
    const escritura = estimatedEscritura(calcData.propertyValue);
    const registro = estimatedRegistro(calcData.propertyValue);
    return itbi + escritura + registro;
  };

  const handleFinancingConsult = () => {
    const text = `Solicitação de Consulta Financiamento finHouse (Simulador):\n\nValor Imóvel: ${formatCurrency(calcData.propertyValue)}\nEntrada: ${formatCurrency(calcData.downPayment)}\nPrazo: ${calcData.years} anos\nParcela Estimada: ${formatCurrency(calculatedInstallment())}`;
    window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 animate-fade-in-up space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tighter flex items-center gap-3 italic"><PieChart className="text-brand-accent" /> Configuração</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor do Imóvel</label>
                <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-xl font-bold border-none focus:ring-2 focus:ring-brand-accent transition-all" value={calcData.propertyValue} onChange={e => setCalcData({...calcData, propertyValue: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entrada / FGTS</label>
                <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-xl font-bold border-none focus:ring-2 focus:ring-brand-accent transition-all" value={calcData.downPayment} onChange={e => setCalcData({...calcData, downPayment: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Taxa (% AA)</label>
                  <input type="number" step="0.1" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold border-none focus:ring-2 focus:ring-brand-accent transition-all" value={calcData.interestRate} onChange={e => setCalcData({...calcData, interestRate: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Anos</label>
                  <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold border-none focus:ring-2 focus:ring-brand-accent transition-all" value={calcData.years} onChange={e => setCalcData({...calcData, years: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-brand-accent p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-accent/20">
             <div className="flex items-center gap-4 mb-4">
                <Landmark size={32}/>
                <div>
                   <h4 className="text-lg font-black uppercase tracking-tight leading-none">Financiamento finHouse</h4>
                   <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Soluções com as menores taxas</p>
                </div>
             </div>
             <p className="text-xs font-medium leading-relaxed mb-6">Taxas personalizadas a partir de 0.99% + TR para Home Equity ou planos SAC com aprovação em 24h.</p>
             <button 
               onClick={handleFinancingConsult}
               className="w-full bg-white text-brand-accent py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-light transition-all shadow-md"
             >
                Abrir consulta financiamento finhouse <ArrowRight size={14}/>
             </button>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 gap-6">
          <div className="bg-brand-primary p-12 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl min-h-[300px]">
            <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-3 relative z-10">Parcela inicial estimada (SAC)</p>
            <p className="text-7xl font-black relative z-10 tracking-tighter italic">{formatCurrency(calculatedInstallment())}</p>
            <div className="mt-10 space-y-3 border-t border-white/10 pt-10 relative z-10">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Saldo para Financiamento:</span>
                <span>{formatCurrency(calcData.propertyValue - calcData.downPayment)}</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Custos Aproximados de Transferência</p>
            <p className="text-4xl font-black text-brand-primary tracking-tighter italic">{formatCurrency(totalFees())}</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">ITBI ({calcData.itbiRate}%)</p>
                <p className="font-bold text-brand-primary">{formatCurrency(calcData.propertyValue * (calcData.itbiRate/100))}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Escritura/Registro</p>
                <p className="font-bold text-brand-primary">{formatCurrency(estimatedEscritura(calcData.propertyValue) + estimatedRegistro(calcData.propertyValue))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimuladorTab;
