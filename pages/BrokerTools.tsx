
import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/Button';
import { 
  Download, Layout, Smartphone, Image as ImageIcon, CheckCircle, 
  PenTool, Copy, RefreshCw, Search, Calculator, 
  PieChart, DollarSign, Check, FileText, User, 
  Printer, Building, Trash2, ClipboardList, Plus, Minus, 
  Camera, AlertTriangle, ShieldCheck, Home, Briefcase, Scale, MapPin, Type as TypeIcon, Globe, Phone, Users
} from 'lucide-react';
import { supabase, Property } from '../supabaseClient';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { COMPANY_NAME, COMPANY_CNPJ, COMPANY_ADDRESS, COMPANY_PHONE } from '../constants';

interface VistoriaPhoto {
  url: string;
  label: string;
}

const BrokerTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketing' | 'calculator' | 'checklist' | 'vistoria'>('marketing');

  // --- MARKETING TOOL STATE ---
  const [format, setFormat] = useState<'story' | 'feed'>('story');
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editorData, setEditorData] = useState({
    title: 'OPORTUNIDADE EXCLUSIVA',
    location: 'SÃO PAULO, SP',
    price: 'R$ 0,00',
    brokerName: 'SEU NOME',
    brokerPhone: '(11) 99999-9999',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800' 
  });
  const [generatedCaption, setGeneratedCaption] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // --- CALCULATOR STATE ---
  const [calcData, setCalcData] = useState({ propertyValue: 500000, downPayment: 100000, interestRate: 9.5, years: 30 });

  // --- CHECKLIST STATE ---
  const [checklistType, setChecklistType] = useState<'sale' | 'rent'>('sale');
  const [checklistRole, setChecklistRole] = useState<'buyer' | 'seller'>('buyer');
  const [paymentType, setPaymentType] = useState<'finance' | 'cash'>('finance'); 
  const [sellerType, setSellerType] = useState<'pf' | 'pj'>('pf');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [isEntrepreneur, setIsEntrepreneur] = useState(false);
  const [checklistCopied, setChecklistCopied] = useState(false);

  // --- VISTORIA STATE ---
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const laudoRef = useRef<HTMLDivElement>(null);
  const anexoRef = useRef<HTMLDivElement>(null);
  const [vistoriaPhotos, setVistoriaPhotos] = useState<VistoriaPhoto[]>([]);
  const [vistoriaData, setVistoriaData] = useState({
    tipo: 'ENTRADA',
    data: new Date().toISOString().split('T')[0],
    imovel: '',
    proprietario: '',
    inquilino: '',
    vistoriador: '',
    comodos: [
      { nome: 'SALA', estado: 'BOM', obs: '' },
      { nome: 'COZINHA', estado: 'BOM', obs: '' },
      { nome: 'BANHEIRO', estado: 'BOM', obs: '' },
      { nome: 'QUARTO 1', estado: 'BOM', obs: '' }
    ]
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (data) setProperties(data as Property[]);
    } catch (err) {}
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // --- MARKETING ACTIONS ---
  const handlePropertySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = parseInt(e.target.value);
    const prop = properties.find(p => p.id === propId);
    if (prop) {
      setSelectedProperty(prop);
      setEditorData({ 
        ...editorData, 
        title: prop.title.toUpperCase(), 
        location: (prop.neighborhood ? `${prop.neighborhood}, ${prop.city}` : prop.address).toUpperCase(), 
        price: formatCurrency(prop.price), 
        image: prop.images[0] || editorData.image 
      });
      setGeneratedCaption(`OPORTUNIDADE finHouse\n\nIMOVEL: ${prop.title.toUpperCase()}\nLOCAL: ${prop.address.toUpperCase()}\n\nVALOR: ${formatCurrency(prop.price)}\nAREA: ${prop.area}M2 | ${prop.quartos} QUARTOS\n\nME CHAME AGORA PARA AGENDAR UMA VISITA!`);
    }
  };

  const handleDownloadMarketing = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#0f172a' });
      const link = document.createElement('a');
      link.download = `finHouse-${format}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally { setDownloading(false); }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // --- CHECKLIST GENERATOR ---
  const generateChecklist = () => {
    let list = `CHECKLIST DE AUDITORIA - finHouse\n`;
    list += `FINALIDADE: ${checklistType === 'sale' ? 'COMPRA E VENDA' : 'LOCACAO'}\n`;
    list += `PERFIL: ${checklistRole === 'buyer' ? 'COMPRADOR / INQUILINO' : 'VENDEDOR / PROPRIETARIO'}\n`;
    list += `-------------------------------------------\n\n`;

    if (checklistRole === 'seller') {
        if (sellerType === 'pf') {
            list += `* DOCS. VENDEDOR (PESSOA FISICA):\n`;
            list += `[ ] RG E CPF (OU CNH VALIDA)\n`;
            list += `[ ] COMPROVANTE DE RESIDENCIA (ULTIMOS 60 DIAS)\n`;
            list += `[ ] CERTIDAO DE ESTADO CIVIL (ATUALIZADA 90 DIAS)\n`;
            
            if (maritalStatus === 'married') {
                list += `[ ] DOCUMENTOS DO CONJUGE (RG/CPF)\n`;
                list += `[ ] PACTO ANTENUPCIAL (SE HOUVER)\n`;
                list += `NOTA: CONJUGE DEVE ASSINAR A VENIA CONJUGAL.\n`;
            }

            if (isEntrepreneur) {
                list += `\n* AUDITORIA DE RISCO (SOCIO / EMPRESARIO):\n`;
                list += `[ ] CND DE TRIBUTOS FEDERAIS DA(S) EMPRESA(S)\n`;
                list += `[ ] CND TRABALHISTA DA PJ (TST/BNDT)\n`;
                list += `[ ] CERTIDAO DE FALENCIA E RECUPERACAO JUDICIAL\n`;
                list += `JUSTIFICATIVA: EVITAR FRAUDE A EXECUCAO POR DESCONSIDERACAO DA PJ.\n`;
            }

            list += `\n* CERTIDOES DO VENDEDOR (PF):\n`;
            list += `[ ] CERTIDAO DE PROTESTOS (CARTORIOS 1 A 10)\n`;
            list += `[ ] CERTIDAO DISTRIBUIDOR CIVEL E CRIMINAL (ESTADUAL/FEDERAL)\n`;
            list += `[ ] CERTIDAO NEGATIVA DE DEBITOS TRABALHISTAS (CNDT)\n`;
        } else {
            list += `* DOCS. VENDEDOR (PESSOA JURIDICA):\n`;
            list += `[ ] CONTRATO SOCIAL CONSOLIDADO OU ESTATUTO\n`;
            list += `[ ] CARTAO CNPJ ATUALIZADO\n`;
            list += `[ ] CERTIDAO SIMPLIFICADA DA JUCESP\n`;
            list += `[ ] RG/CPF DOS SOCIOS ADMINISTRADORES\n`;
            list += `[ ] CND DE TRIBUTOS FEDERAIS E INSS\n`;
            list += `[ ] CND DE TRIBUTOS ESTADUAIS E MUNICIPAIS\n`;
            list += `[ ] CND TRABALHISTA (PJ)\n`;
            list += `[ ] CERTIDAO DE FALENCIA E RECUPERACAO JUDICIAL\n`;
        }

        list += `\n* DOCUMENTACAO DO IMOVEL:\n`;
        list += `[ ] MATRICULA ATUALIZADA COM ONUS E REIPERSECUTORIA\n`;
        list += `[ ] CAPA DO IPTU (EXERCICIO ATUAL)\n`;
        list += `[ ] CERTIDAO NEGATIVA DE DEBITOS MUNICIPAIS DO IMOVEL\n`;
        list += `[ ] DECLARACAO DE QUITACAO CONDOMINIAL (ASSINADA PELO SINDICO)\n`;
    } else {
        list += `* DOCUMENTACAO PESSOAL:\n`;
        list += `[ ] RG E CPF\n`;
        list += `[ ] COMPROVANTE DE RESIDENCIA\n`;
        list += `[ ] COMPROVANTE DE ESTADO CIVIL\n\n`;
        
        list += `* COMPROVACAO DE RENDA:\n`;
        list += `[ ] 3 ULTIMOS HOLERITES (CLT) OU EXTRATOS 3 MESES (AUTONOMO)\n`;
        list += `[ ] DECLARACAO COMPLETA DE IRPF + RECIBO DE ENTREGA\n`;
        
        if (paymentType === 'finance') {
            list += `\n* PARA FINANCIAMENTO:\n`;
            list += `[ ] EXTRATO FGTS (SE FOR UTILIZAR)\n`;
            list += `[ ] FICHA CADASTRAL DO BANCO PREENCHIDA\n`;
        }
    }

    return list;
  };

  const copyChecklist = () => {
    navigator.clipboard.writeText(generateChecklist()).then(() => {
      setChecklistCopied(true);
      setTimeout(() => setChecklistCopied(false), 2000);
    });
  };

  // --- VISTORIA ACTIONS ---
  const handleVistoriaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newPhotos = files.map(file => ({ url: URL.createObjectURL(file), label: '' }));
      setVistoriaPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleGeneratePDF = async () => {
    if (!laudoRef.current || !anexoRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const laudoImg = await htmlToImage.toPng(laudoRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdfH = (doc.getImageProperties(laudoImg).height * pdfWidth) / doc.getImageProperties(laudoImg).width;
      doc.addImage(laudoImg, 'PNG', 0, 0, pdfWidth, pdfH);
      if (vistoriaPhotos.length > 0) {
        doc.addPage();
        const anexoImg = await htmlToImage.toPng(anexoRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
        const anexoH = (doc.getImageProperties(anexoImg).height * pdfWidth) / doc.getImageProperties(anexoImg).width;
        doc.addImage(anexoImg, 'PNG', 0, 0, pdfWidth, anexoH);
      }
      doc.save(`VISTORIA_${vistoriaData.inquilino || 'finHouse'}.pdf`);
    } finally { setIsGeneratingPDF(false); }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-brand-primary rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-8">
          <div className="relative z-10 text-center xl:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/30 text-brand-accent border border-brand-accent/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4">CELULA DE INTELIGENCIA</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">finHouse <span className="text-brand-accent">OS</span></h1>
            <p className="text-gray-400 text-sm max-w-md font-light">Ecossistema de alta performance para o consultor imobiliario moderno.</p>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl flex flex-wrap justify-center gap-2 relative z-10 backdrop-blur-xl border border-white/10">
            <button onClick={() => setActiveTab('marketing')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'marketing' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><ImageIcon size={16} /> Marketing</button>
            <button onClick={() => setActiveTab('vistoria')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'vistoria' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><ClipboardList size={16} /> Vistoria</button>
            <button onClick={() => setActiveTab('calculator')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'calculator' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Calculator size={16} /> Simulador</button>
            <button onClick={() => setActiveTab('checklist')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'checklist' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><FileText size={16} /> Checklist</button>
          </div>
        </div>
      </div>

      {/* --- TAB: MARKETING --- */}
      {activeTab === 'marketing' && (
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
               <h3 className="font-black text-brand-primary mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><Search size={16} className="text-brand-accent" /> 1. Escolha o Imovel</h3>
               <select className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-2 focus:ring-brand-accent transition-all font-bold" onChange={handlePropertySelect} defaultValue="">
                  <option value="" disabled>Selecione um imovel do banco...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>)}
               </select>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
               <h3 className="font-black text-brand-primary mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><PenTool size={16} className="text-brand-accent" /> 2. Personalizar Arte</h3>
               
               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Formato das Redes</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl">
                      <button onClick={() => setFormat('story')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${format === 'story' ? 'bg-white text-brand-primary shadow-sm border border-gray-100' : 'text-gray-400'}`}><Smartphone size={14}/> Story</button>
                      <button onClick={() => setFormat('feed')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${format === 'feed' ? 'bg-white text-brand-primary shadow-sm border border-gray-100' : 'text-gray-400'}`}><Layout size={14}/> Feed</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Titulo na Arte</label>
                    <input type="text" className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 text-xs font-bold uppercase" value={editorData.title} onChange={e => setEditorData({...editorData, title: e.target.value.toUpperCase()})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Localizacao</label>
                    <input type="text" className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 text-xs font-bold uppercase" value={editorData.location} onChange={e => setEditorData({...editorData, location: e.target.value.toUpperCase()})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Consultor</label>
                    <input type="text" className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 text-xs font-bold uppercase" value={editorData.brokerName} onChange={e => setEditorData({...editorData, brokerName: e.target.value.toUpperCase()})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp do Consultor</label>
                    <input type="text" className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 text-xs font-bold" value={editorData.brokerPhone} onChange={e => setEditorData({...editorData, brokerPhone: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="bg-brand-primary p-8 rounded-[2rem] shadow-xl text-white">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black uppercase text-[10px] tracking-widest text-brand-accent">3. Legenda & Copy</h3>
                  <button onClick={copyCaption} className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full font-black uppercase transition-all">
                    {copySuccess ? 'Copiado!' : 'Copiar'}
                  </button>
               </div>
               <textarea className="w-full h-32 p-4 text-[10px] bg-white/5 border border-white/10 rounded-2xl resize-none font-mono text-gray-300 leading-relaxed uppercase" value={generatedCaption} readOnly></textarea>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="bg-gray-200 p-8 md:p-12 rounded-[3rem] w-full flex items-center justify-center min-h-[700px] shadow-inner overflow-hidden">
               <div ref={previewRef} className={`relative shadow-2xl overflow-hidden bg-brand-dark transition-all duration-500 ${format === 'story' ? 'w-[360px] h-[640px]' : 'w-[500px] h-[500px]'}`}>
                  <img src={editorData.image} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-brand-dark/40"></div>
                  
                  <div className="absolute top-10 left-10 right-10 flex justify-between items-start">
                     <div className="text-white font-black text-2xl tracking-tighter uppercase">finHouse</div>
                     <div className="text-right flex flex-col items-end">
                        <span className="text-white font-black text-[10px] uppercase tracking-widest mb-1">finhousebr.com.br</span>
                        <div className="h-0.5 w-10 bg-brand-accent"></div>
                     </div>
                  </div>

                  <div className="absolute bottom-12 left-10 right-10 text-white space-y-4">
                     <div className="space-y-1">
                        <span className="bg-brand-accent text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">{editorData.price}</span>
                        <h2 className={`font-black leading-none uppercase break-words ${format === 'story' ? 'text-4xl' : 'text-5xl'}`}>
                          {editorData.title}
                        </h2>
                     </div>
                     
                     <div className="flex items-center gap-2 text-brand-accent">
                        <MapPin size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{editorData.location}</span>
                     </div>

                     <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                             <User size={12} className="text-brand-accent" />
                             <p className="text-[10px] font-black uppercase tracking-tighter">{editorData.brokerName}</p>
                           </div>
                           <div className="flex items-center gap-2">
                             <Phone size={12} className="text-brand-accent" />
                             <p className="text-[10px] font-black uppercase tracking-tighter">{editorData.brokerPhone}</p>
                           </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                           <Globe size={16} className="text-brand-accent" />
                        </div>
                     </div>
                  </div>

                  <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl"></div>
               </div>
            </div>
            
            <Button onClick={handleDownloadMarketing} disabled={downloading || !selectedProperty} className="mt-8 w-full max-w-md py-5 rounded-2xl shadow-2xl shadow-brand-accent/20 text-xs font-black uppercase tracking-[0.2em]">
               {downloading ? <RefreshCw className="animate-spin" /> : <Download />} {downloading ? 'Processando Imagem...' : 'Baixar Arte em HD'}
            </Button>
            <p className="text-[10px] text-gray-400 mt-4 uppercase font-black tracking-widest">A imagem sera salva em 300 DPI para maxima fidelidade.</p>
          </div>
        </div>
      )}

      {/* --- TAB: CHECKLIST --- */}
      {activeTab === 'checklist' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2 mb-6 uppercase tracking-tighter"><Scale className="text-brand-accent" /> Perfil da Transacao</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Operacao</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                                <button onClick={() => setChecklistType('sale')} className={`py-2 rounded-lg text-xs font-bold transition-all uppercase ${checklistType === 'sale' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500'}`}>Venda</button>
                                <button onClick={() => setChecklistType('rent')} className={`py-2 rounded-lg text-xs font-bold transition-all uppercase ${checklistType === 'rent' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500'}`}>Locacao</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Cliente Atendido</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                                <button onClick={() => setChecklistRole('buyer')} className={`py-2 rounded-lg text-xs font-bold transition-all uppercase ${checklistRole === 'buyer' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500'}`}>{checklistType === 'sale' ? 'Comprador' : 'Locatario'}</button>
                                <button onClick={() => setChecklistRole('seller')} className={`py-2 rounded-lg text-xs font-bold transition-all uppercase ${checklistRole === 'seller' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500'}`}>{checklistType === 'sale' ? 'Vendedor' : 'Proprietario'}</button>
                            </div>
                        </div>
                        {checklistRole === 'seller' && (
                            <div className="p-5 bg-brand-light border border-gray-100 rounded-2xl space-y-4 animate-fade-in">
                                <h4 className="text-sm font-bold text-brand-accent flex items-center gap-2 uppercase tracking-tighter"><Briefcase size={16}/> Detalhes do Vendedor</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setSellerType('pf')} className={`py-2 px-3 rounded-lg text-[10px] font-bold border uppercase ${sellerType === 'pf' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-gray-500 border-gray-200'}`}>Pessoa Fisica</button>
                                    <button onClick={() => setSellerType('pj')} className={`py-2 px-3 rounded-lg text-[10px] font-bold border uppercase ${sellerType === 'pj' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-gray-500 border-gray-200'}`}>Pessoa Juridica</button>
                                </div>
                                {sellerType === 'pf' && (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Estado Civil</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setMaritalStatus('single')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase ${maritalStatus === 'single' ? 'bg-brand-primary text-white' : 'bg-white text-gray-400 border'}`}>Solteiro/Divorciado</button>
                                                <button onClick={() => setMaritalStatus('married')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase ${maritalStatus === 'married' ? 'bg-brand-primary text-white' : 'bg-white text-gray-400 border'}`}>Casado/Uniao E.</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                            <div>
                                                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter">O Vendedor e Socio/Empresario?</p>
                                                <p className="text-[9px] text-gray-400 uppercase font-light">Ativa auditoria de risco da PJ</p>
                                            </div>
                                            <button onClick={() => setIsEntrepreneur(!isEntrepreneur)} className={`w-10 h-6 rounded-full transition-all flex items-center px-1 ${isEntrepreneur ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {checklistRole === 'buyer' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pagamento</label>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                                    <button onClick={() => setPaymentType('cash')} className={`py-2 rounded-lg text-xs font-bold transition-all uppercase ${paymentType === 'cash' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500'}`}>A Vista</button>
                                    <button onClick={() => setPaymentType('finance')} className={`py-2 rounded-lg text-xs font-bold transition-all uppercase ${paymentType === 'finance' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500'}`}>Financiamento</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-7">
                <div className="bg-brand-primary p-10 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Scale size={120} /></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div><h3 className="text-2xl font-bold uppercase tracking-tighter">Listagem Gerada</h3><p className="text-gray-400 text-sm uppercase font-light">Pronta para envio ao cliente.</p></div>
                        <button onClick={copyChecklist} className="flex items-center gap-2 bg-white text-brand-primary px-5 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-transform active:scale-95 uppercase">
                            {checklistCopied ? <CheckCircle size={16} /> : <Copy size={16} />}{checklistCopied ? 'Copiado!' : 'Copiar Tudo'}
                        </button>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative z-10">
                        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-gray-200 uppercase">{generateChecklist()}</pre>
                    </div>
                    <div className="mt-8 flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-[10px] text-yellow-200 relative z-10">
                        <AlertTriangle size={24} className="shrink-0" />
                        <p className="uppercase">Este checklist e uma base tecnica. Sempre valide certidoes de distribuidor estadual e federal (civel e criminal) para seguranca total.</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- TAB: VISTORIA --- */}
      {activeTab === 'vistoria' && (
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6 h-[75vh] overflow-y-auto no-scrollbar">
                 <div className="flex justify-between items-center border-b pb-4 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2 uppercase tracking-tighter">Vistoria Digital</h3>
                    <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="h-10 py-0 text-[10px] font-black uppercase">{isGeneratingPDF ? '...' : 'PDF'}</Button>
                 </div>
                 <div className="space-y-4">
                    <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-bold uppercase" placeholder="ENDERECO" value={vistoriaData.imovel} onChange={e => setVistoriaData({...vistoriaData, imovel: e.target.value.toUpperCase()})} />
                    <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-bold uppercase" placeholder="INQUILINO" value={vistoriaData.inquilino} onChange={e => setVistoriaData({...vistoriaData, inquilino: e.target.value.toUpperCase()})} />
                    <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-bold uppercase" placeholder="VISTORIADOR" value={vistoriaData.vistoriador} onChange={e => setVistoriaData({...vistoriaData, vistoriador: e.target.value.toUpperCase()})} />
                    <div className="space-y-2">
                       {vistoriaData.comodos.map((c, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <input type="text" className="font-bold text-xs bg-transparent w-full mb-2 uppercase" value={c.nome} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].nome = e.target.value.toUpperCase(); setVistoriaData({...vistoriaData, comodos: cp})}} />
                            <div className="flex gap-2">
                                <select className="text-[10px] p-2 rounded-lg border bg-white font-bold uppercase" value={c.estado} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].estado = e.target.value.toUpperCase(); setVistoriaData({...vistoriaData, comodos: cp})}}>
                                    <option>BOM</option>
                                    <option>REGULAR</option>
                                    <option>RUIM</option>
                                </select>
                                <input type="text" className="flex-grow text-[10px] p-2 rounded-lg border bg-white uppercase font-medium" placeholder="OBS" value={c.obs} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].obs = e.target.value.toUpperCase(); setVistoriaData({...vistoriaData, comodos: cp})}} />
                            </div>
                          </div>
                       ))}
                    </div>
                    <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <Camera className="text-gray-300" size={32}/>
                        <span className="text-[10px] font-black mt-2 uppercase">Anexar Provas</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleVistoriaPhotoUpload}/>
                    </label>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-7 bg-gray-200 p-8 rounded-[3rem] overflow-y-auto max-h-[75vh] shadow-inner no-scrollbar flex flex-col items-center">
              <div ref={laudoRef} className="bg-white p-[50px] shadow-2xl text-brand-dark flex flex-col font-sans" style={{ width: '800px', minHeight: '1130px' }}>
                 <div className="flex justify-between items-end border-b-2 border-brand-accent pb-6 mb-10"><div><h1 className="text-2xl font-black uppercase tracking-tighter">Laudo de Vistoria</h1><p className="text-[10px] text-brand-accent font-black uppercase tracking-[0.3em]">Certificacao finHouse</p></div><div className="text-right text-[8px] text-gray-400 font-bold uppercase"><p>CNPJ: {COMPANY_CNPJ}</p><p>{COMPANY_ADDRESS.street}</p></div></div>
                 <div className="grid grid-cols-2 gap-4 text-[11px] mb-10 bg-gray-50 p-6 rounded-2xl uppercase font-bold">
                    <p><span className="font-black text-gray-400">Endereço:</span> {vistoriaData.imovel || '---'}</p>
                    <p><span className="font-black text-gray-400">Data:</span> {new Date(vistoriaData.data).toLocaleDateString('pt-BR')}</p>
                    <p><span className="font-black text-gray-400">Inquilino:</span> {vistoriaData.inquilino || '---'}</p>
                    <p><span className="font-black text-gray-400">Vistoriador:</span> {vistoriaData.vistoriador || '---'}</p>
                 </div>
                 <div className="space-y-4"><table className="w-full text-[10px]"><thead className="bg-brand-primary text-white uppercase font-black"><tr><th className="p-3 text-left">Ambiente</th><th className="p-3 text-left">Estado</th><th className="p-3 text-left">Observacoes</th></tr></thead><tbody className="divide-y">{vistoriaData.comodos.map((c, i) => (<tr key={i}><td className="p-3 font-bold uppercase">{c.nome}</td><td className="p-3 uppercase font-bold text-brand-accent">{c.estado}</td><td className="p-3 text-gray-500 uppercase">{c.obs || 'NENHUMA RESSALVA.'}</td></tr>))}</tbody></table></div>
                 <div className="mt-auto pt-10 border-t flex justify-between px-10"><div className="border-t w-40 pt-2 text-center text-[9px] font-black uppercase tracking-widest">Locatario</div><div className="border-t w-40 pt-2 text-center text-[9px] font-black uppercase tracking-widest">Vistoriador</div></div>
              </div>
              <div ref={anexoRef} className="bg-white p-[50px] shadow-2xl text-brand-dark flex flex-col font-sans" style={{ width: '800px', minHeight: '1130px' }}><h2 className="text-xl font-black uppercase border-b-2 border-brand-accent pb-4 mb-8">Anexo Fotografico</h2><div className="grid grid-cols-2 gap-8">{vistoriaPhotos.map((p, i) => (<div key={i} className="space-y-2 border p-3 rounded-2xl bg-gray-50"><div className="bg-white rounded-xl overflow-hidden flex items-center justify-center h-[180px]"><img src={p.url} className="max-w-full h-auto max-h-full object-contain" crossOrigin="anonymous" /></div><p className="text-[10px] font-black uppercase text-brand-primary">#{i + 1} REGISTRO LOCAL</p></div>))}</div></div>
           </div>
        </div>
      )}

      {/* --- TAB: CALCULATOR (RESTORED FULL) --- */}
      {activeTab === 'calculator' && (
         <div className="max-w-5xl mx-auto px-4 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-10 space-y-6">
                  <h3 className="text-xl font-black text-brand-primary uppercase tracking-tighter flex items-center gap-2"><PieChart className="text-brand-accent" /> Simulacao SAC</h3>
                  
                  <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor Imovel</label>
                        <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold uppercase focus:ring-2 focus:ring-brand-accent outline-none" value={calcData.propertyValue} onChange={e => setCalcData({...calcData, propertyValue: Number(e.target.value)})} />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entrada</label>
                        <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold uppercase focus:ring-2 focus:ring-brand-accent outline-none" value={calcData.downPayment} onChange={e => setCalcData({...calcData, downPayment: Number(e.target.value)})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Taxa (% AA)</label>
                            <input type="number" step="0.1" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold uppercase focus:ring-2 focus:ring-brand-accent outline-none" value={calcData.interestRate} onChange={e => setCalcData({...calcData, interestRate: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Anos</label>
                            <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold uppercase focus:ring-2 focus:ring-brand-accent outline-none" value={calcData.years} onChange={e => setCalcData({...calcData, years: Number(e.target.value)})} />
                        </div>
                    </div>
                  </div>
               </div>
               
               <div className="bg-brand-primary p-10 text-white flex flex-col justify-center">
                  <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">Estimativa de Parcela (INICIAL)</p>
                  <p className="text-5xl font-black">{formatCurrency(((calcData.propertyValue - calcData.downPayment) / (calcData.years * 12)) + ((calcData.propertyValue - calcData.downPayment) * (calcData.interestRate/100/12)))}</p>
                  
                  <div className="mt-8 space-y-2 border-t border-white/10 pt-8">
                     <div className="flex justify-between text-xs">
                        <span className="text-gray-400 uppercase font-black">Financiado:</span>
                        <span className="font-bold">{formatCurrency(calcData.propertyValue - calcData.downPayment)}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                        <span className="text-gray-400 uppercase font-black">Amortizacao Mes:</span>
                        <span className="font-bold">{formatCurrency((calcData.propertyValue - calcData.downPayment) / (calcData.years * 12))}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                        <span className="text-gray-400 uppercase font-black">Juros Mes:</span>
                        <span className="font-bold">{formatCurrency((calcData.propertyValue - calcData.downPayment) * (calcData.interestRate/100/12))}</span>
                     </div>
                  </div>

                  <Button variant="white" fullWidth className="mt-10 py-4 shadow-2xl uppercase font-black tracking-widest" onClick={() => window.open(`https://wa.me/${COMPANY_PHONE}`, '_blank')}>Aprovar Credito</Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default BrokerTools;
