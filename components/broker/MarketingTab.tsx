
import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Search, PenTool, Smartphone, Layout, MapPin, RefreshCw, Download } from 'lucide-react';
import { supabase, Property } from '../../supabaseClient';
import Button from '../Button';
import * as htmlToImage from 'html-to-image';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const MarketingTab: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [format, setFormat] = useState<'story' | 'feed'>('story');
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
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

  useEffect(() => {
    supabase.from('properties').select('*').order('created_at', { ascending: false }).then(({ data }) => { 
      if (data) setProperties(data as Property[]); 
    });
  }, []);

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

  const handleDownload = async () => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up">
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
           <textarea className="w-full h-32 p-4 text-[10px] bg-white/5 border border-white/10 rounded-2xl resize-none font-mono uppercase no-scrollbar" value={generatedCaption} readOnly></textarea>
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
        <Button onClick={handleDownload} disabled={downloading || !selectedProperty} className="mt-8 w-full max-w-md py-5 rounded-2xl shadow-xl shadow-brand-accent/20 text-xs font-black uppercase tracking-[0.2em]">
           {downloading ? <RefreshCw className="animate-spin" /> : <Download />} {downloading ? 'Gerando Arte...' : 'Baixar Imagem em HD'}
        </Button>
      </div>
    </div>
  );
};

export default MarketingTab;
