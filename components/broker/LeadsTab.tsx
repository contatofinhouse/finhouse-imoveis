
import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Phone, Trash2, RefreshCw, XCircle, Coins, UserPlus, TrendingUp } from 'lucide-react';
import { supabase, Property } from '../../supabaseClient';
import Button from '../Button';

interface Lead {
  id: string; 
  client_name: string;
  email: string;
  phone: string;
  property_interest: string;
  vgv_value: number;
  crm_status: 'Novo' | 'Contatado' | 'Visita' | 'Proposta' | 'Fechado' | 'Perdido';
  created_at: string;
  needs_financing: boolean;
  consultant_notes?: string;
}

const formatPhone = (value: string) => {
  if (!value) return '';
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (v.length > 5) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    v = v.replace(/^(\d*)/, "($1");
  }
  return v;
};

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isAdding, setIsAdding] = useState(false);
  const [newLead, setNewLead] = useState({
    client_name: '', phone: '', email: '', property_interest: '', vgv_value: 0, needs_financing: false, consultant_notes: ''
  });

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data) setLeads(data as Lead[]);
    } finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await supabase.from('leads').insert([{
      ...newLead, phone: newLead.phone.replace(/\D/g, ''), crm_status: 'Novo'
    }]).select();
    if (data) {
      setLeads([data[0] as Lead, ...leads]);
      setIsAdding(false);
      setNewLead({ client_name: '', phone: '', email: '', property_interest: '', vgv_value: 0, needs_financing: false, consultant_notes: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir lead?")) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) setLeads(leads.filter(l => l.id !== id));
  };

  const updateStatus = async (id: string, status: Lead['crm_status']) => {
    const { error } = await supabase.from('leads').update({ crm_status: status }).eq('id', id);
    if (!error) setLeads(leads.map(l => l.id === id ? { ...l, crm_status: status } : l));
  };

  const filtered = leads.filter(l => 
    (l.client_name?.toLowerCase().includes(search.toLowerCase()) || l.property_interest?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'Todos' || l.crm_status === statusFilter)
  );

  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pipeline Ativo</p>
          <h4 className="text-3xl font-black text-brand-primary">{leads.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">VGV Total</p>
          <h4 className="text-2xl font-black text-brand-primary">{formatCurrency(leads.reduce((a, b) => a + (Number(b.vgv_value) || 0), 0))}</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Needs Finance</p>
          <h4 className="text-3xl font-black text-brand-accent">{leads.filter(l => l.needs_financing).length}</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Novos</p>
          <h4 className="text-3xl font-black text-green-500">{leads.filter(l => l.crm_status === 'Novo').length}</h4>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center gap-6">
          <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tighter">Gestão de Oportunidades</h3>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input type="text" className="px-4 py-2.5 bg-gray-50 rounded-xl text-xs font-bold" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="px-4 py-2.5 bg-gray-50 rounded-xl text-xs font-bold" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>Todos</option><option>Novo</option><option>Contatado</option><option>Visita</option><option>Proposta</option><option>Fechado</option><option>Perdido</option>
            </select>
            <Button onClick={() => setIsAdding(true)} className="h-[42px] px-6 rounded-xl text-[10px] font-black uppercase"><Plus size={16} className="mr-2" /> Novo Lead</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest"><th className="px-8 py-4">Cliente</th><th className="px-8 py-4">Imóvel/VGV</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Ações</th></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={4} className="p-20 text-center"><RefreshCw className="animate-spin mx-auto text-brand-accent" /></td></tr> : 
                filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="px-8 py-6"><p className="text-sm font-black text-brand-primary uppercase">{l.client_name}</p><p className="text-[9px] text-gray-500 font-bold">{formatPhone(l.phone)}</p></td>
                  <td className="px-8 py-6"><p className="text-xs font-bold uppercase">{l.property_interest || "---"}</p><p className="text-[10px] text-brand-accent font-black">{formatCurrency(l.vgv_value)}</p></td>
                  <td className="px-8 py-6">
                    <select className="text-[9px] font-black uppercase px-3 py-1.5 rounded-full border-none bg-gray-100 cursor-pointer" value={l.crm_status} onChange={e => updateStatus(l.id, e.target.value as any)}>
                      <option value="Novo">Novo</option><option value="Contatado">Contatado</option><option value="Visita">Visita</option><option value="Proposta">Proposta</option><option value="Fechado">Fechado</option><option value="Perdido">Perdido</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right flex gap-2 justify-end">
                    <button onClick={() => window.open(`https://wa.me/${l.phone.replace(/\D/g,'')}`)} className="p-2 text-green-500 bg-green-50 rounded-xl"><Phone size={14}/></button>
                    <button onClick={() => handleDelete(l.id)} className="p-2 text-red-400 bg-red-50 rounded-xl"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-black text-brand-primary uppercase tracking-tighter">Incluir Novo Lead</h3>
              <button onClick={() => setIsAdding(false)}><XCircle size={28} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Nome</label><input required type="text" className="w-full p-3 border rounded-xl bg-gray-50 text-xs font-bold" value={newLead.client_name} onChange={e => setNewLead({...newLead, client_name: e.target.value})} /></div>
                <div><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">WhatsApp</label><input required type="tel" className="w-full p-3 border rounded-xl bg-gray-50 text-xs font-bold" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: formatPhone(e.target.value)})} /></div>
                <div><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">VGV</label><input type="number" className="w-full p-3 border rounded-xl bg-gray-50 text-xs font-bold" value={newLead.vgv_value} onChange={e => setNewLead({...newLead, vgv_value: Number(e.target.value)})} /></div>
                <div className="col-span-2"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Imóvel</label><input type="text" className="w-full p-3 border rounded-xl bg-gray-50 text-xs font-bold" value={newLead.property_interest} onChange={e => setNewLead({...newLead, property_interest: e.target.value})} /></div>
                <div className="col-span-2 flex items-center justify-between p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
                  <div className="flex items-center gap-2"><Coins className="text-orange-500" size={18} /><p className="text-[10px] font-black uppercase">Financiamento?</p></div>
                  <button type="button" onClick={() => setNewLead({...newLead, needs_financing: !newLead.needs_financing})} className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${newLead.needs_financing ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full"></div></button>
                </div>
              </div>
              <Button type="submit" fullWidth className="py-4 rounded-2xl text-xs font-black uppercase">Sincronizar Lead</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;
