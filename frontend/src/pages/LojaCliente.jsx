import { useState, useEffect } from 'react';
import { CartProvider, useCart } from '../contexts/CartContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { getLoja, getProdutos, criarPedido } from '../api';
import {
  ShoppingCart, Search, X, Plus, Minus, Store, MapPin,
  Phone, ChevronRight, Star, Tag, Truck, ShoppingBag,
  ArrowLeft, User, AlertCircle, CheckCircle, Package
} from 'lucide-react';

// ── Cart Drawer ──────────────────────────────────────────────
function CartDrawer({ loja, onClose }) {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart();
  const { show } = useToast();
  const [step, setStep]       = useState('cart'); // cart | checkout | done
  const [loading, setLoading] = useState(false);
  const [tipoEntrega, setTipoEntrega] = useState('entrega'); // entrega | retirada
  const [cliente, setCliente] = useState({ nome: '', telefone: '', endereco: '' });
  const [obs, setObs]         = useState('');

  const finalizar = async () => {
    if (!cliente.nome || !cliente.telefone) { show('Informe seu nome e telefone.', 'error'); return; }
    if (tipoEntrega === 'entrega' && !cliente.endereco) { show('Informe o endereço de entrega.', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await criarPedido({
        codigoLoja: loja.codigoLoja,
        itens: items.map(i => ({ produtoId: i._id, nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
        nomeCliente: cliente.nome,
        telefoneCliente: cliente.telefone,
        enderecoEntrega: tipoEntrega === 'entrega' ? cliente.endereco : 'RETIRADA NA LOJA',
        tipoEntrega,
        observacao: obs,
      });
      clearCart();
      window.open(data.linkWhatsApp, '_blank');
      setStep('done');
    } catch (e) {
      show(e.response?.data?.message || 'Erro ao criar pedido.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,.15)', animation: 'slideRight .25s ease' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step !== 'cart' && step !== 'done' && (
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('cart')} style={{ paddingLeft: 0 }}><ArrowLeft size={18} /></button>
            )}
            <h3 style={{ fontSize: 18 }}>
              {step === 'cart' ? `Carrinho (${count})` : step === 'checkout' ? 'Finalizar pedido' : 'Pedido enviado!'}
            </h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* ── CARRINHO ── */}
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: 'var(--text-3)' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-2)' }}>Seu carrinho está vazio</p>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>Adicione produtos para continuar</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {items.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {item.imagemUrl ? (
                        <img src={item.imagemUrl} alt={item.nome} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{ width: 64, height: 64, background: 'var(--surface-2)', borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                          <Package size={24} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome}</p>
                        <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 700 }}>R$ {item.preco.toFixed(2)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <button onClick={() => updateQty(item._id, item.quantidade - 1)} style={{ width: 26, height: 26, border: '1.5px solid var(--border)', borderRadius: 6, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
                            <Minus size={13} />
                          </button>
                          <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.quantidade}</span>
                          <button onClick={() => updateQty(item._id, item.quantidade + 1)} style={{ width: 26, height: 26, border: '1.5px solid var(--border)', borderRadius: 6, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                        <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── CHECKOUT ── */}
          {step === 'checkout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Seus dados</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="input" placeholder="Seu nome completo *" value={cliente.nome} onChange={e => setCliente(c => ({ ...c, nome: e.target.value }))} />
                  <input className="input" placeholder="Seu telefone / WhatsApp *" value={cliente.telefone} onChange={e => setCliente(c => ({ ...c, telefone: e.target.value }))} />
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Tipo de entrega</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { key: 'entrega', label: 'Entrega', icon: <Truck size={16} /> },
                    { key: 'retirada', label: 'Retirar na loja', icon: <Store size={16} /> },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setTipoEntrega(opt.key)}
                      style={{ flex: 1, padding: '12px', border: `2px solid ${tipoEntrega === opt.key ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 10, background: tipoEntrega === opt.key ? '#f0fdf4' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: tipoEntrega === opt.key ? 'var(--brand)' : 'var(--text-2)', fontWeight: 600, fontSize: 13, transition: 'all .18s' }}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {tipoEntrega === 'entrega' && (
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Endereço de entrega</p>
                  <input className="input" placeholder="Rua, número, bairro, cidade *" value={cliente.endereco} onChange={e => setCliente(c => ({ ...c, endereco: e.target.value }))} />
                </div>
              )}

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Observações</p>
                <textarea className="input" rows={3} placeholder="Alguma observação para o pedido?" value={obs} onChange={e => setObs(e.target.value)} style={{ resize: 'none' }} />
              </div>

              {/* Resumo */}
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 16 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Resumo do pedido</p>
                {items.map(i => (
                  <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
                    <span>{i.nome} x{i.quantidade}</span>
                    <span>R$ {(i.preco * i.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--brand)' }}>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--brand)' }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 10 }}>Pedido enviado!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24 }}>
                Você foi redirecionado para o WhatsApp para confirmar seu pedido com a loja.
              </p>
              <button className="btn btn-primary" onClick={onClose}>Continuar comprando</button>
            </div>
          )}
        </div>

        {/* Footer do drawer */}
        {step === 'cart' && items.length > 0 && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 16, fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--brand)' }}>R$ {total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setStep('checkout')}>
              Finalizar pedido <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={finalizar} disabled={loading}>
              {loading ? (
                <span className="animate-spin" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              ) : (
                <><Phone size={18} /> Enviar pedido no WhatsApp</>
              )}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 10 }}>Você será redirecionado ao WhatsApp da loja</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────
function ProductCard({ produto, onAdd }) {
  const preco = produto.emPromocao && produto.precoPromo ? produto.precoPromo : produto.preco;
  return (
    <div className="card product-card" style={{ overflow: 'hidden' }} onClick={() => onAdd(produto)}>
      <div style={{ position: 'relative' }}>
        {produto.imagemUrl ? (
          <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ width: '100%', height: 120, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
            <Package size={32} />
          </div>
        )}
        {produto.emPromocao && produto.precoPromo && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
            PROMO
          </span>
        )}
        {produto.maisVendido && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: '#f59e0b', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={10} fill="white" /> TOP
          </span>
        )}
      </div>
      <div style={{ padding: '14px 14px 12px' }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.4 }}>{produto.nome}</p>
        {produto.descricao && <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>{produto.descricao}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {produto.emPromocao && produto.precoPromo && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'line-through' }}>R$ {produto.preco.toFixed(2)}</p>
            )}
            <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand)' }}>R$ {preco.toFixed(2)}</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={e => { e.stopPropagation(); onAdd(produto); }}
            disabled={produto.estoque === 0}
            style={{ borderRadius: '50%', width: 34, height: 34, padding: 0 }}>
            <Plus size={16} />
          </button>
        </div>
        {produto.estoque === 0 && (
          <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontWeight: 600 }}>Sem estoque</p>
        )}
      </div>
    </div>
  );
}

// ── Modal produto detalhe ────────────────────────────────────
function ModalProdutoDetalhe({ produto, onClose, onAdd }) {
  const preco = produto.emPromocao && produto.precoPromo ? produto.precoPromo : produto.preco;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        {produto.imagemUrl && (
          <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: '16px 16px 0 0' }} onError={e => { e.target.style.display = 'none'; }} />
        )}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 20, marginBottom: 4 }}>{produto.nome}</h3>
              <span className="badge badge-gray">{produto.categoria}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
          </div>
          {produto.descricao && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{produto.descricao}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              {produto.emPromocao && produto.precoPromo && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'line-through' }}>R$ {produto.preco.toFixed(2)}</p>
              )}
              <p style={{ fontWeight: 800, fontSize: 24, color: 'var(--brand)' }}>R$ {preco.toFixed(2)}</p>
            </div>
            {produto.estoque > 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{produto.estoque} disponíveis</p>
            )}
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => { onAdd(produto); onClose(); }} disabled={produto.estoque === 0}>
            <Plus size={18} /> {produto.estoque === 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main LojaCliente ─────────────────────────────────────────
function LojaClienteInner({ codigoLoja, nav }) {
  const { addItem, count } = useCart();
  const { show } = useToast();
  const [loja, setLoja]         = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [busca, setBusca]       = useState('');
  const [categoria, setCategoria] = useState('');
  const [apenasPromo, setApenasPromo] = useState(false);
  const [cartOpen, setCartOpen]   = useState(false);
  const [prodDetalhe, setProdDetalhe] = useState(null);

  // Cadastro do cliente
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [clienteForm, setClienteForm]   = useState({ nome: '', email: '', telefone: '', endereco: '' });
  const [clienteData, setClienteData]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(`cliente_${codigoLoja}`)); } catch { return null; }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [lojaRes, prodsRes] = await Promise.all([
          getLoja(codigoLoja),
          getProdutos(codigoLoja)
        ]);
        setLoja(lojaRes.data);
        setProdutos(prodsRes.data);
        // Pede cadastro se não tiver
        if (!clienteData) setTimeout(() => setCadastroOpen(true), 800);
      } catch (e) {
        setError(e.response?.data?.message || 'Loja não encontrada.');
      } finally { setLoading(false); }
    };
    load();
  }, [codigoLoja]);

  const categorias = [...new Set(produtos.map(p => p.categoria))].filter(Boolean);

  const prodsFiltrados = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.descricao?.toLowerCase().includes(busca.toLowerCase());
    const matchCat   = !categoria || p.categoria === categoria;
    const matchPromo = !apenasPromo || p.emPromocao;
    return matchBusca && matchCat && matchPromo;
  });

  const handleAdd = (produto) => {
    if (produto.estoque === 0) { show('Produto sem estoque.', 'error'); return; }
    addItem(produto);
    show(`${produto.nome} adicionado!`, 'success');
  };

  const salvarCliente = () => {
    if (!clienteForm.nome || !clienteForm.telefone) { show('Nome e telefone são obrigatórios.', 'error'); return; }
    localStorage.setItem(`cliente_${codigoLoja}`, JSON.stringify(clienteForm));
    setClienteData(clienteForm);
    setCadastroOpen(false);
    show('Bem-vindo(a)! Agora é só escolher seus produtos.', 'success');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%' }} />
      <p style={{ color: 'var(--text-3)' }}>Carregando loja...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <AlertCircle size={48} color="#ef4444" />
      <h2 style={{ color: 'var(--text-1)' }}>Loja não encontrada</h2>
      <p style={{ color: 'var(--text-2)', textAlign: 'center' }}>{error}</p>
      <button className="btn btn-primary" onClick={() => nav('landing')}>Voltar ao início</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Banner + Header da loja */}
      <div style={{ background: loja.bannerFundo ? `url(${loja.bannerFundo}) center/cover` : 'linear-gradient(135deg, #16a34a, #15803d)', minHeight: 200, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,.15)', color: 'white', backdropFilter: 'blur(8px)', marginBottom: 40 }} onClick={() => nav('landing')}>
            <ArrowLeft size={16} /> Início
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 24 }}>
            <div style={{ width: 80, height: 80, background: 'white', borderRadius: 16, overflow: 'hidden', border: '3px solid white', boxShadow: 'var(--shadow)', flexShrink: 0 }}>
              {loja.fotoPerfil ? (
                <img src={loja.fotoPerfil} alt={loja.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={32} color="white" />
                </div>
              )}
            </div>
            <div style={{ color: 'white', paddingBottom: 4 }}>
              <h1 style={{ fontSize: 26, color: 'white', marginBottom: 6 }}>{loja.nome}</h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {loja.endereco && <span style={{ fontSize: 13, opacity: .85, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {loja.endereco}</span>}
                {loja.telefone && <span style={{ fontSize: 13, opacity: .85, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} /> {loja.telefone}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky topbar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input className="input" placeholder="Buscar produtos..." value={busca} onChange={e => setBusca(e.target.value)}
              style={{ paddingLeft: 38 }} />
          </div>
          <button className="btn btn-primary" style={{ position: 'relative', flexShrink: 0 }} onClick={() => setCartOpen(true)}>
            <ShoppingCart size={18} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          {clienteData && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setClienteForm(clienteData); setCadastroOpen(true); }} style={{ flexShrink: 0 }}>
              <User size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
          <button className={`btn btn-sm ${!categoria && !apenasPromo ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setCategoria(''); setApenasPromo(false); }}>
            Todos
          </button>
          {categorias.map(cat => (
            <button key={cat} className={`btn btn-sm ${categoria === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCategoria(cat === categoria ? '' : cat)}>
              {cat}
            </button>
          ))}
          <button className={`btn btn-sm ${apenasPromo ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setApenasPromo(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tag size={13} /> Promoções
          </button>
        </div>

        {/* Destaque: mais vendidos */}
        {!busca && !categoria && !apenasPromo && produtos.filter(p => p.maisVendido && p.ativo).length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={20} fill="#f59e0b" color="#f59e0b" /> Mais vendidos
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {produtos.filter(p => p.maisVendido && p.ativo).map(p => (
                <ProductCard key={p._id} produto={p} onAdd={(prod) => { setProdDetalhe(prod); }} />
              ))}
            </div>
          </div>
        )}

        {/* Seções por categoria */}
        {!busca && !categoria && !apenasPromo ? (
          categorias.length > 0 ? categorias.map(cat => {
            const prods = produtos.filter(p => p.categoria === cat && p.ativo);
            if (prods.length === 0) return null;
            return (
              <div key={cat} style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 20, marginBottom: 16, textTransform: 'capitalize' }}>{cat}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {prods.map(p => <ProductCard key={p._id} produto={p} onAdd={(prod) => setProdDetalhe(prod)} />)}
                </div>
              </div>
            );
          }) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {produtos.filter(p => p.ativo).map(p => <ProductCard key={p._id} produto={p} onAdd={(prod) => setProdDetalhe(prod)} />)}
            </div>
          )
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>{prodsFiltrados.length} resultado(s)</p>
            {prodsFiltrados.length === 0 ? (
              <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                <Search size={40} style={{ margin: '0 auto 16px', color: 'var(--text-3)' }} />
                <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nenhum produto encontrado</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {prodsFiltrados.map(p => <ProductCard key={p._id} produto={p} onAdd={(prod) => setProdDetalhe(prod)} />)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating cart btn mobile */}
      {count > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }} className="show-mobile">
          <button className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-lg)', borderRadius: 999, paddingLeft: 28, paddingRight: 28 }} onClick={() => setCartOpen(true)}>
            <ShoppingCart size={18} /> Ver carrinho ({count})
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && <CartDrawer loja={loja} onClose={() => setCartOpen(false)} />}

      {/* Modal detalhe produto */}
      {prodDetalhe && (
        <ModalProdutoDetalhe
          produto={prodDetalhe}
          onClose={() => setProdDetalhe(null)}
          onAdd={handleAdd}
        />
      )}

      {/* Modal cadastro cliente */}
      {cadastroOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 20 }}>Bem-vindo(a)!</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Antes de comprar, precisamos de alguns dados seus.</p>
              </div>
              {clienteData && <button className="btn btn-ghost btn-sm" onClick={() => setCadastroOpen(false)}><X size={18} /></button>}
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nome completo *</label>
                <input className="input" placeholder="Seu nome" value={clienteForm.nome} onChange={e => setClienteForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>E-mail</label>
                <input className="input" type="email" placeholder="seu@email.com" value={clienteForm.email} onChange={e => setClienteForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Telefone / WhatsApp *</label>
                <input className="input" placeholder="(11) 99999-9999" value={clienteForm.telefone} onChange={e => setClienteForm(f => ({ ...f, telefone: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Endereço de entrega</label>
                <input className="input" placeholder="Rua, número, bairro, cidade" value={clienteForm.endereco} onChange={e => setClienteForm(f => ({ ...f, endereco: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} onClick={salvarCliente}>
                <CheckCircle size={18} /> Confirmar e entrar
              </button>
              {!clienteData && (
                <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setCadastroOpen(false)}>
                  Pular por agora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LojaCliente({ codigoLoja, nav }) {
  return (
    <CartProvider codigoLoja={codigoLoja}>
      <LojaClienteInner codigoLoja={codigoLoja} nav={nav} />
    </CartProvider>
  );
}