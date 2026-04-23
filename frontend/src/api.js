import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers['x-auth-token'] = token;
  return cfg;
});

// ── ADMIN ──────────────────────────────────────────────────
export const adminLogin       = (d)      => api.post('/admin/login', d);
export const adminGetStats    = ()       => api.get('/admin/stats');
export const adminGetChaves   = ()       => api.get('/admin/chaves');
export const adminGerarChave  = ()       => api.post('/admin/chaves');
export const adminDeleteChave    = (id)     => api.delete(`/admin/chaves/${id}`);
export const adminGetLojas    = ()       => api.get('/admin/lojas');
export const adminSetStatus   = (id, a)  => api.put(`/admin/lojas/${id}/status`, { ativa: a });
export const adminDeleteLoja     = (id)     => api.delete(`/admin/lojas/${id}`);

// ── LOJA (dono) ────────────────────────────────────────────
export const lojaRegister     = (d)      => api.post('/loja/register', d);
export const lojaLogin        = (d)      => api.post('/loja/login', d);
export const lojaUpdatePerfil = (d)      => api.put('/loja/perfil', d);
export const lojaInfo         = ()       => api.get('/loja/info');

// ── FUNCIONÁRIOS ───────────────────────────────────────────
export const funcLogin          = (d)    => api.post('/funcionarios/login', d);
export const getFuncionarios    = ()     => api.get('/funcionarios');
export const criarFuncionario   = (d)    => api.post('/funcionarios', d);
export const editarFuncionario  = (id,d) => api.put(`/funcionarios/${id}`, d);
export const deletarFuncionario = (id)   => api.delete(`/funcionarios/${id}`);

// ── CLIENTES (compradores) ─────────────────────────────────
export const clienteRegister    = (d)    => api.post('/clientes/register', d);
export const clienteLogin       = (d)    => api.post('/clientes/login', d);
export const clienteUpdatePerfil= (d)    => api.put('/clientes/perfil', d);
export const getClientes        = ()     => api.get('/clientes');
export const getMeusPedidos     = ()     => api.get('/meus-pedidos');

// ── PRODUTOS ───────────────────────────────────────────────
export const getProdutos        = (p)    => api.get('/produtos', { params: p });
export const getSugestoes       = (b)    => api.get('/produtos/sugestoes', { params: { busca: b } });
export const getCategorias      = ()     => api.get('/produtos/categorias');
export const getPainelProdutos  = ()     => api.get('/painel/produtos');
export const criarProduto       = (d)    => api.post('/produtos', d);
export const editarProduto      = (id,d) => api.put(`/produtos/${id}`, d);
export const deletarProduto     = (id)   => api.delete(`/produtos/${id}`);

// ── ESTOQUE ────────────────────────────────────────────────
export const movimentarEstoque  = (d)    => api.post('/estoque/movimentacao', d);
export const getHistorico       = (p)    => api.get('/estoque/historico', { params: p });
export const getAlertas         = ()     => api.get('/estoque/alertas');

// ── PEDIDOS ONLINE ─────────────────────────────────────────
export const criarPedido        = (d)    => api.post('/pedidos', d);
export const getPainelPedidos   = ()     => api.get('/painel/pedidos');
export const atualizarPedido    = (id,s) => api.put(`/pedidos/${id}/status`, { status: s });

// ── VENDA AVULSA ───────────────────────────────────────────
export const criarVendaAvulsa   = (d)    => api.post('/vendas-avulsas', d);
export const getVendasAvulsas   = ()     => api.get('/vendas-avulsas');

export default api;