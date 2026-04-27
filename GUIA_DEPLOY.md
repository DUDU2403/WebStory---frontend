# 🚀 Guia de Deploy - WebStory

## **Frontend - Vercel**

### ✅ Já Configurado
- `frontend/vercel.json` criado com config correta
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Framework: Vite

### 📝 Passo a Passo

1. **Conectar repositório frontend no Vercel:**
   - Ir para https://vercel.com
   - Clicar em "New Project"
   - Importar repo: `DUDU2403/WebStory---frontend`
   - Vercel detectará automaticamente o `vercel.json`
   - Clicar em "Deploy"

2. **Após deploy:**
   - Frontend estará rodando em: `https://seu-projeto.vercel.app`
   - Rewrite automático para SPA (todos os caminhos → index.html)

---

## **Backend - Vercel (Opcional)**

### ✅ Já Configurado
- `backend/vercel.json` criado
- Rota padrão: `@vercel/node`
- Environment variables configuradas

### 📝 Passo a Passo

1. **Se quiser deployar backend também:**
   - Ir para https://vercel.com
   - Novo projeto importando `DUDU2403/meu-imovel-api` (backend)
   - Selecionar a pasta `/backend` como root
   - Adicionar environment variables:
     ```
     MONGO_URI = seu_mongodb_atlas_uri
     JWT_SECRET = sua_chave_secreta
     ADMIN_EMAIL = seu_email_admin
     ```
   - Deploy

2. **API estará em:**
   - `https://seu-backend.vercel.app`

3. **Atualizar frontend para usar URL do backend:**
   - No frontend, abrir `src/config.js` ou `src/api.js`
   - Trocar `localhost:10000` para `https://seu-backend.vercel.app`

---

## **MongoDB Atlas (Já Configurado)**

✅ Banco de dados já está em produção:
- Cluster: Atlas (confirmado em `.env`)
- Connection String: Já configurada
- Nenhuma ação necessária

---

## **Alternativas de Deploy para Backend**

Se preferir não usar Vercel para o backend:

### **Opção 1: Railway.app**
```bash
railway init
railway add
railway up
```

### **Opção 2: Heroku**
```bash
heroku create seu-app-name
heroku config:set MONGO_URI=...
git push heroku main
```

### **Opção 3: Render.com**
- Similar ao Railway
- Integração com GitHub
- Deploy automático

---

## **Configuração de Variáveis no Vercel**

Se deployar backend no Vercel, adicione no painel do projeto:

**Settings → Environment Variables**

```
MONGO_URI = mongodb+srv://...
JWT_SECRET = sua_chave_super_secreta_aqui
ADMIN_EMAIL = seu_email@example.com
```

---

## **Atualizando Frontend para Usar Backend em Produção**

### Arquivo: `frontend/src/api.js`

```javascript
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';
```

### Arquivo: `frontend/.env.production`

Criar este arquivo:
```
VITE_API_URL=https://seu-backend.vercel.app
```

---

## **Checklist de Deploy**

### Frontend:
- [ ] Verificar `frontend/vercel.json`
- [ ] Conectar repositório no Vercel
- [ ] Configurar domínio personalizado (opcional)
- [ ] Testar login em produção

### Backend (se aplicável):
- [ ] Criar `backend/vercel.json`
- [ ] Conectar repositório no Vercel
- [ ] Adicionar environment variables
- [ ] Testar endpoints

### Ambos:
- [ ] Verificar se API_URL está configurada corretamente
- [ ] Testar login de vendedor
- [ ] Testar registro de cliente
- [ ] Testar admin panel

---

## **URLs Finais**

Após deploy:

```
Frontend: https://seu-projeto.vercel.app
Backend:  https://seu-backend.vercel.app
MongoDB:  Atlas (já em produção)
```

---

## **Resolução de Problemas**

### "Cannot find package.json"
✅ **Solução:** Corrigido no `vercel.json` (remover `cd frontend &&`)

### "Environment variables undefined"
✅ **Solução:** Adicionar no painel Vercel: Settings → Environment Variables

### "CORS errors"
✅ **Solução:** Verificar origem no `server.js` CORS config

### "API não está respondendo"
✅ **Solução:** 
- Verificar se backend está deployado
- Verificar `VITE_API_URL` no frontend
- Verificar logs no Vercel

---

**Deploy concluído! 🎉**
