import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  LayoutDashboard, Package, ClipboardList, TrendingDown,
  LogOut, Menu, X, Plus, Edit, Trash2, AlertTriangle,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Eye, EyeOff,
  Copy, Store, Settings
} from 'lucide-react';
import {
  getMeusProdutos, criarProduto, editarProduto, deletarProduto,
  movimentarEstoque, getHistorico, getAlertas,
  getMeusPedidos, atualizarPedido, lojaUpdatePerfil
} from '../api';
import { useAuth as useA } from '../contexts/AuthContext';

// ── Sub-components ──────────────────────────────────────────

function Spinner() {
  return <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', display: 'inline-block' }} />;
}

function ModalProduto({ produto, onClose, onSaved }) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(produto ? { ...produto } : {
    nome: '', descricao: '', preco: '', precoPromo: '', emPromocao: false,
    imagemUrl: '', categoria: 'geral', estoque: 0, estoqueMin: 5, ativo: true
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
    } catch (e) { show(e.response?.data?.message || 'Erro ao salvar.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 540 }}>
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18 }}>{produto ? 'Editar produto' : 'Novo produto'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nome *</label>
              <input className="input" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do produto" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Preço (R$) *</label>
              <input className="input" type="number" step="0.01" value={form.preco} onChange={e => set('preco', parseFloat(e.target.value))} placeholder="0,00" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Preço promo (R$)</label>
              <input className="input" type="number" step="0.01" value={form.precoPromo || ''} onChange={e => set('precoPromo', parseFloat(e.target.value))} placeholder="0,00" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Categoria</label>
              <input className="input" value={form.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Ex: baterias, telas..." />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Estoque mínimo</label>
              <input className="input" type="number" value={form.estoqueMin} onChange={e => set('estoqueMin', parseInt(e.target.value))} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>URL da imagem</label>
              <input className="input" value={form.imagemUrl || ''} onChange={e => set('imagemUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Descrição</label>
              <textarea className="input" rows={3} value={form.descricao || ''} onChange={e => set('descricao', e.target.value)} placeholder="Descrição do produto..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Em promoção', key: 'emPromocao' },
              { label: 'Mais vendido', key: 'maisVendido' },
              { label: 'Ativo', key: 'ativo' },
            ].map(opt => (
              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={!!form[opt.key]} onChange={e => set(opt.key, e.target.checked)} />
                {opt.label}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={loading}>
              {loading ? <Spinner /> : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      show(`Estoque atualizado! Atual: ${data.estoqueAtual}${data.alertaMinimo ? ' ⚠️ Estoque baixo!' : ''}`, data.alertaMinimo ? 'info' : 'success');
      onSaved();
    } catch (e) { show(e.response?.data?.message || 'Erro.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18 }}>Movimentar estoque</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{produto.nome}</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Estoque atual: <strong>{produto.estoque}</strong> | Mínimo: <strong>{produto.estoqueMin}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['entrada', 'saida'].map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`btn ${tipo === t ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, gap: 6 }}>
                {t === 'entrada' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {t === 'entrada' ? 'Entrada' : 'Saída'}
              </button>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Quantidade</label>
            <input className="input" type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Motivo (opcional)</label>
            <input className="input" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex: compra de fornecedor, venda..." />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={loading}>
              {loading ? <Spinner /> : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function DashboardVendedor({ nav }) {
  const { user, logout, updateUser } = useAuth();
  const { show } = useToast();
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos]   = useState([]);
  const [alertas, setAlertas]   = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [modalProd, setModalProd]     = useState(null); // null | 'new' | produto
  const [modalEst, setModalEst]       = useState(null);
  const [filtro, setFiltro]           = useState('');
  const [codVisible, setCodVisible]   = useState(false);

  // Profile edit
  const [editPerfil, setEditPerfil]   = useState(false);
  const [perfilForm, setPerfilForm]   = useState({ nome: user?.nome || '', telefone: user?.telefone || '', endereco: '', fotoPerfil: '', bannerFundo: '' });

  const loadAll = async () => {
    setLoadingData(true);
    try {
      const [p, ped, al, hist] = await Promise.all([
        getMeusProdutos(), getMeusPedidos(), getAlertas(), getHistorico()
      ]);
      setProdutos(p.data);
      setPedidos(ped.data);
      setAlertas(al.data);
      setHistorico(hist.data);
    } catch { }
    finally { setLoadingData(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(user?.codigoLoja || '');
    show('Código copiado!', 'success');
  };

  const lojaUrl = `${window.location.origin}${window.location.pathname}#loja/${user?.codigoLoja}`;

  const prodsFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  // Stats
  const totalEstoque  = produtos.reduce((s, p) => s + p.estoque, 0);
  const totalProdutos = produtos.length;
  const pedidosPend   = pedidos.filter(p => p.status === 'pendente').length;
  const faturamento   = pedidos.filter(p => p.status === 'confirmado').reduce((s, p) => s + p.total, 0);

  const navItems = [
    { key: 'overview',  label: 'Visão geral',  icon: <LayoutDashboard size={18} /> },
    { key: 'products',  label: 'Produtos',      icon: <Package size={18} /> },
    { key: 'orders',    label: 'Pedidos',        icon: <ClipboardList size={18} /> },
    { key: 'stock',     label: 'Estoque',        icon: <TrendingDown size={18} /> },
    { key: 'settings',  label: 'Configurações',  icon: <Settings size={18} /> },
  ];

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={18} color="white" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nome}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Vendedor</p>
          </div>
        </div>
      </div>
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        {navItems.map(item => (
          <button key={item.key} className={`nav-item ${section === item.key ? 'active' : ''}`}
            onClick={() => { setSection(item.key); setSidebarOpen(false); }}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}>
            {item.icon} {item.label}
            {item.key === 'orders' && pedidosPend > 0 && (
              <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: 11 }}>{pedidosPend}</span>
            )}
            {item.key === 'stock' && alertas.length > 0 && (
              <span className="badge badge-yellow" style={{ marginLeft: 'auto', fontSize: 11 }}>{alertas.length}</span>
            )}
          </button>
        ))}
      </nav>
      <div style={{ padding: '12px 12px 24px', borderTop: '1px solid var(--border)' }}>
        <button className="nav-item" style={{ width: '100%', color: '#ef4444' }} onClick={() => { logout(); nav('landing'); }}>
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Sidebar desktop */}
      <aside style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }} className="hide-mobile">
        {sidebar}
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ width: 260, background: 'var(--surface)', position: 'relative', zIndex: 1, height: '100vh', overflowY: 'auto' }}>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-sm show-mobile" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 style={{ fontSize: 18 }}>{navItems.find(n => n.key === section)?.label}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
              <span style={{ color: 'var(--text-3)' }}>Código:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand)' }}>
                {codVisible ? user?.codigoLoja : '••••••••'}
              </span>
              <button onClick={() => setCodVisible(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                {codVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={copyCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {loadingData && section === 'overview' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
          )}

          {/* ── OVERVIEW ── */}
          {section === 'overview' && !loadingData && (
            <div className="animate-fadeIn">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Total de produtos', val: totalProdutos, color: '#3b82f6', icon: <Package size={20} /> },
                  { label: 'Unidades em estoque', val: totalEstoque, color: 'var(--brand)', icon: <TrendingDown size={20} /> },
                  { label: 'Pedidos pendentes', val: pedidosPend, color: '#f59e0b', icon: <ClipboardList size={20} /> },
                  { label: 'Faturamento confirmado', val: `R$ ${faturamento.toFixed(2)}`, color: '#8b5cf6', icon: <LayoutDashboard size={20} /> },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>{s.label}</p>
                        <p style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: s.color }}>{s.val}</p>
                      </div>
                      <div style={{ width: 40, height: 40, background: s.color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                        {s.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {alertas.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#92400e' }}>Atenção: {alertas.length} produto(s) com estoque baixo</p>
                    <p style={{ fontSize: 13, color: '#b45309', marginTop: 4 }}>
                      {alertas.map(a => a.nome).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Link da loja */}
              <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Link da sua loja</p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lojaUrl}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(lojaUrl); show('Link copiado!', 'success'); }}>
                    <Copy size={14} /> Copiar
                  </button>
                </div>
              </div>

              {/* Últimos pedidos */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>Últimos pedidos</p>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSection('orders')}>Ver todos</button>
                </div>
                {pedidos.slice(0, 5).length === 0 ? (
                  <p style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: 20 }}>Nenhum pedido ainda.</p>
                ) : pedidos.slice(0, 5).map(p => (
                  <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{p.nomeCliente || 'Cliente'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>R$ {p.total.toFixed(2)}</span>
                      <span className={`badge badge-${p.status === 'confirmado' ? 'green' : p.status === 'cancelado' ? 'red' : 'yellow'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PRODUTOS ── */}
          {section === 'products' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input className="input" placeholder="Buscar produto ou categoria..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
                <button className="btn btn-primary" onClick={() => setModalProd('new')}>
                  <Plus size={16} /> Novo produto
                </button>
              </div>

              {loadingData ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
              ) : prodsFiltrados.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                  <Package size={40} style={{ margin: '0 auto 16px', color: 'var(--text-3)' }} />
                  <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nenhum produto encontrado</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModalProd('new')}>Adicionar primeiro produto</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {prodsFiltrados.map(p => (
                    <div key={p._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      {p.imagemUrl ? (
                        <img src={p.imagemUrl} alt={p.nome} style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{ width: '100%', height: 100, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                          <Package size={32} />
                        </div>
                      )}
                      <div style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 14 }}>{p.nome}</p>
                            <span className="badge badge-gray" style={{ marginTop: 4 }}>{p.categoria}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {p.emPromocao && p.precoPromo ? (
                              <>
                                <p style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'line-through' }}>R$ {p.preco.toFixed(2)}</p>
                                <p style={{ fontWeight: 700, color: 'var(--brand)' }}>R$ {p.precoPromo.toFixed(2)}</p>
                              </>
                            ) : <p style={{ fontWeight: 700 }}>R$ {p.preco.toFixed(2)}</p>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 13, color: p.estoque <= p.estoqueMin ? '#ef4444' : 'var(--text-2)' }}>
                            Estoque: <strong>{p.estoque}</strong>
                            {p.estoque <= p.estoqueMin && <AlertTriangle size={13} style={{ display: 'inline', marginLeft: 4, color: '#ef4444' }} />}
                          </span>
                          <span className={`badge ${p.ativo ? 'badge-green' : 'badge-gray'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModalEst(p)}>
                            <TrendingDown size={14} /> Estoque
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModalProd(p)}>
                            <Edit size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={async () => {
                            if (!confirm('Remover este produto?')) return;
                            await deletarProduto(p._id);
                            show('Produto removido.', 'success');
                            loadAll();
                          }}>
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

          {/* ── PEDIDOS ── */}
          {section === 'orders' && (
            <div className="animate-fadeIn">
              {loadingData ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
              ) : pedidos.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                  <ClipboardList size={40} style={{ margin: '0 auto 16px', color: 'var(--text-3)' }} />
                  <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nenhum pedido ainda.</p>
                </div>
              ) : pedidos.map(ped => (
                <div key={ped._id} className="card" style={{ padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{ped.nomeCliente || 'Cliente'}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{new Date(ped.criadoEm).toLocaleString('pt-BR')}</p>
                      <div style={{ marginTop: 10 }}>
                        {ped.itens.map((it, i) => (
                          <p key={i} style={{ fontSize: 13, color: 'var(--text-2)' }}>• {it.nome} x{it.quantidade} — R$ {(it.preco * it.quantidade).toFixed(2)}</p>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--brand)' }}>R$ {ped.total.toFixed(2)}</p>
                      <span className={`badge badge-${ped.status === 'confirmado' ? 'green' : ped.status === 'cancelado' ? 'red' : 'yellow'}`} style={{ marginTop: 8, display: 'inline-block' }}>
                        {ped.status}
                      </span>
                      {ped.status === 'pendente' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button className="btn btn-primary btn-sm" onClick={async () => { await atualizarPedido(ped._id, 'confirmado'); loadAll(); }}>Confirmar</button>
                          <button className="btn btn-danger btn-sm" onClick={async () => { await atualizarPedido(ped._id, 'cancelado'); loadAll(); }}>Cancelar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ESTOQUE ── */}
          {section === 'stock' && (
            <div className="animate-fadeIn">
              {alertas.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', gap: 12 }}>
                  <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#92400e' }}>Produtos com estoque abaixo do mínimo ({alertas.length})</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {alertas.map(a => (
                        <span key={a._id} className="badge badge-yellow">{a.nome} ({a.estoque}/{a.estoqueMin})</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de produtos com estoque */}
              <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Estoque por produto</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-2)' }}>
                        {['Produto', 'Categoria', 'Estoque atual', 'Mínimo', 'Status', 'Ação'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map(p => (
                        <tr key={p._id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.nome}</td>
                          <td style={{ padding: '12px 16px' }}><span className="badge badge-gray">{p.categoria}</span></td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: p.estoque <= p.estoqueMin ? '#ef4444' : 'var(--text-1)' }}>{p.estoque}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{p.estoqueMin}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${p.estoque === 0 ? 'badge-red' : p.estoque <= p.estoqueMin ? 'badge-yellow' : 'badge-green'}`}>
                              {p.estoque === 0 ? 'Sem estoque' : p.estoque <= p.estoqueMin ? 'Baixo' : 'OK'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setModalEst(p)}>
                              <TrendingDown size={13} /> Movimentar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Histórico */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Histórico de movimentações</div>
                {historico.length === 0 ? (
                  <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Nenhuma movimentação registrada.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                          {['Data', 'Produto', 'Tipo', 'Qtd', 'Motivo'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {historico.map(h => (
                          <tr key={h._id} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 16px', color: 'var(--text-2)' }}>{new Date(h.criadoEm).toLocaleDateString('pt-BR')}</td>
                            <td style={{ padding: '10px 16px', fontWeight: 500 }}>{h.produtoId?.nome || '—'}</td>
                            <td style={{ padding: '10px 16px' }}>
                              <span className={`badge ${h.tipo === 'entrada' ? 'badge-green' : 'badge-red'}`}>
                                {h.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 16px', fontWeight: 700 }}>{h.quantidade}</td>
                            <td style={{ padding: '10px 16px', color: 'var(--text-2)' }}>{h.motivo || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {section === 'settings' && (
            <div className="animate-fadeIn" style={{ maxWidth: 560 }}>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 20, fontSize: 16 }}>Informações da loja</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Nome da loja', key: 'nome', placeholder: user?.nome },
                    { label: 'Telefone / WhatsApp', key: 'telefone', placeholder: user?.telefone },
                    { label: 'Endereço', key: 'endereco', placeholder: 'Endereço da loja' },
                    { label: 'URL foto de perfil', key: 'fotoPerfil', placeholder: 'https://...' },
                    { label: 'URL banner', key: 'bannerFundo', placeholder: 'https://...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                      <input className="input" value={perfilForm[f.key] || ''} onChange={e => setPerfilForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ marginTop: 8, alignSelf: 'flex-end' }} onClick={async () => {
                    try {
                      const { data } = await lojaUpdatePerfil(perfilForm);
                      updateUser({ nome: data.nome, telefone: data.telefone });
                      show('Perfil atualizado!', 'success');
                    } catch { show('Erro ao atualizar.', 'error'); }
                  }}>
                    Salvar alterações
                  </button>
                </div>
              </div>

              <div className="card" style={{ padding: 28, marginTop: 16 }}>
                <h3 style={{ marginBottom: 8, fontSize: 16 }}>Código da loja</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>Compartilhe este código para que clientes acessem sua vitrine.</p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--surface-2)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: 'var(--brand)', letterSpacing: '0.05em', flex: 1 }}>{user?.codigoLoja}</span>
                  <button className="btn btn-primary btn-sm" onClick={copyCode}><Copy size={14} /> Copiar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modais */}
      {modalProd && (
        <ModalProduto
          produto={modalProd === 'new' ? null : modalProd}
          onClose={() => setModalProd(null)}
          onSaved={() => { setModalProd(null); loadAll(); }}
        />
      )}
      {modalEst && (
        <ModalEstoque
          produto={modalEst}
          onClose={() => setModalEst(null)}
          onSaved={() => { setModalEst(null); loadAll(); }}
        />
      )}
    </div>
  );
}