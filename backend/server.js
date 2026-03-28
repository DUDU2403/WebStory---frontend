const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Instale: npm install bcryptjs
const jwt = require('jsonwebtoken'); // Instale: npm install jsonwebtoken
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ BANCO CONECTADO"))
  .catch(err => console.log("❌ ERRO MONGO:", err));

// --- MODELOS ---

// Modelo de Usuário (Lead)
const User = mongoose.model('User', new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cpf: { type: String, required: true, unique: true },
  telefone: { type: String, required: true },
  senha: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

// Molde do Imóvel (Agora com referência ao dono)
const Imovel = mongoose.model('Imovel', new mongoose.Schema({
  titulo: String,
  preco: Number,
  localizacao: String,
  contato: String,
  imagemUrl: String,
  tipo: String, // 'venda' ou 'aluguel'
  anuncianteTipo: String, // 'vendedor' ou 'locador'
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}));

// --- MIDDLEWARE DE PROTEÇÃO ---
// Verifica se o token enviado é válido
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: "Acesso negado. Faça login." });

  try {
    const decoded = jwt.verify(token, 'CHAVE_SECRETA_TOKEN'); // Troque 'CHAVE_SECRETA_TOKEN' por algo difícil no seu .env
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: "Token inválido." });
  }
};

// --- ROTAS DE USUÁRIOS (AUTH) ---

// Cadastro de Leads
app.post('/auth/register', async (req, res) => {
  try {
    const { nome, email, cpf, telefone, senha } = req.body;

    let user = await User.findOne({ $or: [{ email }, { cpf }] });
    if (user) return res.status(400).json({ message: "Usuário ou CPF já cadastrado." });

    const salt = await bcrypt.genSalt(10);
    const senhaHashed = await bcrypt.hash(senha, salt);

    user = new User({ nome, email, cpf, telefone, senha: senhaHashed });
    await user.save();

    res.json({ message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao registrar usuário." });
  }
});

// Login do Usuário
app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "E-mail ou senha inválidos." });

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(400).json({ message: "E-mail ou senha inválidos." });

    // Gera o Token
    const token = jwt.sign({ id: user._id, nome: user.nome }, 'CHAVE_SECRETA_TOKEN');
    res.json({ token, user: { id: user._id, nome: user.nome } });
  } catch (err) {
    res.status(500).json({ message: "Erro ao fazer login." });
  }
});

// --- ROTAS DE IMÓVEIS ---

// ROTA 1: Buscar todos (Aberto para todos verem)
app.get('/imoveis', async (req, res) => {
    const imoveis = await Imovel.find().populate('criadoPor', 'nome email');
    res.json(imoveis);
});

// ROTA 2: Criar novo (Protegido: Precisa estar logado)
app.post('/imoveis', auth, async (req, res) => {
    try {
        const novo = new Imovel({
            ...req.body,
            criadoPor: req.user.id // Vincula automaticamente ao usuário logado
        });
        await novo.save();
        res.json(novo);
    } catch (err) {
        res.status(500).json({ message: "Erro ao criar anúncio." });
    }
});

// ROTA 3: DELETAR (Protegido: Só o dono do anúncio pode apagar)
app.delete('/imoveis/:id', auth, async (req, res) => {
    try {
        const imovel = await Imovel.findById(req.params.id);
        if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado." });

        // Verifica se quem está tentando apagar é o dono
        if (imovel.criadoPor.toString() !== req.user.id) {
            return res.status(403).json({ message: "Você não tem permissão para apagar este anúncio." });
        }

        await Imovel.findByIdAndDelete(req.params.id);
        res.json({ message: "Apagado!" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ROTA 4: ATUALIZAR (Protegido: Só o dono do anúncio pode editar)
app.put('/imoveis/:id', auth, async (req, res) => {
    try {
        const imovel = await Imovel.findById(req.params.id);
        if (imovel.criadoPor.toString() !== req.user.id) {
            return res.status(403).json({ message: "Sem permissão para editar." });
        }

        const atualizado = await Imovel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(atualizado);
    } catch (err) {
        res.status(500).send(err);
    }
});

const PORT = process.env.PORT || 10000; 

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});