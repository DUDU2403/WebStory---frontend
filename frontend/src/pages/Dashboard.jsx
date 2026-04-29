import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard, Package, ClipboardList, TrendingDown,
  Users, ShoppingBag, LogOut, Menu, X, Plus, Edit, Trash2,
  AlertTriangle, ArrowUp, ArrowDown, Eye, EyeOff, Copy,
  Store, Settings, Search, CheckCircle, ToggleLeft, ToggleRight,
  Sun, Moon,
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import { LineChart, BarChart, PieChart } from '../components/Charts';
import {
  getPainelProdutos, criarProduto, editarProduto, deletarProduto,
  movimentarEstoque, getHistorico, getAlertas,
  getPainelPedidos, atualizarPedido,
  getFuncionarios, criarFuncionario, editarFuncionario, deletarFuncionario,
  criarVendaAvulsa, getVendasAvulsas,
  lojaUpdatePerfil, getClientes,
} from '../api';
import ImageUploader from '../components/ImageUploader';
import config from '../config';

// ── Utilitários ──────────────────────────────────────────────
const fmt = (v) => `${config.moedaSimbolo} ${Number(v).toFixed(2)}`;

function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid var(--border)',
      borderTopColor: config.corPrimaria,
      borderRadius: '50%',
      animation: 'spin .8s linear infinite',
      display: 'inline-block',
    }} />
  );
}

// Skeleton placeholder para cards de carregamento
function SkeletonCard() {
  return (
    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="skeleton" style={{ height: 12, width: '60%' }} />
      <div className="skeleton" style={{ height: 28, width: '40%' }} />
    </div>
  );
}

