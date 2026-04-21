import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import LandingPage     from './pages/LandingPage';
import LoginVendedor   from './pages/LoginVendedor';
import RegisterVendedor from './pages/RegisterVendedor';
import DashboardVendedor from './pages/DashboardVendedor';
import LojaCliente     from './pages/LojaCliente';
import AdminPanel      from './pages/AdminPanel';

function Router() {
  const { user, loading } = useAuth();
  const [page, setPage]   = useState('landing'); // landing | loja | login | register | dashboard | admin
  const [codigoLoja, setCodigoLoja] = useState('');

  // Lê hash da URL para rota de loja pública
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('loja/')) {
        const code = hash.split('/')[1]?.toUpperCase();
        if (code) { setCodigoLoja(code); setPage('loja'); }
      } else if (hash === 'login')    setPage('login');
      else if (hash === 'register')   setPage('register');
      else if (hash === 'dashboard')  setPage('dashboard');
      else if (hash === 'admin')      setPage('admin');
      else setPage('landing');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const nav = (p, extra) => {
    if (p === 'loja' && extra) { window.location.hash = `loja/${extra}`; }
    else window.location.hash = p === 'landing' ? '' : p;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: 'var(--brand)', borderRadius: '50%' }} />
    </div>
  );

  // Redireciona vendedor logado para dashboard
  if (page === 'login' && user) { nav('dashboard'); return null; }

  switch (page) {
    case 'loja':
      return <LojaCliente codigoLoja={codigoLoja} nav={nav} />;
    case 'login':
      return <LoginVendedor nav={nav} />;
    case 'register':
      return <RegisterVendedor nav={nav} />;
    case 'dashboard':
      if (!user) { nav('login'); return null; }
      return <DashboardVendedor nav={nav} />;
    case 'admin':
      return <AdminPanel nav={nav} />;
    default:
      return <LandingPage nav={nav} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </AuthProvider>
  );
}