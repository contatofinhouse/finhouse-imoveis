import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/Button';
import { Download, Layout, Smartphone, Image as ImageIcon, CheckCircle, Lock, PenTool, Copy, RefreshCw, Search, Phone, Calculator, PieChart, DollarSign, Check, FileText, User, Briefcase, HeartHandshake, Key, Home, Banknote, ShieldAlert, Building2, UserCircle } from 'lucide-react';
import { supabase, Property } from '../supabaseClient';
import * as htmlToImage from 'html-to-image';

const BrokerTools: React.FC = () => {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'marketing' | 'calculator' | 'checklist'>('marketing');

  // --- MARKETING TOOL STATE ---
  const [format, setFormat] = useState<'story' | 'feed'>('story');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Editor State
  const [editorData, setEditorData] = useState({
    title: 'Oportunidade Exclusiva',
    location: 'São Paulo, SP',
    price: 'R$ 0,00',
    type: 'Venda',
    brokerName: 'Seu Nome',
    brokerPhone: '(11) 99999-9999',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800' // Default placeholder
  });

  // Description & Caption State
  const [generatedCaption, setGeneratedCaption] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // --- CALCULATOR STATE ---
  const [calcData, setCalcData] = useState({
    propertyValue: 500000,
    downPayment: 100000,
    interestRate: 9.5, // Default fallback
    years: 30
  });

  // --- CHECKLIST STATE ---
  const [checklistType, setChecklistType] = useState<'sale' | 'rent'>('sale'); // Venda ou Locação
  const [checklistRole, setChecklistRole] = useState<'buyer' | 'seller'>('buyer'); // Comprador/Inquilino ou Vendedor/Proprietário
  const [paymentType, setPaymentType] = useState<'finance' | 'cash'>('finance'); // Financiamento ou À Vista
  
  const [checklistProfile, setChecklistProfile] = useState({
    regime: 'clt', // clt | business
    marital: 'single', // single | married
    useFgts: false,
    sellerType: 'pf', // pf | pj
    sellerHasCompany: false // true | false (se PF tem empresa)
  });
  const [checklistCopied, setChecklistCopied] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'mortgage_interest_rate')
        .single();

      if (data && data.value) {
        setCalcData(prev => ({
          ...prev,
          interestRate: parseFloat(data.value)
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar configurações globais (usando padrão 9.5%):', err);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setProperties(data as Property[]);
      }
    } catch (err) {
      console.error("Erro ao buscar imóveis", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatPhone = (val: string) => {
    return val.replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditorData({...editorData, brokerPhone: formatPhone(e.target.value.substring(0, 15))});
  };

  // --- MARKETING FUNCTIONS ---

  const handlePropertySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = parseInt(e.target.value);
    const prop = properties.find(p => p.id === propId);
    
    if (prop) {
      setSelectedProperty(prop);
      
      const firstImage = (prop.images && prop.images.length > 0) ? prop.images[0] : editorData.image;
      
      setEditorData({
        ...editorData,
        title: prop.title,
        location: prop.neighborhood ? `${prop.neighborhood}, ${prop.city}` : prop.address,
        price: formatCurrency(prop.price),
        type: prop.type,
        image: firstImage
      });

      generateCaptionText(prop);
    }
  };

  const generateCaptionText = (prop: Property) => {
    const hashtags = `#${prop.type.toLowerCase().replace(/\s/g, '')} #imoveis #${prop.city?.toLowerCase().replace(/\s/g, '') || 'sp'} #${prop.neighborhood?.toLowerCase().replace(/\s/g, '') || 'bairro'} #finhouse #oportunidade`;
    const text = `🏡 ${prop.title.toUpperCase()}\n\n📍 ${prop.address}\n\n${prop.description || 'Imóvel incrível com excelente localização e acabamento impecável.'}\n\n💰 Valor: ${formatCurrency(prop.price)}\n${prop.condominio > 0 ? `🏢 Condomínio: ${formatCurrency(prop.condominio)}\n` : ''}📐 Área: ${prop.area}m² | 🛏 ${prop.quartos} Quartos | 🚗 ${prop.vagas} Vagas\n\n📲 Me chame agora para agendar uma visita!\n\n${hashtags}`;
    setGeneratedCaption(text);
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    setDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        style: { margin: '0' },
        fontEmbedCSS: '', 
        filter: (node) => {
           if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
             return false;
           }
           return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `finhouse-${selectedProperty?.id || 'post'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Houve um erro ao gerar a imagem.");
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCaption) return;

    const performCopy = () => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(generatedCaption)
            .then(performCopy)
            .catch(() => fallbackCopyTextToClipboard(generatedCaption, performCopy));
    } else {
        fallbackCopyTextToClipboard(generatedCaption, performCopy);
    }
  };

  const fallbackCopyTextToClipboard = (text: string, onSuccess: () => void) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; 
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
          const successful = document.execCommand('copy');
          if (successful) onSuccess();
          else alert("Não foi possível copiar automaticamente.");
      } catch (err) {
          alert("Erro ao copiar. Selecione o texto manualmente.");
      }
      document.body.removeChild(textArea);
  };

  // --- CALCULATOR FUNCTIONS ---

  const calculateFinance = () => {
    const P = calcData.propertyValue - calcData.downPayment; // Principal
    const r = (calcData.interestRate / 100) / 12; // Monthly Rate
    const n = calcData.years * 12; // Months

    // Simple SAC approximation for first installment: (P/n) + (P * r)
    const amortization = P / n;
    const interest = P * r;
    const firstInstallment = amortization + interest;
    
    // Required Income (Rule of 30%)
    const requiredIncome = firstInstallment / 0.3;

    return {
        principal: P,
        firstInstallment,
        requiredIncome
    };
  };

  const financeResult = calculateFinance();

  // --- CHECKLIST FUNCTIONS ---

  const generateChecklist = () => {
    let list = `📋 *CHECKLIST DE DOCUMENTAÇÃO - finHouse*\n`;
    
    // --- SCENARIO 1: RENT (LOCAÇÃO) ---
    if (checklistType === 'rent') {
        if (checklistRole === 'buyer') { // Tenant (Inquilino)
            list += `*Para Análise de Locação (Pessoa Física)*\n\n`;
            list += `1️⃣ *Identificação*\n- RG e CPF (ou CNH)\n- Comprovante de Residência Atual\n\n`;
            list += `2️⃣ *Renda (Mínimo 3x Aluguel)*\n`;
            if (checklistProfile.regime === 'clt') {
                list += `- 3 últimos Holerites\n- Carteira de Trabalho (Páginas principais)\n- Declaração de IR Completa (se houver)\n`;
            } else {
                list += `- Extrato Bancário (últimos 3 meses)\n- Declaração de IR Completa\n- DECORE (se houver)\n`;
            }
        } else { // Landlord (Proprietário)
            list += `*Documentos do Imóvel e Proprietário (Locação)*\n\n`;
            list += `- RG e CPF dos proprietários\n- Matrícula do Imóvel Atualizada\n- Capa do IPTU (ano corrente)\n- Comprovante de endereço\n- Últimos boletos de condomínio pagos\n`;
        }
    } 
    
    // --- SCENARIO 2: SALE (COMPRA E VENDA) ---
    else {
        if (checklistRole === 'seller') { // Vendedor
            if (checklistProfile.sellerType === 'pj') {
                // VENDEDOR PESSOA JURÍDICA
                list += `*Checklist do Vendedor (Pessoa Jurídica)*\n\n`;
                list += `1️⃣ *Documentos da Empresa*\n`;
                list += `- Contrato Social + Última Alteração (Consolidada)\n`;
                list += `- Cartão CNPJ atualizado\n`;
                list += `- Certidão Simplificada da Junta Comercial (Máx 30 dias)\n`;
                list += `- CNDs da Empresa (Federal, Estadual, Municipal, Trabalhista)\n\n`;
                
                list += `2️⃣ *Sócios/Representantes*\n`;
                list += `- RG e CPF (ou CNH) dos sócios administradores\n`;
                list += `- Comprovante de endereço dos sócios\n\n`;
            } else {
                // VENDEDOR PESSOA FÍSICA
                list += `*Checklist do Vendedor (Pessoa Física)*\n\n`;
                
                list += `1️⃣ *Vendedores*\n`;
                list += `- RG e CPF (ou CNH)\n`;
                list += `- Comprovante de Residência atualizado\n`;
                if (checklistProfile.marital === 'married') {
                    list += `- Certidão de Casamento\n`;
                    list += `- Pacto Antenupcial (se houver)\n`;
                    list += `- Documentos do Cônjuge (RG/CPF)\n`;
                } else {
                    list += `- Certidão de Nascimento atualizada\n`;
                }
                
                if (checklistProfile.sellerHasCompany) {
                    list += `\n⚠️ *Como Sócio de Empresa:*\n`;
                    list += `- Cartão CNPJ da(s) empresa(s)\n`;
                    list += `- CNDs da(s) empresa(s) para análise de risco\n`;
                }
            }

            // IMÓVEL (Comum a ambos)
            list += `\n🏠 *Imóvel*\n`;
            list += `- Matrícula Atualizada (Vintenária)\n`;
            list += `- Capa do IPTU (ano corrente)\n`;
            list += `- Declaração de Inexistência de Débitos Condominiais (se aplicável)\n`;

        } else { // Comprador
            if (paymentType === 'cash') { // À Vista
                list += `*Compra de Imóvel - Pagamento à Vista*\n\n`;
                list += `1️⃣ *Pessoa Física*\n- RG e CPF (ou CNH)\n- Comprovante de Residência atualizado\n- Certidão de Estado Civil (Nascimento/Casamento)\n`;
                list += `\n*Obs:* Comprovante de origem dos recursos pode ser solicitado para compliance (COAF).\n`;
            } else { // Financiamento
                list += `*Análise de Crédito Imobiliário (Financiamento)*\n\n`;
                
                // 1. Identificação
                list += `1️⃣ *Identificação*\n`;
                list += `- RG e CPF (ou CNH válida)\n`;
                list += `- Comprovante de Residência atualizado (Máx 60 dias)\n`;
                if (checklistProfile.marital === 'married') {
                    list += `- Certidão de Casamento\n`;
                    list += `- RG e CPF do Cônjuge\n`;
                } else {
                    list += `- Certidão de Nascimento\n`;
                }
                list += `\n`;

                // 2. Renda
                list += `2️⃣ *Comprovação de Renda*\n`;
                if (checklistProfile.regime === 'clt') {
                    list += `- 3 últimos Holerites\n`;
                    list += `- Carteira de Trabalho Digital (PDF completo)\n`;
                    list += `- Extrato do IR (Imposto de Renda) + Recibo\n`;
                } else {
                    list += `- Extrato Bancário (PF e/ou PJ) dos últimos 6 meses\n`;
                    list += `- Extrato do IR (Imposto de Renda) + Recibo\n`;
                    list += `- Contrato Social (se tiver empresa)\n`;
                }
                list += `\n`;

                // 3. FGTS
                if (checklistProfile.useFgts) {
                    list += `3️⃣ *Uso do FGTS*\n`;
                    list += `- Extrato do FGTS atualizado\n`;
                    list += `- Carteira de Trabalho (para comprovar 3 anos de regime)\n`;
                    if (checklistProfile.marital === 'married') {
                        list += `- Declaração de 1º Imóvel (p/ somar renda)\n`;
                    }
                }
            }
        }
    }

    list += `\n*** Documentos adicionais podem ser solicitados.`;

    return list;
  };

  const copyChecklist = () => {
    const text = generateChecklist();
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            setChecklistCopied(true);
            setTimeout(() => setChecklistCopied(false), 2000);
        });
    } else {
        fallbackCopyTextToClipboard(text, () => {
            setChecklistCopied(true);
            setTimeout(() => setChecklistCopied(false), 2000);
        });
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50">
      
      {/* Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-brand-primary rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="relative z-10 text-center xl:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/30 text-brand-accent border border-brand-accent/50 text-xs font-bold uppercase tracking-wider mb-3">
              Área do Corretor
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Ferramentas de Venda
            </h1>
            <p className="text-gray-300 text-sm max-w-xl">
              Tudo o que você precisa para atender melhor e vender mais.
            </p>
          </div>
          
          {/* Tabs Switcher */}
          <div className="bg-white/10 p-1.5 rounded-xl flex flex-wrap justify-center gap-2 relative z-10 backdrop-blur-sm border border-white/10">
            <button
                onClick={() => setActiveTab('marketing')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'marketing' 
                    ? 'bg-brand-accent text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
                <ImageIcon size={18} /> <span className="hidden md:inline">Gerador de </span>Posts
            </button>
            <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'calculator' 
                    ? 'bg-brand-accent text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
                <Calculator size={18} /> Simulador
            </button>
            <button
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'checklist' 
                    ? 'bg-brand-accent text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
                <FileText size={18} /> Checklist
            </button>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>
      </div>

      {/* --- TAB 1: MARKETING GENERATOR --- */}
      {activeTab === 'marketing' && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
        
        {/* Left Column: Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Select Property */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
                    <Search size={18} className="text-brand-accent" /> 1. Selecione o Imóvel
                </h3>
                <div className="relative">
                    <select 
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-brand-accent text-sm"
                        onChange={handlePropertySelect}
                        defaultValue=""
                    >
                        <option value="" disabled>Escolha um imóvel da lista...</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.title} - {formatCurrency(p.price)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 2. Customize Art */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
                    <PenTool size={18} className="text-brand-accent" /> 2. Personalize
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Formato</label>
                        <div className="flex gap-2">
                        <button 
                            onClick={() => setFormat('story')}
                            className={`flex-1 py-2 px-2 rounded-lg border flex items-center justify-center gap-2 transition-all text-xs ${
                            format === 'story' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <Smartphone size={14} /> Story
                        </button>
                        <button 
                            onClick={() => setFormat('feed')}
                            className={`flex-1 py-2 px-2 rounded-lg border flex items-center justify-center gap-2 transition-all text-xs ${
                            format === 'feed' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <Layout size={14} /> Feed
                        </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Seu Nome</label>
                             <input type="text" className="w-full px-3 py-2 border rounded-lg text-xs" value={editorData.brokerName} onChange={e => setEditorData({...editorData, brokerName: e.target.value})} />
                         </div>
                         <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Preço (Display)</label>
                             <input type="text" className="w-full px-3 py-2 border rounded-lg text-xs" value={editorData.price} onChange={e => setEditorData({...editorData, price: e.target.value})} />
                         </div>
                    </div>
                    
                    <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">Seu WhatsApp</label>
                         <div className="relative">
                            <Phone size={14} className="absolute left-3 top-2.5 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs" 
                                value={editorData.brokerPhone} 
                                onChange={handlePhoneChange} 
                                placeholder="(00) 00000-0000"
                            />
                         </div>
                    </div>

                    {selectedProperty && selectedProperty.images && selectedProperty.images.length > 0 && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Escolha a Foto de Fundo</label>
                            <div className="grid grid-cols-4 gap-2">
                                {selectedProperty.images.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setEditorData({...editorData, image: img})}
                                        className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${editorData.image === img ? 'border-brand-accent' : 'border-transparent'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="thumb" crossOrigin="anonymous" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Description Generator */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-brand-primary flex items-center gap-2">
                        <CheckCircle size={18} className="text-brand-accent" /> 3. Legenda Pronta
                    </h3>
                    <button 
                        onClick={copyToClipboard} 
                        className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded transition-all font-semibold ${
                            copySuccess 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-brand-accent/5 text-brand-accent hover:bg-brand-accent/10'
                        }`}
                    >
                        {copySuccess ? (
                            <><Check size={12} /> Legenda Copiada!</>
                        ) : (
                            <><Copy size={12} /> Copiar Texto</>
                        )}
                    </button>
                </div>
                <textarea 
                    className="w-full h-32 p-3 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-brand-accent resize-none"
                    value={generatedCaption}
                    onChange={(e) => setGeneratedCaption(e.target.value)}
                ></textarea>
                <p className="text-[10px] text-gray-400 mt-1">Hashtags e emojis incluídos automaticamente.</p>
            </div>
        </div>

        {/* Center/Right: Preview & Download (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
             
             {/* Canvas Container */}
             <div className="bg-gray-200 border border-gray-300 rounded-3xl p-8 w-full flex items-center justify-center min-h-[600px] overflow-hidden relative shadow-inner">
                
                <div 
                  ref={previewRef}
                  className={`relative flex-shrink-0 bg-white shadow-2xl overflow-hidden text-white select-none ${
                    format === 'story' ? 'w-[360px] h-[640px]' : 'w-[500px] h-[500px]'
                  }`}
                >
                    <img 
                        src={editorData.image} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        alt="Background" 
                        crossOrigin="anonymous" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30"></div>
                    
                    <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-start">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                            <span className="font-bold text-lg tracking-wider">fin<span className="text-brand-accent">House</span></span>
                        </div>
                        <div className="bg-brand-accent/90 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide shadow-lg">
                            {editorData.type}
                        </div>
                    </div>

                    <div className="absolute top-24 right-0 flex flex-col items-end gap-2">
                        <div className="bg-white text-brand-dark px-4 py-2 rounded-l-full font-bold text-sm shadow-lg transform translate-x-1">
                            👤 {editorData.brokerName}
                        </div>
                        {editorData.brokerPhone && (
                            <div className="bg-[#25D366] text-white px-4 py-1.5 rounded-l-full font-bold text-xs shadow-lg flex items-center gap-1 transform translate-x-1">
                                <Smartphone size={12} /> {editorData.brokerPhone}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <div className="border-l-4 border-brand-accent pl-4 mb-4">
                            <h2 className={`${format === 'story' ? 'text-3xl' : 'text-3xl'} font-bold leading-tight mb-2 text-white drop-shadow-md`}>
                                {editorData.title}
                            </h2>
                            <p className="text-gray-200 text-sm flex items-center gap-1 font-medium">
                                <span className="opacity-80">📍</span> {editorData.location}
                            </p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-300 uppercase tracking-widest mb-0.5">Investimento</p>
                                <p className="text-2xl font-bold text-white">{editorData.price}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-brand-accent flex items-center justify-center">
                                <CheckCircle size={16} className="text-white" />
                            </div>
                        </div>

                        <div className="text-center mt-6 opacity-60 text-[10px] tracking-[0.2em] uppercase">
                            finhousebr.com.br
                        </div>
                    </div>
                </div>

             </div>

             <div className="mt-8 w-full max-w-md">
                <Button 
                    fullWidth 
                    onClick={handleDownload} 
                    disabled={downloading || !selectedProperty}
                    className="py-4 text-lg shadow-xl shadow-brand-accent/20"
                >
                    {downloading ? (
                        <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> Gerando Imagem...</span>
                    ) : (
                        <span className="flex items-center gap-2"><Download /> Baixar Arte em Alta Resolução</span>
                    )}
                </Button>
             </div>

        </div>
      </div>
      )}

      {/* --- TAB 2: CALCULATOR --- */}
      {activeTab === 'calculator' && (
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Inputs */}
                <div className="p-8 md:p-10 space-y-6">
                    <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2 mb-6">
                        <PieChart className="text-brand-accent" /> Parâmetros do Financiamento
                    </h3>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Valor do Imóvel</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-bold text-sm">R$</span>
                            <input 
                                type="number" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand-accent focus:bg-gray-50 font-bold text-gray-800"
                                value={calcData.propertyValue}
                                onChange={(e) => setCalcData({...calcData, propertyValue: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Valor da Entrada</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-bold text-sm">R$</span>
                            <input 
                                type="number" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand-accent focus:bg-gray-50 font-bold text-gray-800"
                                value={calcData.downPayment}
                                onChange={(e) => setCalcData({...calcData, downPayment: Number(e.target.value)})}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Mínimo sugerido: {formatCurrency(calcData.propertyValue * 0.2)} (20%)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Taxa Anual (%)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                readOnly
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-bold text-gray-500 cursor-not-allowed"
                                value={calcData.interestRate}
                                title="Taxa definida pela administração"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Prazo (Anos)</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand-accent focus:bg-gray-50 font-bold text-gray-800"
                                value={calcData.years}
                                onChange={(e) => setCalcData({...calcData, years: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-brand-primary p-8 md:p-10 text-white flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-200">
                        <DollarSign className="text-brand-accent" /> Estimativa de Crédito
                    </h3>

                    <div className="space-y-8">
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Valor Financiado</p>
                            <p className="text-3xl font-bold">{formatCurrency(financeResult.principal)}</p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Primeira Parcela (SAC)</p>
                            <p className="text-4xl font-bold text-brand-accent">{formatCurrency(financeResult.firstInstallment)}</p>
                            <p className="text-xs text-gray-400 mt-1">*Valor aproximado, não inclui seguros.</p>
                        </div>

                        <div className="pt-8 border-t border-gray-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Renda Mínima Familiar</p>
                                    <p className="text-xl font-bold">{formatCurrency(financeResult.requiredIncome)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Comprometimento</p>
                                    <p className="text-xl font-bold text-green-400">30%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-center text-gray-400 text-sm mt-6 max-w-2xl mx-auto">
                * Esta simulação não substitui a análise de crédito oficial. Os valores de parcela consideram o sistema SAC (parcelas decrescentes) e não incluem taxas administrativas e seguros obrigatórios (DFI/MIP). A taxa de juros utilizada foi de {calcData.interestRate}% a.a.
            </p>
         </div>
      )}

      {/* --- TAB 3: CHECKLIST --- */}
      {activeTab === 'checklist' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10">
                    <h3 className="text-2xl font-bold text-brand-primary flex items-center gap-2 mb-2">
                        <FileText className="text-brand-accent" /> Checklist Inteligente
                    </h3>
                    <p className="text-gray-600 mb-8">
                        Selecione as opções abaixo para gerar a lista exata de documentos.
                    </p>

                    {/* Step 1: Operation & Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                        {/* Type: Sale vs Rent */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">1. Tipo de Negócio</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button 
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${checklistType === 'sale' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setChecklistType('sale')}
                                >
                                    <Home size={16} /> Compra/Venda
                                </button>
                                <button 
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${checklistType === 'rent' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setChecklistType('rent')}
                                >
                                    <Key size={16} /> Locação
                                </button>
                            </div>
                        </div>

                        {/* Role: Buyer vs Seller */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">2. Para quem é a lista?</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button 
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${checklistRole === 'buyer' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setChecklistRole('buyer')}
                                >
                                    <User size={16} /> {checklistType === 'sale' ? 'Comprador' : 'Inquilino'}
                                </button>
                                <button 
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${checklistRole === 'seller' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setChecklistRole('seller')}
                                >
                                    <Briefcase size={16} /> {checklistType === 'sale' ? 'Vendedor' : 'Proprietário'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Payment Type (Only for Sale + Buyer) */}
                    {checklistType === 'sale' && checklistRole === 'buyer' && (
                        <div className="mb-8 animate-fade-in-up">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">3. Forma de Pagamento</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-all ${paymentType === 'finance' ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentType" 
                                        className="hidden" 
                                        checked={paymentType === 'finance'} 
                                        onChange={() => setPaymentType('finance')} 
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 font-bold text-gray-800">
                                            <Banknote className="text-brand-accent" size={20} /> Financiamento
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">Uso de FGTS, Carta de Crédito ou Banco</span>
                                    </div>
                                </label>
                                <label className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-all ${paymentType === 'cash' ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentType" 
                                        className="hidden" 
                                        checked={paymentType === 'cash'} 
                                        onChange={() => setPaymentType('cash')} 
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 font-bold text-gray-800">
                                            <DollarSign className="text-green-600" size={20} /> À Vista
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">Recursos próprios (TED/PIX)</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 2 (Seller): Seller Profile (PF vs PJ) */}
                    {checklistType === 'sale' && checklistRole === 'seller' && (
                        <div className="mb-8 animate-fade-in-up">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">3. Tipo de Vendedor</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-all ${checklistProfile.sellerType === 'pf' ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="sellerType" 
                                        className="hidden" 
                                        checked={checklistProfile.sellerType === 'pf'} 
                                        onChange={() => setChecklistProfile({...checklistProfile, sellerType: 'pf'})} 
                                    />
                                    <div className="flex items-center gap-3">
                                        <UserCircle className={checklistProfile.sellerType === 'pf' ? "text-brand-accent" : "text-gray-400"} size={24} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">Pessoa Física</span>
                                            <span className="text-xs text-gray-500">CPF</span>
                                        </div>
                                    </div>
                                </label>
                                <label className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-all ${checklistProfile.sellerType === 'pj' ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="sellerType" 
                                        className="hidden" 
                                        checked={checklistProfile.sellerType === 'pj'} 
                                        onChange={() => setChecklistProfile({...checklistProfile, sellerType: 'pj'})} 
                                    />
                                    <div className="flex items-center gap-3">
                                        <Building2 className={checklistProfile.sellerType === 'pj' ? "text-brand-accent" : "text-gray-400"} size={24} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">Pessoa Jurídica</span>
                                            <span className="text-xs text-gray-500">CNPJ / Holding</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Detailed Profile */}
                    {/* CASE 1: Buyer Finance / Renter */}
                    {((checklistType === 'sale' && checklistRole === 'buyer' && paymentType === 'finance') || (checklistType === 'rent' && checklistRole === 'buyer')) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
                            {/* Regime */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Regime</label>
                                <div className="flex flex-col gap-2">
                                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${checklistProfile.regime === 'clt' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="regime" 
                                            className="hidden" 
                                            checked={checklistProfile.regime === 'clt'} 
                                            onChange={() => setChecklistProfile({...checklistProfile, regime: 'clt'})} 
                                        />
                                        <span className="font-semibold text-sm">Assalariado (CLT)</span>
                                    </label>
                                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${checklistProfile.regime === 'business' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="regime" 
                                            className="hidden" 
                                            checked={checklistProfile.regime === 'business'} 
                                            onChange={() => setChecklistProfile({...checklistProfile, regime: 'business'})} 
                                        />
                                        <span className="font-semibold text-sm">Autônomo / PJ</span>
                                    </label>
                                </div>
                            </div>

                            {/* Marital */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Estado Civil</label>
                                <div className="flex flex-col gap-2">
                                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${checklistProfile.marital === 'single' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="marital" 
                                            className="hidden" 
                                            checked={checklistProfile.marital === 'single'} 
                                            onChange={() => setChecklistProfile({...checklistProfile, marital: 'single'})} 
                                        />
                                        <span className="font-semibold text-sm">Solteiro(a)</span>
                                    </label>
                                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${checklistProfile.marital === 'married' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="marital" 
                                            className="hidden" 
                                            checked={checklistProfile.marital === 'married'} 
                                            onChange={() => setChecklistProfile({...checklistProfile, marital: 'married'})} 
                                        />
                                        <span className="font-semibold text-sm">Casado(a)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Extras - Only for Finance */}
                            {checklistType === 'sale' && paymentType === 'finance' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Recursos</label>
                                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all h-[46px] ${checklistProfile.useFgts ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-brand-accent rounded focus:ring-brand-accent border-gray-300 mr-3"
                                            checked={checklistProfile.useFgts} 
                                            onChange={(e) => setChecklistProfile({...checklistProfile, useFgts: e.target.checked})} 
                                        />
                                        <span className="font-semibold text-sm">Usar FGTS?</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CASE 2: Seller PF Details */}
                    {checklistType === 'sale' && checklistRole === 'seller' && checklistProfile.sellerType === 'pf' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
                             {/* Marital */}
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Estado Civil</label>
                                <div className="flex flex-col gap-2">
                                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${checklistProfile.marital === 'single' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="marital" 
                                            className="hidden" 
                                            checked={checklistProfile.marital === 'single'} 
                                            onChange={() => setChecklistProfile({...checklistProfile, marital: 'single'})} 
                                        />
                                        <span className="font-semibold text-sm">Solteiro(a)</span>
                                    </label>
                                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${checklistProfile.marital === 'married' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="marital" 
                                            className="hidden" 
                                            checked={checklistProfile.marital === 'married'} 
                                            onChange={() => setChecklistProfile({...checklistProfile, marital: 'married'})} 
                                        />
                                        <span className="font-semibold text-sm">Casado(a)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Company Owner */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Empresarial</label>
                                <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all h-[46px] ${checklistProfile.sellerHasCompany ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-brand-accent rounded focus:ring-brand-accent border-gray-300 mr-3"
                                        checked={checklistProfile.sellerHasCompany} 
                                        onChange={(e) => setChecklistProfile({...checklistProfile, sellerHasCompany: e.target.checked})} 
                                    />
                                    <span className="font-semibold text-sm">Possui Empresa / Sócio?</span>
                                </label>
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">Necessário apresentar CND da empresa.</p>
                            </div>
                        </div>
                    )}


                    {/* Output Area */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Prévia do Texto</h4>
                        <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {generateChecklist()}
                        </div>
                        
                        <div className="mt-6 flex justify-between items-center">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <ShieldAlert size={12} /> Isenção de responsabilidade inclusa.
                            </span>
                            <Button onClick={copyChecklist} className="flex items-center gap-2 shadow-lg shadow-brand-accent/20">
                                {checklistCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                {checklistCopied ? 'Copiado para WhatsApp!' : 'Copiar Lista'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default BrokerTools;