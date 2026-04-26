import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';

import AuthCliente      from './pages/AuthCliente';
import Vitrine          from './pages/Vitrine';
import LoginVendedor    from './pages/LoginVendedor';
import RegisterVendedor from './pages/RegisterVendedor';
import Dashboard        from './pages/Dashboard';
import AdminPanel       from './pages/AdminPanel';

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );
}

function Router() {
  const { user, loading, isCliente, isVendedor } = useAuth();
  const [page, setPage] = useState('');

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace('#', '');
      setPage(h || 'home');
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const nav = (p) => { window.location.hash = p === 'home' ? '' : p; };

  if (loading) return <Spinner />;

  // Rotas especiais sempre acessíveis
  if (page === 'admin')         return <AdminPanel nav={nav} />;
  if (page === 'login-vendedor') return <LoginVendedor nav={nav} />;
  if (page === 'register-vendedor') return <RegisterVendedor nav={nav} />;

  // Painel do vendedor
  if (page === 'dashboard') {
    if (!isVendedor) { nav('login-vendedor'); return null; }
    return <Dashboard nav={nav} />;
  }

  // Vitrine — precisa estar logado como cliente
  if (page === 'vitrine' || page === '') {
    if (isVendedor) { nav('dashboard'); return null; }
    if (!isCliente) return <AuthCliente nav={nav} />;
    return (
      <CartProvider>
        <Vitrine nav={nav} />
      </CartProvider>
    );
  }

  // Redireciona usuários logados para o lugar certo
  if (page === 'home' || page === '') {
    if (isVendedor) { nav('dashboard'); return null; }
    if (isCliente)  { nav('vitrine');   return null; }
    return <AuthCliente nav={nav} />;
  }

  return <AuthCliente nav={nav} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}