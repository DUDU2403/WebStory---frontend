import { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus, LogIn, Store, ArrowRight, Sun, Moon } from 'lucide-react';
import { clienteRegister, clienteLogin, lojaInfo } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import config from '../config';

export default function AuthCliente({ nav }) {
  const { login } = useAuth();
  const { show }  = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [modo, setModo]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loja, setLoja]       = useState(null);
  const [form, setForm] = useState({ nome: '', username: '', email: '', senha: '', telefone: '', endereco: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { lojaInfo().then(r => setLoja(r.data)).catch(() => {}); }, []);

  const submit = async () => {
    if (!form.email || !form.senha) { show('Preencha e-mail e senha.', 'error'); return; }
    if (modo === 'cadastro' && (!form.nome || !form.username || !form.telefone)) {
      show('Preencha todos os campos obrigatórios.', 'error'); return;
    }
    setLoading(true);
    try {
      const { data } = await (modo === 'login' ? clienteLogin(form) : clienteRegister(form));
      login(data.token, { ...data.perfil, role: 'cliente' });
      show(modo === 'login' ? `Bem-vindo(a), ${data.perfil.nome}!` : 'Cadastro realizado!', 'success');
      nav('vitrine');
    } catch (e) {
      show(e.response?.data?.message || 'Erro. Tente novamente.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-2)' }}>
      {/* Botão de tema */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-1)',
          zIndex: 50
        }}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Lado esquerdo */}
      <div style={{ flex: 1, background: config.corSecundaria, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'white' }} className="hide-mobile">
        <div style={{ maxWidth: 360, textAlign: 'center' }}>
          {config.logo
            ? <img src={config.logo} alt={config.nomeLoja} style={{ height: 80, marginBottom: 32, objectFit: 'contain' }} />
            : <div style={{ width: 80, height: 80, background: config.corPrimaria, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}><Store size={40} color="white" /></div>
          }
          <h1 style={{ fontSize: 32, color: 'white', marginBottom: 16 }}>{loja?.nome || config.nomeLoja}</h1>
          <p style={{ fontSize: 16, opacity: .75, lineHeight: 1.7 }}>{config.descricao}</p>
          {(loja?.endereco || config.endereco) && (
            <p style={{ fontSize: 13, opacity: .5, marginTop: 24 }}>📍 {loja?.endereco || config.endereco}</p>
          )}
        </div>
      </div>

      {/* Formulário */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }} className="show-mobile">
            <div style={{ width: 40, height: 40, background: config.corPrimaria, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 18 }}>{loja?.nome || config.nomeLoja}</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {[{ key: 'login', label: 'Entrar', icon: <LogIn size={15} /> }, { key: 'cadastro', label: 'Cadastrar', icon: <UserPlus size={15} /> }].map(t => (
              <button key={t.key} onClick={() => setModo(t.key)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .18s', background: modo === t.key ? 'white' : 'transparent', color: modo === t.key ? config.corPrimaria : 'var(--text-2)', boxShadow: modo === t.key ? 'var(--shadow-sm)' : 'none' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {modo === 'cadastro' && <>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nome completo *</label>
                <input className="input" placeholder="Seu nome completo" value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nome de usuário *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 14 }}>@</span>
                  <input className="input" placeholder="seunome" value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} style={{ paddingLeft: 28 }} />
                </div>
              </div>
            </>}

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>E-mail *</label>
              <input className="input" type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Senha *</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.senha} onChange={e => set('senha', e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {modo === 'cadastro' && <>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Telefone / WhatsApp *</label>
                <input className="input" placeholder="(11) 99999-9999" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Endereço <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(opcional)</span></label>
                <input className="input" placeholder="Rua, número, bairro, cidade" value={form.endereco} onChange={e => set('endereco', e.target.value)} />
              </div>
            </>}

            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8, background: config.corPrimaria }} onClick={submit} disabled={loading}>
              {loading
                ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
                : <>{modo === 'login' ? 'Entrar' : 'Criar conta'} <ArrowRight size={16} /></>
              }
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
            <button onClick={() => nav('login-vendedor')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-3)' }}>
              Sou vendedor / funcionário →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}