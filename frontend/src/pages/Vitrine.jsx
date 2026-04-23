import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ShoppingCart, X, Plus, Minus, Package, Star, Tag,
  Truck, Store, Phone, MapPin, User, LogOut, ChevronDown,
  CheckCircle, ArrowRight, Grid, List, SlidersHorizontal, Heart
} from 'lucide-react';
import { getProdutos, getSugestoes, getCategorias, criarPedido, lojaInfo } from '../api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import config from '../config';

// ── Helpers ──────────────────────────────────────────────────
const fmt = (v) => `${config.moedaSimbolo} ${Number(v).toFixed(2)}`;

function Spinner({ size = 20 }) {
  return <div style={{ width: size, height: size, border: '2px solid var(--border)', borderTopColor: config.corPrimaria, borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />;
}

// ── Barra de busca com autocomplete ─────────────────────────
function SearchBar({ value, onChange }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [open, setOpen]           = useState(false);
  const [loadingSug, setLoadingSug] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (val) => {
    onChange(val);
    clearTimeout(timer.current);
    if (val.length < 2) { setSugestoes([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoadingSug(true);
      try {
        const { data } = await getSugestoes(val);
        setSugestoes(data);
        setOpen(data.length > 0);
      } catch { } finally { setLoadingSug(false); }
    }, 280);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'relative' }}>
        <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        <input
          className="input"
          placeholder="Buscar produtos..."
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => sugestoes.length > 0 && setOpen(true)}
          style={{ paddingLeft: 42, paddingRight: value ? 36 : 14, fontSize: 15 }}
        />
        {value && (
          <button onClick={() => { onChange(''); setSugestoes([]); setOpen(false); }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
            <X size={15} />
          </button>
        )}
        {loadingSug && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <Spinner size={16} />
          </div>
        )}
      </div>

      {/* Dropdown sugestões */}
      {open && sugestoes.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden' }}>
          {sugestoes.map(p => {
            const preco = p.emPromocao && p.precoPromo ? p.precoPromo : p.preco;
            return (
              <button key={p._id} onClick={() => { onChange(p.nome); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {p.imagemUrl
                    ? <img src={p.imagemUrl} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}><Package size={18} /></div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{p.categoria}</p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: config.corPrimaria, flexShrink: 0 }}>{fmt(preco)}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Card de produto ──────────────────────────────────────────
function ProdutoCard({ produto, modo = 'grid', onVerDetalhe }) {
  const { addItem } = useCart();
  const { show }    = useToast();
  const preco = produto.emPromocao && produto.precoPromo ? produto.precoPromo : produto.preco;
  const semEstoque = produto.estoque === 0;

  const add = (e) => {
    e.stopPropagation();
    if (semEstoque) return;
    addItem(produto);
    show(`${produto.nome} adicionado!`, 'success');
  };

  if (modo === 'lista') {
    return (
      <div className="card" style={{ display: 'flex', gap: 16, padding: 16, cursor: 'pointer', transition: 'box-shadow .2s' }}
        onClick={() => onVerDetalhe(produto)}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
        <div style={{ width: 90, height: 90, background: 'var(--surface-2)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
          {produto.imagemUrl
            ? <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}><Package size={28} /></div>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{produto.nome}</p>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>{produto.categoria}</span>
              {produto.descricao && <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.5 }}>{produto.descricao}</p>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {produto.emPromocao && produto.precoPromo && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'line-through' }}>{fmt(produto.preco)}</p>
              )}
              <p style={{ fontWeight: 800, fontSize: 18, color: config.corPrimaria }}>{fmt(preco)}</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8, background: config.corPrimaria }} onClick={add} disabled={semEstoque}>
                {semEstoque ? 'Sem estoque' : <><Plus size={14} /> Adicionar</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card product-card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => onVerDetalhe(produto)}>
      <div style={{ position: 'relative' }}>
        <div style={{ height: 180, background: 'var(--surface-2)', overflow: 'hidden' }}>
          {produto.imagemUrl
            ? <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} onError={e => { e.target.style.display = 'none'; }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}><Package size={36} /></div>
          }
        </div>
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexDirection: 'column' }}>
          {produto.emPromocao && produto.precoPromo && (
            <span style={{ background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 7px', borderRadius: 6 }}>PROMO</span>
          )}
          {produto.maisVendido && (
            <span style={{ background: config.corAcento, color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Star size={9} fill="white" /> TOP
            </span>
          )}
        </div>
        {semEstoque && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'white', color: 'var(--text-1)', fontWeight: 700, fontSize: 12, padding: '6px 12px', borderRadius: 8 }}>Sem estoque</span>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 14px 12px' }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.4 }}>{produto.nome}</p>
        {produto.descricao && <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{produto.descricao}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {produto.emPromocao && produto.precoPromo && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'line-through' }}>{fmt(produto.preco)}</p>
            )}
            <p style={{ fontWeight: 800, fontSize: 16, color: config.corPrimaria }}>{fmt(preco)}</p>
          </div>
          <button onClick={add} disabled={semEstoque}
            style={{ width: 34, height: 34, borderRadius: '50%', background: semEstoque ? 'var(--surface-3)' : config.corPrimaria, color: 'white', border: 'none', cursor: semEstoque ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s', flexShrink: 0 }}>
            <Plus size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal detalhe produto ─────────────────────────────────────
function ModalDetalhe({ produto, onClose }) {
  const { addItem } = useCart();
  const { show }    = useToast();
  const [qty, setQty] = useState(1);
  const preco = produto.emPromocao && produto.precoPromo ? produto.precoPromo : produto.preco;

  const add = () => {
    if (produto.estoque === 0) return;
    addItem(produto, qty);
    show(`${produto.nome} adicionado!`, 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        {produto.imagemUrl && (
          <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: '16px 16px 0 0' }} onError={e => { e.target.style.display = 'none'; }} />
        )}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 20, marginBottom: 6 }}>{produto.nome}</h3>
              <span className="badge badge-gray">{produto.categoria}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
          </div>
          {produto.descricao && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{produto.descricao}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              {produto.emPromocao && produto.precoPromo && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'line-through' }}>{fmt(produto.preco)}</p>
              )}
              <p style={{ fontWeight: 800, fontSize: 26, color: config.corPrimaria }}>{fmt(preco)}</p>
            </div>
            {produto.estoque > 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{produto.estoque} disponíveis</p>}
          </div>
          {produto.estoque > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Quantidade:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 10, padding: '4px 8px' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={13} /></button>
                <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(produto.estoque, q + 1))} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={13} /></button>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-3)' }}>= <strong style={{ color: config.corPrimaria }}>{fmt(preco * qty)}</strong></p>
            </div>
          )}
          <button className="btn btn-primary btn-lg" style={{ width: '100%', background: config.corPrimaria }} onClick={add} disabled={produto.estoque === 0}>
            {produto.estoque === 0 ? 'Sem estoque' : <><Plus size={18} /> Adicionar ao carrinho</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Drawer do carrinho ────────────────────────────────────────
function CartDrawer({ onClose }) {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart();
  const { user } = useAuth();
  const { show } = useToast();
  const [step, setStep]     = useState('cart');
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo]     = useState('entrega');
  const [endereco, setEndereco] = useState(user?.endereco || '');
  const [obs, setObs]       = useState('');

  const finalizar = async () => {
    if (tipo === 'entrega' && !endereco) { show('Informe o endereço de entrega.', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await criarPedido({
        itens: items.map(i => ({ produtoId: i._id, nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
        tipoEntrega: tipo, enderecoEntrega: endereco, observacao: obs,
      });
      clearCart();
      window.open(data.linkWhatsApp, '_blank');
      setStep('done');
    } catch (e) { show(e.response?.data?.message || 'Erro ao criar pedido.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,.15)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h3 style={{ fontSize: 18 }}>
            {step === 'cart' ? `Carrinho (${count})` : step === 'checkout' ? 'Finalizar pedido' : '✅ Pedido enviado!'}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {step === 'cart' && (
            items.length === 0
              ? <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <ShoppingCart size={48} style={{ color: 'var(--text-3)', margin: '0 auto 16px', display: 'block' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-2)' }}>Carrinho vazio</p>
                </div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {items.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 60, height: 60, background: 'var(--surface-2)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        {item.imagemUrl ? <img src={item.imagemUrl} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}><Package size={20} /></div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</p>
                        <p style={{ fontSize: 13, color: config.corPrimaria, fontWeight: 700 }}>{fmt(item.preco)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                          <button onClick={() => updateQty(item._id, item.quantidade - 1)} style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 5, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                          <span style={{ fontWeight: 700, fontSize: 14, minWidth: 18, textAlign: 'center' }}>{item.quantidade}</span>
                          <button onClick={() => updateQty(item._id, item.quantidade + 1)} style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 5, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{fmt(item.preco * item.quantidade)}</p>
                        <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', marginTop: 4, display: 'block' }}><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
          )}

          {step === 'checkout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Tipo de entrega</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ k: 'entrega', l: 'Entrega', i: <Truck size={15} /> }, { k: 'retirada', l: 'Retirar na loja', i: <Store size={15} /> }].map(opt => (
                    <button key={opt.k} onClick={() => setTipo(opt.k)} style={{ flex: 1, padding: 12, border: `2px solid ${tipo === opt.k ? config.corPrimaria : 'var(--border)'}`, borderRadius: 10, background: tipo === opt.k ? '#f0fdf4' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: tipo === opt.k ? config.corPrimaria : 'var(--text-2)', fontWeight: 600, fontSize: 13, transition: 'all .18s' }}>
                      {opt.i} {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              {tipo === 'entrega' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Endereço de entrega *</label>
                  <input className="input" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade" />
                </div>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Observações</label>
                <textarea className="input" rows={3} value={obs} onChange={e => setObs(e.target.value)} placeholder="Alguma obs para o pedido?" style={{ resize: 'none' }} />
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 14 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Resumo</p>
                {items.map(i => (
                  <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
                    <span>{i.nome} x{i.quantidade}</span><span>{fmt(i.preco * i.quantidade)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                  <span>Total</span><span style={{ color: config.corPrimaria }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: config.corPrimaria }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 10 }}>Pedido enviado!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24 }}>Você foi direcionado ao WhatsApp para confirmar o pedido.</p>
              <button className="btn btn-primary" style={{ background: config.corPrimaria }} onClick={onClose}>Continuar comprando</button>
            </div>
          )}
        </div>

        {step === 'cart' && items.length > 0 && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 16, fontWeight: 700 }}>
              <span>Total</span><span style={{ color: config.corPrimaria }}>{fmt(total)}</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', background: config.corPrimaria }} onClick={() => setStep('checkout')}>
              Finalizar <ArrowRight size={18} />
            </button>
          </div>
        )}
        {step === 'checkout' && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', background: config.corPrimaria }} onClick={finalizar} disabled={loading}>
              {loading ? <Spinner /> : <><Phone size={18} /> Enviar no WhatsApp</>}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 8 }}>Você será redirecionado ao WhatsApp da loja</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Vitrine principal ─────────────────────────────────────────
export default function Vitrine({ nav }) {
  const { user, logout } = useAuth();
  const { count }        = useCart();
  const { show }         = useToast();

  const [loja, setLoja]           = useState(null);
  const [produtos, setProdutos]   = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]     = useState(true);

  const [busca, setBusca]         = useState('');
  const [categoria, setCategoria] = useState('');
  const [ordem, setOrdem]         = useState('');
  const [apenasPromo, setApenasPromo] = useState(false);
  const [layoutModo, setLayoutModo]   = useState('grid');

  const [cartOpen, setCartOpen]       = useState(false);
  const [prodDetalhe, setProdDetalhe] = useState(null);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (busca)    params.busca    = busca;
      if (categoria) params.categoria = categoria;
      if (apenasPromo) params.promocao = 'true';
      if (ordem)    params.ordem   = ordem;
      const { data } = await getProdutos(params);
      setProdutos(data);
    } catch { } finally { setLoading(false); }
  }, [busca, categoria, apenasPromo, ordem]);

  useEffect(() => {
    lojaInfo().then(r => setLoja(r.data)).catch(() => {});
    getCategorias().then(r => setCategorias(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProdutos, busca ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProdutos]);

  // Agrupa produtos por categoria quando não há filtro ativo
  const semFiltro = !busca && !categoria && !apenasPromo && !ordem;
  const catAtivas = semFiltro ? [...new Set(produtos.map(p => p.categoria))].filter(Boolean) : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Header */}
      <header style={{ background: config.corSecundaria, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {config.logo
              ? <img src={config.logo} alt={config.nomeLoja} style={{ height: 36, objectFit: 'contain' }} />
              : <div style={{ width: 36, height: 36, background: config.corPrimaria, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={19} color="white" /></div>
            }
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 16, color: 'white' }} className="hide-mobile">{loja?.nome || config.nomeLoja}</span>
          </div>

          {/* Busca */}
          <div style={{ flex: 1 }}>
            <SearchBar value={busca} onChange={setBusca} />
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 8, borderRadius: 8 }} onClick={() => setCartOpen(true)}>
              <ShoppingCart size={22} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', color: 'white', padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                <User size={16} />
                <span className="hide-mobile">{user?.nome?.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 180, zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{user?.nome}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>@{user?.username}</p>
                  </div>
                  <button onClick={() => { logout(); nav('home'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#ef4444' }}>
                    <LogOut size={15} /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-header categorias */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', overflowX: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 4, alignItems: 'center', height: 44 }}>
            <button onClick={() => { setCategoria(''); setApenasPromo(false); }} style={{ padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', background: !categoria && !apenasPromo ? 'white' : 'transparent', color: !categoria && !apenasPromo ? config.corSecundaria : 'rgba(255,255,255,.75)', transition: 'all .18s' }}>
              Todos
            </button>
            {categorias.map(cat => (
              <button key={cat} onClick={() => setCategoria(cat === categoria ? '' : cat)} style={{ padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', background: categoria === cat ? 'white' : 'transparent', color: categoria === cat ? config.corSecundaria : 'rgba(255,255,255,.75)', transition: 'all .18s', textTransform: 'capitalize' }}>
                {cat}
              </button>
            ))}
            <button onClick={() => setApenasPromo(v => !v)} style={{ padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, background: apenasPromo ? '#fef9c3' : 'transparent', color: apenasPromo ? '#ca8a04' : 'rgba(255,255,255,.75)', transition: 'all .18s' }}>
              <Tag size={12} /> Promoções
            </button>
          </div>
        </div>
      </header>

      {/* Banner */}
      {!busca && !categoria && !apenasPromo && (loja?.bannerFundo || config.banner) && (
        <div style={{ background: `url(${loja?.bannerFundo || config.banner}) center/cover`, height: 200, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white', gap: 8 }}>
            <h2 style={{ fontSize: 28, color: 'white' }}>{loja?.nome || config.nomeLoja}</h2>
            <p style={{ opacity: .85 }}>{config.descricao}</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {/* Barra de ferramentas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
            {loading ? 'Carregando...' : `${produtos.length} produto${produtos.length !== 1 ? 's' : ''}`}
            {(busca || categoria || apenasPromo) && ' encontrado' + (produtos.length !== 1 ? 's' : '')}
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Ordenação */}
            <select value={ordem} onChange={e => setOrdem(e.target.value)} className="input" style={{ padding: '7px 12px', fontSize: 13, width: 'auto' }}>
              <option value="">Relevância</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="novo">Mais recentes</option>
            </select>
            {/* Layout */}
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {[{ k: 'grid', i: <Grid size={16} /> }, { k: 'lista', i: <List size={16} /> }].map(l => (
                <button key={l.k} onClick={() => setLayoutModo(l.k)} style={{ padding: '7px 10px', border: 'none', cursor: 'pointer', background: layoutModo === l.k ? config.corPrimaria : 'white', color: layoutModo === l.k ? 'white' : 'var(--text-2)', transition: 'all .18s' }}>
                  {l.i}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Produtos */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
        ) : produtos.length === 0 ? (
          <div className="card" style={{ padding: 80, textAlign: 'center' }}>
            <Search size={48} style={{ margin: '0 auto 16px', color: 'var(--text-3)', display: 'block' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-2)', fontSize: 18 }}>Nenhum produto encontrado</p>
            <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Tente outros termos de busca</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => { setBusca(''); setCategoria(''); setApenasPromo(false); }}>Limpar filtros</button>
          </div>
        ) : semFiltro ? (
          // Agrupado por categoria
          <>
            {/* Mais vendidos */}
            {produtos.filter(p => p.maisVendido).length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={20} fill={config.corAcento} color={config.corAcento} /> Mais vendidos
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {produtos.filter(p => p.maisVendido).map(p => <ProdutoCard key={p._id} produto={p} modo="grid" onVerDetalhe={setProdDetalhe} />)}
                </div>
              </div>
            )}
            {catAtivas.map(cat => (
              <div key={cat} style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, marginBottom: 16, textTransform: 'capitalize' }}>{cat}</h2>
                <div style={{ display: layoutModo === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', flexDirection: 'column', gap: 16 }}>
                  {produtos.filter(p => p.categoria === cat).map(p => <ProdutoCard key={p._id} produto={p} modo={layoutModo} onVerDetalhe={setProdDetalhe} />)}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ display: layoutModo === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', flexDirection: 'column', gap: 16 }}>
            {produtos.map(p => <ProdutoCard key={p._id} produto={p} modo={layoutModo} onVerDetalhe={setProdDetalhe} />)}
          </div>
        )}
      </div>

      {/* Botão flutuante carrinho mobile */}
      {count > 0 && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }} className="show-mobile">
          <button onClick={() => setCartOpen(true)} style={{ background: config.corPrimaria, color: 'white', border: 'none', borderRadius: 999, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={18} /> Ver carrinho ({count})
          </button>
        </div>
      )}

      {cartOpen    && <CartDrawer onClose={() => setCartOpen(false)} />}
      {prodDetalhe && <ModalDetalhe produto={prodDetalhe} onClose={() => setProdDetalhe(null)} />}
    </div>
  );
}