// ─── App Principal ────────────────────────────────────────────────────────────
// Substitua APENAS a função App() no final do seu App.jsx por este trecho

function App() {
  const [sessao, setSessao] = useState(() => JSON.parse(localStorage.getItem('webstory_sessao') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('webstory_token') || null);
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState(() => {
    // Define o modo inicial com base na sessão salva
    const s = JSON.parse(localStorage.getItem('webstory_sessao') || 'null');
    if (s?.isAdmin) return 'admin';
    if (s) return 'painel';
    return 'vitrine';
  });

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'eduardojunior3300@outlook.com';

  const handleAuth = async (dados, tipo) => {
    setCarregando(true);
    try {
      if (tipo === 'login') {
        // Login admin
        if (dados.email === ADMIN_EMAIL) {
          const res = await axios.post(`${API_URL}/admin/login`, dados);
          localStorage.setItem('webstory_token', res.data.token);
          localStorage.setItem('webstory_sessao', JSON.stringify({ email: res.data.email, isAdmin: true }));
          setToken(res.data.token);
          setSessao({ email: res.data.email, isAdmin: true });
          setModo('admin');
          return;
        }
        // Login de loja
        const res = await axios.post(`${API_URL}/loja/login`, dados);
        localStorage.setItem('webstory_token', res.data.token);
        localStorage.setItem('webstory_sessao', JSON.stringify(res.data.loja));
        setToken(res.data.token);
        setSessao(res.data.loja);
        setModo('painel');
      } else {
        // Cadastro
        const resCadastro = await axios.post(`${API_URL}/loja/register`, dados);
        const resLogin = await axios.post(`${API_URL}/loja/login`, { email: dados.email, senha: dados.senha });
        const codigoLoja = resLogin.data.loja.codigoLoja;
        alert(`✅ Loja criada com sucesso!\n\nSeu código de acesso para clientes é:\n\n${codigoLoja}\n\nGuarde este código — é como seus clientes vão acessar sua loja!`);
        localStorage.setItem('webstory_token', resLogin.data.token);
        localStorage.setItem('webstory_sessao', JSON.stringify(resLogin.data.loja));
        setToken(resLogin.data.token);
        setSessao(resLogin.data.loja);
        setModo('painel');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('webstory_token');
    localStorage.removeItem('webstory_sessao');
    setToken(null);
    setSessao(null);
    setModo('vitrine');
  };

  // ── Roteamento ──────────────────────────────────────────────────────────────

  // Vitrine pública (sem sessão)
  if (modo === 'vitrine') {
    return (
      <>
        <Vitrine />
        {/* Botão fixo para dono de loja acessar o painel */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setModo('painel')}
            className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-900 transition-colors">
            <LogIn size={16} /> Sou dono de loja
          </button>
        </div>
      </>
    );
  }

  // Painel da loja
  if (modo === 'painel') {
    // Sem sessão ou sem token → mostra login
    if (!sessao || !token) {
      return <LoginLoja onLogin={handleAuth} carregando={carregando} />;
    }
    // Admin tentou ir ao painel → redireciona para admin
    if (sessao.isAdmin) {
      setModo('admin');
      return null;
    }
    return (
      <>
        <PainelLoja loja={sessao} token={token} onLogout={logout} />
        {/* Botão para ver a vitrine como cliente */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setModo('vitrine')}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-700 transition-colors">
            <Store size={16} /> Ver vitrine
          </button>
        </div>
      </>
    );
  }

  // Painel admin
  if (modo === 'admin') {
    if (!sessao?.isAdmin || !token) {
      return <LoginLoja onLogin={handleAuth} carregando={carregando} />;
    }
    return <AdminPainel token={token} onLogout={logout} />;
  }

  // Fallback
  return <LoginLoja onLogin={handleAuth} carregando={carregando} />;
}

export default App;