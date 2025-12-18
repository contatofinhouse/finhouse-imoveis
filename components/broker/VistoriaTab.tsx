import React, { useState, useRef } from 'react';
import { ClipboardList, PlusCircle, RefreshCw, XCircle, Camera } from 'lucide-react';
import Button from '../Button';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { COMPANY_CNPJ, COMPANY_ADDRESS } from '../../constants';

interface VistoriaPhoto {
  url: string;
  label: string;
}

const VistoriaTab: React.FC = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const laudoRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [vistoriaPhotos, setVistoriaPhotos] = useState<VistoriaPhoto[]>([]);
  const [vistoriaData, setVistoriaData] = useState({
    tipo: 'Entrada' as 'Entrada' | 'Saída',
    data: new Date().toISOString().split('T')[0],
    imovel: '',
    inquilino: '',
    vistoriador: '',
    comodos: [
      { nome: 'SALA', estado: 'BOM', obs: '' },
      { nome: 'COZINHA', estado: 'BOM', obs: '' },
      { nome: 'BANHEIRO', estado: 'BOM', obs: '' },
      { nome: 'QUARTO 1', estado: 'BOM', obs: '' }
    ],
    itensEntregues: { chaves: '0', controles: '0', tags: '0' }
  });

  const addComodo = () => {
    setVistoriaData({
      ...vistoriaData,
      comodos: [...vistoriaData.comodos, { nome: 'NOVO AMBIENTE', estado: 'BOM', obs: '' }]
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
      const laudoProps = doc.getImageProperties(laudoImg);
      const pdfH = (laudoProps.height * pdfWidth) / laudoProps.width;
      doc.addImage(laudoImg, 'PNG', 0, 0, pdfWidth, pdfH);

      for (let i = 0; i < vistoriaPhotos.length; i++) {
        const photoEl = photoRefs.current[i];
        if (photoEl) {
          doc.addPage();
          const photoImg = await htmlToImage.toPng(photoEl, { pixelRatio: 2, backgroundColor: '#ffffff' });
          const photoProps = doc.getImageProperties(photoImg);
          const imgH = (photoProps.height * pdfWidth) / photoProps.width;
          doc.addImage(photoImg, 'PNG', 0, 0, pdfWidth, imgH);
        }
      }
      doc.save(`Vistoria_${vistoriaData.inquilino || 'finHouse'}.pdf`);
    } finally { setIsGeneratingPDF(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up">
      <div className="lg:col-span-5 h-[80vh] overflow-y-auto no-scrollbar space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-brand-primary uppercase text-[10px] tracking-widest">Ficha de Vistoria</h3>
            <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="h-9 py-0 text-[10px] font-black uppercase tracking-widest shadow-brand-accent/20">
               {isGeneratingPDF ? 'PROCESSANDO...' : 'BAIXAR LAUDO'}
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
              <button onClick={() => setVistoriaData({...vistoriaData, tipo: 'Entrada'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${vistoriaData.tipo === 'Entrada' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400'}`}>Entrada</button>
              <button onClick={() => setVistoriaData({...vistoriaData, tipo: 'Saída'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${vistoriaData.tipo === 'Saída' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400'}`}>Saída</button>
            </div>
            <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-semibold uppercase border-none focus:ring-2 focus:ring-brand-accent" placeholder="Endereço do Imóvel" value={vistoriaData.imovel} onChange={e => setVistoriaData({...vistoriaData, imovel: e.target.value.toUpperCase()})} />
            <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-semibold uppercase border-none focus:ring-2 focus:ring-brand-accent" placeholder="Locatário / Inquilino" value={vistoriaData.inquilino} onChange={e => setVistoriaData({...vistoriaData, inquilino: e.target.value.toUpperCase()})} />
            <input type="text" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-semibold uppercase border-none focus:ring-2 focus:ring-brand-accent" placeholder="Vistoriador" value={vistoriaData.vistoriador} onChange={e => setVistoriaData({...vistoriaData, vistoriador: e.target.value.toUpperCase()})} />
            
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase text-gray-400">Ambientes</h4><button onClick={addComodo} className="text-brand-accent flex items-center gap-1 text-[10px] font-bold uppercase"><PlusCircle size={14}/> Incluir</button></div>
              {vistoriaData.comodos.map((c, i) => (
                <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl relative shadow-sm">
                  <button onClick={() => removeComodo(i)} className="absolute -top-2 -right-2 text-red-400 bg-white rounded-full"><XCircle size={18} /></button>
                  <input type="text" className="font-bold text-xs w-full mb-2 bg-transparent uppercase" value={c.nome} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].nome = e.target.value.toUpperCase(); setVistoriaData({...vistoriaData, comodos: cp})}} />
                  <div className="flex gap-2">
                    <select className="text-[10px] p-2 border border-gray-100 rounded-lg bg-gray-50 font-black uppercase" value={c.estado} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].estado = e.target.value; setVistoriaData({...vistoriaData, comodos: cp})}}><option>BOM</option><option>REGULAR</option><option>RUIM</option></select>
                    <input type="text" className="flex-grow text-[10px] p-2 border border-gray-100 rounded-lg bg-gray-50" placeholder="Observações" value={c.obs} onChange={e => {const cp = [...vistoriaData.comodos]; cp[i].obs = e.target.value; setVistoriaData({...vistoriaData, comodos: cp})}} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 space-y-4">
                <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Itens Entregues</h4>
                <div className="space-y-4 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100">
                   {['chaves', 'controles', 'tags'].map(item => (
                     <div key={item} className="flex items-center gap-4">
                        <span className="text-[11px] font-black uppercase text-gray-500 w-24">{item}:</span>
                        <input type="number" className="w-20 p-2 border rounded-xl bg-white text-xs font-bold text-center shadow-sm" value={vistoriaData.itensEntregues[item as keyof typeof vistoriaData.itensEntregues]} 
                        // Fixed typo: corrected itemsEntregues to itensEntregues to maintain state consistency
                        onChange={e => setVistoriaData({...vistoriaData, itensEntregues: {...vistoriaData.itensEntregues, [item]: e.target.value}})} />
                     </div>
                   ))}
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
            <div className="bg-white shadow-2xl origin-top" style={{ width: '800px', transform: 'scale(0.8)', marginBottom: '-180px' }}>
              <div ref={laudoRef} className="p-[60px] flex flex-col bg-white text-brand-dark min-h-[1130px] uppercase">
                <div className="border-b-2 border-brand-accent pb-6 mb-10 flex justify-between items-end">
                  <div><h1 className="text-2xl font-black">Laudo de Vistoria Digital</h1><p className="text-[10px] text-brand-accent font-black tracking-[0.3em]">Certificação finHouse OS</p></div>
                  <div className="text-right text-[8px] text-gray-400 font-bold"><p>CNPJ: {COMPANY_CNPJ}</p><p>{COMPANY_ADDRESS.street}</p></div>
                </div>
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 mb-10 text-[11px] grid grid-cols-2 gap-4">
                  <p><span className="font-black opacity-40 mr-2">OPERAÇÃO:</span> {vistoriaData.tipo}</p>
                  <p><span className="font-black opacity-40 mr-2">DATA:</span> {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="col-span-2"><span className="font-black opacity-40 mr-2">IMÓVEL:</span> {vistoriaData.imovel || '---'}</p>
                  <p className="col-span-2"><span className="font-black opacity-40 mr-2">LOCATÁRIO:</span> {vistoriaData.inquilino || '---'}</p>
                </div>
                <table className="w-full text-[10px] mb-10 border-collapse">
                  <thead className="bg-brand-primary text-white"><th className="p-4 text-left font-black tracking-widest border-none">AMBIENTE</th><th className="p-4 text-right font-black tracking-widest border-none">CONSERVAÇÃO</th></thead>
                  <tbody className="divide-y divide-gray-100 border border-gray-100">
                    {vistoriaData.comodos.map((c, i) => (
                      <tr key={i}><td className="p-4 font-bold"><p>{c.nome}</p><p className="text-[8px] text-gray-400 font-normal">{c.obs || 'Sem ressalvas.'}</p></td><td className="p-4 text-right font-black text-brand-accent">{c.estado}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-20 border-t border-gray-100 pt-20 flex justify-between px-10">
                  <div className="w-48 border-t border-black pt-2 text-center text-[8px] font-black uppercase tracking-widest">Assinatura Locatário</div>
                  <div className="w-48 border-t border-black pt-2 text-center text-[8px] font-black uppercase tracking-widest">Vistoriador finHouse</div>
                </div>
              </div>
            </div>

            {vistoriaPhotos.map((p, i) => (
              <div key={i} className="bg-white shadow-2xl origin-top" style={{ width: '800px', transform: 'scale(0.8)', marginBottom: '-180px' }}>
                {/* Fix: Wrap assignment in braces to ensure the ref callback returns void instead of the element */}
                <div ref={el => { photoRefs.current[i] = el; }} className="p-[60px] flex flex-col bg-white min-h-[1130px]">
                    <div className="flex justify-between items-center border-b-2 border-brand-accent pb-6 mb-10 uppercase">
                       <h2 className="text-xl font-black">Anexo fotográfico #{i+1}</h2>
                       <span className="text-[10px] text-gray-400 font-black">{vistoriaData.tipo} - {new Date().toLocaleDateString('pt-BR')}</span>
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
  );
};

export default VistoriaTab;