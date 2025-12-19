
import React, { useState, useEffect } from 'react';
import { supabase, Property } from '../../supabaseClient';
import { 
  BarChart3, 
  Target, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  Info, 
  Share2, 
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';
import Button from '../Button';
import { COMPANY_PHONE } from '../../constants';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

const CmaTab: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [targetProperty, setTargetProperty] = useState<Property | null>(null);
  const [comparables, setComparables] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros de Comparativos
  const [filterNeighborhood, setFilterNeighborhood] = useState(true);
  const [filterCity, setFilterCity] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (data) setProperties(data as Property[]);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComparable = (prop: Property) => {
    if (comparables.find(c => c.id === prop.id)) {
      setComparables(comparables.filter(c => c.id !== prop.id));
    } else {
      if (comparables.length < 4) {
        setComparables([...comparables, prop]);
      } else {
        alert("Máximo de 4 imóveis comparáveis.");
      }
    }
  };

  const calculateStats = () => {
    if (comparables.length === 0) return { avgM2: 0 };
    const totalM2 = comparables.reduce((acc, p) => acc + (p.price / (p.area || 1)), 0);
    const avgM2 = totalM2 / comparables.length;
    return { avgM2 };
  };

  const { avgM2 } = calculateStats();
  const suggestedPrice = targetProperty ? avgM2 * targetProperty.area : 0;
  const priceDiff = targetProperty && suggestedPrice > 0 ? ((targetProperty.price - suggestedPrice) / suggestedPrice) * 100 : 0;

  const handleShareReport = () => {
    if (!targetProperty) return;
    const text = `Análise de Mercado finHouse\n\nImóvel Alvo: ${targetProperty.title}\nPreço Atual: ${formatCurrency(targetProperty.price)}\n\nBaseado em ${comparables.length} imóveis similares na região:\nPreço Médio m²: ${formatCurrency(avgM2)}\nPreço Sugerido: ${formatCurrency(suggestedPrice)}\n\nStatus: ${priceDiff > 5 ? 'Acima do mercado' : priceDiff < -5 ? 'Oportunidade (Abaixo)' : 'Preço Equilibrado'}\n\nGerado via finHouse OS`;
    window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Lógica de filtragem robusta (usando diretamente neighborhood e city da tabela properties)
  const availableComparables = properties.filter(p => {
    if (!targetProperty) return true;
    if (p.id === targetProperty.id) return false;
    
    // Normalização rigorosa para comparação (trim, lowerCase e fallback)
    const targetNeighborhood = (targetProperty.neighborhood || '').toString().trim().toLowerCase();
    const targetCity = (targetProperty.city || '').toString().trim().toLowerCase();
    const currentNeighborhood = (p.neighborhood || '').toString().trim().toLowerCase();
    const currentCity = (p.city || '').toString().trim().toLowerCase();

    // Filtro por Bairro
    if (filterNeighborhood && targetNeighborhood && currentNeighborhood !== targetNeighborhood) {
      return false;
    }
    
    // Filtro por Cidade
    if (filterCity && targetCity && currentCity !== targetCity) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Configuração e Seleção */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-brand-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={18} className="text-brand-accent" /> 1. Imóvel Alvo
            </h3>
            <select 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all cursor-pointer"
              onChange={(e) => {
                const selected = properties.find(p => p.id === parseInt(e.target.value));
                setTargetProperty(selected || null);
                setComparables([]); // Limpa comparativos ao trocar o alvo para evitar dados inconsistentes
              }}
              defaultValue=""
            >
              <option value="" disabled>Selecione o imóvel para avaliar...</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.neighborhood || 'Bairro N/I'})
                </option>
              ))}
            </select>
            {targetProperty && (!targetProperty.neighborhood || !targetProperty.city) && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-[10px] font-bold bg-red-50 p-3 rounded-xl">
                <AlertCircle size={14} />
                <span>Aviso: Imóvel alvo sem bairro ou cidade cadastrados.</span>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                <Layers size={18} className="text-brand-accent" /> 2. Comparáveis ({comparables.length}/4)
              </h3>
            </div>
            
            {/* Filtros de Sugestão */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setFilterNeighborhood(!filterNeighborhood)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${filterNeighborhood ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                <Filter size={10} /> Mesmo Bairro
              </button>
              <button 
                onClick={() => setFilterCity(!filterCity)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${filterCity ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                <Filter size={10} /> Mesma Cidade
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {availableComparables.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleComparable(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                    comparables.find(c => c.id === p.id) 
                    ? 'bg-indigo-50 border-brand-accent' 
                    : 'bg-white border-gray-100 hover:border-brand-accent/30'
                  }`}
                >
                  <div className="max-w-[80%]">
                    <p className="text-[10px] font-black text-brand-primary truncate uppercase">{p.title}</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                      <span className="text-brand-accent">{p.area}m²</span> • {p.neighborhood || 'N/I'} • {formatCurrency(p.price)}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    comparables.find(c => c.id === p.id) ? 'bg-brand-accent border-brand-accent' : 'border-gray-200'
                  }`}>
                    {comparables.find(c => c.id === p.id) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </button>
              ))}
              {availableComparables.length === 0 && !loading && (
                <div className="py-10 text-center">
                  <Search size={24} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-[10px] text-gray-400 font-bold italic">Nenhum imóvel encontrado com os filtros ativos.</p>
                </div>
              )}
              {loading && <div className="py-10 text-center"><p className="text-[10px] text-gray-400 font-bold animate-pulse">Carregando mercado...</p></div>}
            </div>
          </div>
        </div>

        {/* Lado Direito: Análise e Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {!targetProperty ? (
            <div className="h-full min-h-[400px] bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center">
              <BarChart3 size={48} className="text-gray-200 mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Selecione o imóvel alvo para iniciar a análise comparativa</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Média m² Região</p>
                  <h4 className="text-3xl font-black text-brand-primary">{formatCurrency(avgM2)}</h4>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Preço Sugerido</p>
                  <h4 className="text-3xl font-black text-brand-accent">{formatCurrency(suggestedPrice)}</h4>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Status de Preço</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={priceDiff > 5 ? 'text-red-500' : 'text-green-500'} size={24} />
                    <h4 className={`text-2xl font-black ${priceDiff > 5 ? 'text-red-500' : 'text-green-500'}`}>
                      {priceDiff > 0 ? `+${priceDiff.toFixed(1)}%` : `${priceDiff.toFixed(1)}%`}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
                <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest">Tabela Comparativa Lado a Lado</h3>
                  <button onClick={handleShareReport} className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-accent hover:text-brand-primary transition-colors">
                    <Share2 size={14} /> Enviar p/ Cliente
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100/30 text-[9px] font-black text-gray-400 uppercase">
                      <tr>
                        <th className="px-8 py-4 border-none">Atributo</th>
                        <th className="px-8 py-4 bg-indigo-50/50 text-brand-accent border-none">Imóvel Alvo</th>
                        {comparables.map((c, i) => (
                          <th key={c.id} className="px-8 py-4 border-none">Comp. #{i+1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px] font-bold text-gray-700">
                      <tr>
                        <td className="px-8 py-4 text-gray-400 font-black">PREÇO</td>
                        <td className="px-8 py-4 bg-indigo-50/30 text-brand-accent">{formatCurrency(targetProperty.price)}</td>
                        {comparables.map(c => <td key={c.id} className="px-8 py-4">{formatCurrency(c.price)}</td>)}
                      </tr>
                      <tr>
                        <td className="px-8 py-4 text-gray-400 font-black">ÁREA (M²)</td>
                        <td className="px-8 py-4 bg-indigo-50/30">{targetProperty.area}m²</td>
                        {comparables.map(c => <td key={c.id} className="px-8 py-4">{c.area}m²</td>)}
                      </tr>
                      <tr>
                        <td className="px-8 py-4 text-gray-400 font-black">PREÇO / M²</td>
                        <td className="px-8 py-4 bg-indigo-50/30 font-black">{formatCurrency(targetProperty.price / (targetProperty.area || 1))}</td>
                        {comparables.map(c => <td key={c.id} className="px-8 py-4">{formatCurrency(c.price / (c.area || 1))}</td>)}
                      </tr>
                      <tr>
                        <td className="px-8 py-4 text-gray-400 font-black">QUARTOS</td>
                        <td className="px-8 py-4 bg-indigo-50/30">{targetProperty.quartos}</td>
                        {comparables.map(c => <td key={c.id} className="px-8 py-4">{c.quartos}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-brand-primary p-10 rounded-[2.5rem] text-white space-y-4 shadow-xl">
                <div className="flex items-center gap-3 text-brand-accent">
                  <Info size={20} />
                  <h4 className="text-xs font-black uppercase tracking-widest">Estratégia Recomendada</h4>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  O imóvel alvo está {Math.abs(priceDiff) < 5 ? 'muito próximo à média de preço da região.' : priceDiff > 0 ? `posicionado cerca de ${priceDiff.toFixed(1)}% acima dos comparáveis selecionados.` : `posicionado cerca de ${Math.abs(priceDiff).toFixed(1)}% abaixo da média local.`} 
                  {priceDiff > 5 && ' Considere destacar acabamentos premium ou negociar margens para acelerar a venda.'}
                  {priceDiff < -5 && ' Este imóvel representa uma excelente oportunidade de investimento agressivo.'}
                  A média atual de mercado nos imóveis selecionados é de <span className="text-brand-accent font-black">{formatCurrency(avgM2)}</span> por metro quadrado.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CmaTab;
