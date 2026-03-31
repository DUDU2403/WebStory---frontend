import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Home, MapPin, Search, PlusCircle, Trash2, MessageCircle, Camera, Loader2, LogIn, LogOut, X, ShieldCheck, Users, Zap, BarChart3, CreditCard, CheckCircle2 } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';

const API_URL = import.meta.env.VITE_API_URL || "https://meu-imovel-api-3z32.onrender.com";

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
      <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight mb-2">{imovel.titulo}</h3>
      <p className="text-2xl font-black text-slate-900 mb-2">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.preco)}
      </p>
      <p className="text-slate-400 text-sm font-medium flex items-center gap-1.5 mb-6">
        <MapPin size={16} className="text-indigo-500" /> {imovel.localizacao}
      </p>

      <div className="flex flex-col gap-2">
        <a href={`https://wa.me/${imovel.contato}`} target="_blank" rel="noreferrer" className="bg-emerald-500 text-white p-4 rounded-2xl flex justify-center items-center gap-3 font-bold hover:bg-emerald-600 transition-all shadow-lg active:scale-[0.98]">
          <MessageCircle size={20} /> Falar com anunciante
        </a>
        
        {usuario && imovel.criadoPor?._id === usuario.id && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => onEdit(imovel)} className="flex-1 bg-slate-50 text-slate-500 p-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">EDITAR</button>
            <button onClick={() => onDelete(imovel._id)} className="flex-1 bg-slate-50 text-slate-500 p-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">APAGAR</button>
            {imovel.status !== 'vendido' && (
              <button onClick={() => onSell(imovel._id)} className="flex-1 bg-slate-900 text-white p-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-black transition-all">VENDI</button>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function App() {
  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState("buscar"); 
  const [matches, setMatches] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("todos");
  const [selecionadoParaEdicao, setSelecionadoParaEdicao] = useState(null);
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [authModo, setAuthModo] = useState("login");
  const [mostrarPolitica, setMostrarPolitica] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [dadosAuth, setDadosAuth] = useState({ nome: "", email: "", cpf: "", creci: "", telefone: "", senha: "" });
  const [novoImovel, setNovoImovel] = useState({ titulo: "", preco: "", localizacao: "", contato: "", tipoNegocio: "venda", tipoImovel: "casa", comissao: "6", imagemUrl: "" });
  const [fotoArquivo, setFotoArquivo] = useState(null);

  const carregarImoveis = async () => {
    try {
      const res = await axios.get(`${API_URL}/imoveis`);
      setImoveis(res.data);
    } catch (err) { console.error("Erro ao carregar dados", err); }
  };

  useEffect(() => { carregarImoveis(); }, []);

  const manipularAuth = async (e) => {
    e.preventDefault();
    if (authModo === "cadastro" && !aceitouTermos) return alert("Aceite a política de privacidade.");
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
      } else {
        alert("Cadastro ok! Faça login.");
        setAuthModo("login");
      }
    } catch (err) { alert(err.response?.data?.message || "Erro na conexão."); }
    finally { setCarregando(false); }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUsuario(null);
    setModo("buscar");
  };

  const cadastrar = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      let imagemUrl = novoImovel.imagemUrl;
      if (fotoArquivo) {
        const formData = new FormData();
        formData.append("file", fotoArquivo);
        formData.append("upload_preset", "ml_default"); // Substitua pelo seu preset do Cloudinary
        const resCloud = await axios.post(`https://api.cloudinary.com/v1_1/dolazq2mw/image/upload`, formData);
        imagemUrl = resCloud.data.secure_url;
      }
      const config = { headers: { 'x-auth-token': token } };
      if (selecionadoParaEdicao) {
        await axios.put(`${API_URL}/imoveis/${selecionadoParaEdicao}`, { ...novoImovel, imagemUrl }, config);
      } else {
        await axios.post(`${API_URL}/imoveis`, { ...novoImovel, imagemUrl }, config);
      }
      setModo("buscar");
      carregarImoveis();
    } catch (err) { alert("Erro ao salvar."); }
    finally { setCarregando(false); }
  };

  const carregarMatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/imoveis/matches`, { headers: { 'x-auth-token': token } });
      setMatches(res.data);
      setModo("matches");
    } catch (err) { alert("Assinatura necessária."); setModo("pagamento"); }
  };

  const filtrados = imoveis.filter(i => {
    const matchBusca = i.titulo?.toLowerCase().includes(busca.toLowerCase()) || i.localizacao?.toLowerCase().includes(busca.toLowerCase());
    const matchAba = abaAtiva === "todos" || i.tipoNegocio === abaAtiva;
    return matchBusca && matchAba;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      {mostrarPolitica && <PrivacyPolicy onClose={() => setMostrarPolitica(false)} />}
      
      {/* HEADER SIMPLIFICADO */}
      <header className="p-6 max-w-7xl mx-auto flex justify-between items-center bg-white rounded-3xl mt-4 shadow-sm">
        <div className="flex items-center gap-2" onClick={() => setModo("buscar")}>
          <Home className="text-indigo-600" />
          <h1 className="font-black text-xl">Imóvel Pro</h1>
        </div>
        <div className="flex gap-4">
          {usuario ? (
            <button onClick={logout} className="text-xs font-bold text-red-500 uppercase">Sair</button>
          ) : (
            <button onClick={() => setMostrarAuth(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase">Entrar</button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* BUSCA */}
        <div className="mb-10">
          <input 
            placeholder="Procurar cidade, bairro ou título..." 
            className="w-full p-6 rounded-[2rem] bg-white shadow-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        {/* MODOS DE NAVEGAÇÃO */}
        {modo === "buscar" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
             <div className="md:col-span-2 bg-indigo-600 p-10 rounded-[3rem] text-white">
                <h3 className="text-3xl font-black mb-4">Sistema de Match Pro</h3>
                <p className="mb-6 opacity-80">Acesse imóveis exclusivos de outros corretores para parcerias.</p>
                <button onClick={carregarMatches} className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold">Ver Matches</button>
             </div>
             <button onClick={() => setModo("anunciar")} className="bg-white border-2 border-dashed border-slate-200 p-10 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-500 transition-all">
                <PlusCircle size={40} className="text-slate-300" />
                <span className="font-bold text-slate-500">Anunciar Imóvel</span>
             </button>
          </div>
        )}

        {/* LISTAGEM */}
        {modo === "buscar" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtrados.map(i => (
              <ImovelCard key={i._id} imovel={i} usuario={usuario} onDelete={carregarImoveis} onEdit={(imovel) => {setNovoImovel(imovel); setSelecionadoParaEdicao(imovel._id); setModo("anunciar");}} />
            ))}
          </div>
        )}

        {/* FORMULÁRIO ANÚNCIO */}
        {modo === "anunciar" && (
          <div className="max-w-xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl">
             <h2 className="text-2xl font-black mb-8">O que vamos anunciar hoje?</h2>
             <form onSubmit={cadastrar} className="space-y-4">
                <input placeholder="Título do anúncio" className="w-full p-4 bg-slate-50 rounded-2xl" value={novoImovel.titulo} onChange={e => setNovoImovel({...novoImovel, titulo: e.target.value})} />
                <input placeholder="Preço" type="number" className="w-full p-4 bg-slate-50 rounded-2xl" value={novoImovel.preco} onChange={e => setNovoImovel({...novoImovel, preco: e.target.value})} />
                <input placeholder="Localização" className="w-full p-4 bg-slate-50 rounded-2xl" value={novoImovel.localizacao} onChange={e => setNovoImovel({...novoImovel, localizacao: e.target.value})} />
                <input placeholder="WhatsApp contato" className="w-full p-4 bg-slate-50 rounded-2xl" value={novoImovel.contato} onChange={e => setNovoImovel({...novoImovel, contato: e.target.value})} />
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                   <input type="file" onChange={e => setFotoArquivo(e.target.files[0])} />
                </div>
                <button className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold">PUBLICAR ANÚNCIO</button>
                <button type="button" onClick={() => setModo("buscar")} className="w-full text-slate-400 font-bold">Cancelar</button>
             </form>
          </div>
        )}
      </main>

      {/* MODAL AUTH */}
      {mostrarAuth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative">
              <button onClick={() => setMostrarAuth(false)} className="absolute top-6 right-6"><X /></button>
              <h2 className="text-2xl font-black mb-6">{authModo === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
              <form onSubmit={manipularAuth} className="space-y-4">
                 {authModo === 'cadastro' && (
                   <input placeholder="Nome" className="w-full p-4 bg-slate-50 rounded-2xl" onChange={e => setDadosAuth({...dadosAuth, nome: e.target.value})} />
                 )}
                 <input placeholder="E-mail" type="email" className="w-full p-4 bg-slate-50 rounded-2xl" onChange={e => setDadosAuth({...dadosAuth, email: e.target.value})} />
                 <input placeholder="Senha" type="password" className="w-full p-4 bg-slate-50 rounded-2xl" onChange={e => setDadosAuth({...dadosAuth, senha: e.target.value})} />
                 <button className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold uppercase tracking-widest">
                    {carregando ? <Loader2 className="animate-spin mx-auto" /> : (authModo === 'login' ? 'Entrar' : 'Cadastrar')}
                 </button>
                 <p className="text-center text-sm text-slate-500 cursor-pointer" onClick={() => setAuthModo(authModo === 'login' ? 'cadastro' : 'login')}>
                    {authModo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                 </p>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}