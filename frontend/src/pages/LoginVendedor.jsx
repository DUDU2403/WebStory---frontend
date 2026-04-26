import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Store, Users, Sun, Moon } from 'lucide-react';
import { lojaLogin, funcLogin } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import config from '../config';

export default function LoginVendedor({ nav }) {
  const { login } = useAuth();
  const { show }  = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [tipo, setTipo]         = useState('dono');
  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!email || !senha) { show('Preencha todos os campos.', 'error'); return; }
    setLoading(true);
    try {
      const fn = tipo === 'dono' ? lojaLogin : funcLogin;
      const { data } = await fn({ email, senha });

      // ✅ Salva perfil completo com role e id corretos
      const role = tipo === 'dono' ? 'loja' : 'funcionario';
      login(data.token, { ...data.perfil, role, id: data.perfil.id });

      show('Bem-vindo!', 'success');
      nav('dashboard');
    } catch (e) {
      show(e.response?.data?.message || 'Credenciais inválidas.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
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

      <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav('home')} style={{ marginBottom: 24, paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: config.corSecundaria, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20 }}>Painel da loja</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Acesso restrito</p>
          </div>
        </div>

        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[{ k: 'dono', l: 'Dono', i: <Store size={14} /> }, { k: 'funcionario', l: 'Funcionário', i: <Users size={14} /> }].map(t => (
            <button key={t.k} onClick={() => setTipo(t.k)}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .18s', background: tipo === t.k ? 'white' : 'transparent', color: tipo === t.k ? config.corSecundaria : 'var(--text-2)', boxShadow: tipo === t.k ? 'var(--shadow-sm)' : 'none' }}>
              {t.i} {t.l}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>E-mail</label>
            <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={senha}
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{ paddingRight: 44 }} />
              <button onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8, background: config.corSecundaria }}
            onClick={submit} disabled={loading}>
            {loading
              ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
              : 'Entrar'}
          </button>
        </div>

        {tipo === 'dono' && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-2)' }}>
            Não tem conta?{' '}
            <button onClick={() => nav('register-vendedor')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: config.corPrimaria, fontWeight: 600 }}>
              Criar loja
            </button>
          </p>
        )}
      </div>
    </div>
  );
}