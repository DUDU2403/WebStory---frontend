import { useState } from 'react';
import { Store, ShoppingBag, BarChart2, Zap, ArrowRight, Search } from 'lucide-react';

export default function LandingPage({ nav }) {
  const [codigo, setCodigo] = useState('');

  const acessarLoja = () => {
    const c = codigo.trim().toUpperCase();
    if (!c) return;
    nav('loja', c);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #bbf7d0 100%)' }}>
      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--brand-dark)' }}>WebStory</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => nav('login')}>Entrar</button>
          <button className="btn btn-primary" onClick={() => nav('register')}>Criar loja</button>
        </div>
      </header>

      {/* Hero */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div className="animate-fadeIn">
          <span className="badge badge-green" style={{ marginBottom: 24, display: 'inline-block' }}>
            🚀 Sua loja online com WhatsApp
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.1, marginBottom: 24, color: '#0f172a' }}>
            Venda mais com sua<br />
            <span style={{ color: 'var(--brand)' }}>loja digital</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
            Crie sua vitrine online, gerencie estoque e receba pedidos direto no WhatsApp. Simples, rápido e eficiente.
          </p>
        </div>

        {/* Busca de loja */}
        <div className="animate-slideUp card" style={{ maxWidth: 520, margin: '0 auto 80px', padding: 28 }}>
          <p style={{ fontWeight: 600, marginBottom: 16, color: 'var(--text-1)', textAlign: 'left' }}>
            <Search size={16} style={{ display: 'inline', marginRight: 6 }} />
            Acessar uma loja
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input"
              placeholder="Digite o código da loja (ex: LOJA-A1B2)"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && acessarLoja()}
              style={{ textTransform: 'uppercase' }}
            />
            <button className="btn btn-primary" onClick={acessarLoja} style={{ flexShrink: 0 }}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 80 }}>
          {[
            { icon: <ShoppingBag size={24} />, title: 'Vitrine completa', desc: 'Categorias, busca, promoções e imagens dos produtos.' },
            { icon: <BarChart2 size={24} />, title: 'Controle de estoque', desc: 'Dashboard, alertas de estoque mínimo e histórico.' },
            { icon: <Zap size={24} />, title: 'Pedidos no WhatsApp', desc: 'Cliente finaliza o pedido direto no seu WhatsApp.' },
          ].map((f, i) => (
            <div key={i} className="card animate-slideUp" style={{ padding: 28, textAlign: 'left', animationDelay: `${i * 0.1}s` }}>
              <div style={{ width: 48, height: 48, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{ padding: 48, background: 'var(--brand)', border: 'none', color: 'white' }}>
          <h2 style={{ fontSize: 28, marginBottom: 12, color: 'white' }}>Pronto para começar?</h2>
          <p style={{ opacity: .85, marginBottom: 28 }}>Crie sua loja em minutos e comece a vender hoje.</p>
          <button className="btn btn-lg" style={{ background: 'white', color: 'var(--brand)' }} onClick={() => nav('register')}>
            Criar minha loja grátis <ArrowRight size={18} />
          </button>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-3)', fontSize: 13 }}>
        © 2025 WebStory · Todos os direitos reservados
      </footer>
    </div>
  );
}