# 🔧 Correções Aplicadas - WebStory

## **Problemas Identificados e Resolvidos**

### **1. ✅ Clientes não conseguiam registrar conta**
**Causa:** O endpoint `/clientes/register` e `/clientes/login` requeriam uma loja com `ativa: true`.

**Solução Aplicada:**
- Removido o filtro `{ ativa: true }` dos endpoints:
  - `POST /clientes/register`
  - `POST /clientes/login`
  - `GET /produtos` (vitrine pública)
  - `GET /produtos/sugestoes` (autocomplete)
  - `GET /produtos/categorias`
  - `GET /loja/info`

Agora os clientes conseguem registrar e logar **independente do status da loja**.

---

### **2. ✅ Admin pode deletar chave de acesso já usada**
**Causa:** O endpoint `DELETE /admin/chaves/:id` tinha verificação que impedia delete de chaves já usadas.

**Solução Aplicada:**
- Removida a restrição:
```javascript
// ANTES:
if (c.usada) return res.status(400).json({ message: 'Chave já utilizada.' });

// DEPOIS:
// Permite delete de chaves usadas também
```

---

### **3. ❓ Erro de credenciais ao logar na loja (PRECISA INVESTIGAÇÃO)**

**Possíveis causas:**
1. **Nenhuma loja foi criada ainda** → Precisa de uma chave de acesso válida gerada pelo admin
2. **A loja está inativa** → Verá mensagem "Loja desativada"
3. **E-mail ou senha incorretos** → Mensagem "E-mail ou senha inválidos"

**Como testar:**

#### **Opção A: Criar uma loja de teste (Fluxo correto)**

1. **No Admin Panel** (`/admin`):
   - Login com email admin
   - Ir para aba "🔑 Chaves"
   - Clicar em "+ Gerar nova chave"
   - Copiar a chave (ex: `AK-12345678`)

2. **No LoginVendedor** (`/login-vendedor`):
   - Clicar em "Criar loja"
   - Preencher dados (nome, email, telefone, senha)
   - Colar a chave de acesso copiada
   - Clicar em "Criar loja"

3. **Então logar**:
   - Email e senha da loja criada
   - Deve funcionar agora

#### **Opção B: Verificar dados no banco (Terminal)**

```bash
# Conectar ao MongoDB
mongosh "seu_connection_string"

# Ver se há lojas
db.lojas.find({})

# Ver se há chaves não usadas
db.chavedacesso.find({ usada: false })

# Ver chaves já usadas
db.chavedacesso.find({ usada: true })
```

---

## **Resumo das Mudanças no Backend**

**Arquivo:** `backend/server.js`

### **Alterações:**

1. **Linha ~525:** `POST /clientes/register` - Remove `{ ativa: true }`
2. **Linha ~520:** `POST /clientes/login` - Remove `{ ativa: true }`
3. **Linha ~315:** `DELETE /admin/chaves/:id` - Remove verificação de chave usada
4. **Linha ~570:** `GET /produtos` - Remove `{ ativa: true }`
5. **Linha ~590:** `GET /produtos/sugestoes` - Remove `{ ativa: true }`
6. **Linha ~605:** `GET /produtos/categorias` - Remove `{ ativa: true }`
7. **Linha ~418:** `GET /loja/info` - Remove `{ ativa: true }`

---

## **⚠️ Próximos Passos Recomendados**

1. **Testar fluxo completo:**
   - Gerar chave no admin
   - Registrar loja com chave
   - Fazer login como dono
   - Tentar registrar cliente
   - Verificar se produtos aparecem na vitrine

2. **Se ainda tiver erro de credenciais:**
   - Verificar console do navegador (F12 → Network)
   - Ver exatamente qual é a resposta do servidor
   - Verificar se email está correto
   - Tentar resetar senha no banco

3. **Criar dados de teste:**
   - Use o `/seed.js` para popular banco com dados iniciais
   - Ou crie manualmente via UI

---

## **Estrutura de Autenticação**

```
┌─────────────────────────────────────┐
│ ADMIN (Gerencia chaves)             │
│ - Email: admin@webstory.com         │
│ - Gera chaves de acesso (AK-xxxxx)  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ LOJA (Dono - Cria com chave)        │
│ - Email único                       │
│ - Precisa de chave válida (AK-...)  │
│ - Cria produtos                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CLIENTE (Comprador)                 │
│ - Registra/login sem chave          │
│ - Ver produtos                      │
│ - Fazer pedidos                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ FUNCIONÁRIO (Acesso ao painel)      │
│ - Criado pelo dono da loja          │
│ - Pode gerenciar produtos           │
└─────────────────────────────────────┘
```

---

## **Notas Importantes**

- ✅ Clientes **NÃO** precisam de chave para registrar
- ✅ Chaves de acesso são **descartáveis** (usam uma vez)
- ✅ Admin agora pode **deletar chaves de qualquer tipo** (usadas ou não)
- ⚠️ A loja **PODE estar inativa** e clientes/produtos ainda funcionam
- ⚠️ Se a loja não existir no banco, ninguém consegue fazer login
