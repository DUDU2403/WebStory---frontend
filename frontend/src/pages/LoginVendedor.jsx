import { useState } from 'react';
import { Store, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { lojaLogin } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginVendedor({ nav }) {
  const { login } = useAuth();
  const { show }  = useToast();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    if (!form.email || !form.senha) { show('Preencha todos os campos.', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await lojaLogin(form);

      // ✅ CORREÇÃO: garante que a role está presente nos dados do usuário
      // O backend pode retornar 'role' dentro de data.loja, ou pode não retornar.
      // Forçamos 'loja' como padrão para que isVendedor funcione corretamente.
      const userData = {
        ...data.loja,
        role: data.loja.role || 'loja',
      };

      login(data.token, userData);
      show('Bem-vindo de volta!', 'success');
      nav(data.loja.isAdmin ? 'admin' : 'dashboard');
    } catch (e) {
      show(e.response?.data?.message || 'Erro ao entrar.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav('landing')} style={{ marginBottom: 24, paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'var(--brand)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22 }}>Entrar</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Painel do vendedor</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>E-mail</label>
            <input className="input" type="email" placeholder="seu@email.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{ paddingRight: 44 }} />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={submit} disabled={loading} style={{ marginTop: 8, width: '100%' }}>
            {loading ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> : 'Entrar'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-2)' }}>
          Não tem conta?{' '}
          <button onClick={() => nav('register-vendedor')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontWeight: 600 }}>
            Criar loja
          </button>
        </p>
      </div>
    </div>
  );
}