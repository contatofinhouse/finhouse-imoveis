import React, { useEffect, useState } from 'react';
import { supabase, Property } from '../supabaseClient';
import { MapPin, BedDouble, Bath, Square, Search, AlertTriangle, X, Heart, ChevronLeft, ChevronRight, Share2, Car, ChevronDown } from 'lucide-react';
import Button from '../components/Button';
import { COMPANY_PHONE } from '../constants';

// Mock data update to match new interface with extra fields
const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Cobertura Duplex no Jardins",
    address: "Rua Oscar Freire, 1200 - Jardins, São Paulo",
    price: 2500000,
    quartos: 3,
    banheiros: 4,
    area: 220,
    vagas: 3,
    condominio: 2500,
    iptu: 850,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800"
    ],
    type: "Apartamento",
    contract: "Venda",
    status: "available"
  },
  {
    id: 2,
    title: "Casa de Alto Padrão em Alphaville",
    address: "Alameda Rio Negro, 500 - Alphaville, Barueri",
    price: 3800000,
    quartos: 4,
    banheiros: 5,
    area: 450,
    vagas: 4,
    condominio: 1200,
    iptu: 500,
    images: [
      "https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
    ],
    type: "Casa",
    contract: "Venda",
    status: "available"
  },
  {
    id: 3,
    title: "Studio Moderno na Vila Madalena",
    address: "Rua Harmonia, 350 - Vila Madalena, São Paulo",
    price: 3500,
    quartos: 1,
    banheiros: 1,
    area: 45,
    vagas: 1,
    condominio: 600,
    iptu: 150,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
    ],
    type: "Studio",
    contract: "Aluguel",
    status: "available"
  },
  {
    id: 4,
    title: "Terreno em Condomínio Fechado",
    address: "Residencial Bosque, Cotia - SP",
    price: 450000,
    quartos: 0,
    banheiros: 0,
    area: 1000,
    vagas: 0,
    condominio: 400,
    iptu: 100,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
    ],
    type: "Terreno",
    contract: "Venda",
    status: "available"
  }
];

