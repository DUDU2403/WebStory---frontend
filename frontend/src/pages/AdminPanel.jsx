import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import {
  Shield, Key, Store, Trash2, Plus, Eye, EyeOff,
  ArrowLeft, Copy, ToggleLeft, ToggleRight, LogOut,
  BarChart2, RefreshCw
} from 'lucide-react';
import {
  adminGetStats, adminGetChaves, adminGerarChave, adminDelChave,
  adminGetLojas, adminSetStatus, adminDelLoja
} from '../api';
import config from '../config';

function Spinner() {
  return <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />;
}

export default function AdminPanel({ nav }) {
  const { show }  = useToast();
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('admin_token');
    if (t) localStorage.setItem('token', t);
    return t;
  });
  const [loginForm, setLoginForm] = useState({
    email: import.meta.env.VITE_ADMIN_EMAIL || '',
    senha: '',
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPass, setShowPass]         = useState(false);
  const [section, setSection]           = useState('stats');
  const [stats, setStats]   = useState(null);
  const [chaves, setChaves] = useState([]);
  const [lojas, setLojas]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (token) loadData(); }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c, l] = await Promise.all([adminGetStats(), adminGetChaves(), adminGetLojas()]);
      setStats(s.data); setChaves(c.data); setLojas(l.data);
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
        setToken(null);
      }
    } finally { setLoading(false); }
  };

  const doLogin = async () => {
    if (!loginForm.email || !loginForm.senha) { show('Preencha e-mail e senha.', 'error'); return; }
    setLoginLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const res  = await fetch(`${BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { show(data.message || 'Acesso negado.', 'error'); return; }
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      show('Bem-vindo, admin!', 'success');
    } catch { show('Erro ao conectar com o servidor.', 'error'); }
    finally { setLoginLoading(false); }
  };

  const gerarChave = async () => {
    try {
      const { data } = await adminGerarChave();
      navigator.clipboard.writeText(data.chave).catch(() => {});
      show(`Chave gerada e copiada: ${data.chave}`, 'success');
      loadData();
    } catch { show('Erro ao gerar chave.', 'error'); }
  };

  // Tela de login
  if (!token) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 400, padding: 40 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav('home')} style={{ marginBottom: 24, paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, background: '#1e293b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#6366f1" />
          </div>
          <div>
            <h1 style={{ fontSize: 20 }}>Admin</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Painel do sistema</p>
          </div>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '11px 14px', marginBottom: 22, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Key size={14} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
            <strong>Primeiro acesso?</strong> Digite o e-mail admin e escolha uma senha. O sistema criará automaticamente.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>E-mail do admin</label>
            <input className="input" type="email" value={loginForm.email}
              onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@email.com" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
              Senha <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(defina no primeiro acesso)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} value={loginForm.senha}
                onChange={e => setLoginForm(f => ({ ...f, senha: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
                placeholder="••••••••" style={{ paddingRight: 44 }} />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8, background: '#6366f1' }}
            onClick={doLogin} disabled={loginLoading}>
            {loginLoading ? <Spinner /> : 'Entrar / Criar acesso'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', color: 'white', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color="#6366f1" />
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15 }}>WebStory Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[
            { key: 'stats',  label: '📊 Visão geral' },
            { key: 'chaves', label: '🔑 Chaves' },
            { key: 'lojas',  label: '🏪 Lojas' },
          ].map(s => (
            <button key={s.key} onClick={() => setSection(s.key)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: section === s.key ? 'rgba(255,255,255,.15)' : 'transparent', color: section === s.key ? 'white' : '#94a3b8', transition: 'all .18s' }}>
              {s.label}
            </button>
          ))}
          <button onClick={loadData} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#94a3b8', display: 'flex', alignItems: 'center' }} title="Atualizar">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => { localStorage.removeItem('admin_token'); localStorage.removeItem('token'); setToken(null); }}
            style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, background: 'rgba(239,68,68,.2)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>}

        {/* Stats */}
        {!loading && section === 'stats' && stats && (
          <div className="animate-fadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              {[
                { label: 'Total de lojas',    val: stats.totalLojas,      color: '#3b82f6' },
                { label: 'Lojas ativas',      val: stats.lojasAtivas,     color: '#16a34a' },
                { label: 'Total produtos',    val: stats.totalProdutos,   color: '#8b5cf6' },
                { label: 'Total pedidos',     val: stats.totalPedidos,    color: '#f59e0b' },
                { label: 'Chaves pendentes',  val: stats.chavesPendentes, color: '#ef4444' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>{s.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Sora', color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chaves */}
        {!loading && section === 'chaves' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 20 }}>Chaves de acesso</h2>
              <button className="btn btn-primary" style={{ background: '#6366f1' }} onClick={gerarChave}>
                <Plus size={16} /> Gerar nova chave
              </button>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Chave', 'Status', 'Loja vinculada', 'Criada em', 'Ação'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chaves.map(c => (
                    <tr key={c._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>{c.chave}</span>
                          <button onClick={() => { navigator.clipboard.writeText(c.chave); show('Copiado!', 'success'); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${c.usada ? 'badge-green' : 'badge-yellow'}`}>{c.usada ? 'Usada' : 'Disponível'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{c.lojaId?.nome || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{new Date(c.criadaEm).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {!c.usada && (
                          <button className="btn btn-danger btn-sm" onClick={async () => {
                            if (!confirm('Remover chave?')) return;
                            await adminDelChave(c._id); loadData();
                          }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {chaves.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Nenhuma chave gerada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lojas */}
        {!loading && section === 'lojas' && (
          <div className="animate-fadeIn">
            <h2 style={{ fontSize: 20, marginBottom: 18 }}>Lojas cadastradas ({lojas.length})</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Loja', 'E-mail', 'Telefone', 'Status', 'Criada em', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lojas.map(l => (
                    <tr key={l._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, background: '#6366f1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={14} color="white" />
                          </div>
                          <span style={{ fontWeight: 600 }}>{l.nome}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{l.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{l.telefone}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${l.ativa ? 'badge-green' : 'badge-red'}`}>{l.ativa ? 'Ativa' : 'Inativa'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{new Date(l.criadaEm).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className={`btn btn-sm ${l.ativa ? 'btn-outline' : 'btn-primary'}`}
                            style={{ borderColor: '#6366f1', color: l.ativa ? '#6366f1' : 'white', background: l.ativa ? 'transparent' : '#6366f1' }}
                            onClick={async () => { await adminSetStatus(l._id, !l.ativa); loadData(); }}>
                            {l.ativa ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                            {l.ativa ? 'Desativar' : 'Ativar'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={async () => {
                            if (!confirm(`Remover loja "${l.nome}"? Esta ação não pode ser desfeita.`)) return;
                            await adminDelLoja(l._id); loadData();
                          }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lojas.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Nenhuma loja cadastrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}