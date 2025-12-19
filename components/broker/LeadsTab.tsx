
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Trash2, RefreshCw, 
  XCircle, Coins, Edit3, Landmark, CheckCircle2, Clock, 
  FileSearch, ArrowRight, TrendingUp, Mail, CalendarDays,
  Link2, MessageSquare, Tag
} from 'lucide-react';
import { supabase, Property } from '../../supabaseClient';
import Button from '../Button';
import FinancingConsultModal from './FinancingConsultModal';

interface Lead {
  id: string; 
  client_name: string;
  email: string;
  phone: string;
  property_interest: string;
  vgv_value: number;
  crm_status: string;
  financing_step?: string;
  next_step?: string;
  lead_type?: string; // Venda ou Locação
  created_at: string;
  needs_financing: boolean;
  consultant_notes?: string;
}

const CRM_STATUS_OPTIONS = [
  { value: 'Novo', label: 'Novo Lead', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Contatado', label: 'Em Contato', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'Visita', label: 'Visita Agendada', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'Proposta', label: 'Proposta Recebida', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'Fechado', label: 'Venda Concluída', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'Perdido', label: 'Perdido', color: 'bg-red-100 text-red-700 border-red-200' }
];

const NEXT_STEP_OPTIONS = [
  "Primeiro Contato",
  "Visita Agendada",
  "Visita Realizada",
  "Proposta Enviada",
  "Fechamento / Contrato",
  "Pós-Venda"
];

const LEAD_TYPE_OPTIONS = ["Venda", "Locação"];

const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);
  const [selectedLeadForFinancing, setSelectedLeadForFinancing] = useState<any>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [formData, setFormData] = useState({
    client_name: '', phone: '', email: '', property_interest: '',
    vgv_value: '', needs_financing: false, crm_status: 'Novo', 
    financing_step: 'Não Iniciado', next_step: NEXT_STEP_OPTIONS[0], 
    lead_type: 'Venda', consultant_notes: ''
  });

  const parseError = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Erro de conexão com o banco.";
  };

  const maskPhone = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = "(" + v.substring(0, 2) + ") " + v.substring(2);
    if (v.length > 10) v = v.substring(0, 10) + "-" + v.substring(10);
    return v;
  };

  const maskCurrency = (v: string) => {
    v = v.replace(/\D/g, "");
    if (!v) return "";
    const floatValue = (Number(v) / 100);
    return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const parseCurrency = (v: string) => {
    if (!v) return 0;
    const cleanValue = v.replace(/[^\d]/g, "");
    return Number(cleanValue) / 100;
  };

  useEffect(() => { 
    fetchLeads(); 
    fetchProperties();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('*').order('title');
    if (data) setProperties(data);
  };

  const handleLinkProperty = (propertyId: string) => {
    const prop = properties.find(p => p.id === parseInt(propertyId));
    if (prop) {
      setFormData({
        ...formData,
        property_interest: prop.title,
        vgv_value: maskCurrency((prop.price * 100).toString()),
        lead_type: prop.contract === 'Aluguel' ? 'Locação' : 'Venda'
      });
    }
  };

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      client_name: '', phone: '', email: '', property_interest: '',
      vgv_value: '', needs_financing: false, crm_status: 'Novo', 
      financing_step: 'Não Iniciado', next_step: NEXT_STEP_OPTIONS[0],
      lead_type: 'Venda', consultant_notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      client_name: lead.client_name || '',
      phone: maskPhone(lead.phone || ''),
      email: lead.email || '',
      property_interest: lead.property_interest || '',
      vgv_value: lead.vgv_value ? maskCurrency((lead.vgv_value * 100).toString()) : '',
      needs_financing: !!lead.needs_financing,
      crm_status: lead.crm_status || 'Novo',
      financing_step: lead.financing_step || 'Não Iniciado',
      next_step: lead.next_step || NEXT_STEP_OPTIONS[0],
      lead_type: lead.lead_type || 'Venda',
      consultant_notes: lead.consultant_notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      client_name: formData.client_name.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      email: formData.email.trim().toLowerCase() || null,
      property_interest: formData.property_interest.trim() || null,
      vgv_value: parseCurrency(formData.vgv_value),
      needs_financing: formData.needs_financing,
      crm_status: formData.crm_status,
      financing_step: formData.financing_step,
      next_step: formData.next_step,
      lead_type: formData.lead_type,
      consultant_notes: formData.consultant_notes.trim() || null
    };

    try {
      if (editingLead) {
        const { error } = await supabase.from('leads').update(payload).eq('id', editingLead.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('leads').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      await fetchLeads();
    } catch (err: any) {
      alert(`Erro: ${parseError(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || !window.confirm("Confirmar exclusão permanente deste lead?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err: any) { alert(parseError(err)); } finally { setLoading(false); }
  };

  const openFinancingConsult = (lead: Lead) => {
    setSelectedLeadForFinancing({
      name: lead.client_name,
      phone: maskPhone(lead.phone),
      email: lead.email,
      vgv: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.vgv_value),
      property: lead.property_interest
    });
    setIsFinancingModalOpen(true);
  };

  const filtered = leads.filter(l => {
    const s = search.toLowerCase();
    const name = (l.client_name || '').toLowerCase();
    const email = (l.email || '').toLowerCase();
    return (name.includes(s) || email.includes(s)) && (statusFilter === 'Todos' || l.crm_status === statusFilter);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[10px] font-black text-gray-400 mb-1">Total Leads</p><h4 className="text-3xl font-black text-brand-primary">{leads.length}</h4></div>
          <Users className="text-brand-accent/20" size={32} />
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[10px] font-black text-indigo-400 mb-1">Vendas Ativas</p><h4 className="text-3xl font-black text-indigo-600">{leads.filter(l => l.lead_type === 'Venda').length}</h4></div>
          <Tag className="text-indigo-50" size={32} />
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-green-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[10px] font-black text-green-400 mb-1">Locações Ativas</p><h4 className="text-3xl font-black text-green-600">{leads.filter(l => l.lead_type === 'Locação').length}</h4></div>
          <CheckCircle2 className="text-green-50" size={32} />
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[10px] font-black text-gray-400 mb-1">Ticket Médio VGV</p><h4 className="text-2xl font-black text-brand-primary tracking-tighter">
            {leads.length > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(leads.reduce((a, b) => a + (Number(b.vgv_value) || 0), 0) / leads.length) : 'R$ 0'}
          </h4></div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b flex flex-col lg:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <h3 className="text-xl font-bold text-brand-primary tracking-tight">CRM de Leads Integrado</h3>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <div className="relative flex-grow">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
               <input type="text" className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs w-full lg:w-64 outline-none focus:ring-2 focus:ring-brand-accent transition-all font-medium" placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="Todos">Todas as Fases</option>
              {CRM_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button onClick={handleOpenAdd} className="h-[42px] px-6 rounded-xl text-[10px] font-black tracking-widest shadow-lg shadow-brand-accent/20"><Plus size={16} className="mr-1.5" /> Novo Lead</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100/50 text-[10px] font-black text-gray-400 border-b">
              <tr>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Negócio</th>
                <th className="px-8 py-5">Imóvel / VGV</th>
                <th className="px-8 py-5">Próxima Etapa</th>
                <th className="px-8 py-5">Fase CRM</th>
                <th className="px-8 py-5">Notas Gerais</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-brand-primary">{l.client_name}</span>
                      <span className="text-[10px] text-gray-400 font-bold mt-1 flex items-center gap-1"><Mail size={10}/> {l.email || '---'}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{maskPhone(l.phone)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-md border shadow-sm ${l.lead_type === 'Locação' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                       {l.lead_type || 'Venda'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-700 line-clamp-1">{l.property_interest || '---'}</span>
                      <span className="text-[11px] text-brand-accent font-black mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.vgv_value || 0)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <CalendarDays size={14} className="text-brand-accent" />
                       <span className="text-[10px] font-black text-gray-600">
                         {l.next_step || 'A Definir'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${CRM_STATUS_OPTIONS.find(o => o.value === l.crm_status)?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {l.crm_status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-2 max-w-[150px]">
                       <MessageSquare size={14} className="text-gray-300 mt-1 shrink-0" />
                       <span className="text-[10px] font-medium text-gray-400 line-clamp-2">
                         {l.consultant_notes || 'Nenhuma observação'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex gap-2 justify-end items-center">
                      <button 
                        onClick={() => openFinancingConsult(l)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-brand-accent hover:text-white rounded-lg shadow-sm transition-all whitespace-nowrap"
                      >
                        <Coins size={14}/>
                        Crédito
                      </button>
                      <button onClick={() => handleOpenEdit(l)} className="p-2 text-brand-primary bg-white hover:bg-brand-light border border-gray-200 rounded-lg shadow-sm transition-all"><Edit3 size={16}/></button>
                      <button onClick={() => handleDelete(l.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 rounded-lg shadow-md transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={7} className="p-20 text-center"><RefreshCw className="animate-spin mx-auto text-brand-accent" size={32} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in max-h-[95vh] flex flex-col my-auto">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-2xl font-black text-brand-primary tracking-tighter">{editingLead ? 'Atualizar Lead' : 'Novos Negócios'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2 bg-white rounded-full border shadow-sm transition-colors"><XCircle size={28} /></button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">Nome do Cliente</label>
                  <input required className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">WhatsApp</label>
                  <input required className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">Email (Opcional)</label>
                  <input className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="exemplo@mail.com" />
                </div>

                <div className="md:col-span-2 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                  <h4 className="text-[10px] font-black text-indigo-500 flex items-center gap-2"><Link2 size={14}/> Vincular Imóvel do Portfólio</h4>
                  <select 
                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-xs font-bold outline-none"
                    onChange={(e) => handleLinkProperty(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Selecione um imóvel anunciado...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.title} ({p.contract})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">Tipo de Negócio</label>
                  <select className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent" value={formData.lead_type} onChange={e => setFormData({...formData, lead_type: e.target.value})}>
                    {LEAD_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">Próxima Etapa</label>
                  <select className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent" value={formData.next_step} onChange={e => setFormData({...formData, next_step: e.target.value})}>
                    {NEXT_STEP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">Produto / Imóvel de Interesse</label>
                  <input required className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.property_interest} onChange={e => setFormData({...formData, property_interest: e.target.value})} />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">VGV Estimado</label>
                  <input required className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.vgv_value} onChange={e => setFormData({...formData, vgv_value: maskCurrency(e.target.value)})} placeholder="R$ 0,00" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">Status Comercial</label>
                  <select className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent" value={formData.crm_status} onChange={e => setFormData({...formData, crm_status: e.target.value})}>
                    {CRM_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Coins className="text-indigo-600" size={18} />
                     <p className="text-[10px] font-black text-brand-primary tracking-widest">Consultar finHouse Crédito?</p>
                   </div>
                   <button type="button" onClick={() => setFormData({...formData, needs_financing: !formData.needs_financing})} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 shadow-inner ${formData.needs_financing ? 'bg-brand-accent justify-end' : 'bg-gray-300 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-md"></div></button>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 mb-2 block tracking-widest">Notas Gerais / Observações</label>
                  <textarea rows={3} className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-accent resize-none transition-all" value={formData.consultant_notes} onChange={e => setFormData({...formData, consultant_notes: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <Button type="submit" fullWidth disabled={loading} className="py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-accent/20">
                  {loading ? 'Salvando...' : editingLead ? 'Atualizar Lead' : 'Cadastrar Lead'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FinancingConsultModal 
        isOpen={isFinancingModalOpen} 
        onClose={() => {setIsFinancingModalOpen(false); setSelectedLeadForFinancing(null);}} 
        initialData={selectedLeadForFinancing}
      />
    </div>
  );
};

export default LeadsTab;
