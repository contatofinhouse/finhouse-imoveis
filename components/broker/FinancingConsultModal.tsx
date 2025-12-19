
import React, { useState, useEffect } from 'react';
import { XCircle, Landmark, ArrowRight, User, Phone, Coins, FileText, Mail } from 'lucide-react';
import Button from '../Button';
import { COMPANY_PHONE } from '../../constants';
import { supabase } from '../../supabaseClient';

interface FinancingConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    name?: string;
    phone?: string;
    email?: string;
    vgv?: string;
    property?: string;
  };
}

const FinancingConsultModal: React.FC<FinancingConsultModalProps> = ({ isOpen, onClose, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vgv: '',
    property: '',
    type: 'Financiamento Imobiliário',
    notes: ''
  });

  // Garante que os dados sejam re-populados sempre que o initialData mudar (ao abrir o modal para um lead específico)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        vgv: initialData.vgv || '',
        property: initialData.property || '',
      }));
    } else if (!isOpen) {
      // Limpa ao fechar
      setFormData({
        name: '',
        phone: '',
        email: '',
        vgv: '',
        property: '',
        type: 'Financiamento Imobiliário',
        notes: ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const maskPhone = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = "(" + v.substring(0, 2) + ") " + v.substring(2);
    if (v.length > 10) v = v.substring(0, 10) + "-" + v.substring(10);
    return v;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('leads').insert([{
        client_name: formData.name.toUpperCase(),
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email.trim().toLowerCase() || null,
        vgv_value: parseFloat(formData.vgv.replace(/[^\d]/g, '')) / 100 || 0,
        property_interest: `CONSULTA CRÉDITO: ${formData.property.toUpperCase()}`,
        needs_financing: true,
        crm_status: 'Novo',
        financing_step: 'Analise',
        next_step: 'CONSULTA FINANCEIRA ENVIADA',
        consultant_notes: `SOLICITAÇÃO VIA PORTAL: ${formData.type}. Notas: ${formData.notes}`
      }]);

      if (error) console.warn("CRM Sync falhou:", error.message);

      const text = `*SOLICITAÇÃO DE CONSULTA FINHOUSE*\n\n` +
                 `*Tipo:* ${formData.type}\n` +
                 `*Cliente:* ${formData.name.toUpperCase()}\n` +
                 `*WhatsApp:* ${formData.phone}\n` +
                 `*Email:* ${formData.email || 'Não informado'}\n` +
                 `*VGV Imóvel:* ${formData.vgv}\n` +
                 `*Imóvel/Produto:* ${formData.property}\n` +
                 `*Observações:* ${formData.notes || 'Nenhuma'}\n\n` +
                 `_Gerado via finHouse OS_`;

      window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <Landmark className="text-brand-accent" size={24} />
            <h3 className="text-xl font-black text-brand-primary uppercase tracking-tighter">Consulta finHouse</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle size={28} /></button>
        </div>

        <form onSubmit={handleSend} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Nome do Cliente</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input required className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold uppercase focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">WhatsApp</label>
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input required className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Email (Opcional)</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="mail@exemplo.com" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Valor do Imóvel</label>
              <div className="relative">
                <Coins size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input required className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.vgv} onChange={e => setFormData({...formData, vgv: e.target.value})} placeholder="R$ 0,00" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Tipo de Crédito</label>
              <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-accent transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Financiamento Imobiliário</option>
                <option>Home Equity (Garantia de Imóvel)</option>
                <option>Consórcio Contemplado</option>
                <option>Crédito PJ / Empresarial</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Breve Descrição/Imóvel</label>
              <div className="relative">
                <FileText size={14} className="absolute left-4 top-4 text-gray-300" />
                <textarea rows={2} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold uppercase focus:ring-2 focus:ring-brand-accent transition-all resize-none" value={formData.property} onChange={e => setFormData({...formData, property: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={loading} className="py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20">
              {loading ? 'Processando...' : 'Enviar para finHouse'} <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancingConsultModal;
