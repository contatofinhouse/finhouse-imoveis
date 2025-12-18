
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Phone, Trash2, RefreshCw, 
  XCircle, Coins, Edit3, MessageSquare, AlertCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import Button from '../Button';

interface Lead {
  id: string; 
  client_name: string;
  email: string;
  phone: string;
  property_interest: string;
  vgv_value: number;
  crm_status: string;
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
  { value: 'Perdido', label: 'Perdido / Desistência', color: 'bg-red-100 text-red-700 border-red-200' }
];

const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    phone: '',
    email: '',
    property_interest: '',
    vgv_value: '0',
    needs_financing: false,
    crm_status: 'Novo',
    consultant_notes: ''
  });

  const parseError = (err: any): string => {
    if (!err) return "Erro desconhecido";
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    if (err.details) return err.details;
    try { return JSON.stringify(err); } catch (e) { return String(err); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      console.error("Erro fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      client_name: '', phone: '', email: '', property_interest: '',
      vgv_value: '0', needs_financing: false, crm_status: 'Novo', consultant_notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      client_name: lead.client_name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      property_interest: lead.property_interest || '',
      vgv_value: String(lead.vgv_value || 0),
      needs_financing: !!lead.needs_financing,
      crm_status: lead.crm_status || 'Novo',
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
      email: formData.email.trim() || null,
      property_interest: formData.property_interest.trim() || null,
      vgv_value: parseFloat(formData.vgv_value) || 0,
      needs_financing: formData.needs_financing,
      crm_status: formData.crm_status,
      consultant_notes: formData.consultant_notes.trim() || null,
      status: 'pending' 
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
      alert(`Erro ao salvar: ${parseError(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Log inicial para depuração
    console.log("Tentando excluir lead com ID:", id);
    
    if (!id) {
      alert("Erro: ID do lead não encontrado.");
      return;
    }

    const confirmResult = window.confirm("CUIDADO: Você está prestes a EXCLUIR este lead permanentemente.\nDeseja continuar?");
    
    if (!confirmResult) {
      console.log("Exclusão cancelada pelo usuário.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Execução direta do comando delete no Supabase
      const { error, status, statusText } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      console.log(`Resposta Supabase - Status: ${status} (${statusText})`);

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        throw error;
      }

      // Atualização imediata do estado local para refletir a exclusão na UI
      setLeads(currentLeads => currentLeads.filter(lead => lead.id !== id));
      
      alert("Lead removido com sucesso do banco de dados!");
      
    } catch (err: any) {
      const errorMsg = parseError(err);
      console.error("FALHA CRÍTICA NO DELETE:", err);
      alert(`ERRO AO EXCLUIR NO BANCO:\n${errorMsg}\n\nNota: Mesmo com RLS desativado, verifique se existem chaves estrangeiras vinculadas.`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter(l => {
    const s = search.toLowerCase();
    const name = (l.client_name || '').toLowerCase();
    const phone = (l.phone || '').toLowerCase();
    return (name.includes(s) || phone.includes(s)) && (statusFilter === 'Todos' || l.crm_status === statusFilter);
  });

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Indicadores KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Base Ativa</p>
          <h4 className="text-3xl font-black text-brand-primary">{leads.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">VGV Estimado</p>
          <h4 className="text-2xl font-black text-brand-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(leads.reduce((a, b) => a + (Number(b.vgv_value) || 0), 0))}
          </h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Interesse Crédito</p>
          <h4 className="text-3xl font-black text-indigo-500">{leads.filter(l => l.needs_financing).length}</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Fase: Novo</p>
          <h4 className="text-3xl font-black text-blue-500">{leads.filter(l => l.crm_status === 'Novo').length}</h4>
        </div>
      </div>

      {/* Área de Gestão CRM */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b flex flex-col lg:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div>
            <h3 className="text-xl font-bold text-brand-primary uppercase tracking-tight">Fluxo de Oportunidades</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Sincronização Cloud Ativa</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <div className="relative flex-grow">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
               <input 
                 type="text" 
                 className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs w-full lg:w-64 outline-none focus:ring-2 focus:ring-brand-accent transition-all font-medium" 
                 placeholder="Buscar por nome..." 
                 value={search} 
                 onChange={e => setSearch(e.target.value)} 
               />
            </div>
            <select 
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none cursor-pointer" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="Todos">Todas as Etapas</option>
              {CRM_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button onClick={handleOpenAdd} className="h-[42px] px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-accent/20 transition-transform active:scale-95">
              <Plus size={16} className="mr-1.5" /> Adicionar Lead
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100/50 text-[10px] font-black text-gray-400 uppercase border-b">
              <tr>
                <th className="px-8 py-5">Perfil Cliente</th>
                <th className="px-8 py-5">Interesse / VGV</th>
                <th className="px-8 py-5">Status Comercial</th>
                <th className="px-8 py-5 text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <RefreshCw className="animate-spin mx-auto text-brand-accent mb-4" size={32} />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Acessando Supabase...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-sm font-bold text-gray-400 uppercase">Sem resultados para os filtros aplicados.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-brand-primary uppercase tracking-tight">{l.client_name || 'LEAD SEM NOME'}</span>
                        <span className="text-[10px] text-gray-500 font-bold mt-1 flex items-center gap-1">
                          <Phone size={10} className="text-brand-accent"/> {l.phone || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-700 uppercase line-clamp-1">{l.property_interest || '---'}</span>
                        <span className="text-[11px] text-brand-accent font-black mt-1">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.vgv_value || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${CRM_STATUS_OPTIONS.find(o => o.value === l.crm_status)?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {l.crm_status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {/* BOTOES SEMPRE VISIVEIS E COM CORES DE ALTO CONTRASTE */}
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleOpenEdit(l)} 
                          className="p-3 text-brand-primary bg-white hover:bg-brand-light border border-gray-200 rounded-xl shadow-sm transition-all active:scale-95"
                          title="Editar Registro"
                        >
                          <Edit3 size={16}/>
                        </button>
                        <button 
                          onClick={() => window.open(`https://wa.me/${l.phone?.replace(/\D/g,'')}`)} 
                          className="p-3 text-green-600 bg-green-50 hover:bg-green-100 border border-green-100 rounded-xl shadow-sm transition-all active:scale-95"
                          title="Falar no WhatsApp"
                        >
                          <MessageSquare size={16}/>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }} 
                          className="p-3 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 rounded-xl shadow-md transition-all active:scale-90"
                          title="EXCLUIR PERMANENTEMENTE"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Cadastro e Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in max-h-[95vh] flex flex-col my-auto">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tighter">
                {editingLead ? 'Ficha de Lead' : 'Nova Oportunidade'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-red-500 p-2 bg-white rounded-full border shadow-sm transition-colors"
              >
                <XCircle size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Nome do Cliente</label>
                  <input required type="text" className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold uppercase focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">WhatsApp</label>
                  <input required type="text" className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Etapa CRM</label>
                  <select className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent" value={formData.crm_status} onChange={e => setFormData({...formData, crm_status: e.target.value})}>
                    {CRM_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Produto / Interesse</label>
                  <input type="text" className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold uppercase focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.property_interest} onChange={e => setFormData({...formData, property_interest: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">VGV Estimado (R$)</label>
                  <input type="number" step="0.01" className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none transition-all" value={formData.vgv_value} onChange={e => setFormData({...formData, vgv_value: e.target.value})} />
                </div>
                <div className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-2xl md:col-span-1 self-end mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-brand-accent shadow-sm"><Coins size={20} /></div>
                    <p className="text-[10px] font-black text-brand-primary uppercase">Crédito?</p>
                  </div>
                  <button type="button" onClick={() => setFormData({...formData, needs_financing: !formData.needs_financing})} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 shadow-inner ${formData.needs_financing ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-md"></div></button>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Notas do Consultor</label>
                  <textarea rows={4} className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-accent resize-none transition-all" value={formData.consultant_notes} onChange={e => setFormData({...formData, consultant_notes: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <Button type="submit" fullWidth disabled={loading} className="py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-accent/20">
                  {loading ? 'Processando Nuvem...' : editingLead ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;
