import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Home, MapPin, Search, PlusCircle, Trash2, MessageCircle, Camera, Loader2, UserPlus, LogIn, LogOut, X } from 'lucide-react';

const API_URL = "https://meu-imovel-api.onrender.com";

function App() {
  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState("buscar"); 
  const [abaAtiva, setAbaAtiva] = useState("todos");
  const [selecionadoParaEdicao, setSelecionadoParaEdicao] = useState(null);
  
  // Estados de Autenticação
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [authModo, setAuthModo] = useState("login"); // 'login' ou 'cadastro'
  
  // Estados para Cadastro de Usuário (Leads)
  const [dadosAuth, setDadosAuth] = useState({ nome: "", endereço: "", email: "", cpf: "", telefone: "", senha: "" });

  // Estados para o Imóvel
  const [novoImovel, setNovoImovel] = useState({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", imagemUrl: "" });
  const [fotoArquivo, setFotoArquivo] = useState(null);
  const localizacaoRef = useRef(null);

  const carregarImoveis = async () => {
    try {
      const res = await axios.get(`${API_URL}/imoveis`);
      setImoveis(res.data);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  useEffect(() => { carregarImoveis(); }, []);

  // --- FUNÇÕES DE AUTENTICAÇÃO ---

  const manipularAuth = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const rota = authModo === "login" ? "/auth/login" : "/auth/register";
      const res = await axios.post(`${API_URL}${rota}`, dadosAuth);
      
      if (authModo === "login") {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('usuario', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUsuario(res.data.user);
        setMostrarAuth(false);
        alert(`Bem-vindo, ${res.data.user.nome}!`);
      } else {
        alert("Cadastro realizado! Agora faça seu login.");
        setAuthModo("login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erro na operação.");
    } finally {
      setCarregando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    setModo("buscar");
  };

  // --- FUNÇÕES DE IMÓVEIS ---

  const cadastrar = async (e) => {
    e.preventDefault();
    if (!selecionadoParaEdicao && !fotoArquivo) return alert("Selecione uma foto!");
    
    setCarregando(true);
    try {
      let imagemUrl = novoImovel.imagemUrl;
      if (fotoArquivo) {
        const formData = new FormData();
        formData.append("file", fotoArquivo);
        formData.append("upload_preset", "meu_imovel");
        const resCloud = await axios.post(`https://api.cloudinary.com/v1_1/dolazq2mw/image/upload`, formData);
        imagemUrl = resCloud.data.secure_url;
      }

      const config = { headers: { 'x-auth-token': token } };

      if (selecionadoParaEdicao) {
        await axios.put(`${API_URL}/imoveis/${selecionadoParaEdicao}`, { ...novoImovel, imagemUrl }, config);
      } else {
        await axios.post(`${API_URL}/imoveis`, { ...novoImovel, imagemUrl }, config);
      }

      setSelecionadoParaEdicao(null);
      setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", imagemUrl: "" });
      setFotoArquivo(null);
      setModo("buscar");
      carregarImoveis();
      alert("Sucesso!");
    } catch (err) {
      alert("Erro ao salvar. Verifique se você está logado.");
    } finally {
      setCarregando(false);
    }
  };

  const excluir = async (id) => {
    if (window.confirm("Apagar anúncio?")) {
      try {
        await axios.delete(`${API_URL}/imoveis/${id}`, { headers: { 'x-auth-token': token } });
        carregarImoveis();
      } catch (err) {
        alert("Erro ao excluir.");
      }
    }
  };

  const filtrados = imoveis.filter(i => {
    const matchBusca = i.titulo?.toLowerCase().includes(busca.toLowerCase()) || i.localizacao?.toLowerCase().includes(busca.toLowerCase());
    const matchAba = abaAtiva === "todos" || i.tipo === abaAtiva;
    return matchBusca && matchAba;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* MODAL DE LOGIN/CADASTRO */}
      {mostrarAuth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-widest">
                {authModo === "login" ? "Acesse sua conta" : "Seja um anunciante"}
              </h2>
              <button onClick={() => setMostrarAuth(false)}><X size={24} /></button>
            </div>
            <form onSubmit={manipularAuth} className="p-8 space-y-4">
              {authModo === "cadastro" && (
                <>
                  <input required placeholder="Nome Completo" className="w-full p-3 border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500"
                    onChange={e => setDadosAuth({...dadosAuth, nome: e.target.value})} />
                  <input required placeholder="CPF (Apenas números)" className="w-full p-3 border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500"
                    onChange={e => setDadosAuth({...dadosAuth, cpf: e.target.value})} />
                  <input required placeholder="WhatsApp (DDD + Número)" className="w-full p-3 border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500"
                    onChange={e => setDadosAuth({...dadosAuth, telefone: e.target.value})} />
                </>
              )}
              <input required type="email" placeholder="Seu E-mail" className="w-full p-3 border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500"
                onChange={e => setDadosAuth({...dadosAuth, email: e.target.value})} />
              <input required type="password" placeholder="Sua Senha" className="w-full p-3 border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500"
                onChange={e => setDadosAuth({...dadosAuth, senha: e.target.value})} />
              
              <button disabled={carregando} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black hover:bg-indigo-700 transition-all flex justify-center">
                {carregando ? <Loader2 className="animate-spin" /> : (authModo === "login" ? "ENTRAR" : "CRIAR CONTA")}
              </button>
              
              <button type="button" onClick={() => setAuthModo(authModo === "login" ? "cadastro" : "login")} className="w-full text-indigo-600 font-bold text-sm">
                {authModo === "login" ? "Não tem conta? Cadastre-se aqui" : "Já tem conta? Faça Login"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-50 border-b-4 border-indigo-400">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur p-3 rounded-2xl"><Home size={32} /></div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Imóvel Pro</h1>
            {usuario && <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Olá, {usuario.nome}</p>}
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-blue-100" size={20} />
          <input placeholder="Buscar por cidade, bairro..." className="w-full pl-12 pr-5 py-3 rounded-full text-slate-800 font-medium focus:ring-4 focus:ring-blue-300 outline-none transition-all shadow-xl bg-white/95" onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {usuario ? (
            <button onClick={logout} className="bg-red-500/20 hover:bg-red-500 p-3 rounded-full transition-all flex items-center gap-2 font-bold text-xs"><LogOut size={18}/> SAIR</button>
          ) : (
            <button onClick={() => {setAuthModo("login"); setMostrarAuth(true)}} className="bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all flex items-center gap-2 font-bold text-xs uppercase"><LogIn size={18}/> Entrar</button>
          )}
        </div>
      </header>

      <main className="px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-4 flex gap-3 mb-8 justify-center md:justify-start">
          <button onClick={() => setModo("buscar")} className={`px-6 py-2 font-bold rounded-full transition-all ${modo === "buscar" ? "bg-indigo-700 text-white shadow-lg" : "bg-white text-slate-700 border border-indigo-200"}`}>🔎 Buscar imóveis</button>
          <button onClick={() => {
            if(!usuario) { setAuthModo("cadastro"); setMostrarAuth(true); }
            else { setModo("anunciar"); }
          }} className={`px-6 py-2 font-bold rounded-full transition-all ${modo === "anunciar" ? "bg-green-700 text-white shadow-lg" : "bg-white text-slate-700 border border-green-200"}`}>🏠 Anunciar imóvel</button>
        </div>

        {/* COLUNA DO FORMULÁRIO */}
        <section className={`lg:col-span-1 ${modo === "anunciar" ? "block" : "hidden"}`}>
          <form onSubmit={cadastrar} className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-indigo-100 space-y-6 sticky top-28">
            <h2 className="text-2xl font-black text-indigo-700 border-b-3 border-indigo-200 pb-4">
              {selecionadoParaEdicao ? "Editar Anúncio" : "Novo Anúncio"}
            </h2>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase">📝 Título</label>
              <input required className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-indigo-200" value={novoImovel.titulo} onChange={e => setNovoImovel({...novoImovel, titulo: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase">🏷️ Tipo</label>
                <select className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-indigo-200" value={novoImovel.tipo} onChange={e => setNovoImovel({...novoImovel, tipo: e.target.value})}>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase">💰 Preço</label>
                <input required type="number" className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-indigo-200" value={novoImovel.preco} onChange={e => setNovoImovel({...novoImovel, preco: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase">📸 Foto</label>
              <div className="relative w-full h-32 border-3 border-dashed border-indigo-300 rounded-2xl flex flex-col items-center justify-center bg-indigo-50 overflow-hidden">
                {fotoArquivo ? <img src={URL.createObjectURL(fotoArquivo)} className="w-full h-full object-cover" /> : <Camera size={32} className="text-indigo-400" />}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFotoArquivo(e.target.files[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase">📍 Endereço</label>
              <input required className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-indigo-200" value={novoImovel.localizacao} onChange={e => setNovoImovel({...novoImovel, localizacao: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase">📱 WhatsApp para contato</label>
              <input required placeholder="119..." className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-indigo-200" value={novoImovel.contato} onChange={e => setNovoImovel({...novoImovel, contato: e.target.value})} />
            </div>

            <button disabled={carregando} className="w-full p-4 rounded-2xl font-black text-white bg-indigo-600 shadow-xl uppercase transition-all">
              {carregando ? <Loader2 className="animate-spin inline" /> : "Publicar Agora"}
            </button>
          </form>
        </section>

        {/* VITRINE DE IMÓVEIS */}
        <section className={`lg:col-span-3 ${modo === "anunciar" ? "hidden" : "block"}`}>
          <div className="flex gap-2 mb-8 sticky top-24 bg-slate-50/80 backdrop-blur z-10 py-4">
            {["todos", "venda", "aluguel"].map(tipo => (
              <button key={tipo} onClick={() => setAbaAtiva(tipo)} className={`px-5 py-2 font-black rounded-xl uppercase text-xs transition-all ${abaAtiva === tipo ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 border border-indigo-100"}`}>
                {tipo}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrados.map(imovel => (
              <div key={imovel._id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-indigo-50">
                <div className="relative h-48">
                  <img src={imovel.imagemUrl} className="w-full h-full object-cover" alt="imovel" />
                  <div className={`absolute top-3 right-3 ${imovel.tipo === 'venda' ? 'bg-green-500' : 'bg-amber-500'} text-white px-3 py-1 rounded-full font-black text-[10px]`}>
                    {imovel.tipo.toUpperCase()}
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-2xl font-black text-indigo-700">R$ {Number(imovel.preco).toLocaleString('pt-BR')}</p>
                  <h3 className="font-bold text-lg text-slate-800 truncate">{imovel.titulo}</h3>
                  <p className="text-slate-500 text-xs flex items-center gap-1 mb-4"><MapPin size={14} /> {imovel.localizacao}</p>
                  
                  <div className="flex flex-col gap-2">
                    <a href={`https://wa.me/${imovel.contato}`} target="_blank" rel="noreferrer" className="bg-green-500 text-white p-3 rounded-xl flex justify-center items-center gap-2 font-bold hover:bg-green-600 transition-all">
                      <MessageCircle size={18} /> Ver Contato
                    </a>
                    
                    {/* SÓ MOSTRA EDITAR/EXCLUIR SE FOR O DONO */}
                    {usuario && imovel.criadoPor?._id === usuario.id && (
                      <div className="flex gap-2 border-t pt-2 mt-2">
                        <button onClick={() => {
                          setSelecionadoParaEdicao(imovel._id);
                          setNovoImovel({...imovel});
                          setModo("anunciar");
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} className="flex-1 bg-slate-100 text-slate-600 p-2 rounded-xl font-bold text-xs hover:bg-indigo-50">✏️ EDITAR</button>
                        <button onClick={() => excluir(imovel._id)} className="flex-1 bg-slate-100 text-red-400 p-2 rounded-xl font-bold text-xs hover:bg-red-50">🗑️ APAGAR</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;