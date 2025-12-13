import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { UploadCloud, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Lista das principais cidades de SP para o mercado imobiliário
const SP_CITIES = [
  "São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "São José dos Campos", 
  "Santo André", "Ribeirão Preto", "Osasco", "Sorocaba", "Mauá", "São José do Rio Preto", 
  "Mogi das Cruzes", "Santos", "Diadema", "Jundiaí", "Piracicaba", "Carapicuíba", 
  "Bauru", "Itaquaquecetuba", "São Vicente", "Franca", "Praia Grande", "Guarujá", 
  "Taubaté", "Limeira", "Suzano", "Taboão da Serra", "Sumaré", "Barueri", "Embu das Artes", 
  "São Carlos", "Indaiatuba", "Cotia", "Americana", "Marília", "Itapevi", "Araraquara", 
  "Jacareí", "Hortolândia", "Presidente Prudente", "Rio Claro", "Araçatuba", "Ferraz de Vasconcelos", 
  "Santa Bárbara d'Oeste", "Itapecerica da Serra", "Francisco Morato", "Itu", "Bragança Paulista", 
  "Pindamonhangaba", "Itapetininga", "São Caetano do Sul", "Franco da Rocha", "Mogi Guaçu", 
  "Jaú", "Botucatu", "Atibaia", "Santana de Parnaíba", "Araras", "Cubatão", "Valinhos", 
  "Sertãozinho", "Jandira", "Birigui", "Ribeirão Pires", "Votorantim", "Barretos", "Catanduva", 
  "Várzea Paulista", "Guartinguetá", "Tatuí", "Caraguatatuba", "Itatiba", "Salto", "Poá", 
  "Ourinhos", "Paulínia", "Assis", "Leme", "Itanhaém", "Caieiras", "Mairiporã", "Votuporanga", 
  "Caçapava", "Itapeva", "Mogi Mirim", "São João da Boa Vista", "Avaré", "Lorena", "Ubatuba", 
  "Cajamar", "Arujá", "São Sebastião", "Campo Limpo Paulista", "Bebedouro", "São Roque", 
  "Cruzeiro", "Lins", "Jaboticabal", "Pirassununga", "Vinhedo", "Itapira", "Amparo", 
  "Cosmópolis", "Embu-Guaçu", "Fernandópolis", "Mococa", "Lençóis Paulista", "Peruíbe", 
  "Tupã", "Penápolis", "Batatais", "Bertioga", "Mirassol", "Ibitinga", "Nova Odessa", 
  "Boituva", "Andradina", "Monte Mor", "Registro", "Taquaritinga", "Porto Ferreira", 
  "Piedade", "Capivari", "São José do Rio Pardo", "Olímpia", "Artur Nogueira", "Vargem Grande Paulista", 
  "Porto Feliz", "Jaguariúna", "Rio Grande da Serra", "Louveira", "Pedreira", "Tremembé", 
  "Mongaguá", "Mairinque", "Matinhos", "Pontal", "Rio das Pedras", "Cabreúva", "Serrana", 
  "Jales", "Capão Bonito", "Santa Isabel", "Dracena", "Jardinópolis", "Espírito Santo do Pinhal", 
  "Garça", "Presidente Epitácio", "Orlândia", "Itararé", "Vargem Grande do Sul", "Tietê", 
  "Itápolis", "Ituverava", "São Manuel", "Guaíra", "Promissão", "Socorro", "Américo Brasiliense", 
  "Novo Horizonte", "Guariba", "Pitangueiras", "Presidente Venceslau", "Agudos", "Ibiúna", 
  "Barra Bonita", "Aparecida", "São Pedro", "José Bonifácio", "Aguaí", "Adamantina", 
  "Ilhabela", "Cravinhos", "Santa Cruz do Rio Pardo", "Descalvado", "Cachoeira Paulista", 
  "Morro Agudo", "Bairiti", "Arçoiaba da Serra", "São Miguel Arcanjo", "Osvaldo Cruz", 
  "Brotas", "Santa Fé do Sul", "Paraguaçu Paulista", "Cândido Mota", "Igarapava", "Juquitiba", 
  "Casa Branca", "Guararapes", "Rancharia", "Iperó", "Laranjal Paulista", "Piraju", 
  "Tanabi", "Jambeiro", "Holambra"
].sort();

interface Captcha {
  num1: number;
  num2: number;
  answer: number;
}

// Utility for masking
const formatCurrency = (value: string) => {
  if (!value) return '';
  // Remove non-digits
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  // Convert to float
  const floatValue = parseFloat(numeric) / 100;
  // Format to BRL
  return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseCurrency = (value: string) => {
  if (!value) return 0;
  const numeric = value.replace(/\D/g, '');
  return parseFloat(numeric) / 100;
};

const formatPhone = (value: string) => {
  if (!value) return '';
  let v = value.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

const AdvertisePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Captcha State
  const [captcha, setCaptcha] = useState<Captcha>({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    state: 'SP', // Default locked to SP
    city: 'São Paulo', // Default city
    neighborhood: '',
    street: '',
    price: '', // Display string
    quartos: '',
    banheiros: '',
    area: '',
    vagas: '',
    condominio: '', // Display string
    iptu: '', // Display string
    type: 'Apartamento',
    contract: 'Venda',
    owner_email: '',
    owner_phone: '' // Display string
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1: n1, num2: n2, answer: n1 + n2 });
    setCaptchaInput('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle Masks
    if (name === 'price' || name === 'condominio' || name === 'iptu') {
        setFormData({ ...formData, [name]: formatCurrency(value) });
    } else if (name === 'owner_phone') {
        setFormData({ ...formData, [name]: formatPhone(value.substring(0, 15)) }); // Max length for (XX) XXXXX-XXXX
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const validFiles = selectedFiles.filter(file => 
        (file.type === 'image/jpeg' || file.type === 'image/png')
      );

      if (validFiles.length + files.length > 12) {
        alert('Máximo de 12 imagens permitidas.');
        return;
      }

      if (validFiles.length < selectedFiles.length) {
        alert('Apenas arquivos JPG e PNG são permitidos.');
      }

      setFiles(prev => [...prev, ...validFiles]);

      // Create previews
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
        URL.revokeObjectURL(prev[index]); // Cleanup memory
        return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Verify Captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setError('Captcha incorreto. Tente novamente.');
      generateCaptcha();
      setLoading(false);
      return;
    }

    if (files.length === 0) {
      setError('Adicione pelo menos uma imagem.');
      setLoading(false);
      return;
    }

    try {
      const uploadedImageUrls: string[] = [];

      // 1. Upload Images
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrl);
      }

      // Construct full address for backward compatibility (Admin use mainly)
      const fullAddress = `${formData.street ? formData.street + ', ' : ''}${formData.neighborhood}, ${formData.city} - ${formData.state}`;

      // 2. Insert Data
      const { error: insertError } = await supabase
        .from('properties')
        .insert([{
          title: formData.title,
          description: formData.description,
          // Address Split
          state: formData.state,
          city: formData.city,
          neighborhood: formData.neighborhood,
          street: formData.street,
          address: fullAddress, // Legacy field population
          
          // Numeric Conversions
          price: parseCurrency(formData.price),
          condominio: parseCurrency(formData.condominio),
          iptu: parseCurrency(formData.iptu),
          
          quartos: parseInt(formData.quartos) || 0,
          banheiros: parseInt(formData.banheiros) || 0,
          area: parseFloat(formData.area) || 0,
          vagas: parseInt(formData.vagas) || 0,
          
          type: formData.type,
          contract: formData.contract,
          status: 'available',
          images: uploadedImageUrls,
          
          // Owner Info
          owner_email: formData.owner_email,
          owner_phone: formData.owner_phone
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      window.scrollTo(0,0);
      
      // Reset form
      setFormData({
        title: '', description: '', 
        state: 'SP', city: 'São Paulo', neighborhood: '', street: '',
        price: '', quartos: '', banheiros: '', area: '', 
        vagas: '', condominio: '', iptu: '', 
        type: 'Apartamento', contract: 'Venda',
        owner_email: '', owner_phone: ''
      });
      setFiles([]);
      setPreviews([]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao enviar anúncio.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg text-center">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-brand-primary mb-4">Anúncio Recebido!</h2>
          <p className="text-gray-600 mb-8">
            Seu imóvel foi cadastrado com sucesso. Ele já está disponível em nossa listagem para milhares de compradores.
          </p>
          <div className="flex flex-col gap-3">
             <Button onClick={() => setSuccess(false)}>Cadastrar Outro</Button>
             <Button variant="outline" onClick={() => navigate('/imoveis')}>Ver na Listagem</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-primary mb-2">Anuncie seu Imóvel</h1>
          <p className="text-gray-600">Preencha o formulário abaixo para divulgar seu imóvel em nossa plataforma.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            {/* Section 1: Property Info */}
            <div>
               <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Dados do Imóvel</h3>
               
               <div className="space-y-6">
                 {/* Title & Desc */}
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Anúncio</label>
                    <input type="text" name="title" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" placeholder="Ex: Lindo Apartamento no Jardins" value={formData.title} onChange={handleChange} />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição Detalhada</label>
                    <textarea name="description" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white resize-y" placeholder="Descreva os detalhes, diferenciais e o que torna este imóvel especial..." value={formData.description} onChange={handleChange} />
                 </div>

                 {/* Address Group - Manual with SP Focus */}
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                        Localização 
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
                           {/* Locked State Field */}
                           <input 
                              type="text" 
                              name="state" 
                              readOnly 
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 font-bold cursor-not-allowed text-center" 
                              value="SP" 
                            />
                        </div>
                        <div className="md:col-span-4">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Cidade</label>
                           {/* City Dropdown */}
                           <select 
                             name="city" 
                             required 
                             className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-brand-accent bg-white" 
                             value={formData.city} 
                             onChange={handleChange}
                           >
                              <option value="" disabled>Selecione a cidade</option>
                              {SP_CITIES.map((city, idx) => (
                                <option key={idx} value={city}>{city}</option>
                              ))}
                           </select>
                        </div>
                        <div className="md:col-span-6">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Bairro</label>
                           <input type="text" name="neighborhood" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-brand-accent bg-white" placeholder="Jardins" value={formData.neighborhood} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-12">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Rua e Número (Privado - Não aparece no site)</label>
                           <input type="text" name="street" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-brand-accent bg-white" placeholder="Rua Oscar Freire, 1200" value={formData.street} onChange={handleChange} />
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Finalidade</label>
                        <select name="contract" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" value={formData.contract} onChange={handleChange}>
                            <option value="Venda">Venda</option>
                            <option value="Aluguel">Aluguel</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                        <select name="type" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" value={formData.type} onChange={handleChange}>
                            <option value="Apartamento">Apartamento</option>
                            <option value="Casa">Casa</option>
                            <option value="Studio">Studio</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Comercial">Comercial</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Valor do Imóvel</label>
                        <input type="text" name="price" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" placeholder="R$ 0,00" value={formData.price} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Área Útil (m²)</label>
                        <input type="number" name="area" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" placeholder="0" value={formData.area} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:col-span-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Quartos</label>
                            <input type="number" name="quartos" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" value={formData.quartos} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Banheiros</label>
                            <input type="number" name="banheiros" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" value={formData.banheiros} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Vagas</label>
                            <input type="number" name="vagas" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" value={formData.vagas} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Condomínio</label>
                        <input type="text" name="condominio" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" placeholder="R$ 0,00" value={formData.condominio} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">IPTU</label>
                        <input type="text" name="iptu" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" placeholder="R$ 0,00" value={formData.iptu} onChange={handleChange} />
                    </div>
                 </div>
               </div>
            </div>

            {/* Section 2: Images */}
            <div>
                <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Fotos do Imóvel</h3>
                <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span></p>
                            <p className="text-xs text-gray-500">JPG ou PNG (Max 12 fotos)</p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/jpeg, image/png"
                            onChange={handleFileChange}
                            disabled={files.length >= 12}
                        />
                    </label>
                </div>

                {previews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {previews.map((src, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 3: Contact (No Name) */}
            <div>
               <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Seus Contatos</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                     <input type="email" name="owner_email" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" value={formData.owner_email} onChange={handleChange} placeholder="seu@email.com" />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Celular (WhatsApp)</label>
                     <input type="tel" name="owner_phone" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-brand-accent focus:bg-white" placeholder="(00) 00000-0000" value={formData.owner_phone} onChange={handleChange} />
                  </div>
               </div>
            </div>

            {/* Captcha & Submit */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
               <label className="block text-sm font-bold text-gray-700 mb-2">Verificação de Segurança</label>
               <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-300 font-mono text-lg font-bold tracking-widest text-brand-primary select-none">
                     {captcha.num1} + {captcha.num2} = ?
                  </div>
                  <input 
                    type="number" 
                    className="w-24 px-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-brand-accent"
                    placeholder="Res."
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required
                  />
               </div>
               
               <Button type="submit" fullWidth disabled={loading} className="py-4 text-lg">
                  {loading ? 'Enviando...' : 'Publicar Anúncio'}
               </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvertisePage;