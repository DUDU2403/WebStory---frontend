# WebStory — Backend

Sistema de lojas online com pedidos via WhatsApp.

## Tecnologias
- Node.js + Express
- MongoDB (Mongoose)
- JWT para autenticação
- bcryptjs para senhas

---

## Instalação local

```bash
npm install
cp .env.example .env
# Preencha o .env com suas variáveis
npm run dev
```

---

## Deploy no Render

1. Suba o projeto no GitHub com o nome `WebStory`
2. No Render: **New Web Service** → conecte o repositório
3. Em **Environment Variables**, adicione:
   - `MONGO_URI` — URI do novo projeto no MongoDB Atlas
   - `JWT_SECRET` — string secreta longa
   - `ADMIN_EMAIL` — seu e-mail de admin
4. **Start Command:** `node server.js`

---

## Primeiro acesso como admin

Acesse `POST /admin/login` com seu e-mail e defina uma senha.
Na primeira vez, o sistema cria o admin automaticamente.

---

## Fluxo principal

### Admin
1. `POST /admin/login` — login do admin
2. `POST /admin/chaves` — gera chave de acesso para uma loja
3. Envia a chave para o dono da loja

### Loja
4. `POST /loja/register` — cadastro com a chave recebida → recebe `codigoLoja`
5. `POST /loja/login` — login
6. `POST /produtos` — cadastra produtos
7. `POST /estoque/movimentacao` — registra entradas e saídas

### Cliente
8. `GET /loja/:codigoLoja` — acessa a vitrine da loja
9. `GET /loja/:codigoLoja/produtos` — lista produtos
10. `POST /pedidos` — finaliza carrinho → recebe link do WhatsApp

---

## Rotas completas

### Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/login` | Login do admin |
| POST | `/admin/chaves` | Gerar chave de acesso |
| GET | `/admin/chaves` | Listar chaves |
| DELETE | `/admin/chaves/:id` | Remover chave |
| GET | `/admin/lojas` | Listar lojas |
| PUT | `/admin/lojas/:id/status` | Ativar/desativar loja |
| DELETE | `/admin/lojas/:id` | Remover loja |
| GET | `/admin/stats` | Estatísticas gerais |

### Loja
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/loja/register` | Cadastro com chave |
| POST | `/loja/login` | Login |
| PUT | `/loja/perfil` | Atualizar banner/foto |
| GET | `/loja/:codigoLoja` | Perfil público da loja |
| GET | `/minha-loja/produtos` | Produtos do painel |
| GET | `/minha-loja/pedidos` | Pedidos recebidos |

### Produtos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/loja/:codigoLoja/produtos` | Vitrine pública |
| POST | `/produtos` | Cadastrar produto |
| PUT | `/produtos/:id` | Editar produto |
| DELETE | `/produtos/:id` | Remover produto |

### Estoque
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/estoque/movimentacao` | Entrada ou saída |
| GET | `/estoque/historico` | Histórico |
| GET | `/estoque/alertas` | Produtos com estoque baixo |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/pedidos` | Criar pedido + link WhatsApp |
| PUT | `/pedidos/:id/status` | Atualizar status |