import { useState } from 'react';
import { Store, Eye, EyeOff, ArrowLeft, Key } from 'lucide-react';
import { lojaRegister } from '../api';
import { useToast } from '../contexts/ToastContext';
import config from '../config';

export default function RegisterVendedor({ nav }) {
  const { show } = useToast();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', telefone: '',
    chaveAcesso: '', cnpj: '', endereco: ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    const { nome, email, senha, telefone, chaveAcesso } = form;
    if (!nome || !email || !senha || !telefone || !chaveAcesso) {
      show('Preencha todos os campos obrigatórios.', 'error'); return;
    }
    setLoading(true);
    try {
      const { data } = await lojaRegister(form);
      show('Loja criada com sucesso! Faça login para continuar.', 'success');
      nav('login-vendedor');
    } catch (e) {
      show(e.response?.data?.message || 'Erro ao cadastrar.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 460, padding: 40 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav('home')} style={{ marginBottom: 24, paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, background: config.corPrimaria, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22 }}>Criar loja</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Etapa {step} de 2</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, marginBottom: 32 }}>
          <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: config.corPrimaria, borderRadius: 2, transition: 'width .3s' }} />
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Nome da loja *</label>
              <input className="input" placeholder="Ex: Peças Pro Celulares" value={form.nome} onChange={e => set('nome', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>E-mail *</label>
              <input className="input" type="email" placeholder="contato@minhaloja.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Senha *</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => set('senha', e.target.value)} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Telefone / WhatsApp *</label>
              <input className="input" placeholder="(11) 99999-9999" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8, background: config.corPrimaria }}
              onClick={() => {
                if (!form.nome || !form.email || !form.senha || !form.telefone) { show('Preencha todos os campos.', 'error'); return; }
                setStep(2);
              }}>
              Próximo
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
              <Key size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                Você precisa de uma <strong>chave de acesso</strong> fornecida pelo administrador para criar sua loja.
              </p>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Chave de acesso *</label>
              <input className="input" placeholder="AK-XXXXXXXX" value={form.chaveAcesso} onChange={e => set('chaveAcesso', e.target.value.toUpperCase())} style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>CNPJ <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(opcional)</span></label>
              <input className="input" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={e => set('cnpj', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Endereço da loja <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(opcional)</span></label>
              <input className="input" placeholder="Rua, número, bairro, cidade" value={form.endereco} onChange={e => set('endereco', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setStep(1)}>Voltar</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1, background: config.corPrimaria }} onClick={submit} disabled={loading}>
                {loading
                  ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
                  : 'Criar loja'
                }
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-2)' }}>
          Já tem conta?{' '}
          <button onClick={() => nav('login-vendedor')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: config.corPrimaria, fontWeight: 600 }}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}