// ── Modal genérico ────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 520 }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth }}>
        <div style={{ padding: '22px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Modal Produto ─────────────────────────────────────────────
function ModalProduto({ produto, onClose, onSaved }) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(produto || {
    nome: '', descricao: '', preco: '', precoPromo: '', emPromocao: false,
    imagemUrl: '', categoria: '', estoque: 0, estoqueMin: 5, ativo: true, maisVendido: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.nome || !form.preco) { show('Nome e preço são obrigatórios.', 'error'); return; }
    setLoading(true);
    try {
      if (produto) await editarProduto(produto._id, form);
      else await criarProduto(form);
      show(produto ? 'Produto atualizado!' : 'Produto criado!', 'success');
      onSaved();
    } catch (e) { show(e.response?.data?.message || 'Erro.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={produto ? 'Editar produto' : 'Novo produto'} onClose={onClose} maxWidth={540}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { col: '1/-1', label: 'Nome *', key: 'nome', ph: 'Nome do produto' },
          { label: 'Preço (R$) *', key: 'preco', type: 'number', ph: '0,00' },
          { label: 'Preço promo (R$)', key: 'precoPromo', type: 'number', ph: '0,00' },
          { label: 'Categoria', key: 'categoria', ph: 'Ex: baterias, telas...' },
          { label: 'Estoque atual', key: 'estoque', type: 'number', ph: '0' },
          { label: 'Estoque mínimo', key: 'estoqueMin', type: 'number', ph: '5' },
        ].map(f => (
          <div key={f.key} style={{ gridColumn: f.col || 'auto' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>{f.label}</label>
            <input className="input" type={f.type || 'text'} step={f.type === 'number' ? '0.01' : undefined}
              placeholder={f.ph} value={form[f.key] ?? ''}
              onChange={e => set(f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} />
          </div>
        ))}
        <div style={{ gridColumn: '1/-1' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Descrição</label>
          <textarea className="input" rows={3} placeholder="Descrição do produto..." value={form.descricao || ''}
            onChange={e => set('descricao', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Imagem do produto</label>
          <ImageUploader onImageSelect={(img) => set('imagemUrl', img)} label="Enviar imagem do produto" maxSizeMB={5} />
        </div>
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'emPromocao', label: 'Em promoção' },
            { key: 'maisVendido', label: 'Mais vendido' },
            { key: 'ativo', label: 'Ativo' },
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={!!form[opt.key]} onChange={e => set(opt.key, e.target.checked)} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 1, background: config.corPrimaria }} onClick={save} disabled={loading}>
          {loading ? <Spinner /> : 'Salvar'}
        </button>
      </div>
    </Modal>
  );
}

// ── Modal Estoque ─────────────────────────────────────────────
function ModalEstoque({ produto, onClose, onSaved }) {
  const { show } = useToast();
  const [tipo, setTipo]     = useState('entrada');
  const [qty, setQty]       = useState(1);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await movimentarEstoque({ produtoId: produto._id, tipo, quantidade: qty, motivo });
      show(`Estoque atualizado! Atual: ${data.estoqueAtual}${data.alertaMinimo ? ' ⚠️ Baixo!' : ''}`, data.alertaMinimo ? 'info' : 'success');
      onSaved();
    } catch (e) { show(e.response?.data?.message || 'Erro.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Movimentar estoque" onClose={onClose} maxWidth={400}>
      <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <p style={{ fontWeight: 600 }}>{produto.nome}</p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Atual: <strong>{produto.estoque}</strong> | Mínimo: <strong>{produto.estoqueMin}</strong></p>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        {['entrada', 'saida'].map(t => (
          <button key={t} onClick={() => setTipo(t)} className={`btn ${tipo === t ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, background: tipo === t ? config.corPrimaria : undefined, borderColor: config.corPrimaria, color: tipo === t ? 'white' : config.corPrimaria }}>
            {t === 'entrada' ? <><ArrowUp size={15} /> Entrada</> : <><ArrowDown size={15} /> Saída</>}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Quantidade</label>
        <input className="input" type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Motivo (opcional)</label>
        <input className="input" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex: compra de fornecedor..." />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 1, background: config.corPrimaria }} onClick={save} disabled={loading}>
          {loading ? <Spinner /> : 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
}

// ── Modal Funcionário ─────────────────────────────────────────
function ModalFuncionario({ func, onClose, onSaved }) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: func?.nome || '', email: func?.email || '', senha: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.nome || !form.email || (!func && !form.senha)) { show('Preencha os campos obrigatórios.', 'error'); return; }
    setLoading(true);
    try {
      if (func) await editarFuncionario(func._id, form);
      else await criarFuncionario(form);
      show(func ? 'Funcionário atualizado!' : 'Funcionário adicionado!', 'success');
      onSaved();
    } catch (e) { show(e.response?.data?.message || 'Erro ao salvar funcionário.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={func ? 'Editar funcionário' : 'Novo funcionário'} onClose={onClose} maxWidth={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nome *</label>
          <input className="input" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do funcionário" />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>E-mail *</label>
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" disabled={!!func} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
            Senha {func ? <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(deixe em branco para não alterar)</span> : '*'}
          </label>
          <input className="input" type="password" value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="••••••••" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 1, background: config.corPrimaria }} onClick={save} disabled={loading}>
          {loading ? <Spinner /> : 'Salvar'}
        </button>
      </div>
    </Modal>
  );
}

// ── Modal Venda Avulsa ────────────────────────────────────────
function ModalVendaAvulsa({ produtos, onClose, onSaved }) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [obs, setObs] = useState('');
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState([]);

  const prodsFiltrados = produtos.filter(p =>
    p.ativo && p.estoque > 0 &&
    (p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.categoria || '').toLowerCase().includes(busca.toLowerCase()))
  );

  const addItem = (p) => {
    setItens(prev => {
      const ex = prev.find(i => i._id === p._id);
      if (ex) return prev.map(i => i._id === p._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { _id: p._id, nome: p.nome, preco: p.emPromocao && p.precoPromo ? p.precoPromo : p.preco, qty: 1, estoque: p.estoque }];
    });
  };

  const updateQty = (id, v) => {
    if (v <= 0) { setItens(prev => prev.filter(i => i._id !== id)); return; }
    setItens(prev => prev.map(i => i._id === id ? { ...i, qty: Math.min(v, i.estoque) } : i));
  };

  const total = itens.reduce((s, i) => s + i.preco * i.qty, 0);

  const save = async () => {
    if (itens.length === 0) { show('Adicione ao menos um produto.', 'error'); return; }
    setLoading(true);
    try {
      await criarVendaAvulsa({
        itens: itens.map(i => ({ produtoId: i._id, nome: i.nome, preco: i.preco, quantidade: i.qty })),
        nomeCliente: nomeCliente || 'Cliente avulso',
        observacao: obs,
      });
      show('Venda registrada! Estoque atualizado.', 'success');
      onSaved();
    } catch (e) { show(e.response?.data?.message || 'Erro.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 700, maxHeight: '90vh' }}>
        <div style={{ padding: '22px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18 }}>Venda avulsa — presencial</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Adicionar produtos</p>
            <input className="input" placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} style={{ marginBottom: 10 }} />
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {prodsFiltrados.length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>Nenhum produto encontrado</p>
                : prodsFiltrados.map(p => {
                    const preco = p.emPromocao && p.precoPromo ? p.precoPromo : p.preco;
                    return (
                      <button key={p._id} onClick={() => addItem(p)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = config.corPrimaria}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{p.nome}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Estoque: {p.estoque}</p>
                        </div>
                        <p style={{ fontWeight: 700, color: config.corPrimaria, fontSize: 14 }}>{fmt(preco)}</p>
                      </button>
                    );
                  })
              }
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>Itens da venda</p>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nome do cliente</label>
              <input className="input" placeholder="Cliente avulso" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} />
            </div>
            <div style={{ flex: 1, minHeight: 160, maxHeight: 200, overflowY: 'auto' }}>
              {itens.length === 0
                ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 8 }}>
                    Clique nos produtos para adicionar
                  </div>
                : itens.map(item => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.nome}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 5, background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 5, background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 13, minWidth: 70, textAlign: 'right', color: config.corPrimaria }}>{fmt(item.preco * item.qty)}</p>
                      <button onClick={() => setItens(prev => prev.filter(i => i._id !== item._id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={14} /></button>
                    </div>
                  ))
              }
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Observação</label>
              <input className="input" placeholder="Opcional..." value={obs} onChange={e => setObs(e.target.value)} />
            </div>
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
                <span>Total</span>
                <span style={{ color: config.corPrimaria }}>{fmt(total)}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ background: config.corPrimaria }} onClick={save} disabled={loading || itens.length === 0}>
              {loading ? <Spinner /> : <><CheckCircle size={18} /> Confirmar venda</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers para gráficos ─────────────────────────────────────

// Agrupa vendas+pedidos por dia (últimos N dias) para LineChart
function buildFluxoData(pedidos, vendas, days = 14) {
  const map = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    map[key] = 0;
  }
  [...pedidos, ...vendas].forEach(item => {
    const d = new Date(item.criadoEm);
    const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (key in map) map[key]++;
  });
  return Object.entries(map).map(([label, value]) => ({ label, value }));
}

// Monta dados de desempenho por funcionário para BarChart
function buildFuncData(funcionarios, pedidos, vendas) {
  return funcionarios.slice(0, 6).map(f => {
    const total = [...pedidos, ...vendas].filter(v => v.operador === f.nome || v.operador === f._id).length;
    return { label: f.nome.split(' ')[0], value: total };
  });
}

// ── Dashboard principal ───────────────────────────────────────
export default function Dashboard({ nav }) {
  const { user, logout, updateUser, isDono } = useAuth();
  const { show } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [section, setSection]         = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData]               = useState({
    produtos: [], pedidos: [], alertas: [], historico: [],
    funcionarios: [], vendas: [], clientes: [],
  });
  const [loading, setLoading]         = useState(true);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [filtroProd, setFiltroProd]   = useState('');
  const [perfilForm, setPerfilForm]   = useState({
    nome: user?.nome || '', telefone: '', endereco: '', fotoPerfil: '', bannerFundo: '',
  });

  // Modais
  const [modalProd, setModalProd]   = useState(null);
  const [modalEst, setModalEst]     = useState(null);
  const [modalFunc, setModalFunc]   = useState(null);
  const [modalVenda, setModalVenda] = useState(false);

  // ── Carregamento de dados ────────────────────────────────────
  // FIX: carrega funcionários/clientes de forma independente do isDono
  // (o backend rejeita com 403 se não for dono, tratado no catch individual)
  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, ped, al, hist, v] = await Promise.all([
        getPainelProdutos(),
        getPainelPedidos(),
        getAlertas(),
        getHistorico(),
        getVendasAvulsas(),
      ]);

      // FIX: tenta carregar dados exclusivos do dono independentemente
      // O isDono pode estar defasado no momento do mount — deixamos o backend decidir
      let extras = { funcionarios: [], clientes: [] };
      try {
        const [f, c] = await Promise.all([getFuncionarios(), getClientes()]);
        extras.funcionarios = Array.isArray(f.data) ? f.data : [];
        // FIX SINCRONIZAÇÃO: garante que clientes seja sempre o array atualizado
        extras.clientes = Array.isArray(c.data) ? c.data : [];
      } catch {
        // 403 esperado para funcionários — sem problema
      }

      setData({
        produtos:      p.data   || [],
        pedidos:       ped.data || [],
        alertas:       al.data  || [],
        historico:     hist.data|| [],
        vendas:        v.data   || [],
        ...extras,
      });
    } catch (e) {
      show('Erro ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // FIX PERMISSÃO: useEffect sem dependência de isDono para não bloquear
  // o carregamento inicial. isDono pode ser falso por 1 tick antes de hidratar.
  useEffect(() => { loadAll(); }, []); // eslint-disable-line

  // ── Cmd+K ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Itens da busca global ────────────────────────────────────
  const searchItems = [
    ...data.produtos.map(p   => ({ id: p._id, name: p.nome,              category: p.categoria,                                       type: 'produto' })),
    ...data.pedidos.map(p    => ({ id: p._id, name: `Pedido – ${p.nomeCliente || 'Cliente'}`, category: new Date(p.criadoEm).toLocaleDateString('pt-BR'), type: 'pedido' })),
    ...data.clientes.map(c   => ({ id: c._id, name: c.nome,              category: c.email,                                           type: 'cliente' })),
  ];

  const handleSearchSelect = (item) => {
    if (item.type === 'produto')  { setSection('products'); setModalProd(data.produtos.find(p => p._id === item.id) || null); }
    else if (item.type === 'pedido')  setSection('orders');
    else if (item.type === 'cliente') setSection('clients');
  };

  // ── Dados para gráficos ──────────────────────────────────────
  const fluxoData = buildFluxoData(data.pedidos, data.vendas, 14);
  const funcChartData = buildFuncData(data.funcionarios, data.pedidos, data.vendas);
  const pieData = [
    { label: 'Confirmados', value: data.pedidos.filter(p => p.status === 'confirmado').length },
    { label: 'Pendentes',   value: data.pedidos.filter(p => p.status === 'pendente').length },
    { label: 'Cancelados',  value: data.pedidos.filter(p => p.status === 'cancelado').length },
    { label: 'Vendas pres.',value: data.vendas.length },
  ].filter(d => d.value > 0);

  // ── Stats ────────────────────────────────────────────────────
  const prodsFiltrados = data.produtos.filter(p =>
    p.nome.toLowerCase().includes(filtroProd.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(filtroProd.toLowerCase())
  );

  const stats = {
    produtos:     data.produtos.length,
    estoque:      data.produtos.reduce((s, p) => s + p.estoque, 0),
    pedidosPend:  data.pedidos.filter(p => p.status === 'pendente').length,
    faturamento:  [...data.pedidos.filter(p => p.status === 'confirmado'), ...data.vendas].reduce((s, p) => s + (p.total || 0), 0),
  };

  // ── Nav items ────────────────────────────────────────────────
  const navItems = [
    { key: 'overview',  label: 'Visão geral',    icon: <LayoutDashboard size={17} /> },
    { key: 'products',  label: 'Produtos',        icon: <Package size={17} /> },
    { key: 'orders',    label: 'Pedidos',          icon: <ClipboardList size={17} />, badge: stats.pedidosPend },
    { key: 'stock',     label: 'Estoque',          icon: <TrendingDown size={17} />,  badge: data.alertas.length, badgeColor: 'yellow' },
    { key: 'sales',     label: 'Venda avulsa',    icon: <ShoppingBag size={17} /> },
    // FIX PERMISSÃO: itens do menu condicionados ao isDono mas o loadAll
    // já tentou buscar os dados — a UI simplesmente não mostra se não for dono
    ...(isDono ? [
      { key: 'team',     label: 'Funcionários',   icon: <Users size={17} /> },
      { key: 'clients',  label: 'Clientes',        icon: <Users size={17} /> },
      { key: 'settings', label: 'Configurações',   icon: <Settings size={17} /> },
    ] : []),
  ];

  // ── Sidebar ──────────────────────────────────────────────────
  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: config.corPrimaria, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={18} color="white" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nome}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{isDono ? 'Dono' : 'Funcionário'}</p>
          </div>
        </div>
      </div>
      <nav style={{ padding: '10px 10px', flex: 1 }}>
        {navItems.map(item => (
          <button key={item.key} className={`nav-item ${section === item.key ? 'active' : ''}`}
            onClick={() => { setSection(item.key); setSidebarOpen(false); }}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 2 }}>
            {item.icon} {item.label}
            {item.badge > 0 && (
              <span className={`badge badge-${item.badgeColor || 'red'}`} style={{ marginLeft: 'auto', fontSize: 11, padding: '1px 7px' }}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div style={{ padding: '10px 10px 20px', borderTop: '1px solid var(--border)' }}>
        <button className="nav-item" style={{ width: '100%', color: '#ef4444' }} onClick={() => { logout(); nav('home'); }}>
          <LogOut size={17} /> Sair
        </button>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-2)' }}>

      {/* Sidebar desktop */}
      <aside style={{ width: 230, background: 'var(--surface)', borderRight: '1px solid var(--border)', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }} className="hide-mobile">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ width: 250, background: 'var(--surface)', position: 'relative', zIndex: 1, height: '100vh', overflowY: 'auto' }}>
            {sidebar}
          </aside>
        </div>
      )}

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost btn-sm show-mobile" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 style={{ fontSize: 17 }}>{navItems.find(n => n.key === section)?.label || 'Dashboard'}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSearchOpen(true)}
              title="Busca global (Cmd+K / Ctrl+K)"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Search size={14} />
              <span style={{ fontSize: 12 }}>Cmd+K</span>
            </button>
            <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title={isDark ? 'Modo claro' : 'Modo escuro'}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="btn btn-primary btn-sm" style={{ background: config.corPrimaria }} onClick={() => setModalVenda(true)}>
              <ShoppingBag size={14} /> Venda avulsa
            </button>
          </div>
        </div>

        <div style={{ padding: 20 }}>

          {/* ── LOADING ── */}
          {loading && (
            <div className="animate-fadeIn">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
                {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={36} /></div>
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {!loading && section === 'overview' && (
            <div className="animate-fadeIn">
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Produtos',            val: stats.produtos,          color: '#3b82f6' },
                  { label: 'Unidades em estoque',  val: stats.estoque,           color: config.corPrimaria },
                  { label: 'Pedidos pendentes',    val: stats.pedidosPend,       color: '#f59e0b' },
                  { label: 'Faturamento total',    val: fmt(stats.faturamento),  color: '#8b5cf6' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora', color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Alerta estoque baixo */}
              {data.alertas.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', gap: 12 }}>
                  <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#92400e' }}>{data.alertas.length} produto(s) com estoque baixo</p>
                    <p style={{ fontSize: 13, color: '#b45309', marginTop: 4 }}>{data.alertas.map(a => a.nome).join(', ')}</p>
                  </div>
                </div>
              )}

              {/* ── GRÁFICOS ─────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Gráfico de linha — fluxo de vendas */}
                <div className="card" style={{ padding: 20 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Fluxo de vendas</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Pedidos + vendas avulsas nos últimos 14 dias</p>
                  {fluxoData.every(d => d.value === 0)
                    ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                        Nenhum dado ainda
                      </div>
                    : <LineChart data={fluxoData} height={200} color={config.corPrimaria} />
                  }
                </div>

                {/* Gráfico de pizza — status dos pedidos */}
                <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, alignSelf: 'flex-start' }}>Status dos pedidos</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, alignSelf: 'flex-start' }}>Distribuição por status</p>
                  {pieData.length === 0
                    ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                        Nenhum pedido registrado
                      </div>
                    : <PieChart
                        data={pieData}
                        size={180}
                        colors={[config.corPrimaria, '#f59e0b', '#ef4444', '#3b82f6']}
                      />
                  }
                </div>
              </div>

              {/* Gráfico de barras — desempenho por funcionário (só dono) */}
              {isDono && data.funcionarios.length > 0 && (
                <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Desempenho por funcionário</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Número de vendas / pedidos por operador</p>
                  {funcChartData.every(d => d.value === 0)
                    ? <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>
                        Sem vendas registradas por funcionário ainda.
                      </p>
                    : <BarChart data={funcChartData} height={200} color={config.corPrimaria} />
                  }
                </div>
              )}

              {/* Últimos pedidos + últimas vendas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Últimos pedidos</p>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSection('orders')}>Ver todos</button>
                  </div>
                  {data.pedidos.slice(0, 5).map(p => (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{p.nomeCliente || 'Cliente'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{fmt(p.total)}</p>
                        <span className={`badge badge-${p.status === 'confirmado' ? 'green' : p.status === 'cancelado' ? 'red' : 'yellow'}`} style={{ fontSize: 10 }}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                  {data.pedidos.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>Nenhum pedido.</p>}
                </div>

                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Últimas vendas presenciais</p>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSection('sales')}>Ver todas</button>
                  </div>
                  {data.vendas.slice(0, 5).map(v => (
                    <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{v.nomeCliente}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(v.criadoEm).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: config.corPrimaria }}>{fmt(v.total)}</p>
                    </div>
                  ))}
                  {data.vendas.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>Nenhuma venda.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUTOS ── */}
          {!loading && section === 'products' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input className="input" placeholder="Buscar produto ou categoria..." value={filtroProd} onChange={e => setFiltroProd(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <button className="btn btn-primary" style={{ background: config.corPrimaria }} onClick={() => setModalProd('new')}>
                  <Plus size={16} /> Novo produto
                </button>
              </div>
              {prodsFiltrados.length === 0
                ? <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <Package size={40} style={{ margin: '0 auto 14px', color: 'var(--text-3)', display: 'block' }} />
                    <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nenhum produto encontrado</p>
                    <button className="btn btn-primary" style={{ marginTop: 14, background: config.corPrimaria }} onClick={() => setModalProd('new')}>Adicionar produto</button>
                  </div>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                    {prodsFiltrados.map(p => (
                      <div key={p._id} className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ height: 140, background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
                          {p.imagemUrl
                            ? <img src={p.imagemUrl} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}><Package size={32} /></div>
                          }
                          {!p.ativo && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: 'white', color: '#ef4444', fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 6 }}>Inativo</span></div>}
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 13 }}>{p.nome}</p>
                              <span className="badge badge-gray" style={{ marginTop: 3, fontSize: 10 }}>{p.categoria}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              {p.emPromocao && p.precoPromo && <p style={{ fontSize: 10, color: 'var(--text-3)', textDecoration: 'line-through' }}>{fmt(p.preco)}</p>}
                              <p style={{ fontWeight: 700, color: config.corPrimaria }}>{fmt(p.emPromocao && p.precoPromo ? p.precoPromo : p.preco)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: p.estoque <= p.estoqueMin ? '#ef4444' : 'var(--text-2)' }}>
                              Estoque: <strong>{p.estoque}</strong>
                              {p.estoque <= p.estoqueMin && <AlertTriangle size={12} style={{ display: 'inline', marginLeft: 3, color: '#ef4444' }} />}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-outline btn-sm" style={{ flex: 1, borderColor: config.corPrimaria, color: config.corPrimaria }} onClick={() => setModalEst(p)}>
                              <TrendingDown size={13} /> Estoque
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModalProd(p)}><Edit size={13} /></button>
                            <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={async () => {
                              if (!confirm('Remover este produto?')) return;
                              await deletarProduto(p._id); show('Removido.', 'success'); loadAll();
                            }}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── PEDIDOS ── */}
          {!loading && section === 'orders' && (
            <div className="animate-fadeIn">
              {data.pedidos.length === 0
                ? <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <ClipboardList size={40} style={{ margin: '0 auto 14px', color: 'var(--text-3)', display: 'block' }} />
                    <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nenhum pedido ainda.</p>
                  </div>
                : data.pedidos.map(ped => (
                    <div key={ped._id} className="card" style={{ padding: 18, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 15 }}>{ped.nomeCliente || 'Cliente'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{new Date(ped.criadoEm).toLocaleString('pt-BR')}</p>
                          {ped.telefoneCliente && <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>📱 {ped.telefoneCliente}</p>}
                          {ped.enderecoEntrega && <p style={{ fontSize: 13, color: 'var(--text-2)' }}>📍 {ped.enderecoEntrega}</p>}
                          {ped.observacao && <p style={{ fontSize: 13, color: 'var(--text-2)' }}>📝 {ped.observacao}</p>}
                          <div style={{ marginTop: 10 }}>
                            {ped.itens.map((it, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-2)' }}>• {it.nome} x{it.quantidade} — {fmt(it.preco * it.quantidade)}</p>)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 800, fontSize: 18, color: config.corPrimaria }}>{fmt(ped.total)}</p>
                          <span className={`badge badge-${ped.status === 'confirmado' ? 'green' : ped.status === 'cancelado' ? 'red' : 'yellow'}`} style={{ display: 'inline-block', marginTop: 6 }}>{ped.status}</span>
                          {ped.status === 'pendente' && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                              <button className="btn btn-primary btn-sm" style={{ background: config.corPrimaria }} onClick={async () => { await atualizarPedido(ped._id, 'confirmado'); loadAll(); }}>Confirmar</button>
                              <button className="btn btn-danger btn-sm" onClick={async () => { await atualizarPedido(ped._id, 'cancelado'); loadAll(); }}>Cancelar</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}

          {/* ── ESTOQUE ── */}
          {!loading && section === 'stock' && (
            <div className="animate-fadeIn">
              {data.alertas.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#92400e' }}>Estoque baixo em {data.alertas.length} produto(s)</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {data.alertas.map(a => <span key={a._id} className="badge badge-yellow">{a.nome} ({a.estoque}/{a.estoqueMin})</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Posição de estoque</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-2)' }}>
                        {['Produto', 'Categoria', 'Atual', 'Mínimo', 'Status', 'Ação'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.produtos.map(p => (
                        <tr key={p._id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 500 }}>{p.nome}</td>
                          <td style={{ padding: '10px 14px' }}><span className="badge badge-gray">{p.categoria}</span></td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: p.estoque <= p.estoqueMin ? '#ef4444' : 'var(--text-1)' }}>{p.estoque}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{p.estoqueMin}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span className={`badge ${p.estoque === 0 ? 'badge-red' : p.estoque <= p.estoqueMin ? 'badge-yellow' : 'badge-green'}`}>
                              {p.estoque === 0 ? 'Zerado' : p.estoque <= p.estoqueMin ? 'Baixo' : 'OK'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <button className="btn btn-outline btn-sm" style={{ borderColor: config.corPrimaria, color: config.corPrimaria }} onClick={() => setModalEst(p)}>
                              Movimentar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Histórico de movimentações</div>
                {data.historico.length === 0
                  ? <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Nenhuma movimentação.</p>
                  : <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: 'var(--surface-2)' }}>
                            {['Data', 'Produto', 'Tipo', 'Qtd', 'Operador', 'Motivo'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.historico.map(h => (
                            <tr key={h._id} style={{ borderTop: '1px solid var(--border)' }}>
                              <td style={{ padding: '9px 14px', color: 'var(--text-2)' }}>{new Date(h.criadoEm).toLocaleDateString('pt-BR')}</td>
                              <td style={{ padding: '9px 14px', fontWeight: 500 }}>{h.produtoId?.nome || '—'}</td>
                              <td style={{ padding: '9px 14px' }}><span className={`badge ${h.tipo === 'entrada' ? 'badge-green' : 'badge-red'}`}>{h.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span></td>
                              <td style={{ padding: '9px 14px', fontWeight: 700 }}>{h.quantidade}</td>
                              <td style={{ padding: '9px 14px', color: 'var(--text-2)' }}>{h.operador || '—'}</td>
                              <td style={{ padding: '9px 14px', color: 'var(--text-2)' }}>{h.motivo || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            </div>
          )}

          {/* ── VENDAS AVULSAS ── */}
          {!loading && section === 'sales' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn btn-primary" style={{ background: config.corPrimaria }} onClick={() => setModalVenda(true)}>
                  <Plus size={16} /> Nova venda avulsa
                </button>
              </div>
              {data.vendas.length === 0
                ? <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <ShoppingBag size={40} style={{ margin: '0 auto 14px', color: 'var(--text-3)', display: 'block' }} />
                    <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nenhuma venda avulsa registrada.</p>
                  </div>
                : <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                          {['Data', 'Cliente', 'Operador', 'Itens', 'Total', 'Obs'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.vendas.map(v => (
                          <tr key={v._id} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{new Date(v.criadoEm).toLocaleDateString('pt-BR')}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 500 }}>{v.nomeCliente}</td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{v.operador || '—'}</td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{v.itens.length} item(s)</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: config.corPrimaria }}>{fmt(v.total)}</td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{v.observacao || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              }
            </div>
          )}

          {/* ── FUNCIONÁRIOS (só dono) ── */}
          {!loading && section === 'team' && isDono && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn btn-primary" style={{ background: config.corPrimaria }} onClick={() => setModalFunc('new')}>
                  <Plus size={16} /> Adicionar funcionário
                </button>
              </div>
              {data.funcionarios.length === 0
                ? <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <Users size={40} style={{ margin: '0 auto 14px', color: 'var(--text-3)', display: 'block' }} />
                    <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nenhum funcionário cadastrado.</p>
                  </div>
                : <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                          {['Nome', 'E-mail', 'Status', 'Desde', 'Ações'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.funcionarios.map(f => (
                          <tr key={f._id} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, background: config.corPrimaria + '22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.corPrimaria, fontWeight: 700, fontSize: 13 }}>
                                  {f.nome[0].toUpperCase()}
                                </div>
                                {f.nome}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{f.email}</td>
                            <td style={{ padding: '12px 14px' }}><span className={`badge ${f.ativo ? 'badge-green' : 'badge-red'}`}>{f.ativo ? 'Ativo' : 'Inativo'}</span></td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{new Date(f.criadoEm).toLocaleDateString('pt-BR')}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setModalFunc(f)}><Edit size={13} /></button>
                                <button className="btn btn-ghost btn-sm" onClick={async () => { await editarFuncionario(f._id, { ativo: !f.ativo }); loadAll(); }} title={f.ativo ? 'Desativar' : 'Ativar'}>
                                  {f.ativo ? <ToggleRight size={15} color={config.corPrimaria} /> : <ToggleLeft size={15} color="var(--text-3)" />}
                                </button>
                                <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={async () => { if (!confirm('Remover funcionário?')) return; await deletarFuncionario(f._id); loadAll(); }}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              }
            </div>
          )}

          {/* ── CLIENTES ── */}
          {/* FIX SINCRONIZAÇÃO: data.clientes é sempre re-buscado no loadAll,
              então ao recarregar a seção os dados estarão atualizados */}
          {!loading && section === 'clients' && isDono && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {data.clientes.length} cliente(s) cadastrado(s)
                </p>
                <button className="btn btn-ghost btn-sm" onClick={loadAll}>
                  ↻ Atualizar
                </button>
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      {['Nome', 'Username', 'E-mail', 'Telefone', 'Endereço', 'Desde'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.clientes.map(c => (
                      <tr key={c._id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.nome}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>@{c.username}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{c.email}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{c.telefone}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{c.endereco || '—'}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{new Date(c.criadoEm).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.clientes.length === 0 && <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Nenhum cliente cadastrado.</p>}
              </div>
            </div>
          )}

          {/* ── CONFIGURAÇÕES ── */}
          {!loading && section === 'settings' && isDono && (
            <div className="animate-fadeIn" style={{ maxWidth: 540 }}>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, marginBottom: 20 }}>Informações da loja</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Nome da loja', key: 'nome' },
                    { label: 'Telefone / WhatsApp', key: 'telefone' },
                    { label: 'Endereço', key: 'endereco' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                      <input className="input" value={perfilForm[f.key] || ''} onChange={e => setPerfilForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Foto de perfil da loja</label>
                    <ImageUploader onImageSelect={(img) => setPerfilForm(p => ({ ...p, fotoPerfil: img }))} label="Enviar foto de perfil" maxSizeMB={5} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Banner/Capa da loja</label>
                    <ImageUploader onImageSelect={(img) => setPerfilForm(p => ({ ...p, bannerFundo: img }))} label="Enviar banner" maxSizeMB={5} />
                  </div>
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-end', background: config.corPrimaria }} onClick={async () => {
                    try {
                      const { data: d } = await lojaUpdatePerfil(perfilForm);
                      updateUser({ nome: d.nome, telefone: d.telefone });
                      show('Perfil atualizado!', 'success');
                    } catch { show('Erro ao atualizar.', 'error'); }
                  }}>
                    Salvar alterações
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Modais ── */}
      {modalProd  && <ModalProduto produto={modalProd === 'new' ? null : modalProd} onClose={() => setModalProd(null)} onSaved={() => { setModalProd(null); loadAll(); }} />}
      {modalEst   && <ModalEstoque produto={modalEst} onClose={() => setModalEst(null)} onSaved={() => { setModalEst(null); loadAll(); }} />}
      {modalFunc  && <ModalFuncionario func={modalFunc === 'new' ? null : modalFunc} onClose={() => setModalFunc(null)} onSaved={() => { setModalFunc(null); loadAll(); }} />}
      {modalVenda && <ModalVendaAvulsa produtos={data.produtos} onClose={() => setModalVenda(false)} onSaved={() => { setModalVenda(false); loadAll(); }} />}

      {/* ── Busca global ── */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
        items={searchItems}
      />
    </div>
  );
}