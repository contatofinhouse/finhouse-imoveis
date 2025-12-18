
import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/Button';
import { 
  Download, Layout, Smartphone, Image as ImageIcon, CheckCircle, 
  PenTool, Copy, RefreshCw, Search, Calculator, 
  PieChart, DollarSign, Check, FileText, User, 
  ClipboardList, Plus, Minus, 
  Camera, AlertTriangle, ShieldCheck, Home, Briefcase, Scale, MapPin, Type as TypeIcon, Globe, Phone, Users, Coins, PlusCircle, XCircle
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

  // --- CALCULATOR & FEES STATE ---
  const [calcData, setCalcData] = useState({ 
    propertyValue: 500000, 
    downPayment: 100000, 
    interestRate: 9.5, 
    years: 30,
    itbiRate: 3.0 
  });

  const estimatedEscritura = (val: number) => Math.min(val * 0.005, 6500);
  const estimatedRegistro = (val: number) => Math.min(val * 0.003, 3500);

  // --- CHECKLIST STATE ---
  const [checklistType, setChecklistType] = useState<'sale' | 'rent'>('sale');
  const [checklistRole, setChecklistRole] = useState<'buyer' | 'seller'>('buyer');
  const [paymentType, setPaymentType] = useState<'finance' | 'cash'>('finance'); 
  const [useFGTS, setUseFGTS] = useState(false);
  const [sellerType, setSellerType] = useState<'pf' | 'pj'>('pf');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [isEntrepreneur, setIsEntrepreneur] = useState(false);
  const [checklistCopied, setChecklistCopied] = useState(false);

  // --- VISTORIA STATE ---
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const laudoRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [vistoriaPhotos, setVistoriaPhotos] = useState<VistoriaPhoto[]>([]);
  const [vistoriaData, setVistoriaData] = useState({
    tipo: 'Entrada',
    data: new Date().toISOString().split('T')[0],
    imovel: '',
    proprietario: '',
    inquilino: '',
    vistoriador: '',
    comodos: [
      { nome: 'Sala', estado: 'Bom', obs: '' },
      { nome: 'Cozinha', estado: 'Bom', obs: '' },
      { nome: 'Banheiro', estado: 'Bom', obs: '' },
      { nome: 'Quarto 1', estado: 'Bom', obs: '' }
    ],
    areaServico: { tanque: 'Ok', torneira: 'Ok', tomadas: 'Ok', obs: '' },
    instalacoes: { eletrica: 'Funcionando', hidraulica: 'Funcionando', gas: 'Encanado' },
    itensEntregues: { chaves: '0', controles: '0', tags: '0' }
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
      
      setCalcData(prev => ({
        ...prev,
        propertyValue: prop.price,
        interestRate: prop.taxa || prev.interestRate
      }));

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

  // --- CHECKLIST ACTIONS ---
  const generateChecklist = () => {
    let list = `CHECKLIST DE AUDITORIA - finHouse\n`;
    list += `FINALIDADE: ${checklistType === 'sale' ? 'COMPRA E VENDA' : 'LOCAÇÃO'}\n`;
    list += `PERFIL: ${checklistRole === 'buyer' ? 'COMPRADOR' : 'VENDEDOR'}\n`;
    list += `-------------------------------------------\n\n`;
    
    if (checklistRole === 'seller') {
        if (sellerType === 'pf') {
            list += `* DOCS. VENDEDOR (PESSOA FÍSICA):\n[ ] RG E CPF (OU CNH VÁLIDA)\n[ ] COMPROVANTE DE RESIDÊNCIA (ÚLTIMOS 60 DIAS)\n[ ] CERTIDÃO DE ESTADO CIVIL (ATUALIZADA 90 DIAS)\n`;
            if (maritalStatus === 'married') {
                list += `[ ] DOCUMENTOS DO CÔNJUGE (RG/CPF)\n[ ] CERTIDÃO DE CASAMENTO COM AVERBAÇÃO\n[ ] PACTO ANTENUPCIAL (SE HOUVER)\n`;
            }
            if (isEntrepreneur) {
                list += `\n* AUDITORIA DE RISCO (SÓCIO / EMPRESÁRIO):\n[ ] CND DE TRIBUTOS FEDERAIS DA(S) EMPRESA(S)\n[ ] CERTIDÃO DE FALÊNCIA E RECUPERAÇÃO JUDICIAL DA PJ\n[ ] CONTRATO SOCIAL DAS EMPRESAS (ÚLTIMA ALTERAÇÃO)\n`;
            }
        } else {
            list += `* DOCS. VENDEDOR (PESSOA JURÍDICA):\n[ ] CONTRATO SOCIAL CONSOLIDADO\n[ ] CARTÃO CNPJ ATUALIZADO\n[ ] CND DE TRIBUTOS FEDERAIS E INSS\n[ ] CERTIDÃO DE FALÊNCIA E RECUPERAÇÃO JUDICIAL\n[ ] RG/CPF DOS SÓCIOS ADMINISTRADORES\n`;
        }
        list += `\n* DOCUMENTAÇÃO DO IMÓVEL:\n[ ] MATRÍCULA ATUALIZADA (VINTENÁRIA COM NEGATIVA DE ÔNUS)\n[ ] CAPA DO IPTU (MOSTRANDO VALOR VENAL)\n[ ] CERTIDÃO NEGATIVA DE DÉBITOS MUNICIPAIS\n[ ] QUITAÇÃO CONDOMINIAL (ASSINADA PELO SÍNDICO)\n[ ] COMBUSTÍVEL/GÁS (DECLARAÇÃO DE QUITAÇÃO)`;
    } else {
        list += `* DOCUMENTAÇÃO PESSOAL (COMPRADOR):\n[ ] RG E CPF\n[ ] COMPROVANTE DE RESIDÊNCIA ATUAL\n[ ] CERTIDÃO DE ESTADO CIVIL ATUALIZADA\n`;
        
        if (maritalStatus === 'married') {
            list += `[ ] RG/CPF DO CÔNJUGE\n[ ] CERTIDÃO DE CASAMENTO\n`;
        }

        list += `\n* COMPROVAÇÃO DE RENDA:\n[ ] 3 ÚLTIMOS HOLERITES (OU DECORE SE AUTÔNOMO)\n[ ] EXTRATOS BANCÁRIOS (ÚLTIMOS 3 MESES)\n[ ] IRPF COMPLETO + RECIBO DE ENTREGA\n`;
        
        if (isEntrepreneur) {
            list += `[ ] CONTRATO SOCIAL DA EMPRESA\n[ ] CARTÃO CNPJ\n[ ] COMPROVANTE DE PRÓ-LABORE\n`;
        }

        if (paymentType === 'finance') {
            list += `\n* PARA FINANCIAMENTO:\n[ ] FICHA CADASTRAL BANCÁRIA PREENCHIDA\n[ ] AUTORIZAÇÃO DE CONSULTA AO SCR (BACEN)\n`;
            if (useFGTS) {
                list += `[ ] EXTRATO ATUALIZADO DO FGTS\n[ ] CARTEIRA DE TRABALHO (CÓPIA DAS PÁGINAS DE CONTRATO)\n[ ] DECLARAÇÃO DE OCUPAÇÃO DE IMÓVEL (PARA USO DO FGTS)\n`;
            }
        }
    }
    return list;
  };

  const copyChecklist = () => {
    const text = generateChecklist();
    navigator.clipboard.writeText(text);
    setChecklistCopied(true);
    setTimeout(() => setChecklistCopied(false), 2000);
  };

  // --- VISTORIA ACTIONS ---
  const addComodo = () => {
    setVistoriaData({
      ...vistoriaData,
      comodos: [...vistoriaData.comodos, { nome: 'Novo ambiente', estado: 'Bom', obs: '' }]
    });
  };

  const removeComodo = (index: number) => {
    const newComodos = vistoriaData.comodos.filter((_, i) => i !== index);
    setVistoriaData({ ...vistoriaData, comodos: newComodos });
  };

  const handleVistoriaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newPhotos = files.map(file => ({ url: URL.createObjectURL(file), label: '' }));
      setVistoriaPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleGeneratePDF = async () => {
    if (!laudoRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = doc.internal.pageSize.getWidth();
      
      const laudoImg = await htmlToImage.toPng(laudoRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdfH = (doc.getImageProperties(laudoImg).height * pdfWidth) / doc.getImageProperties(laudoImg).width;
      doc.addImage(laudoImg, 'PNG', 0, 0, pdfWidth, pdfH);

      for (let i = 0; i < vistoriaPhotos.length; i++) {
        const photoEl = photoRefs.current[i];
        if (photoEl) {
          doc.addPage();
          const photoImg = await htmlToImage.toPng(photoEl, { pixelRatio: 2, backgroundColor: '#ffffff' });
          const imgH = (doc.getImageProperties(photoImg).height * pdfWidth) / doc.getImageProperties(photoImg).width;
          doc.addImage(photoImg, 'PNG', 0, 0, pdfWidth, imgH);
        }
      }
      doc.save(`Vistoria_${vistoriaData.inquilino || 'finHouse'}.pdf`);
    } finally { setIsGeneratingPDF(false); }
  };

  const calculatedInstallment = () => {
    const financed = calcData.propertyValue - calcData.downPayment;
    if (financed <= 0) return 0;
    const amortization = financed / (calcData.years * 12);
    const interest = financed * (calcData.interestRate / 100 / 12);
    return amortization + interest;
  };

  const totalFees = () => {
    const itbi = calcData.propertyValue * (calcData.itbiRate / 100);
    const escritura = estimatedEscritura(calcData.propertyValue);
    const registro = estimatedRegistro(calcData.propertyValue);
    return itbi + escritura + registro;
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-brand-primary rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-8">
          <div className="relative z-10 text-center xl:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/30 text-brand-accent border border-brand-accent/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4">CÉLULA DE INTELIGÊNCIA</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">finHouse <span className="text-brand-accent">OS</span></h1>
            <p className="text-gray-400 text-sm max-w-md font-light">Ecossistema de alta performance para o consultor imobiliário moderno.</p>
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
               <h3 className="font-black text-brand-primary mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><Search size={16} className="text-brand-accent" /> 1. Escolha o Imóvel</h3>
               <select className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-2 focus:ring-brand-accent transition-all font-bold" onChange={handlePropertySelect} defaultValue="">
                  <option value="" disabled>Selecione um imóvel do banco...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>)}
               </select>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
               <h3 className="font-black text-brand-primary mb-2 flex items-center gap-2 uppercase text-xs tracking-widest"><PenTool size={16} className="text-brand-accent" /> 2. Personalizar Arte</h3>
               
               <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl mb-4">
                  <button onClick={() => setFormat('story')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${format === 'story' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400'}`}><Smartphone size={14}/> Story</button>
                  <button onClick={() => setFormat('feed')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${format === 'feed' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400'}`}><Layout size={14}/> Feed</button>
               </div>

               <input type="text" className="w-full p-3 border rounded-xl bg-gray-50 text-xs font-bold uppercase" value={editorData.title} onChange={e => setEditorData({...editorData, title: e.target.value.toUpperCase()})} placeholder="Título na Arte" />
               <input type="text" className="w-full p-3 border rounded-xl bg-gray-50 text-xs font-bold uppercase" value={editorData.brokerName} onChange={e => setEditorData({...editorData, brokerName: e.target.value.toUpperCase()})} placeholder="Seu Nome" />
               <input type="text" className="w-full p-3 border rounded-xl bg-gray-50 text-xs font-bold" value={editorData.brokerPhone} onChange={e => setEditorData({...editorData, brokerPhone: e.target.value})} placeholder="Seu WhatsApp" />
            </div>
            <div className="bg-brand-primary p-8 rounded-[2rem] text-white">
               <div className="flex justify-between items-center mb-4"><h3 className="text-[10px] font-black uppercase tracking-widest text-brand-accent">3. Legenda Sugerida</h3><button onClick={copyCaption} className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-black uppercase">{copySuccess ? 'Copiado!' : 'Copiar'}</button></div>
               <textarea className="w-full h-32 p-4 text-[10px] bg-white/5 border border-white/10 rounded-2xl resize-none font-mono uppercase" value={generatedCaption} readOnly></textarea>
            </div>
          </div>
          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="bg-gray-200 p-6 md:p-10 rounded-[3rem] w-full flex justify-center min-h-[600px] overflow-hidden shadow-inner">
               <div ref={previewRef} className={`relative shadow-2xl overflow-hidden bg-brand-dark transition-all duration-500 ${format === 'story' ? 'w-[320px] h-[568px]' : 'w-[450px] h-[450px]'}`}>
                  <img src={editorData.image} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-brand-dark/40"></div>
                  <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                     <div className="text-white font-black text-xl tracking-tighter">fin<span className="text-brand-accent">House</span></div>
                     <div className="flex flex-col items-end group">
                        <span className="text-[8px] text-white/90 font-black uppercase tracking-[0.2em]">FINHOUSEBR.COM.BR</span>
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-accent to-transparent mt-1 shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                     </div>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
                     <span className="bg-brand-accent text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest inline-block">{editorData.price}</span>
                     <h2 className={`font-black uppercase leading-none ${format === 'story' ? 'text-3xl' : 'text-4xl'}`}>{editorData.title}</h2>
                     <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1"><MapPin size={10}/> {editorData.location}</p>
                     
                     <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <div>
                           <p className="text-[8px] font-black uppercase text-brand-accent">Consultor</p>
                           <p className="text-[10px] font-bold uppercase">{editorData.brokerName}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black uppercase text-brand-accent">Contato</p>
                           <p className="text-[10px] font-bold">{editorData.brokerPhone}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <Button onClick={handleDownloadMarketing} disabled={downloading || !selectedProperty} className="mt-8 w-full max-w-md py-5 rounded-2xl shadow-xl shadow-brand-accent/20 text-xs font-black uppercase tracking-[0.2em]">
               {downloading ? <RefreshCw className="animate-spin" /> : <Download />} {downloading ? 'Gerando Arte...' : 'Baixar Imagem em HD'}
            </Button>
          </div>
        </div>
      )}

      {/* --- TAB: VISTORIA --- */}
      {activeTab === 'vistoria' && (
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up">
           <div className="lg:col-span-5 h-[80vh] overflow-y-auto no-scrollbar space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2 tracking-tighter">Ficha de vistoria</h3>
                    <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="h-9 py-0 text-[10px] font-black uppercase">
                       {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
                    </Button>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 mb-6">
                       <button onClick={() => setVistoriaData({...vistoriaData, tipo: 'Entrada'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${vistoriaData.tipo === 'Entrada' ? 'bg-brand-accent text-white shadow-lg' : 'text-gray-400'}`}>Entrada</button>
                       <button onClick={() => setVistoriaData({...vistoriaData, tipo: 'Saída'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${vistoriaData.tipo === 'Saída' ? 'bg-brand-accent text-white shadow-lg' : 'text-gray-400'}`}>Saída</button>
                    </div>

                    <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-semibold" placeholder="Endereço do imóvel" value={vistoriaData.imovel} onChange={e => setVistoriaData({...vistoriaData, imovel: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-semibold" placeholder="Locatário / Inquilino" value={vistoriaData.inquilino} onChange={e => setVistoriaData({...vistoriaData, inquilino: e.target.value})} />
                      <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-semibold" placeholder="Vistoriador Responsável" value={vistoriaData.vistoriador} onChange={e => setVistoriaData({...vistoriaData, vistoriador: e.target.value})} />
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex justify-between items-center"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ambientes</h4><button onClick={addComodo} className="text-brand-accent flex items-center gap-1 text-[10px] font-bold uppercase"><PlusCircle size={14}/> Incluir</button></div>
                        <div className="space-y-3">
                           {vistoriaData.comodos.map((c, i) => (
                              <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl relative group">
                                <button onClick={() => removeComodo(i)} className="absolute -top-2 -right-2 text-red-400 bg-white rounded-full"><XCircle size={18} /></button>
                                <input type="text" className="font-bold text-xs w-full mb-2 bg-transparent" value={c.nome} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].nome = e.target.value; setVistoriaData({...vistoriaData, comodos: cp})}} />
                                <div className="flex gap-2">
                                    <select className="text-[10px] p-2 border rounded-lg bg-gray-50" value={c.estado} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].estado = e.target.value; setVistoriaData({...vistoriaData, comodos: cp})}}><option>Bom</option><option>Regular</option><option>Ruim</option></select>
                                    <input type="text" className="flex-grow text-[10px] p-2 border rounded-lg bg-gray-50" placeholder="Observações" value={c.obs} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].obs = e.target.value; setVistoriaData({...vistoriaData, comodos: cp})}} />
                                </div>
                              </div>
                           ))}
                        </div>
                    </div>

                    <div className="pt-6 space-y-4">
                        <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest font-black">10. ITENS ENTREGUES</h4>
                        <div className="space-y-4 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100">
                           <div className="flex items-center gap-4">
                              <span className="text-[11px] font-black uppercase text-gray-500 w-24">Chaves:</span>
                              <input type="number" className="w-20 p-2 border rounded-xl bg-white text-xs font-bold text-center shadow-sm" value={vistoriaData.itensEntregues.chaves} onChange={e => setVistoriaData({...vistoriaData, itensEntregues: {...vistoriaData.itensEntregues, chaves: e.target.value}})} />
                              <span className="text-[10px] font-bold text-gray-400">unidades</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-[11px] font-black uppercase text-gray-500 w-24">Controles:</span>
                              <input type="number" className="w-20 p-2 border rounded-xl bg-white text-xs font-bold text-center shadow-sm" value={vistoriaData.itensEntregues.controles} onChange={e => setVistoriaData({...vistoriaData, itensEntregues: {...vistoriaData.itensEntregues, controles: e.target.value}})} />
                              <span className="text-[10px] font-bold text-gray-400">unidades</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-[11px] font-black uppercase text-gray-500 w-24">Tags / cartões:</span>
                              <input type="number" className="w-20 p-2 border rounded-xl bg-white text-xs font-bold text-center shadow-sm" value={vistoriaData.itensEntregues.tags} onChange={e => setVistoriaData({...vistoriaData, itensEntregues: {...vistoriaData.itensEntregues, tags: e.target.value}})} />
                              <span className="text-[10px] font-bold text-gray-400">unidades</span>
                           </div>
                        </div>
                    </div>

                    <label className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors">
                        <Camera className="text-brand-accent mb-2" size={32}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Anexar evidências fotográficas</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleVistoriaPhotoUpload}/>
                    </label>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-7 bg-gray-200 rounded-[3rem] p-4 flex flex-col items-center shadow-inner overflow-hidden min-h-[80vh]">
              <div className="w-full h-full overflow-auto flex flex-col items-center gap-10 no-scrollbar py-6">
                <div 
                  className="bg-white shadow-2xl origin-top transition-all" 
                  style={{ width: '800px', transform: 'scale(0.8)', marginBottom: '-180px' }}
                >
                  <div ref={laudoRef} className="p-[60px] flex flex-col bg-white text-brand-dark min-h-[1130px]">
                    <div className="flex justify-between items-end border-b-2 border-brand-accent pb-6 mb-10">
                      <div><h1 className="text-2xl font-black uppercase tracking-tighter">Laudo de vistoria - {vistoriaData.tipo}</h1><p className="text-[10px] text-brand-accent font-black uppercase tracking-[0.3em]">Certificação finHouse OS</p></div>
                      <div className="text-right text-[8px] text-gray-400 font-bold uppercase"><p>CNPJ: {COMPANY_CNPJ}</p><p>{COMPANY_ADDRESS.street}</p></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-[11px] mb-10 bg-gray-50 p-8 rounded-2xl border border-gray-100">
                        <p><span className="font-black text-gray-400 uppercase text-[9px] tracking-widest mr-2">Imóvel:</span> {vistoriaData.imovel || '---'}</p>
                        <p><span className="font-black text-gray-400 uppercase text-[9px] tracking-widest mr-2">Data:</span> {new Date(vistoriaData.data).toLocaleDateString('pt-BR')}</p>
                        <p><span className="font-black text-gray-400 uppercase text-[9px] tracking-widest mr-2">Inquilino/Locatário:</span> {vistoriaData.inquilino || '---'}</p>
                        <p><span className="font-black text-gray-400 uppercase text-[9px] tracking-widest mr-2">Vistoriador:</span> {vistoriaData.vistoriador || '---'}</p>
                    </div>

                    <div className="space-y-8 flex-grow">
                        <table className="w-full text-[10px]">
                          <thead className="bg-brand-primary text-white text-[9px] uppercase font-black tracking-widest">
                            <tr><th className="p-4 text-left">Ambiente / Avaliação Técnica</th><th className="p-4 text-right">Estado</th></tr>
                          </thead>
                          <tbody className="divide-y border-b">
                            {vistoriaData.comodos.map((c, i) => (
                              <tr key={i}><td className="p-4"><p className="font-bold text-gray-800 text-sm">{c.nome}</p><p className="text-[10px] text-gray-400 font-light mt-1">{c.obs || 'Sem ressalvas identificadas.'}</p></td><td className="p-4 text-right font-black uppercase text-brand-accent">{c.estado}</td></tr>
                            ))}
                          </tbody>
                        </table>

                        <div className="py-8 border-t border-b">
                          <h4 className="text-[12px] font-black uppercase mb-6 text-brand-primary tracking-widest">10. ITENS ENTREGUES</h4>
                          <div className="grid grid-cols-1 gap-3 text-[11px]">
                            <p className="flex justify-between border-b border-dashed pb-2"><span>Chaves:</span> <span className="font-bold">{vistoriaData.itensEntregues.chaves} unidades</span></p>
                            <p className="flex justify-between border-b border-dashed pb-2"><span>Controles:</span> <span className="font-bold">{vistoriaData.itensEntregues.controles} unidades</span></p>
                            <p className="flex justify-between border-b border-dashed pb-2"><span>Tags / cartões:</span> <span className="font-bold">{vistoriaData.itensEntregues.tags} unidades</span></p>
                          </div>
                        </div>

                        <div className="pt-4">
                          <h4 className="text-[11px] font-black uppercase mb-3 text-brand-primary tracking-widest">11. DECLARAÇÃO LEGAL</h4>
                          <p className="text-[10px] leading-relaxed text-gray-500 font-light text-justify">
                            Declaram as partes que realizaram a vistoria no imóvel acima identificado, constatando fielmente o estado do mesmo. Este laudo passa a ser parte integrante do contrato. O locatário aceita o imóvel nas condições descritas e compromete-se a devolvê-lo no mesmo estado.
                          </p>
                        </div>

                        <div className="mt-20 flex justify-between px-10">
                           <div className="flex flex-col items-center gap-2">
                              <div className="w-64 border-t border-gray-400 pt-3 text-center">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{vistoriaData.vistoriador || 'Vistoriador'}</p>
                                 <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Vistoriador Responsável</p>
                              </div>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                              <div className="w-64 border-t border-gray-400 pt-3 text-center">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{vistoriaData.inquilino || 'Locatário'}</p>
                                 <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Locatário / Inquilino</p>
                              </div>
                           </div>
                        </div>
                    </div>
                  </div>
                </div>

                {vistoriaPhotos.map((p, i) => (
                  <div key={i} className="bg-white shadow-2xl origin-top" style={{ width: '800px', transform: 'scale(0.8)', marginBottom: '-180px' }}>
                    <div ref={el => photoRefs.current[i] = el} className="p-[60px] flex flex-col bg-white min-h-[1130px]">
                        <div className="flex justify-between items-center border-b-2 border-brand-accent pb-6 mb-10">
                           <h2 className="text-xl font-black uppercase">Anexo fotográfico #{i+1}</h2>
                           <span className="text-[10px] text-gray-400 font-black uppercase">{vistoriaData.tipo} - {new Date(vistoriaData.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex-grow flex items-center justify-center bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 p-4">
                           <img src={p.url} className="max-w-full max-h-[800px] object-contain shadow-sm" crossOrigin="anonymous" />
                        </div>
                        <p className="mt-10 text-center font-black uppercase text-brand-primary tracking-[0.4em] text-xs">Evidência Técnica Registrada - finHouse OS</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* --- TAB: SIMULATOR --- */}
      {activeTab === 'calculator' && (
         <div className="max-w-7xl mx-auto px-4 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                     <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tighter flex items-center gap-3"><PieChart className="text-brand-accent" /> Configuração</h3>
                     <div className="space-y-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor do Imóvel</label>
                           <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-lg font-bold" value={calcData.propertyValue} onChange={e => setCalcData({...calcData, propertyValue: Number(e.target.value)})} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entrada</label>
                           <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-lg font-bold" value={calcData.downPayment} onChange={e => setCalcData({...calcData, downPayment: Number(e.target.value)})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Taxa (% AA)</label>
                              <input type="number" step="0.1" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold" value={calcData.interestRate} onChange={e => setCalcData({...calcData, interestRate: Number(e.target.value)})} />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Anos</label>
                              <input type="number" className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold" value={calcData.years} onChange={e => setCalcData({...calcData, years: Number(e.target.value)})} />
                           </div>
                        </div>
                        <div className="pt-6 border-t border-gray-100">
                           <label className="block text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">Alíquota ITBI (%)</label>
                           <input type="number" step="0.1" className="w-full p-4 border border-brand-accent/20 rounded-2xl bg-indigo-50/30 text-sm font-black text-brand-accent" value={calcData.itbiRate} onChange={e => setCalcData({...calcData, itbiRate: Number(e.target.value)})} />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-7 grid grid-cols-1 gap-6">
                  <div className="bg-brand-primary p-10 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
                     <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-3 relative z-10">Parcela inicial estimada (SAC)</p>
                     <p className="text-6xl font-black relative z-10 tracking-tighter">{formatCurrency(calculatedInstallment())}</p>
                     <div className="mt-10 space-y-3 border-t border-white/10 pt-10 relative z-10">
                        <div className="flex justify-between text-xs"><span className="text-gray-400 uppercase font-black tracking-widest">Valor Financiado:</span><span className="font-bold">{formatCurrency(calcData.propertyValue - calcData.downPayment)}</span></div>
                     </div>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Custos de Escritura e Impostos</p>
                     <p className="text-4xl font-black text-brand-primary tracking-tighter">{formatCurrency(totalFees())}</p>
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
      )}

      {/* --- TAB: CHECKLIST --- */}
      {activeTab === 'checklist' && (
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tighter">Gerador de Checklist</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Auditar para</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
                                <button onClick={() => setChecklistRole('buyer')} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${checklistRole === 'buyer' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500'}`}><User size={14} className="inline mr-2" /> Comprador</button>
                                <button onClick={() => setChecklistRole('seller')} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${checklistRole === 'seller' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500'}`}><Home size={14} className="inline mr-2" /> Vendedor</button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                           <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-gray-400">Estado Civil: Casado?</label><button onClick={() => setMaritalStatus(maritalStatus === 'single' ? 'married' : 'single')} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${maritalStatus === 'married' ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-md"></div></button></div>
                           <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-gray-400">Empresário / Sócio?</label><button onClick={() => setIsEntrepreneur(!isEntrepreneur)} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${isEntrepreneur ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-md"></div></button></div>
                        </div>

                        {checklistRole === 'buyer' && (
                           <div className="space-y-4 pt-4 border-t border-brand-accent/10 animate-fade-in">
                              <h4 className="text-[9px] font-black text-brand-accent uppercase tracking-widest">Opções de Pagamento</h4>
                              <div className="grid grid-cols-2 gap-2 bg-indigo-50/30 p-1 rounded-2xl">
                                  <button onClick={() => setPaymentType('finance')} className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${paymentType === 'finance' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400'}`}>Financiado</button>
                                  <button onClick={() => setPaymentType('cash')} className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${paymentType === 'cash' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400'}`}>À Vista</button>
                              </div>
                              {paymentType === 'finance' && (
                                 <div className="flex justify-between items-center px-2"><label className="text-[10px] font-black uppercase text-gray-400">Utilizar FGTS?</label><button onClick={() => setUseFGTS(!useFGTS)} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${useFGTS ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-md"></div></button></div>
                              )}
                           </div>
                        )}

                        {checklistRole === 'seller' && (
                           <div className="space-y-4 pt-4 border-t border-brand-accent/10 animate-fade-in">
                              <h4 className="text-[9px] font-black text-brand-accent uppercase tracking-widest">Perfil Jurídico</h4>
                              <div className="grid grid-cols-2 gap-2 bg-indigo-50/30 p-1 rounded-2xl">
                                  <button onClick={() => setSellerType('pf')} className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${sellerType === 'pf' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400'}`}>Pessoa Física</button>
                                  <button onClick={() => setSellerType('pj')} className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${sellerType === 'pj' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400'}`}>Pessoa Jurídica</button>
                              </div>
                           </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-7 bg-brand-primary p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-10 relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Checklist finHouse</h3>
                    <button onClick={copyChecklist} className="bg-white text-brand-primary px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-105">{checklistCopied ? 'Copiado!' : 'Copiar Texto'}</button>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl font-mono text-[10px] md:text-xs whitespace-pre-wrap leading-relaxed uppercase relative z-10 shadow-inner overflow-y-auto max-h-[60vh] no-scrollbar">
                    {generateChecklist()}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BrokerTools;
