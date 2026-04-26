# 🔧 Guia de Depuração - Erro de Cadastro

## Problema Relatado
Ao tentar cadastrar funcionário, produto ou criar conta de cliente, aparece mensagem genérica: "Erro. Tente novamente"

## Passo 1: Identificar Exatamente o Erro
### No Frontend:
```javascript
// Abra o DevTools (F12)
// Vá para a aba Console
// Tente fazer um cadastro e veja o erro exato
```

### No Backend:
```javascript
// Adicione este console.log no catch dos endpoints
catch (e) { 
  console.error('ERRO DETALHADO:', e); // ← ADICIONE ESTA LINHA
  res.status(500).json({ message: e.message }); 
}
```

## Possíveis Problemas Específicos

### 1. **Token Inválido em Endpoints Autenticados**
**Afeta**: `criarFuncionario`, `criarProduto`, `movimentarEstoque`

**Solução**: Verifique se o token está sendo enviado:
```javascript
// Em api.js, o interceptor adiciona o token:
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers['x-auth-token'] = token;
  return cfg;
});
```

### 2. **Erro de Validação de Email Único**
**Afeta**: `criarFuncionario`, `clienteRegister`

**Causa**: MongoDB tenta inserer um email que já existe
**Solução**: Adicione tratamento específico:
```javascript
catch (e) {
  if (e.code === 11000) { // Erro de índice único
    const field = Object.keys(e.keyPattern)[0];
    return res.status(400).json({ message: `${field} já cadastrado.` });
  }
  res.status(500).json({ message: e.message });
}
```

### 3. **Erro de Conexão com MongoDB**
**Sintoma**: Erro em TODOS os endpoints
**Solução**: 
- Verifique se MongoDB está rodando
- Verifique se MONGO_URI está correto no .env
- Teste: `mongo --eval "db.version()"`

### 4. **CORS ou Requisição Bloqueada**
**Sintoma**: Network erro ou status 0
**Verificação**:
1. Abra DevTools → Network
2. Faça um cadastro
3. Procure a requisição vermelha
4. Veja a aba "Response" para detalhes

## Teste Rápido com Curl

```bash
# Teste criar funcionário
curl -X POST http://localhost:10000/funcionarios \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -d '{"nome":"Test","email":"test@test.com","senha":"123456"}'

# Teste criar cliente
curl -X POST http://localhost:10000/clientes/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","username":"test","email":"test@test.com","senha":"123456","telefone":"1199999999"}'
```

## Checklist de Verificação
- [ ] Backend está rodando (`npm run dev` em /backend)?
- [ ] Variáveis de ambiente estão setadas (.env)?
- [ ] MongoDB está conectado (veja console do backend)?
- [ ] Token é válido (console do frontend mostra token)?
- [ ] Email não está duplicado no banco?
- [ ] Campos obrigatórios foram preenchidos?

## Se Nada Funcionar
Ative logs detalhados no backend:
```javascript
// No início do server.js:
console.log('🔐 JWT_SECRET:', JWT_SECRET);
console.log('🌐 MONGO_URI:', process.env.MONGO_URI);

// No middleware lojaAuth:
const lojaAuth = (req, res, next) => {
  const token = req.header('x-auth-token');
  console.log('🔑 Token recebido:', token?.substring(0, 20) + '...');
  // ... resto do código
};
```
