import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  if (token) cfg.headers['x-auth-token'] = token;
  return cfg;
});

export const lojaRegister     = (data)      => api.post('/loja/register', data);
export const lojaLogin        = (data)      => api.post('/loja/login', data);
export const lojaUpdatePerfil = (data)      => api.put('/loja/perfil', data);

export const getLoja     = (codigo)         => api.get(`/loja/${codigo}`);
export const getProdutos = (codigo, params) => api.get(`/loja/${codigo}/produtos`, { params });

export const getMeusProdutos = ()           => api.get('/minha-loja/produtos');
export const criarProduto    = (data)       => api.post('/produtos', data);
export const editarProduto   = (id, d)      => api.put(`/produtos/${id}`, d);
export const deletarProduto  = (id)         => api.delete(`/produtos/${id}`);

export const movimentarEstoque = (data)     => api.post('/estoque/movimentacao', data);
export const getHistorico      = (params)   => api.get('/estoque/historico', { params });
export const getAlertas        = ()         => api.get('/estoque/alertas');

export const criarPedido     = (data)       => api.post('/pedidos', data);
export const getMeusPedidos  = ()           => api.get('/minha-loja/pedidos');
export const atualizarPedido = (id, status) => api.put(`/pedidos/${id}/status`, { status });

export const adminLogin       = (data)      => api.post('/admin/login', data);
export const adminGetChaves   = ()          => api.get('/admin/chaves');
export const adminGerarChave  = ()          => api.post('/admin/chaves');
export const adminDeleteChave = (id)        => api.delete(`/admin/chaves/${id}`);
export const adminGetLojas    = ()          => api.get('/admin/lojas');
export const adminSetStatus   = (id, ativa) => api.put(`/admin/lojas/${id}/status`, { ativa });
export const adminDeleteLoja  = (id)        => api.delete(`/admin/lojas/${id}`);
export const adminGetStats    = ()          => api.get('/admin/stats');

export default api;