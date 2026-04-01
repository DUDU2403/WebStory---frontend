import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Home, MapPin, Search, PlusCircle, Trash2, MessageCircle, Camera, Loader2, UserPlus, LogIn, LogOut, X, ShieldCheck, Users, Zap, BarChart3, CreditCard, CheckCircle2 } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';

// Dica: Use localhost se estiver testando localmente, ou a URL do seu deploy
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? "http://localhost:10000" : "https://meu-imovel-api.onrender.com");

// Componente de Card extraído para melhor organização e performance
const ImovelCard = ({ imovel, usuario, onEdit, onDelete, onSell }) => (
  <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:-translate-y-2 transition-all duration-500 border border-slate-100">
    <div className="relative h-64 overflow-hidden">
      <img src={imovel.imagemUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={imovel.titulo} />
      {imovel.status === 'vendido' && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-black uppercase tracking-widest">Vendido</span>
        </div>
      )}
      <div className={`absolute top-4 left-4 ${imovel.tipoNegocio === 'venda' ? 'bg-indigo-600' : 'bg-emerald-500'} text-white px-4 py-1.5 rounded-xl font-bold text-[10px] tracking-widest uppercase shadow-lg`}>
        {imovel.tipoNegocio?.toUpperCase()} • {imovel.tipoImovel?.toUpperCase()}
      </div>
    </div>
    
    <div className="p-7">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">{imovel.titulo}</h3>
      </div>
      <p className="text-2xl font-black text-slate-900 mb-2">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.preco)}
      </p>
      <p className="text-slate-400 text-sm font-medium flex items-center gap-1.5 mb-8">
        <MapPin size={16} className="text-indigo-500" /> {imovel.localizacao}
      </p>

      <div className="flex items-center gap-2 mb-6">
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-tighter">{imovel.tipoImovel}</span>
        {imovel.comissao && (
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-tighter">Parceria: {imovel.comissao}%</span>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <a href={`https://wa.me/${imovel.contato}`} target="_blank" rel="noreferrer" className="bg-emerald-500 text-white p-4 rounded-2xl flex justify-center items-center gap-3 font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-50 active:scale-[0.98]">
          <MessageCircle size={20} /> Falar com anunciante
        </a>
        
        {usuario && imovel.criadoPor?._id === usuario.id && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => onEdit(imovel)} className="flex-1 bg-slate-50 text-slate-500 p-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              EDITAR
            </button>
            <button onClick={() => onDelete(imovel._id)} className="flex-1 bg-slate-50 text-slate-500 p-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">
              APAGAR
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

function App() {
  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState("buscar"); 
  const [matches, setMatches] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("todos");
  const [selecionadoParaEdicao, setSelecionadoParaEdicao] = useState(null);
  
  // Estados de Autenticação
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [authModo, setAuthModo] = useState("login"); // 'login' ou 'cadastro'
  const [mostrarPolitica, setMostrarPolitica] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  
  // Estados para Cadastro de Usuário (Leads)
  const [dadosAuth, setDadosAuth] = useState({ nome: "", email: "", cpf: "", creci: "", telefone: "", senha: "" });

  // Estados para o Imóvel
  const [novoImovel, setNovoImovel] = useState({ titulo: "", preco: "", localizacao: "", contato: "", tipoNegocio: "venda", tipoImovel: "casa", comissao: "6", imagemUrl: "" });
  const [fotoArquivo, setFotoArquivo] = useState(null);

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
    if (authModo === "cadastro" && !aceitouTermos) {
      return alert("Você precisa aceitar a Política de Privacidade para continuar.");
    }
    
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
      console.error("Erro detalhado da Auth:", err);
      alert(err.response?.data?.message || "Erro de conexão com o servidor. Verifique se o backend está rodando.");
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
      setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipoNegocio: "venda", tipoImovel: "casa", comissao: "", imagemUrl: "" });
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

  const carregarMatches = async () => {
    setCarregando(true);
    try {
      const res = await axios.get(`${API_URL}/imoveis/matches`, { headers: { 'x-auth-token': token } });
      setMatches(res.data);
      setModo("matches");
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao carregar matches.");
    } finally { setCarregando(false); }
  };

  const confirmarVenda = async (id) => {
    if (window.confirm("Ao confirmar, você reconhece a venda e a taxa de 2% devida ao site. Prosseguir?")) {
      try {
        await axios.post(`${API_URL}/imoveis/${id}/vender`, {}, { headers: { 'x-auth-token': token } });
        carregarImoveis();
        alert("Negócio fechado! Entraremos em contato para as instruções de repasse da taxa.");
      } catch (err) {
        alert("Erro ao confirmar venda.");
      }
    }
  };

  const filtrados = imoveis.filter(i => {
    const matchBusca = i.titulo?.toLowerCase().includes(busca.toLowerCase()) || i.localizacao?.toLowerCase().includes(busca.toLowerCase());
    const matchAba = abaAtiva === "todos" || i.tipoNegocio === abaAtiva;
    return matchBusca && matchAba;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
      
      {/* POLÍTICA DE PRIVACIDADE MODAL */}
      {mostrarPolitica && <PrivacyPolicy onClose={() => setMostrarPolitica(false)} />}

      {/* MODAL DE LOGIN/CADASTRO */}
      {mostrarAuth && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 bg-linear-to-br from-indigo-600 to-blue-700 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {authModo === "login" ? "Acesse sua conta" : "Seja um anunciante"}
              </h2>
              <button onClick={() => setMostrarAuth(false)} className="hover:rotate-90 transition-transform"><X size={28} /></button>
            </div>
            <form onSubmit={manipularAuth} className="p-10 space-y-5">
              {authModo === "cadastro" && (
                <>
                  <input required value={dadosAuth.nome} placeholder="Nome Completo" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    onChange={e => setDadosAuth({...dadosAuth, nome: e.target.value})} />
                  <input required value={dadosAuth.cpf} placeholder="CPF (Apenas números)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    onChange={e => setDadosAuth({...dadosAuth, cpf: e.target.value})} />
                  <input required value={dadosAuth.creci} placeholder="Número do CRECI" className="w-full p-4 bg-slate-50 border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    onChange={e => setDadosAuth({...dadosAuth, creci: e.target.value})} />
                  <input required value={dadosAuth.telefone} placeholder="WhatsApp (DDD + Número)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    onChange={e => setDadosAuth({...dadosAuth, telefone: e.target.value})} />
                </>
              )}
              <input required value={dadosAuth.email} type="email" placeholder="Seu E-mail" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                onChange={e => setDadosAuth({...dadosAuth, email: e.target.value})} />
              <input required value={dadosAuth.senha} type="password" placeholder="Sua Senha" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                onChange={e => setDadosAuth({...dadosAuth, senha: e.target.value})} />
              
              <button disabled={carregando} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex justify-center active:scale-[0.98]">
                {carregando ? <Loader2 className="animate-spin" /> : (authModo === "login" ? "ENTRAR" : "CRIAR CONTA")}
              </button>

              {authModo === "cadastro" && (
                <div className="flex items-start gap-3 p-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                    onChange={(e) => setAceitouTermos(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                    Aceito a <button type="button" onClick={() => setMostrarPolitica(true)} className="text-indigo-600 font-bold hover:underline">Política de Privacidade</button> e o processamento dos meus dados para captação de leads.
                  </label>
                </div>
              )}
              
              <button type="button" onClick={() => setAuthModo(authModo === "login" ? "cadastro" : "login")} className="w-full text-slate-500 font-semibold text-sm hover:text-indigo-600 transition-colors">
                {authModo === "login" ? "Não tem conta? Cadastre-se aqui" : "Já tem conta? Faça Login"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-4xl px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-indigo-600 text-white p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-100">
              <Home size={28} strokeWidth={2.5} />
            </div>
              <div className="block">
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-700 to-blue-600">Imóvel Pro</h1>
              {usuario && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Olá, {usuario.nome.split(' ')[0]}</p>}
            </div>
          </div>

          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              placeholder="Onde você quer morar?" 
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400" 
              onChange={e => setBusca(e.target.value)} 
            />
          </div>

          <div className="flex items-center gap-3">
            {usuario ? (
              <button onClick={logout} className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs hover:bg-red-100 transition-colors uppercase tracking-wider">
                <LogOut size={16}/> Sair
              </button>
            ) : (
              <button onClick={() => {setAuthModo("login"); setMostrarAuth(true)}} className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 uppercase tracking-widest">
                <LogIn size={16}/> Entrar
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="px-6 py-12 max-w-7xl mx-auto">
        {/* HERO SECTION MINI */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">Encontre o lugar que<br/><span className="text-indigo-600">combina com você.</span></h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">A plataforma mais moderna para encontrar seu próximo lar ou investir no mercado imobiliário com segurança.</p>
        </div>

        <div className="flex gap-4 mb-12 justify-center">
          <button onClick={() => setModo("buscar")} className={`px-8 py-4 font-bold rounded-2xl transition-all flex items-center gap-3 ${modo === "buscar" ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
            <Search size={20} /> Buscar imóveis
          </button>
          <button onClick={() => {
            if(!usuario) { setAuthModo("cadastro"); setMostrarAuth(true); }
            else { setModo("anunciar"); }
          }} className={`px-8 py-4 font-bold rounded-2xl transition-all flex items-center gap-3 ${modo === "anunciar" ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-105" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
            <PlusCircle size={20} /> Anunciar imóvel
          </button>
        </div>

        {/* BENTO GRID DE RECURSOS (Aparece apenas no modo buscar) */}
        {modo === "buscar" && (
          <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-linear-to-br from-indigo-600 to-indigo-900 p-10 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative group border border-indigo-400/20">
              <Zap className="absolute -right-5 -top-5 w-64 h-64 text-white/10 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative">
                <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-md"><Users size={24} /></div>
                <h3 className="text-4xl font-black mb-4 tracking-tighter">Sistema de Match</h3>
                <p className="text-indigo-100 max-w-md text-lg font-medium leading-relaxed">Conectamos o corretor que tem o cliente ao que tem o imóvel. Ganhe agilidade e divida comissões com segurança.</p>
              </div>
              <button 
                onClick={() => {
                  if (!usuario) { setAuthModo("login"); setMostrarAuth(true); }
                  else if (!usuario.isSubscriptionActive) { setModo("pagamento"); }
                  else { carregarMatches(); }
                }}
                className="bg-white text-indigo-600 w-fit px-8 py-3 rounded-xl font-bold mt-8 hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                {usuario?.isSubscriptionActive ? "Ver Oportunidades" : "Ativar Match (R$ 29,90/mês)"}
              </button>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="bg-indigo-50 w-fit p-3 rounded-2xl mb-6 text-indigo-600"><BarChart3 size={24} /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Gestão de Leads</h3>
              <p className="text-slate-500 font-medium">Acompanhe quem visualizou seus imóveis em tempo real.</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="bg-emerald-50 w-fit p-3 rounded-2xl mb-6 text-emerald-600"><ShieldCheck size={24} /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Perfis Verificados</h3>
              <p className="text-slate-500 font-medium">Segurança total com verificação de CRECI obrigatória.</p>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* COLUNA DO FORMULÁRIO */}
        <section className={`lg:col-span-1 ${modo === "anunciar" ? "block" : "hidden"}`}>
          <form onSubmit={cadastrar} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8 sticky top-32">
            <h2 className="text-2xl font-bold text-slate-900">
              {selecionadoParaEdicao ? "Editar Anúncio" : "Novo Anúncio"}
            </h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Título</label>
              <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all" value={novoImovel.titulo} onChange={e => setNovoImovel({...novoImovel, titulo: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Finalidade</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-bold text-slate-700" value={novoImovel.tipoNegocio} onChange={e => setNovoImovel({...novoImovel, tipoNegocio: e.target.value})}>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Preço</label>
                <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all" value={novoImovel.preco} onChange={e => setNovoImovel({...novoImovel, preco: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo Imóvel</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-bold text-slate-700" value={novoImovel.tipoImovel} onChange={e => setNovoImovel({...novoImovel, tipoImovel: e.target.value})}>
                  <option value="casa">Casa</option>
                  <option value="apto">Apartamento</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Comissão %</label>
                <input type="number" placeholder="Ex: 6" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all" value={novoImovel.comissao} onChange={e => setNovoImovel({...novoImovel, comissao: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Foto do Imóvel</label>
              <div className="relative w-full h-40 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors cursor-pointer group">
                {fotoArquivo ? <img src={URL.createObjectURL(fotoArquivo)} className="w-full h-full object-cover" /> : <Camera size={32} className="text-indigo-400" />}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFotoArquivo(e.target.files[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Localização</label>
              <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all" value={novoImovel.localizacao} onChange={e => setNovoImovel({...novoImovel, localizacao: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
              <input required placeholder="119..." className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all" value={novoImovel.contato} onChange={e => setNovoImovel({...novoImovel, contato: e.target.value})} />
            </div>

            <button disabled={carregando} className="w-full p-5 rounded-2xl font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
              {carregando ? <Loader2 className="animate-spin inline" /> : "Publicar Agora"}
            </button>
          </form>
        </section>

        {/* PÁGINA DE PAGAMENTO */}
        {modo === "pagamento" && (
          <section className="lg:col-span-4 flex justify-center py-10">
            <div className="bg-white w-full max-w-2xl p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-indigo-600">
                <CreditCard size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900">Ative o Sistema de Match</h2>
                <p className="text-slate-500 text-lg">Desbloqueie parcerias exclusivas e acelere suas vendas.</p>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-4xl border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-600 font-bold text-lg">Assinatura Mensal</span>
                  <span className="text-3xl font-black text-indigo-600">R$ 29,90</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-emerald-500" size={18} /> Acesso ilimitado ao Sistema de Match</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-emerald-500" size={18} /> Visualização de contatos de outros corretores</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-emerald-500" size={18} /> Selo de Profissional Verificado no perfil</li>
                </ul>
                <button 
                  onClick={async () => {
                    setCarregando(true);
                    try {
                      const res = await axios.post(`${API_URL}/auth/subscribe`, {}, { headers: { 'x-auth-token': token } });
                      setUsuario(res.data.user);
                      localStorage.setItem('usuario', JSON.stringify(res.data.user));
                      alert("Assinatura ativada com sucesso!");
                      setModo("buscar");
                    } catch (e) { alert("Erro ao processar assinatura."); }
                    finally { setCarregando(false); }
                  }}
                  disabled={carregando}
                  className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl flex justify-center items-center gap-3">
                  {carregando ? <Loader2 className="animate-spin" /> : "CONCLUIR PAGAMENTO"}
                </button>
              </div>
              <button onClick={() => setModo("buscar")} className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors uppercase tracking-widest">Agora não, voltar para busca</button>
            </div>
          </section>
        )}

        {/* ÁREA DE MATCHES EXCLUSIVA */}
        {modo === "matches" && (
          <section className="lg:col-span-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Oportunidades de Parceria</h2>
                <p className="text-slate-500 font-medium">Imóveis de outros corretores disponíveis para divisão de comissão.</p>
              </div>
              <button onClick={() => setModo("buscar")} className="text-indigo-600 font-bold hover:underline">Voltar para busca</button>
            </div>
            
            {matches.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
                <Zap size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold">Nenhum match encontrado no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(m => (
                  <div key={m._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <img src={m.imagemUrl} className="w-full h-48 object-cover rounded-3xl mb-4" />
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{m.titulo}</h3>
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black">+{m.comissao}%</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">Corretor: <span className="text-slate-900 font-bold">{m.criadoPor?.nome}</span> (CRECI: {m.criadoPor?.creci})</p>
                    <a href={`https://wa.me/${m.criadoPor?.telefone}`} target="_blank" rel="noreferrer" className="block w-full text-center bg-emerald-500 text-white p-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all">Chamar no WhatsApp</a>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VITRINE DE IMÓVEIS */}
        <section className={`lg:col-span-3 ${modo !== "buscar" ? "hidden" : "block"}`}>
          <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
            {["todos", "venda", "aluguel"].map(tipo => (
              <button key={tipo} onClick={() => setAbaAtiva(tipo)} className={`px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${abaAtiva === tipo ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"}`}>
                {tipo}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrados.map(imovel => (
              <ImovelCard 
                key={imovel._id} 
                imovel={imovel} 
                usuario={usuario} 
                onDelete={excluir}
                onSell={confirmarVenda}
                onEdit={(imovel) => {
                  setSelecionadoParaEdicao(imovel._id);
                  setNovoImovel({...imovel});
                  setModo("anunciar");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}

export default App;