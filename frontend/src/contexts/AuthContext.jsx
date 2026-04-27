import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      try { setUser(JSON.parse(u)); } catch { }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  // Helpers de role
  const isCliente     = user?.role === 'cliente';
  const isVendedor    = user?.role === 'loja' || user?.role === 'funcionario';
  const isDono        = user?.role === 'loja';
  const isFuncionario = user?.role === 'funcionario';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isCliente, isVendedor, isDono, isFuncionario }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);