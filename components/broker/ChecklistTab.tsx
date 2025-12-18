
import React, { useState } from 'react';
import { FileText, User, Home } from 'lucide-react';

const ChecklistTab: React.FC = () => {
  const [checklistRole, setChecklistRole] = useState<'buyer' | 'seller'>('buyer');
  const [paymentType, setPaymentType] = useState<'finance' | 'cash'>('finance'); 
  const [useFGTS, setUseFGTS] = useState(false);
  const [sellerType, setSellerType] = useState<'pf' | 'pj'>('pf');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [isEntrepreneur, setIsEntrepreneur] = useState(false);
  const [checklistCopied, setChecklistCopied] = useState(false);

  const generateChecklist = () => {
    let list = `CHECKLIST DE AUDITORIA - finHouse\n`;
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

  return (
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
                     <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Casado(a)?</label><button onClick={() => setMaritalStatus(maritalStatus === 'single' ? 'married' : 'single')} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${maritalStatus === 'married' ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-md"></div></button></div>
                     <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Empresário?</label><button onClick={() => setIsEntrepreneur(!isEntrepreneur)} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${isEntrepreneur ? 'bg-brand-accent justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-md"></div></button></div>
                  </div>

                  {checklistRole === 'buyer' && (
                     <div className="space-y-4 pt-4 border-t border-brand-accent/10 animate-fade-in">
                        <h4 className="text-[9px] font-black text-brand-accent uppercase tracking-widest">Pagamento</h4>
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
      <div className="lg:col-span-7 bg-brand-primary p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden min-h-[450px]">
        <div className="flex justify-between items-center mb-10 relative z-10">
          <h3 className="text-3xl font-black uppercase tracking-tighter">Checklist finHouse</h3>
          <button onClick={copyChecklist} className="bg-white text-brand-primary px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105">
            {checklistCopied ? 'COPIADO!' : 'COPIAR LISTA'}
          </button>
        </div>
        <div className="bg-white/5 border border-white/10 p-10 rounded-3xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed uppercase relative z-10 h-64 overflow-y-auto no-scrollbar shadow-inner">
          {generateChecklist()}
        </div>
      </div>
    </div>
  );
};

export default ChecklistTab;
