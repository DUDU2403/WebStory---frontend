import { useState } from 'react';
import { Store, ArrowRight, ShoppingBag, BarChart2, Key, Shield } from 'lucide-react';

export default function LandingPage({ nav }) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro]     = useState('');

  const acessarLoja = () => {
    const cod = codigo.trim().toUpperCase();
    if (!cod) { setErro('Digite o código da loja.'); return; }
    if (!cod.startsWith('LOJA-') || cod.length < 9) { setErro('Código inválido. Formato: LOJA-XXXX'); return; }
    setErro('');
    nav('loja', cod);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-1)' }}>
            Web<span style={{ color: 'var(--brand)' }}>Story</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('login')}>Entrar</button>
          <button className="btn btn-primary btn-sm" onClick={() => nav('register')}>Criar loja</button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, color: 'white', fontSize: 13, fontWeight: 600 }}>
            <ShoppingBag size={14} /> Plataforma de lojas online
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', color: 'white', lineHeight: 1.15, marginBottom: 20 }}>
            Sua loja online pronta para vender
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.85)', lineHeight: 1.7, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Gerencie produtos, controle estoque e receba pedidos pelo WhatsApp — tudo em um só lugar.
          </p>

          {/* Caixa de acesso à loja */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 440, margin: '0 auto', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', marginBottom: 6 }}>Acessar uma loja</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>Digite o código que a loja te enviou</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="input"
                placeholder="LOJA-XXXX"
                value={codigo}
                onChange={e => { setCodigo(e.target.value.toUpperCase()); setErro(''); }}
                onKeyDown={e => e.key === 'Enter' && acessarLoja()}
                style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em', fontSize: 16, textAlign: 'center' }}
              />
              <button className="btn btn-primary" onClick={acessarLoja} style={{ flexShrink: 0 }}>
                <ArrowRight size={18} />
              </button>
            </div>
            {erro && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{erro}</p>}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, marginBottom: 48 }}>Tudo que sua loja precisa</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { icon: <ShoppingBag size={24} />, title: 'Vitrine completa', desc: 'Produtos organizados por categorias, com fotos, preços e promoções em destaque.' },
            { icon: <BarChart2 size={24} />, title: 'Controle de estoque', desc: 'Dashboard com movimentações, alertas de estoque mínimo e histórico completo.' },
            { icon: <Store size={24} />, title: 'Pedidos via WhatsApp', desc: 'O cliente finaliza o carrinho e o pedido chega formatado direto no seu WhatsApp.' },
            { icon: <Shield size={24} />, title: 'Acesso por chave', desc: 'Cada loja recebe uma chave exclusiva gerada pelo admin para garantir segurança.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: 28 }}>
              <div style={{ width: 48, height: 48, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, marginBottom: 12 }}>Pronto para começar?</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 28, fontSize: 15 }}>Crie sua loja agora com uma chave de acesso do administrador.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => nav('register')}>
            <Store size={18} /> Criar minha loja
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => nav('login')}>
            Já tenho conta
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', textAlign: 'center', padding: '24px', fontSize: 13 }}>
        <p>© {new Date().getFullYear()} WebStory. Todos os direitos reservados.</p>
        <button onClick={() => nav('admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, margin: '8px auto 0' }}>
          <Shield size={12} /> Área admin
        </button>
      </footer>
    </div>
  );
}