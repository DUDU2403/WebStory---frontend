import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import {
  Shield, Key, Store, BarChart2, Trash2, Plus, Eye, EyeOff,
  ArrowLeft, Copy, CheckCircle, X, ToggleLeft, ToggleRight, LogOut
} from 'lucide-react';
import {
  adminLogin, adminGetStats, adminGetChaves, adminGerarChave,
  adminDeleteChave, adminGetLojas, adminSetStatus, adminDeleteLoja
} from '../api';

function Spinner() {
  return <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', display: 'inline-block' }} />;
}

export default function AdminPanel({ nav }) {
  const { show } = useToast();
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('admin_token');
    if (t) localStorage.setItem('token', t); // garante que o interceptor do axios usa o token admin
    return t;
  });
  const [loginForm, setLoginForm] = useState({ email: import.meta.env.VITE_ADMIN_EMAIL || '', senha: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [section, setSection] = useState('stats');
  const [stats, setStats]     = useState(null);
  const [chaves, setChaves]   = useState([]);
  const [lojas, setLojas]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c, l] = await Promise.all([adminGetStats(), adminGetChaves(), adminGetLojas()]);
      setStats(s.data);
      setChaves(c.data);
      setLojas(l.data);
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('admin_token');
        setToken(null);
      }
    } finally { setLoading(false); }
  };

  const doLogin = async () => {
    if (!loginForm.email || !loginForm.senha) { show('Preencha e-mail e senha.', 'error'); return; }
    setLoginLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const res = await fetch(`${BASE}/admin/login`, {
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
    } catch (e) {
      show('Erro ao conectar com o servidor.', 'error');
    } finally { setLoginLoading(false); }
  };

  const gerarChave = async () => {
    try {
      const { data } = await adminGerarChave();
      show(`Chave gerada: ${data.chave}`, 'success');
      navigator.clipboard.writeText(data.chave);
      loadData();
    } catch { show('Erro ao gerar chave.', 'error'); }
  };

  const removeChave = async (id) => {
    if (!confirm('Remover esta chave?')) return;
    await adminDeleteChave(id);
    loadData();
  };

  const toggleLoja = async (loja) => {
    await adminSetStatus(loja._id, !loja.ativa);
    loadData();
  };

  const removeLoja = async (id) => {
    if (!confirm('Remover esta loja?')) return;
    await adminDeleteLoja(id);
    loadData();
  };

  // Login screen
  if (!token) return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 400, padding: 40 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav('landing')} style={{ marginBottom: 24, paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, background: '#1e293b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20 }}>Admin</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Painel do administrador</p>
          </div>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Key size={15} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
            <strong>Primeiro acesso?</strong> Digite o e-mail de admin e escolha uma senha. O sistema vai criá-la automaticamente.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>E-mail do admin</label>
            <input className="input" type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder={import.meta.env.VITE_ADMIN_EMAIL || 'admin@email.com'} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
              Senha {!loginForm.email ? '' : <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(defina uma no primeiro acesso)</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} value={loginForm.senha}
                onChange={e => setLoginForm(f => ({ ...f, senha: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
                placeholder="Digite a senha desejada"
                style={{ paddingRight: 44 }} />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={doLogin} disabled={loginLoading} style={{ width: '100%', marginTop: 8, background: '#1e293b' }}>
            {loginLoading ? <Spinner /> : 'Entrar / Criar acesso'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', color: 'white', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} color="#94a3b8" />
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>WebStory Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'stats', label: 'Visão geral' },
            { key: 'chaves', label: 'Chaves' },
            { key: 'lojas', label: 'Lojas' },
          ].map(s => (
            <button key={s.key} onClick={() => setSection(s.key)}
              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: section === s.key ? 'rgba(255,255,255,.15)' : 'transparent', color: section === s.key ? 'white' : '#94a3b8', transition: 'all .18s' }}>
              {s.label}
            </button>
          ))}
          <button onClick={() => { localStorage.removeItem('admin_token'); localStorage.removeItem('token'); setToken(null); }}
            style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, background: 'rgba(239,68,68,.2)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>}

        {/* Stats */}
        {section === 'stats' && !loading && stats && (
          <div className="animate-fadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total de lojas',   val: stats.totalLojas,      color: '#3b82f6' },
                { label: 'Lojas ativas',     val: stats.lojasAtivas,     color: 'var(--brand)' },
                { label: 'Total produtos',   val: stats.totalProdutos,   color: '#8b5cf6' },
                { label: 'Total pedidos',    val: stats.totalPedidos,    color: '#f59e0b' },
                { label: 'Chaves pendentes', val: stats.chavesPendentes, color: '#ef4444' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chaves */}
        {section === 'chaves' && !loading && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20 }}>Chaves de acesso</h2>
              <button className="btn btn-primary" onClick={gerarChave}>
                <Plus size={16} /> Gerar nova chave
              </button>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Chave', 'Status', 'Loja associada', 'Criada em', 'Ação'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chaves.map(c => (
                    <tr key={c._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {c.chave}
                          <button onClick={() => { navigator.clipboard.writeText(c.chave); show('Copiado!', 'success'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${c.usada ? 'badge-green' : 'badge-yellow'}`}>{c.usada ? 'Usada' : 'Disponível'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>
                        {c.lojaId ? `${c.lojaId.nome}` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>
                        {new Date(c.criadaEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {!c.usada && (
                          <button className="btn btn-danger btn-sm" onClick={() => removeChave(c._id)}>
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
        {section === 'lojas' && !loading && (
          <div className="animate-fadeIn">
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Lojas cadastradas ({lojas.length})</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Loja', 'E-mail', 'Código', 'Status', 'Criada em', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lojas.map(l => (
                    <tr key={l._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={15} color="white" />
                          </div>
                          {l.nome}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{l.email}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13 }}>{l.codigoLoja}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${l.ativa ? 'badge-green' : 'badge-red'}`}>{l.ativa ? 'Ativa' : 'Inativa'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{new Date(l.criadaEm).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className={`btn btn-sm ${l.ativa ? 'btn-outline' : 'btn-primary'}`} onClick={() => toggleLoja(l)}>
                            {l.ativa ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {l.ativa ? 'Desativar' : 'Ativar'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeLoja(l._id)}>
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