// Carousel Component
const ImageCarousel: React.FC<{ images: string[]; alt: string; onClick?: () => void }> = ({ images, alt, onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Sem imagem</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <img 
        src={images[currentIndex]} 
        alt={`${alt} - Foto ${currentIndex + 1}`} 
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        onClick={onClick}
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 rounded-full text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 rounded-full text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface PropertiesPageProps {
  favoritesOnly?: boolean;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ favoritesOnly = false }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterContract, setFilterContract] = useState('Todos');
  const [filterPrice, setFilterPrice] = useState('any');

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedFavorites = localStorage.getItem('finhouse_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch failed or table missing, loading mock data:', error.message);
        setProperties(MOCK_PROPERTIES);
        setUsingMockData(true);
      } else if (data) {
        const normalizedData: Property[] = data.map((item: any) => ({
          ...item,
          images: (item.images && item.images.length > 0) ? item.images : (item.image_url ? [item.image_url] : []),
          quartos: item.quartos !== undefined ? item.quartos : (item.beds || 0),
          banheiros: item.banheiros !== undefined ? item.banheiros : (item.baths || 0),
          area: item.area !== undefined ? item.area : (item.sqft || 0),
          vagas: item.vagas !== undefined ? item.vagas : 0,
          condominio: item.condominio !== undefined ? item.condominio : 0,
          iptu: item.iptu !== undefined ? item.iptu : 0,
          type: item.type || 'Imóvel',
          contract: item.contract || 'Venda' // Default to Venda if missing
        }));

        setProperties(normalizedData);
        setUsingMockData(false);
      } else {
         setProperties(MOCK_PROPERTIES);
         setUsingMockData(true);
      }
    } catch (error) {
      console.error('Unexpected error, loading mock data:', error);
      setProperties(MOCK_PROPERTIES);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    setFavorites(newFavorites);
    localStorage.setItem('finhouse_favorites', JSON.stringify(newFavorites));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleShare = async (e: React.MouseEvent, property: Property) => {
    e.stopPropagation(); 
    e.preventDefault();
    const shareData = {
      text: `Confira este imóvel incrível: ${property.title} em ${property.address}. Valor: ${formatCurrency(property.price)}`,
      url: window.location.href 
    };
    try {
      await navigator.clipboard.writeText(`${shareData.text} \n${shareData.url}`);
      alert('Link copiado para a área de transferência!');
    } catch (err) {
      console.log('Error sharing:', err);
      alert('Não foi possível copiar o link.');
    }
  };

  const filteredProperties = properties.filter(p => {
    // 1. Search Term
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Favorites
    const matchesFavorites = favoritesOnly ? favorites.includes(p.id) : true;

    // 3. Type Filter
    const matchesType = filterType === 'Todos' || p.type === filterType;

    // 4. Contract Filter (Rent vs Buy)
    const matchesContract = filterContract === 'Todos' || 
                           (p.contract && p.contract.toLowerCase() === filterContract.toLowerCase()) ||
                           (!p.contract && filterContract === 'Venda'); // Assume sale if undefined

    // 5. Price Filter
    let matchesPrice = true;
    if (filterPrice !== 'any') {
        const price = p.price;
        if (filterPrice === 'low') matchesPrice = price <= 500000;
        else if (filterPrice === 'mid') matchesPrice = price > 500000 && price <= 1000000;
        else if (filterPrice === 'high') matchesPrice = price > 1000000;
        else if (filterPrice === 'rent_low') matchesPrice = price <= 3000;
        else if (filterPrice === 'rent_mid') matchesPrice = price > 3000 && price <= 7000;
        else if (filterPrice === 'rent_high') matchesPrice = price > 7000;
    }

    return matchesSearch && matchesFavorites && matchesType && matchesContract && matchesPrice;
  });

  const handleWhatsAppClick = (property: Property) => {
    const text = `Olá! Tenho interesse no imóvel: *${property.title}* (${property.address}) no valor de ${formatCurrency(property.price)}. Gostaria de mais informações.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Search & Filters */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
             <h1 className="text-3xl font-bold text-brand-primary">
                {favoritesOnly ? 'Meus Favoritos' : 'Encontre seu Imóvel'}
             </h1>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Search Bar */}
                <div className="col-span-1 md:col-span-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent focus:bg-white transition-colors"
                    placeholder="Buscar por nome ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Contract Filter (Venda/Aluguel) */}
                <div className="col-span-1 md:col-span-2 relative">
                   <select 
                      className="block w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent appearance-none cursor-pointer"
                      value={filterContract}
                      onChange={(e) => setFilterContract(e.target.value)}
                   >
                      <option value="Todos">Finalidade</option>
                      <option value="Venda">Comprar</option>
                      <option value="Aluguel">Alugar</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Type Filter */}
                <div className="col-span-1 md:col-span-2 relative">
                   <select 
                      className="block w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent appearance-none cursor-pointer"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                   >
                      <option value="Todos">Tipo de Imóvel</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Casa">Casa</option>
                      <option value="Terreno">Terreno</option>
                      <option value="Studio">Studio</option>
                      <option value="Comercial">Comercial</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Price Filter */}
                <div className="col-span-1 md:col-span-2 relative">
                   <select 
                      className="block w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent appearance-none cursor-pointer"
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(e.target.value)}
                   >
                      <option value="any">Preço</option>
                      {filterContract === 'Aluguel' ? (
                          <>
                             <option value="rent_low">Até R$ 3.000</option>
                             <option value="rent_mid">R$ 3.000 - R$ 7.000</option>
                             <option value="rent_high">Acima de R$ 7.000</option>
                          </>
                      ) : (
                          <>
                            <option value="low">Até R$ 500 mil</option>
                            <option value="mid">R$ 500k - R$ 1MM</option>
                            <option value="high">Acima de R$ 1MM</option>
                          </>
                      )}
                   </select>
                   <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Action Buttons */}
                <div className="col-span-1 md:col-span-2 flex gap-2">
                   {!favoritesOnly && (
                     <Button 
                       className="w-full h-9 py-0 text-sm bg-brand-primary hover:bg-brand-dark shadow-none" 
                       onClick={fetchProperties}
                     >
                       Buscar
                     </Button>
                   )}
                </div>
             </div>
          </div>

          {/* Demo Mode Alert */}
          {usingMockData && (
            <div className="mt-4 flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 text-xs">
              <AlertTriangle size={14} />
              <span>Modo demonstração. Conecte o Supabase para dados reais.</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {favoritesOnly ? 'Você ainda não possui favoritos.' : 'Nenhum imóvel encontrado.'}
            </h3>
            <p className="text-gray-500 mt-1 text-sm">
              {favoritesOnly ? 'Navegue pelos imóveis e clique no coração para salvar.' : 'Tente ajustar os filtros para ver mais opções.'}
            </p>
            <Button variant="outline" className="mt-6 text-sm h-10 py-0" onClick={() => {
                setSearchTerm('');
                setFilterType('Todos');
                setFilterContract('Todos');
                setFilterPrice('any');
            }}>
                Limpar Filtros
            </Button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <div 
              key={property.id} 
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group/card"
            >
              {/* Image Container with Carousel */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <ImageCarousel 
                  images={property.images} 
                  alt={property.title} 
                  onClick={() => setSelectedProperty(property)} 
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-none">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-dark uppercase tracking-wider shadow-sm">
                      {property.type}
                    </span>
                    {property.contract === 'Aluguel' && (
                       <span className="bg-brand-accent/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                         Aluguel
                       </span>
                    )}
                </div>
                
                {/* Action Buttons (Share & Favorite) */}
                <div className="absolute top-4 right-4 z-30 flex gap-2">
                  <button 
                    onClick={(e) => handleShare(e, property)}
                    className="bg-white p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform focus:outline-none text-gray-500 hover:text-brand-accent cursor-pointer"
                    title="Copiar Link"
                    type="button"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => toggleFavorite(e, property.id)}
                    className="bg-white p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform focus:outline-none cursor-pointer"
                    title="Favoritar"
                    type="button"
                  >
                    <Heart 
                      size={16} 
                      className={favorites.includes(property.id) ? "fill-red-500 text-red-500 transition-colors" : "text-gray-400 transition-colors"} 
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-grow cursor-pointer" onClick={() => setSelectedProperty(property)}>
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-brand-primary tracking-tight">
                      {formatCurrency(property.price)}
                      {property.contract === 'Aluguel' && <span className="text-sm font-normal text-gray-500">/mês</span>}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3 mb-4 text-gray-600 text-xs">
                  {property.type !== 'Terreno' && (
                      <>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            <BedDouble size={14} className="text-brand-accent"/>
                            <span className="font-semibold">{property.quartos}</span> <span className="text-gray-400">qts</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            <Bath size={14} className="text-brand-accent"/>
                            <span className="font-semibold">{property.banheiros}</span> <span className="text-gray-400">ban</span>
                        </div>
                      </>
                  )}
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                    <Square size={14} className="text-brand-accent"/>
                    <span className="font-semibold">{property.area}</span> <span className="text-gray-400">m²</span>
                  </div>
                  {property.vagas > 0 && (
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Car size={14} className="text-brand-accent"/>
                      <span className="font-semibold">{property.vagas}</span> <span className="text-gray-400">vag</span>
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-gray-800 text-base mb-1 truncate">{property.title}</h4>
                <div className="flex items-start text-gray-500 text-xs">
                  <MapPin size={14} className="mt-0.5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{property.address}</span>
                </div>
              </div>

              {/* Footer Button */}
              <div className="px-5 pb-5 pt-0 mt-auto">
                <Button 
                  fullWidth 
                  variant="outline" 
                  className="rounded-lg h-9 py-0 text-sm border-gray-200 text-gray-600 hover:border-brand-accent hover:text-brand-accent"
                  onClick={() => setSelectedProperty(property)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSelectedProperty(null)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col md:flex-row transition-transform duration-300 scale-100" 
            onClick={e => e.stopPropagation()}
          >
            <button 
                onClick={() => setSelectedProperty(null)} 
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-gray-100 transition-colors text-gray-800 border border-gray-200"
            >
              <X size={24} />
            </button>
            
            {/* Image Side (Left) - Modal Carousel */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 min-h-[300px]">
               <ImageCarousel images={selectedProperty.images} alt={selectedProperty.title} />
            </div>

            {/* Content Side (Right) */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col bg-white">
               <div className="mb-2 flex justify-between items-start">
                   <div className="flex gap-2">
                       <span className="inline-block px-3 py-1 rounded-full bg-brand-light text-brand-accent text-xs font-bold uppercase tracking-wider mb-3 border border-brand-accent/20">
                           {selectedProperty.type}
                       </span>
                       {selectedProperty.contract === 'Aluguel' && (
                           <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider mb-3 border border-green-200">
                               Aluguel
                           </span>
                       )}
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleShare(e, selectedProperty)}
                        className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-brand-accent cursor-pointer"
                        title="Copiar Link"
                        type="button"
                      >
                        <Share2 size={24} />
                      </button>
                      <button 
                        onClick={(e) => toggleFavorite(e, selectedProperty.id)}
                        className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Favoritar"
                        type="button"
                      >
                        <Heart 
                          size={24} 
                          className={favorites.includes(selectedProperty.id) ? "fill-red-500 text-red-500" : "text-gray-400"} 
                        />
                      </button>
                   </div>
               </div>
               
               <h2 className="text-3xl font-bold text-brand-primary leading-tight mb-2">{selectedProperty.title}</h2>

               <p className="text-gray-500 flex items-start mb-6 text-sm">
                  <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0 text-brand-accent" /> {selectedProperty.address}
               </p>
               
               <div className="mb-6">
                 <div className="text-4xl font-bold text-brand-accent mb-2">
                    {formatCurrency(selectedProperty.price)}
                    {selectedProperty.contract === 'Aluguel' && <span className="text-xl text-gray-400 font-normal">/mês</span>}
                 </div>
                 
                 {/* Costs Section - Cleaned up separator */}
                 <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                   {selectedProperty.condominio > 0 && (
                     <span className="flex items-center gap-1">
                       <span className="font-semibold">Condomínio:</span> {formatCurrency(selectedProperty.condominio)}
                     </span>
                   )}
                   {selectedProperty.condominio > 0 && selectedProperty.iptu > 0 && (
                     <span className="hidden sm:inline text-gray-300">•</span>
                   )}
                   {selectedProperty.iptu > 0 && (
                     <span className="flex items-center gap-1">
                       <span className="font-semibold">IPTU:</span> {formatCurrency(selectedProperty.iptu)}
                     </span>
                   )}
                 </div>
               </div>

               {/* Grid with 4 items including Garage */}
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {selectedProperty.type !== 'Terreno' && (
                      <>
                          <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                             <BedDouble className="mx-auto mb-1 text-brand-accent" size={22} />
                             <span className="block font-bold text-lg text-gray-800">{selectedProperty.quartos}</span>
                             <span className="text-[10px] text-gray-500 uppercase font-medium">Quartos</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                             <Bath className="mx-auto mb-1 text-brand-accent" size={22} />
                             <span className="block font-bold text-lg text-gray-800">{selectedProperty.banheiros}</span>
                             <span className="text-[10px] text-gray-500 uppercase font-medium">Banheiros</span>
                          </div>
                      </>
                  )}
                  <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                     <Car className="mx-auto mb-1 text-brand-accent" size={22} />
                     <span className="block font-bold text-lg text-gray-800">{selectedProperty.vagas}</span>
                     <span className="text-[10px] text-gray-500 uppercase font-medium">Vagas</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                     <Square className="mx-auto mb-1 text-brand-accent" size={22} />
                     <span className="block font-bold text-lg text-gray-800">{selectedProperty.area}</span>
                     <span className="text-[10px] text-gray-500 uppercase font-medium">Área (m²)</span>
                  </div>
               </div>

               <div className="mb-8">
                   <h3 className="font-bold text-gray-900 mb-2">Sobre este imóvel</h3>
                   <p className="text-gray-600 leading-relaxed font-light">
                       Excelente oportunidade de {selectedProperty.contract === 'Aluguel' ? 'alugar' : 'comprar'} um {selectedProperty.type.toLowerCase()} localizado em uma das melhores regiões da cidade. 
                       Com {selectedProperty.area}m², este imóvel oferece todo o conforto e praticidade que você busca. 
                       {selectedProperty.type !== 'Terreno' && `Possui ${selectedProperty.quartos} quartos espaçosos, ${selectedProperty.banheiros} banheiros e`} {selectedProperty.vagas} vagas de garagem. 
                       Acabamento de alto padrão e pronto para morar. Agende sua visita!
                   </p>
               </div>

               <div className="mt-auto pt-6 border-t border-gray-100">
                   <Button fullWidth onClick={() => handleWhatsAppClick(selectedProperty)} className="py-4 text-lg shadow-xl shadow-indigo-200">
                      Tenho Interesse
                   </Button>
                   <p className="text-center text-xs text-gray-400 mt-3">
                       Você será redirecionado para o WhatsApp de um de nossos consultores.
                   </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;