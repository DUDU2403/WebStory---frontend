import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Home, MapPin, Search, PlusCircle, Trash2, MessageCircle, Camera, Loader2 } from 'lucide-react';

// URL DO SEU BACKEND NO RENDER (Sempre sem a barra no final)
const API_URL = "https://meu-imovel-api.onrender.com";

function App() {
  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState("buscar"); // 'buscar' ou 'anunciar'
  const [abaAtiva, setAbaAtiva] = useState("todos"); // 'todos', 'venda', 'aluguel'
  const [selecionadoParaEdicao, setSelecionadoParaEdicao] = useState(null);
  
  // Estados para o Formulário
  const [novoImovel, setNovoImovel] = useState({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", imagemUrl: "" });
  const [fotoArquivo, setFotoArquivo] = useState(null);
  const localizacaoRef = useRef(null);

  const carregarImoveis = async () => {
    try {
      // Usando a variável API_URL para buscar os dados
      const res = await axios.get(`${API_URL}/imoveis`);
      setImoveis(res.data);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  useEffect(() => { carregarImoveis(); }, []);

  // Google Places Autocomplete para campo de localização
  const initAutocomplete = () => {
    if (!window.google?.maps?.places || !localizacaoRef.current) return;
    const autocomplete = new window.google.maps.places.Autocomplete(localizacaoRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "br" },
      fields: ["formatted_address"]
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        setNovoImovel(prev => ({ ...prev, localizacao: place.formatted_address }));
      }
    });
  };

  useEffect(() => {
    if (modo !== "anunciar") return;
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    if (!document.getElementById("google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      window.initAutocomplete = initAutocomplete;
      document.body.appendChild(script);
    }
  }, [modo]);

  // FUNÇÃO PRINCIPAL: Upload + Cadastro
  const cadastrar = async (e) => {
    e.preventDefault();
    
    // Se não for edição e não tiver foto, avisa
    if (!selecionadoParaEdicao && !fotoArquivo) return alert("Por favor, selecione uma foto!");
    
    setCarregando(true);
    try {
      let imagemUrl = novoImovel.imagemUrl;

      // 1. Upload para o Cloudinary (se houver novo arquivo selecionado)
      if (fotoArquivo) {
        const formData = new FormData();
        formData.append("file", fotoArquivo);
        formData.append("upload_preset", "meu_imovel"); // Certifique-se que no Cloudinary está 'Unsigned'

        const resCloud = await axios.post(
          `https://api.cloudinary.com/v1_1/dolazq2mw/image/upload`,
          formData
        );
        imagemUrl = resCloud.data.secure_url;
      }

      // 2. Salvar ou Atualizar no Backend usando API_URL
      if (selecionadoParaEdicao) {
        await axios.put(`${API_URL}/imoveis/${selecionadoParaEdicao}`, {
          ...novoImovel,
          imagemUrl
        });
        alert("🏠 Anúncio atualizado com sucesso!");
      } else {
        await axios.post(`${API_URL}/imoveis`, {
          ...novoImovel,
          imagemUrl
        });
        alert("🏠 Imóvel cadastrado com sucesso!");
      }

      // Limpar formulário e voltar ao modo buscar
      setSelecionadoParaEdicao(null);
      setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", imagemUrl: "" });
      setFotoArquivo(null);
      setModo("buscar");
      carregarImoveis();
    } catch (err) {
      alert("Erro ao processar. Verifique se o servidor no Render está ativo.");
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  const excluir = async (id) => {
    if (window.confirm("Deseja apagar este anúncio permanentemente?")) {
      try {
        await axios.delete(`${API_URL}/imoveis/${id}`);
        carregarImoveis();
      } catch (err) {
        console.error("Erro ao excluir", err);
      }
    }
  };

  const filtrados = imoveis.filter(i => {
    const matchBusca = i.titulo?.toLowerCase().includes(busca.toLowerCase()) || 
                       i.localizacao?.toLowerCase().includes(busca.toLowerCase());
    const matchAba = abaAtiva === "todos" || i.tipo === abaAtiva;
    return matchBusca && matchAba;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-50 border-b-4 border-indigo-400">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur p-3 rounded-2xl">
            <Home size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">IMÓVEL PRO</h1>
            <p className="text-sm text-blue-100 font-medium">Encontre o imóvel dos seus sonhos</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-blue-100" size={20} />
          <input 
            placeholder="Buscar por cidade, bairro..." 
            className="w-full pl-12 pr-5 py-3 rounded-full text-slate-800 font-medium focus:ring-4 focus:ring-blue-300 outline-none transition-all shadow-xl text-base bg-white/95 backdrop-blur"
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </header>

      <main className="px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-4 flex gap-3 mb-8 justify-center md:justify-start">
          <button
            onClick={() => setModo("buscar")}
            className={`px-6 py-2 font-bold rounded-full transition-all ${modo === "buscar" ? "bg-indigo-700 text-white shadow-lg" : "bg-white text-slate-700 border border-indigo-200 hover:bg-indigo-50"}`}
          >
            🔎 Buscar imóveis
          </button>
          <button
            onClick={() => setModo("anunciar")}
            className={`px-6 py-2 font-bold rounded-full transition-all ${modo === "anunciar" ? "bg-green-700 text-white shadow-lg" : "bg-white text-slate-700 border border-green-200 hover:bg-green-50"}`}
          >
            🏠 Anunciar imóvel
          </button>
        </div>

        {/* COLUNA DO FORMULÁRIO */}
        <section className={`lg:col-span-1 ${modo === "anunciar" ? "block" : "hidden"}`}>
          <form onSubmit={cadastrar} className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-indigo-100 space-y-6 sticky top-28 backdrop-blur-sm">
            <h2 className="text-2xl font-black flex items-center gap-3 mb-4 text-indigo-700 border-b-3 border-indigo-200 pb-4">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <PlusCircle size={24} className="text-indigo-600" />
              </div>
              {selecionadoParaEdicao ? "Editar Anúncio" : "Novo Anúncio"}
            </h2>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">📝 Título do Imóvel</label>
              <input required placeholder="Casa moderna com piscina..." className="w-full p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium" 
                value={novoImovel.titulo} onChange={e => setNovoImovel({...novoImovel, titulo: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">🏷️ Tipo de Anúncio</label>
              <select required className="w-full p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium" 
                value={novoImovel.tipo} onChange={e => setNovoImovel({...novoImovel, tipo: e.target.value})}>
                <option value="venda">À Venda</option>
                <option value="aluguel">Para Alugar</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">👤 Anunciante</label>
              <select required className="w-full p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium"
                value={novoImovel.anuncianteTipo} onChange={e => setNovoImovel({...novoImovel, anuncianteTipo: e.target.value})}>
                <option value="vendedor">Vendedor</option>
                <option value="locador">Locador</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">💰 Preço (R$)</label>
              <input required type="number" placeholder="450.000" className="w-full p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium" 
                value={novoImovel.preco} onChange={e => setNovoImovel({...novoImovel, preco: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">📸 Foto do Imóvel</label>
              <div className="relative w-full h-40 border-3 border-dashed border-indigo-300 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all cursor-pointer overflow-hidden group">
                {fotoArquivo ? (
                   <img src={URL.createObjectURL(fotoArquivo)} className="w-full h-full object-cover" alt="preview" />
                ) : novoImovel.imagemUrl ? (
                   <img src={novoImovel.imagemUrl} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <>
                    <Camera className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                    <span className="text-sm text-indigo-600 font-bold">Clique para selecionar</span>
                  </>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={e => setFotoArquivo(e.target.files[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">📍 Localização</label>
              <input
                ref={localizacaoRef}
                required
                placeholder="Ex: Rua Tal, Bairro tal, Cidade..."
                className="w-full p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium"
                value={novoImovel.localizacao}
                onChange={e => setNovoImovel({...novoImovel, localizacao: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">📱 WhatsApp</label>
              <input required placeholder="Ex: 11988887777" className="w-full p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium" 
                value={novoImovel.contato} onChange={e => setNovoImovel({...novoImovel, contato: e.target.value})} />
            </div>

            <div className="flex flex-col gap-2">
              <button 
                disabled={carregando}
                className={`w-full p-4 rounded-2xl font-black text-white shadow-xl transition-all flex justify-center items-center gap-3 text-lg uppercase tracking-wider ${carregando ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-95'}`}
              >
                {carregando ? <Loader2 className="animate-spin" size={24} /> : (selecionadoParaEdicao ? "💾 Atualizar" : "✨ Publicar")}
              </button>
              {selecionadoParaEdicao && (
                <button 
                  type="button"
                  onClick={() => {
                    setSelecionadoParaEdicao(null);
                    setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", imagemUrl: "" });
                    setFotoArquivo(null);
                    setModo("buscar");
                  }}
                  className="w-full p-3 rounded-2xl font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  ✖ Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* COLUNA DOS CARDS */}
        <section className={`lg:col-span-3 ${modo === "anunciar" ? "hidden" : "block"}`}>
          {/* ABAS DE FILTRO */}
          <div className="flex flex-wrap gap-2 mb-8 sticky top-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-10 py-5 border-b-2 border-indigo-100 shadow-sm">
            <button
              onClick={() => setAbaAtiva("todos")}
              className={`px-5 py-2 font-black rounded-xl transition-all ${abaAtiva === "todos" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 border border-indigo-100"}`}
            >
              📋 Todos
            </button>
            <button
              onClick={() => setAbaAtiva("venda")}
              className={`px-5 py-2 font-black rounded-xl transition-all ${abaAtiva === "venda" ? "bg-green-600 text-white shadow-md" : "bg-white text-slate-600 border border-green-100"}`}
            >
              🏷️ Venda
            </button>
            <button
              onClick={() => setAbaAtiva("aluguel")}
              className={`px-5 py-2 font-black rounded-xl transition-all ${abaAtiva === "aluguel" ? "bg-amber-600 text-white shadow-md" : "bg-white text-slate-600 border border-amber-100"}`}
            >
              🔑 Aluguel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrados.length > 0 ? filtrados.map(imovel => (
              <div key={imovel._id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-indigo-50 group">
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img src={imovel.imagemUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="imovel" />
                  <div className={`absolute top-3 right-3 ${imovel.tipo === 'venda' ? 'bg-green-500' : 'bg-amber-500'} text-white px-3 py-1 rounded-full font-black text-xs shadow-md`}>
                    {imovel.tipo === 'venda' ? 'À VENDA' : 'ALUGUEL'}
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-2xl font-black text-indigo-700 mb-1">R$ {Number(imovel.preco).toLocaleString('pt-BR')}</p>
                  <h3 className="font-bold text-lg mb-1 truncate text-slate-800">{imovel.titulo}</h3>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mb-4"><MapPin size={14} /> {imovel.localizacao}</p>
                  
                  <div className="flex flex-col gap-2">
                    <a href={`https://wa.me/${imovel.contato}`} target="_blank" rel="noreferrer" className="bg-green-500 text-white p-3 rounded-xl flex justify-center items-center gap-2 font-bold hover:bg-green-600 transition-all">
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setSelecionadoParaEdicao(imovel._id);
                        setNovoImovel({...imovel});
                        setFotoArquivo(null);
                        setModo("anunciar");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="flex-1 bg-slate-100 text-slate-600 p-2 rounded-xl font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm">
                        ✏️ Editar
                      </button>
                      <button onClick={() => excluir(imovel._id)} className="flex-1 bg-slate-100 text-red-400 p-2 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all text-sm">
                        🗑️ Apagar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20">
                <p className="text-xl font-bold text-slate-400">Nenhum imóvel encontrado.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;