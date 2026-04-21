import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Store, Search, PlusCircle, Trash2, MessageCircle, Camera, Loader2,
  LogIn, LogOut, X, ShieldCheck, Zap, BarChart3,
  CheckCircle2, ChevronRight, ChevronLeft, Eye, EyeOff,
  Package, DollarSign, AlertCircle, CheckCheck, ShoppingCart,
  Key, Filter, Phone, Mail, Lock, LayoutDashboard,
  Tag, TrendingUp, Bell, ArrowRight, Star, Minus, Plus,
  ClipboardList, BoxSelect, ToggleLeft, ToggleRight, Image
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:10000' : 'https://webstory-backend.onrender.com');

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>{children}</span>;
};

// ─── Campo Input ─────────────────────────────────────────────────────────────
const Campo = React.memo(({ label, icon: Icon, name, type = 'text', placeholder, dados, setDados, erros, setErros, showSenha, setShowSenha }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        type={name === 'senha' ? (showSenha ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={dados?.[name] ?? ''}
        onChange={e => {
          setDados(d => ({ ...d, [name]: e.target.value }));
          if (setErros) setErros(er => ({ ...er, [name]: '' }));
        }}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${erros?.[name] ? 'border-rose-300 bg-rose-50' : 'border-slate-200 focus:border-indigo-400 focus:bg-white'}`}
      />
      {name === 'senha' && (
        <button type="button" onClick={() => setShowSenha(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {erros?.[name] && <p className="text-rose-500 text-xs mt-1">{erros[name]}</p>}
  </div>
));

// ─── Login Loja ───────────────────────────────────────────────────────────────
const LoginLoja = ({ onLogin, carregando }) => {
  const [dados, setDados] = useState({});
  const [showSenha, setShowSenha] = useState(false);
  const [aba, setAba] = useState('login'); // login | cadastro

  const campoProps = { dados, setDados, erros: {}, showSenha, setShowSenha };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">WebStory</h1>
          <p className="text-indigo-200 text-sm mt-1">Painel da sua loja</p>
        </div>

        <div className="flex border-b border-slate-100">
          {['login', 'cadastro'].map(t => (
            <button key={t} onClick={() => setAba(t)}
              className={`flex-1 py-3.5 text-sm font-bold capitalize transition-all ${aba === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
              {t === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-4">
          {aba === 'login' ? (
            <>
              <Campo label="E-mail" icon={Mail} name="email" type="email" placeholder="loja@email.com" {...campoProps} setErros={null} />
              <Campo label="Senha" icon={Lock} name="senha" placeholder="Sua senha" {...campoProps} setErros={null} />
              <button onClick={() => onLogin(dados, 'login')} disabled={carregando}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {carregando ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={16} /> Entrar no painel</>}
              </button>
            </>
          ) : (
            <>
              <Campo label="Nome da loja" icon={Store} name="nome" placeholder="Ex: Mercearia do João" {...campoProps} setErros={null} />
              <Campo label="E-mail" icon={Mail} name="email" type="email" placeholder="loja@email.com" {...campoProps} setErros={null} />
              <Campo label="WhatsApp" icon={Phone} name="telefone" placeholder="(11) 99999-9999" {...campoProps} setErros={null} />
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Chave de acesso</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="AK-XXXXXXXX"
                    value={dados.chaveAcesso || ''}
                    onChange={e => setDados(d => ({ ...d, chaveAcesso: e.target.value.toUpperCase() }))}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Chave fornecida pelo administrador do sistema</p>
              </div>
              <Campo label="Senha" icon={Lock} name="senha" placeholder="Mínimo 6 caracteres" {...campoProps} setErros={null} />
              <button onClick={() => onLogin(dados, 'cadastro')} disabled={carregando}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {carregando ? <Loader2 size={18} className="animate-spin" /> : <><CheckCheck size={16} /> Criar minha loja</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Produto Card (vitrine pública) ──────────────────────────────────────────
const ProdutoCard = ({ produto, onAddCarrinho }) => (
  <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100">
    <div className="relative h-48 overflow-hidden bg-slate-100">
      {produto.imagemUrl
        ? <img src={produto.imagemUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={produto.nome} />
        : <div className="w-full h-full flex items-center justify-center"><Package size={40} className="text-slate-300" /></div>
      }
      {produto.emPromocao && (
        <div className="absolute top-3 left-3">
          <Badge color="rose">Promoção</Badge>
        </div>
      )}
      {produto.estoque === 0 && (
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
          <span className="bg-white text-slate-900 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest">Esgotado</span>
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{produto.nome}</h3>
      {produto.descricao && <p className="text-slate-400 text-xs mb-2 line-clamp-1">{produto.descricao}</p>}
      <div className="flex items-end gap-2 mb-3">
        {produto.emPromocao && produto.precoPromo ? (
          <>
            <span className="text-lg font-black text-rose-600">{fmt(produto.precoPromo)}</span>
            <span className="text-xs text-slate-400 line-through mb-0.5">{fmt(produto.preco)}</span>
          </>
        ) : (
          <span className="text-lg font-black text-slate-900">{fmt(produto.preco)}</span>
        )}
      </div>
      <button
        onClick={() => onAddCarrinho(produto)}
        disabled={produto.estoque === 0}
        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        <ShoppingCart size={15} /> Adicionar
      </button>
    </div>
  </div>
);

// ─── Vitrine Pública ──────────────────────────────────────────────────────────
const Vitrine = ({ codigoLoja: codigoInicial }) => {
  const [codigo, setCodigo] = useState(codigoInicial || '');
  const [inputCodigo, setInputCodigo] = useState('');
  const [loja, setLoja] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarLoja = useCallback(async (cod) => {
    if (!cod) return;
    setCarregando(true);
    setErro('');
    try {
      const [resLoja, resProdutos] = await Promise.all([
        axios.get(`${API_URL}/loja/${cod}`),
        axios.get(`${API_URL}/loja/${cod}/produtos`)
      ]);
      setLoja(resLoja.data);
      setProdutos(resProdutos.data);
    } catch {
      setErro('Loja não encontrada. Verifique o código e tente novamente.');
      setLoja(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { if (codigo) carregarLoja(codigo); }, [codigo, carregarLoja]);

  const addCarrinho = (produto) => {
    setCarrinho(c => {
      const existe = c.find(i => i._id === produto._id);
      if (existe) return c.map(i => i._id === produto._id ? { ...i, qtd: i.qtd + 1 } : i);
      return [...c, { ...produto, qtd: 1 }];
    });
  };

  const alterarQtd = (id, delta) => {
    setCarrinho(c => c.map(i => i._id === id ? { ...i, qtd: Math.max(1, i.qtd + delta) } : i).filter(i => i.qtd > 0));
  };

  const removerItem = (id) => setCarrinho(c => c.filter(i => i._id !== id));

  const totalCarrinho = carrinho.reduce((acc, i) => acc + (i.emPromocao && i.precoPromo ? i.precoPromo : i.preco) * i.qtd, 0);

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return;
    setCarregando(true);
    try {
      const itens = carrinho.map(i => ({
        produtoId: i._id,
        nome: i.nome,
        preco: i.emPromocao && i.precoPromo ? i.precoPromo : i.preco,
        quantidade: i.qtd
      }));
      const res = await axios.post(`${API_URL}/pedidos`, {
        codigoLoja: loja.codigoLoja,
        itens,
        nomeCliente
      });
      window.open(res.data.linkWhatsApp, '_blank');
      setCarrinho([]);
      setMostrarCarrinho(false);
    } catch {
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  // Tela de entrada por código
  if (!loja) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">WebStory</h1>
          <p className="text-slate-500 text-sm mb-6">Digite o código da loja para acessar</p>
          {carregando ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
          ) : (
            <>
              <input
                placeholder="Ex: LOJA-4F9A"
                value={inputCodigo}
                onChange={e => setInputCodigo(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && setCodigo(inputCodigo)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 text-center font-mono font-bold text-lg tracking-widest mb-3"
              />
              {erro && <p className="text-rose-500 text-xs mb-3">{erro}</p>}
              <button onClick={() => setCodigo(inputCodigo)}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <ArrowRight size={18} /> Acessar loja
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner + Header da loja */}
      <div className="relative">
        {loja.bannerFundo
          ? <img src={loja.bannerFundo} className="w-full h-48 object-cover" alt="banner" />
          : <div className="w-full h-48 bg-indigo-600" />
        }
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
          {loja.fotoPerfil
            ? <img src={loja.fotoPerfil} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg" alt="logo" />
            : <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg"><Store size={28} className="text-indigo-600" /></div>
          }
          <div>
            <h1 className="text-2xl font-black text-white">{loja.nome}</h1>
            {loja.endereco && <p className="text-white/80 text-sm">{loja.endereco}</p>}
          </div>
        </div>
      </div>

      {/* Barra de busca + carrinho */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar produtos..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button onClick={() => setMostrarCarrinho(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Carrinho</span>
            {carrinho.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                {carrinho.reduce((a, i) => a + i.qtd, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Produtos */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {produtosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-bold text-slate-700">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtosFiltrados.map(p => <ProdutoCard key={p._id} produto={p} onAddCarrinho={addCarrinho} />)}
          </div>
        )}
      </div>

      {/* Carrinho modal */}
      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg">Seu carrinho</h3>
              <button onClick={() => setMostrarCarrinho(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {carrinho.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">Carrinho vazio</p>
                </div>
              ) : (
                carrinho.map(item => (
                  <div key={item._id} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      {item.imagemUrl ? <img src={item.imagemUrl} className="w-full h-full object-cover" alt="" /> : <Package size={20} className="text-slate-400 m-auto mt-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.nome}</p>
                      <p className="text-xs text-indigo-600 font-bold">{fmt(item.emPromocao && item.precoPromo ? item.precoPromo : item.preco)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => alterarQtd(item._id, -1)} className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.qtd}</span>
                      <button onClick={() => alterarQtd(item._id, 1)} className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-colors">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removerItem(item._id)} className="w-7 h-7 bg-rose-50 text-rose-400 rounded-lg flex items-center justify-center hover:bg-rose-100 transition-colors ml-1">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrinho.length > 0 && (
              <div className="p-6 border-t border-slate-100 space-y-4">
                <input
                  placeholder="Seu nome (opcional)"
                  value={nomeCliente}
                  onChange={e => setNomeCliente(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="text-xl font-black text-slate-900">{fmt(totalCarrinho)}</span>
                </div>
                <button onClick={finalizarPedido} disabled={carregando}
                  className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-60">
                  {carregando ? <Loader2 size={18} className="animate-spin" /> : <><MessageCircle size={18} /> Finalizar pelo WhatsApp</>}
                </button>
                <p className="text-center text-xs text-slate-400">O pedido será enviado via WhatsApp. Pagamento via Pix combinado com a loja.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Painel da Loja ───────────────────────────────────────────────────────────
const PainelLoja = ({ loja, token, onLogout }) => {
  const [aba, setAba] = useState('dashboard');
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [novoProduto, setNovoProduto] = useState({ nome: '', descricao: '', preco: '', precoPromo: '', emPromocao: false, categoria: 'geral', estoque: '', estoqueMin: '5', imagemUrl: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [fotoArquivo, setFotoArquivo] = useState(null);

  const [movForm, setMovForm] = useState({ produtoId: '', tipo: 'entrada', quantidade: '', motivo: '' });

  const headers = { 'x-auth-token': token };

  const carregar = useCallback(async () => {
    try {
      const [resProd, resPed, resAlert, resHist] = await Promise.all([
        axios.get(`${API_URL}/minha-loja/produtos`, { headers }),
        axios.get(`${API_URL}/minha-loja/pedidos`, { headers }),
        axios.get(`${API_URL}/estoque/alertas`, { headers }),
        axios.get(`${API_URL}/estoque/historico`, { headers }),
      ]);
      setProdutos(resProd.data);
      setPedidos(resPed.data);
      setAlertas(resAlert.data);
      setHistorico(resHist.data);
    } catch { /* silencioso */ }
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarProduto = async () => {
    setCarregando(true);
    try {
      let imagemUrl = novoProduto.imagemUrl;
      if (fotoArquivo) {
        const formData = new FormData();
        formData.append('file', fotoArquivo);
        formData.append('upload_preset', 'webstory');
        const res = await axios.post('https://api.cloudinary.com/v1_1/dolazq2mw/image/upload', formData);
        imagemUrl = res.data.secure_url;
      }
      const payload = { ...novoProduto, imagemUrl, preco: Number(novoProduto.preco), precoPromo: novoProduto.precoPromo ? Number(novoProduto.precoPromo) : null, estoque: Number(novoProduto.estoque), estoqueMin: Number(novoProduto.estoqueMin) };
      if (editandoId) {
        await axios.put(`${API_URL}/produtos/${editandoId}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/produtos`, payload, { headers });
      }
      setNovoProduto({ nome: '', descricao: '', preco: '', precoPromo: '', emPromocao: false, categoria: 'geral', estoque: '', estoqueMin: '5', imagemUrl: '' });
      setEditandoId(null);
      setFotoArquivo(null);
      setAba('produtos');
      carregar();
    } catch { alert('Erro ao salvar produto.'); }
    finally { setCarregando(false); }
  };

  const excluirProduto = async (id) => {
    if (!window.confirm('Remover este produto?')) return;
    try {
      await axios.delete(`${API_URL}/produtos/${id}`, { headers });
      carregar();
    } catch { alert('Erro ao excluir.'); }
  };

  const registrarMovimentacao = async () => {
    if (!movForm.produtoId || !movForm.quantidade) return alert('Preencha produto e quantidade.');
    setCarregando(true);
    try {
      await axios.post(`${API_URL}/estoque/movimentacao`, { ...movForm, quantidade: Number(movForm.quantidade) }, { headers });
      setMovForm({ produtoId: '', tipo: 'entrada', quantidade: '', motivo: '' });
      carregar();
      alert('Movimentação registrada!');
    } catch (err) { alert(err.response?.data?.message || 'Erro ao registrar.'); }
    finally { setCarregando(false); }
  };

  const atualizarStatusPedido = async (id, status) => {
    try {
      await axios.put(`${API_URL}/pedidos/${id}/status`, { status }, { headers });
      carregar();
    } catch { alert('Erro ao atualizar pedido.'); }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'estoque', label: 'Estoque', icon: BoxSelect },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <span className="font-black text-slate-900">{loja.nome}</span>
              <span className="ml-2 text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{loja.codigoLoja}</span>
            </div>
          </div>
          {alertas.length > 0 && (
            <button onClick={() => setAba('estoque')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
              <Bell size={13} /> {alertas.length} alerta{alertas.length > 1 ? 's' : ''}
            </button>
          )}
          <button onClick={onLogout} className="w-9 h-9 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-xl flex items-center justify-center transition-colors">
            <LogOut size={16} />
          </button>
        </div>

        {/* Nav */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto pb-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setAba(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ${aba === id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <button onClick={() => setAba('novoProduto')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ml-auto ${aba === 'novoProduto' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
            <PlusCircle size={15} /> Novo produto
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* DASHBOARD */}
        {aba === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Olá, {loja.nome.split(' ')[0]} 👋</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Produtos ativos', value: produtos.filter(p => p.ativo).length, icon: Package, color: 'indigo' },
                { label: 'Pedidos hoje', value: pedidos.filter(p => new Date(p.criadoEm).toDateString() === new Date().toDateString()).length, icon: ClipboardList, color: 'emerald' },
                { label: 'Alertas de estoque', value: alertas.length, icon: AlertCircle, color: alertas.length > 0 ? 'amber' : 'slate' },
                { label: 'Em promoção', value: produtos.filter(p => p.emPromocao).length, icon: Tag, color: 'rose' },
              ].map(({ label, value, icon: Icon, color }) => {
                const colors = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-600', slate: 'bg-slate-100 text-slate-500' };
                return (
                  <div key={label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}><Icon size={20} /></div>
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
                  </div>
                );
              })}
            </div>

            {alertas.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2"><Bell size={16} /> Produtos com estoque baixo</p>
                <div className="space-y-2">
                  {alertas.map(p => (
                    <div key={p._id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5">
                      <span className="text-sm font-bold text-slate-900">{p.nome}</span>
                      <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2.5 py-1 rounded-full">
                        {p.estoque} restantes (mín: {p.estoqueMin})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-slate-900 mb-3">Pedidos recentes</h3>
              {pedidos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm">Nenhum pedido ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pedidos.slice(0, 5).map(p => (
                    <div key={p._id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{p.nomeCliente || 'Cliente anônimo'}</p>
                        <p className="text-xs text-slate-400">{p.itens.length} item(ns) · {new Date(p.criadoEm).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="font-black text-slate-900 text-sm">{fmt(p.total)}</span>
                      <Badge color={p.status === 'confirmado' ? 'emerald' : p.status === 'cancelado' ? 'rose' : 'amber'}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUTOS */}
        {aba === 'produtos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Meus produtos</h2>
              <button onClick={() => setAba('novoProduto')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                <PlusCircle size={16} /> Novo produto
              </button>
            </div>
            {produtos.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-700">Nenhum produto cadastrado</p>
                <button onClick={() => setAba('novoProduto')} className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                  Cadastrar primeiro produto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {produtos.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="h-36 bg-slate-100 relative overflow-hidden">
                      {p.imagemUrl ? <img src={p.imagemUrl} className="w-full h-full object-cover" alt={p.nome} /> : <div className="flex items-center justify-center h-full"><Package size={32} className="text-slate-300" /></div>}
                      {p.emPromocao && <div className="absolute top-2 left-2"><Badge color="rose">Promoção</Badge></div>}
                      {p.estoque <= p.estoqueMin && <div className="absolute top-2 right-2"><Badge color="amber">Estoque baixo</Badge></div>}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-slate-900 text-sm mb-1">{p.nome}</p>
                      <p className="text-indigo-600 font-black text-base mb-2">{fmt(p.emPromocao && p.precoPromo ? p.precoPromo : p.preco)}</p>
                      <p className="text-xs text-slate-400 mb-3">Estoque: <span className={`font-bold ${p.estoque <= p.estoqueMin ? 'text-amber-600' : 'text-slate-700'}`}>{p.estoque}</span></p>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditandoId(p._id); setNovoProduto({ ...p, preco: p.preco.toString(), precoPromo: p.precoPromo?.toString() || '', estoque: p.estoque.toString(), estoqueMin: p.estoqueMin.toString() }); setAba('novoProduto'); }}
                          className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          Editar
                        </button>
                        <button onClick={() => excluirProduto(p._id)} className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOVO / EDITAR PRODUTO */}
        {aba === 'novoProduto' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setAba('produtos'); setEditandoId(null); }} className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-xl font-black text-slate-900">{editandoId ? 'Editar produto' : 'Novo produto'}</h2>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-5">

              {/* Foto */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Foto do produto</label>
                <div className="relative w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors cursor-pointer">
                  {fotoArquivo
                    ? <img src={URL.createObjectURL(fotoArquivo)} className="w-full h-full object-cover" alt="" />
                    : novoProduto.imagemUrl
                      ? <img src={novoProduto.imagemUrl} className="w-full h-full object-cover" alt="" />
                      : <><Image size={28} className="text-slate-400 mb-2" /><p className="text-sm text-slate-400">Clique para adicionar foto</p></>
                  }
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFotoArquivo(e.target.files[0])} />
                </div>
              </div>

              <Campo label="Nome do produto" name="nome" placeholder="Ex: Arroz tipo 1 - 5kg" dados={novoProduto} setDados={setNovoProduto} />
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Descrição</label>
                <textarea rows={2} placeholder="Detalhes do produto..." value={novoProduto.descricao || ''} onChange={e => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Preço (R$)" name="preco" type="number" placeholder="0,00" dados={novoProduto} setDados={setNovoProduto} />
                <Campo label="Estoque" name="estoque" type="number" placeholder="0" dados={novoProduto} setDados={setNovoProduto} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Estoque mínimo" name="estoqueMin" type="number" placeholder="5" dados={novoProduto} setDados={setNovoProduto} />
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Categoria</label>
                  <input value={novoProduto.categoria || ''} onChange={e => setNovoProduto({ ...novoProduto, categoria: e.target.value })} placeholder="Ex: bebidas, frios..."
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl">
                <button type="button" onClick={() => setNovoProduto(p => ({ ...p, emPromocao: !p.emPromocao }))}>
                  {novoProduto.emPromocao ? <ToggleRight size={28} className="text-rose-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Produto em promoção</p>
                  <p className="text-xs text-slate-500">Aparece com destaque na vitrine</p>
                </div>
                {novoProduto.emPromocao && (
                  <div className="w-32">
                    <input type="number" placeholder="Preço promo" value={novoProduto.precoPromo || ''} onChange={e => setNovoProduto({ ...novoProduto, precoPromo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-sm outline-none focus:border-rose-400" />
                  </div>
                )}
              </div>

              <button onClick={salvarProduto} disabled={carregando}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-60">
                {carregando ? <Loader2 size={18} className="animate-spin" /> : <><CheckCheck size={18} /> {editandoId ? 'Salvar alterações' : 'Cadastrar produto'}</>}
              </button>
            </div>
          </div>
        )}

        {/* ESTOQUE */}
        {aba === 'estoque' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900">Controle de estoque</h2>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-900">Registrar movimentação</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Produto</label>
                  <select value={movForm.produtoId} onChange={e => setMovForm(m => ({ ...m, produtoId: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400">
                    <option value="">Selecione</option>
                    {produtos.map(p => <option key={p._id} value={p._id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                  <div className="flex gap-2">
                    {['entrada', 'saida'].map(t => (
                      <button key={t} onClick={() => setMovForm(m => ({ ...m, tipo: t }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all capitalize ${movForm.tipo === t ? t === 'entrada' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500'}`}>
                        {t === 'entrada' ? '+ Entrada' : '- Saída'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Quantidade</label>
                  <input type="number" placeholder="0" value={movForm.quantidade} onChange={e => setMovForm(m => ({ ...m, quantidade: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Motivo (opcional)</label>
                  <input placeholder="Ex: Reposição, venda..." value={movForm.motivo} onChange={e => setMovForm(m => ({ ...m, motivo: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
                </div>
              </div>
              <button onClick={registrarMovimentacao} disabled={carregando}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {carregando ? <Loader2 size={18} className="animate-spin" /> : <><CheckCheck size={16} /> Registrar movimentação</>}
              </button>
            </div>

            {alertas.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2"><AlertCircle size={16} /> Produtos com estoque abaixo do mínimo</p>
                <div className="space-y-2">
                  {alertas.map(p => (
                    <div key={p._id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5">
                      <span className="text-sm font-bold text-slate-900">{p.nome}</span>
                      <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2.5 py-1 rounded-full">{p.estoque} / mín {p.estoqueMin}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-slate-900 mb-3">Histórico de movimentações</h3>
              {historico.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <BarChart3 size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm">Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historico.map(m => (
                    <div key={m._id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                        {m.tipo === 'entrada' ? <Plus size={16} /> : <Minus size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{m.produtoId?.nome || 'Produto removido'}</p>
                        {m.motivo && <p className="text-xs text-slate-400">{m.motivo}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                        </p>
                        <p className="text-xs text-slate-400">{new Date(m.criadoEm).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {aba === 'pedidos' && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-6">Pedidos recebidos</h2>
            {pedidos.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-700">Nenhum pedido ainda</p>
                <p className="text-sm text-slate-400 mt-1">Os pedidos dos clientes aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900">{p.nomeCliente || 'Cliente anônimo'}</p>
                        <p className="text-xs text-slate-400">{new Date(p.criadoEm).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">{fmt(p.total)}</p>
                        <Badge color={p.status === 'confirmado' ? 'emerald' : p.status === 'cancelado' ? 'rose' : 'amber'}>{p.status}</Badge>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-1">
                      {p.itens.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-700">{item.nome} x{item.quantidade}</span>
                          <span className="font-bold text-slate-900">{fmt(item.preco * item.quantidade)}</span>
                        </div>
                      ))}
                    </div>
                    {p.status === 'pendente' && (
                      <div className="flex gap-2">
                        <button onClick={() => atualizarStatusPedido(p._id, 'confirmado')}
                          className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
                          Confirmar
                        </button>
                        <button onClick={() => atualizarStatusPedido(p._id, 'cancelado')}
                          className="flex-1 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────
const AdminPainel = ({ token, onLogout }) => {
  const [lojas, setLojas] = useState([]);
  const [chaves, setChaves] = useState([]);
  const [stats, setStats] = useState({});
  const [aba, setAba] = useState('stats');
  const headers = { 'x-auth-token': token };

  const carregar = useCallback(async () => {
    try {
      const [resLojas, resChaves, resStats] = await Promise.all([
        axios.get(`${API_URL}/admin/lojas`, { headers }),
        axios.get(`${API_URL}/admin/chaves`, { headers }),
        axios.get(`${API_URL}/admin/stats`, { headers }),
      ]);
      setLojas(resLojas.data);
      setChaves(resChaves.data);
      setStats(resStats.data);
    } catch { /* silencioso */ }
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  const gerarChave = async () => {
    try {
      const res = await axios.post(`${API_URL}/admin/chaves`, {}, { headers });
      alert(`Chave gerada: ${res.data.chave}`);
      carregar();
    } catch { alert('Erro ao gerar chave.'); }
  };

  const removerChave = async (id) => {
    if (!window.confirm('Remover esta chave?')) return;
    try { await axios.delete(`${API_URL}/admin/chaves/${id}`, { headers }); carregar(); }
    catch (err) { alert(err.response?.data?.message || 'Erro.'); }
  };

  const alterarStatusLoja = async (id, ativa) => {
    try { await axios.put(`${API_URL}/admin/lojas/${id}/status`, { ativa }, { headers }); carregar(); }
    catch { alert('Erro ao atualizar.'); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-black text-slate-900">Admin <span className="text-rose-600">WebStory</span></span>
          </div>
          <button onClick={onLogout} className="w-9 h-9 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-xl flex items-center justify-center transition-colors">
            <LogOut size={16} />
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {[{ id: 'stats', label: 'Visão geral' }, { id: 'lojas', label: 'Lojas' }, { id: 'chaves', label: 'Chaves de acesso' }].map(({ id, label }) => (
            <button key={id} onClick={() => setAba(id)}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all ${aba === id ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {aba === 'stats' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total de lojas', value: stats.totalLojas, icon: Store },
              { label: 'Lojas ativas', value: stats.lojasAtivas, icon: CheckCircle2 },
              { label: 'Produtos cadastrados', value: stats.totalProdutos, icon: Package },
              { label: 'Pedidos realizados', value: stats.totalPedidos, icon: ClipboardList },
              { label: 'Chaves pendentes', value: stats.chavesPendentes, icon: Key },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-3"><Icon size={20} /></div>
                <p className="text-2xl font-black text-slate-900">{value ?? '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {aba === 'lojas' && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-6">Lojas cadastradas</h2>
            <div className="space-y-3">
              {lojas.map(l => (
                <div key={l._id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{l.nome}</p>
                    <p className="text-xs text-slate-400">{l.email} · <span className="font-mono">{l.codigoLoja}</span></p>
                  </div>
                  <Badge color={l.ativa ? 'emerald' : 'rose'}>{l.ativa ? 'Ativa' : 'Inativa'}</Badge>
                  <button onClick={() => alterarStatusLoja(l._id, !l.ativa)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${l.ativa ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                    {l.ativa ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === 'chaves' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Chaves de acesso</h2>
              <button onClick={gerarChave} className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors">
                <PlusCircle size={16} /> Gerar nova chave
              </button>
            </div>
            <div className="space-y-3">
              {chaves.map(c => (
                <div key={c._id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-900 flex-1">{c.chave}</span>
                  <Badge color={c.usada ? 'slate' : 'emerald'}>{c.usada ? 'Usada' : 'Disponível'}</Badge>
                  {c.lojaId && <span className="text-xs text-slate-400">{c.lojaId.nome}</span>}
                  {!c.usada && (
                    <button onClick={() => removerChave(c._id)} className="w-8 h-8 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ─── App Principal ────────────────────────────────────────────────────────────
function App() {
  const [sessao, setSessao] = useState(() => JSON.parse(localStorage.getItem('webstory_sessao') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('webstory_token') || null);
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState('vitrine'); // vitrine | painel | admin

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'eduardojunior3300@outlook.com';

  const handleAuth = async (dados, tipo) => {
    setCarregando(true);
    try {
      if (tipo === 'login') {
        // Tenta login admin primeiro
        if (dados.email === ADMIN_EMAIL) {
          const res = await axios.post(`${API_URL}/admin/login`, dados);
          localStorage.setItem('webstory_token', res.data.token);
          localStorage.setItem('webstory_sessao', JSON.stringify({ email: res.data.email, isAdmin: true }));
          setToken(res.data.token);
          setSessao({ email: res.data.email, isAdmin: true });
          setModo('admin');
          return;
        }
        // Login de loja
        const res = await axios.post(`${API_URL}/loja/login`, dados);
        localStorage.setItem('webstory_token', res.data.token);
        localStorage.setItem('webstory_sessao', JSON.stringify(res.data.loja));
        setToken(res.data.token);
        setSessao(res.data.loja);
        setModo('painel');
      } else {
        await axios.post(`${API_URL}/loja/register`, dados);
        alert(`Loja criada! Seu código é: ${(await axios.post(`${API_URL}/loja/login`, { email: dados.email, senha: dados.senha })).data.loja.codigoLoja}\n\nAnote este código — é como seus clientes vão acessar sua loja!`);
        handleAuth({ email: dados.email, senha: dados.senha }, 'login');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('webstory_token');
    localStorage.removeItem('webstory_sessao');
    setToken(null);
    setSessao(null);
    setModo('vitrine');
  };

  // Redireciona ao recarregar página
  useEffect(() => {
    if (sessao?.isAdmin) setModo('admin');
    else if (sessao) setModo('painel');
  }, []);

  if (modo === 'vitrine' || !sessao) {
    if (sessao && !sessao.isAdmin) {
      // Loja logada mas foi para vitrine — mostra botão de voltar ao painel
    }
    return (
      <div>
        {!sessao && <Vitrine />}
        {sessao && !sessao.isAdmin && modo === 'vitrine' && (
          <div className="fixed bottom-4 right-4 z-50">
            <button onClick={() => setModo('painel')} className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-700 transition-colors">
              <LayoutDashboard size={16} /> Voltar ao painel
            </button>
          </div>
        )}
        {!sessao && (
          <div className="fixed bottom-4 right-4 z-50">
            <button onClick={() => setModo('painel')} className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-900 transition-colors">
              <LogIn size={16} /> Sou dono de loja
            </button>
          </div>
        )}
      </div>
    );
  }

  if (modo === 'painel' && sessao && !sessao.isAdmin) {
    if (!token) return <LoginLoja onLogin={handleAuth} carregando={carregando} />;
    return <PainelLoja loja={sessao} token={token} onLogout={logout} />;
  }

  if (modo === 'admin' && sessao?.isAdmin) {
    return <AdminPainel token={token} onLogout={logout} />;
  }

  return <LoginLoja onLogin={handleAuth} carregando={carregando} />;
}

export default App;