
import AdminPanel from './AdminPanel';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Home, MapPin, Search, PlusCircle, Trash2, MessageCircle, Camera, Loader2,
  UserPlus, LogIn, LogOut, X, ShieldCheck, Users, Zap, BarChart3, CreditCard,
  CheckCircle2, ChevronRight, ChevronLeft, Eye, EyeOff, Bell, TrendingUp,
  Building2, Key, Heart, Filter, Star, Phone, Mail, User, FileText,
  ArrowRight, Award, Lock, Unlock, LayoutDashboard, Package, DollarSign,
  Calendar, Clock, AlertCircle, CheckCheck, Handshake
} from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:10000' : 'https://meu-imovel-api.onrender.com');

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
const fmtPhone = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>{children}</span>;
};

// ─── Imovel Card ─────────────────────────────────────────────────────────────
const ImovelCard = ({ imovel, usuario, onEdit, onDelete, onInteresse }) => {
  const [liked, setLiked] = useState(false);
  const isOwner = usuario && imovel.criadoPor?._id === usuario.id;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 border border-slate-100">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {imovel.imagemUrl
          ? <img src={imovel.imagemUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" alt={imovel.titulo} />
          : <div className="w-full h-full flex items-center justify-center"><Building2 size={48} className="text-slate-300" /></div>
        }
        {imovel.status === 'vendido' && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
            <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm">Vendido</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge color={imovel.tipoNegocio === 'venda' ? 'indigo' : 'emerald'}>
            {imovel.tipoNegocio}
          </Badge>
          <Badge color="slate">{imovel.tipoImovel}</Badge>
        </div>
        {!isOwner && (
          <button onClick={() => setLiked(p => !p)} className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
            <Heart size={16} className={liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
          </button>
        )}
        {imovel.comissao > 0 && (
          <div className="absolute bottom-3 right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-[10px] font-black">
            PARCERIA {imovel.comissao}%
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{imovel.titulo}</h3>
        <p className="text-slate-400 text-sm flex items-center gap-1 mb-3">
          <MapPin size={13} className="text-indigo-400 shrink-0" /> {imovel.localizacao}
        </p>
        <p className="text-xl font-black text-slate-900 mb-4">{fmt(imovel.preco)}</p>

        <div className="flex gap-2">
          <a
            href={`https://wa.me/${imovel.contato}?text=Olá! Vi seu imóvel "${imovel.titulo}" e gostaria de mais informações.`}
            target="_blank" rel="noreferrer"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
          >
            <MessageCircle size={16} /> Contato
          </a>
          {isOwner && (
            <>
              <button onClick={() => onEdit(imovel)} className="w-11 h-11 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-xl flex items-center justify-center transition-colors">
                <FileText size={16} />
              </button>
              <button onClick={() => onDelete(imovel._id)} className="w-11 h-11 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-xl flex items-center justify-center transition-colors">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
        {imovel.criadoPor && (
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
            Anunciado por <span className="font-semibold text-slate-600">{imovel.criadoPor.nome}</span>
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Multi-Step Registration ──────────────────────────────────────────────────
const steps = ['Perfil', 'Profissional', 'Segurança'];

// ✅ CORREÇÃO: Campo movido para FORA do MultiStepRegister
// Antes estava dentro, causando re-mount a cada tecla digitada (perda de foco)
const Campo = ({ label, icon: Icon, name, type = 'text', placeholder, dados, setDados, erros, setErros, showSenha, setShowSenha }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        type={name === 'senha' ? (showSenha ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={dados[name] || ''}
        onChange={e => {
          let v = e.target.value;
          if (name === 'cpf') v = fmtCPF(v);
          if (name === 'telefone') v = fmtPhone(v);
          setDados(d => ({ ...d, [name]: v }));
          setErros(er => ({ ...er, [name]: '' }));
        }}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${erros[name] ? 'border-rose-300 bg-rose-50' : 'border-slate-200 focus:border-indigo-400 focus:bg-white'}`}
      />
      {name === 'senha' && (
        <button type="button" onClick={() => setShowSenha(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {erros[name] && <p className="text-rose-500 text-xs mt-1">{erros[name]}</p>}
  </div>
);

const MultiStepRegister = ({ dados, setDados, onSubmit, carregando, onSwitch, mostrarPolitica }) => {
  const [step, setStep] = useState(0);
  const [showSenha, setShowSenha] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erros, setErros] = useState({});

  const validarStep = () => {
    const e = {};
    if (step === 0) {
      if (!dados.nome) e.nome = 'Nome obrigatório';
      if (!dados.email || !/\S+@\S+\.\S+/.test(dados.email)) e.email = 'E-mail inválido';
      if (!dados.telefone) e.telefone = 'Telefone obrigatório';
      if (!dados.cpf || dados.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF inválido';
    }
    if (step === 1) {
      if (!dados.tipoPerfil) e.tipoPerfil = 'Selecione um perfil';
      if (dados.tipoPerfil === 'corretor' && !dados.creci) e.creci = 'CRECI obrigatório para corretores';
    }
    if (step === 2) {
      if (!dados.senha || dados.senha.length < 6) e.senha = 'Senha com mínimo 6 caracteres';
      if (!aceitouTermos) e.termos = 'Aceite os termos para continuar';
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validarStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarStep()) onSubmit(e);
  };

  // Props compartilhadas para todos os Campos
  const campoProps = { dados, setDados, erros, setErros, showSenha, setShowSenha };

  return (
    <div className="p-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                {i < step ? <CheckCheck size={14} /> : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-indigo-300' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 0 && (
          <>
            <h3 className="font-bold text-slate-900 text-lg mb-4">Seus dados pessoais</h3>
            <Campo label="Nome completo" icon={User} name="nome" placeholder="João Silva" {...campoProps} />
            <Campo label="E-mail" icon={Mail} name="email" type="email" placeholder="joao@email.com" {...campoProps} />
            <div className="grid grid-cols-2 gap-3">
              <Campo label="CPF" icon={FileText} name="cpf" placeholder="000.000.000-00" {...campoProps} />
              <Campo label="WhatsApp" icon={Phone} name="telefone" placeholder="(11) 99999-9999" {...campoProps} />
            </div>
            <Campo label="Cidade / Estado" icon={MapPin} name="cidade" placeholder="São Paulo, SP" {...campoProps} />
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="font-bold text-slate-900 text-lg mb-4">Seu perfil profissional</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Você é:</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'corretor', label: 'Corretor de Imóveis', desc: 'Tenho CRECI e atuo profissionalmente', icon: Award },
                  { value: 'proprietario', label: 'Proprietário', desc: 'Quero anunciar meu imóvel', icon: Key },
                  { value: 'comprador', label: 'Comprador / Locatário', desc: 'Estou buscando um imóvel', icon: Search },
                ].map(({ value, label, desc, icon: Icon }) => (
                  <button key={value} type="button"
                    onClick={() => { setDados(d => ({ ...d, tipoPerfil: value })); setErros(e => ({ ...e, tipoPerfil: '' })); }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${dados.tipoPerfil === value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dados.tipoPerfil === value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                    {dados.tipoPerfil === value && <CheckCircle2 className="ml-auto text-indigo-600 shrink-0" size={20} />}
                  </button>
                ))}
              </div>
              {erros.tipoPerfil && <p className="text-rose-500 text-xs mt-1">{erros.tipoPerfil}</p>}
            </div>
            {dados.tipoPerfil === 'corretor' && (
              <>
                <Campo label="Número do CRECI" icon={Award} name="creci" placeholder="Ex: 12345-F" {...campoProps} />
                <Campo label="Imobiliária (opcional)" icon={Building2} name="imobiliaria" placeholder="Nome da imobiliária" {...campoProps} />
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Anos de experiência</label>
                  <select
                    value={dados.experiencia || ''}
                    onChange={e => setDados(d => ({ ...d, experiencia: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="">Selecione</option>
                    <option value="0-2">Menos de 2 anos</option>
                    <option value="2-5">2 a 5 anos</option>
                    <option value="5-10">5 a 10 anos</option>
                    <option value="10+">Mais de 10 anos</option>
                  </select>
                </div>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="font-bold text-slate-900 text-lg mb-4">Crie sua senha</h3>
            <Campo label="Senha" icon={Lock} name="senha" placeholder="Mínimo 6 caracteres" {...campoProps} />
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              {[
                { ok: dados.senha?.length >= 6, label: 'Mínimo 6 caracteres' },
                { ok: /[A-Z]/.test(dados.senha || ''), label: 'Uma letra maiúscula' },
                { ok: /[0-9]/.test(dados.senha || ''), label: 'Um número' },
              ].map(({ ok, label }) => (
                <div key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={13} className={ok ? 'text-emerald-500' : 'text-slate-300'} />
                  {label}
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
              <input type="checkbox" id="terms" checked={aceitouTermos} onChange={e => { setAceitouTermos(e.target.checked); setErros(er => ({ ...er, termos: '' })); }}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 cursor-pointer" />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                Li e aceito a <button type="button" onClick={mostrarPolitica} className="text-indigo-600 font-bold underline">Política de Privacidade</button> e os Termos de Uso da plataforma.
              </label>
            </div>
            {erros.termos && <p className="text-rose-500 text-xs">{erros.termos}</p>}
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button type="button" onClick={prev} className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
              <ChevronLeft size={16} /> Voltar
            </button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" onClick={next} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={carregando} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {carregando ? <Loader2 size={18} className="animate-spin" /> : <><CheckCheck size={16} /> Criar minha conta</>}
            </button>
          )}
        </div>

        <button type="button" onClick={onSwitch} className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 transition-colors pt-2">
          Já tem conta? <span className="font-bold text-indigo-600">Faça login</span>
        </button>
      </form>
    </div>
  );
};

// ─── Login Form ───────────────────────────────────────────────────────────────
const LoginForm = ({ dados, setDados, onSubmit, carregando, onSwitch }) => {
  const [showSenha, setShowSenha] = useState(false);
  return (
    <div className="p-8">
      <h3 className="font-bold text-slate-900 text-lg mb-6">Acesse sua conta</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">E-mail</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" placeholder="seu@email.com" value={dados.email || ''} onChange={e => setDados(d => ({ ...d, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type={showSenha ? 'text' : 'password'} placeholder="Sua senha" value={dados.senha || ''} onChange={e => setDados(d => ({ ...d, senha: e.target.value }))}
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all" />
            <button type="button" onClick={() => setShowSenha(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={carregando} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
          {carregando ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={16} /> Entrar na plataforma</>}
        </button>
        <button type="button" onClick={onSwitch} className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          Não tem conta? <span className="font-bold text-indigo-600">Cadastre-se grátis</span>
        </button>
      </form>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ usuario, imoveis, token, onNovoImovel }) => {
  const meusImoveis = imoveis.filter(i => i.criadoPor?._id === usuario.id);
  const disponiveis = meusImoveis.filter(i => i.status !== 'vendido').length;
  const vendidos = meusImoveis.filter(i => i.status === 'vendido').length;
  const totalValue = meusImoveis.reduce((acc, i) => acc + (i.preco || 0), 0);

  const stats = [
    { label: 'Anúncios ativos', value: disponiveis, icon: Package, color: 'indigo' },
    { label: 'Negócios fechados', value: vendidos, icon: CheckCheck, color: 'emerald' },
    { label: 'Portfolio total', value: fmt(totalValue), icon: DollarSign, color: 'amber' },
    { label: 'Perfil', value: usuario.isSubscriptionActive ? 'Match Pro ✓' : 'Básico', icon: Award, color: usuario.isSubscriptionActive ? 'emerald' : 'slate' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Olá, {usuario.nome.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 text-sm mt-1">Aqui está um resumo da sua atividade</p>
        </div>
        <button onClick={onNovoImovel} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          <PlusCircle size={18} /> Novo anúncio
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => {
          const colors = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-100 text-slate-600' };
          return (
            <div key={label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
                <Icon size={20} />
              </div>
              <p className="text-xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {meusImoveis.length > 0 ? (
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Meus anúncios</h3>
          <div className="space-y-3">
            {meusImoveis.map(im => (
              <div key={im._id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {im.imagemUrl ? <img src={im.imagemUrl} className="w-full h-full object-cover" alt="" /> : <Building2 size={24} className="text-slate-300 m-auto mt-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{im.titulo}</p>
                  <p className="text-xs text-slate-500 truncate">{im.localizacao}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-slate-900 text-sm">{fmt(im.preco)}</p>
                  <Badge color={im.status === 'vendido' ? 'rose' : 'emerald'}>{im.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700 mb-1">Nenhum anúncio ainda</p>
          <p className="text-sm text-slate-400 mb-4">Publique seu primeiro imóvel agora</p>
          <button onClick={onNovoImovel} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
            Publicar anúncio
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Pagamento Match Pro ──────────────────────────────────────────────────────
const PaginaPagamento = ({ token, setUsuario, setModo, carregando, setCarregando }) => {
  const [metodoPagamento, setMetodoPagamento] = useState('pix');

  const ativarAssinatura = async () => {
    setCarregando(true);
    try {
      const res = await axios.post(`${API_URL}/auth/subscribe`, {}, { headers: { 'x-auth-token': token } });
      const novoUsuario = { ...res.data.user };
      setUsuario(novoUsuario);
      localStorage.setItem('usuario', JSON.stringify(novoUsuario));
      alert('✅ Assinatura Match Pro ativada com sucesso! Bem-vindo ao clube.');
      setModo('matches');
    } catch {
      alert('Erro ao processar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
          <Zap size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Match Pro</h2>
        <p className="text-slate-500 mt-2">Conecte-se com os melhores imóveis e corretores do mercado</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-black text-slate-900">R$ 29,90</span>
            <span className="text-slate-400 mb-1">/mês</span>
          </div>
          <ul className="space-y-3">
            {[
              'Acesso ilimitado ao sistema de Match',
              'Visualize contatos de outros corretores',
              'Filtre por região, tipo e comissão',
              'Selo de Profissional Verificado no perfil',
              'Suporte prioritário via WhatsApp',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Forma de pagamento</p>
          <div className="flex gap-3 mb-6">
            {[
              { id: 'pix', label: 'PIX' },
              { id: 'cartao', label: 'Cartão' },
              { id: 'boleto', label: 'Boleto' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setMetodoPagamento(id)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${metodoPagamento === id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {metodoPagamento === 'pix' && (
            <div className="bg-slate-50 rounded-2xl p-6 text-center mb-6">
              <div className="w-32 h-32 bg-slate-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <p className="text-xs text-slate-500">QR Code PIX</p>
              </div>
              <p className="text-xs text-slate-500">Escaneie o QR Code ou copie a chave PIX</p>
              <div className="flex items-center gap-2 mt-3 bg-white rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-slate-700 flex-1 truncate font-mono">contato@meuilmovel.com.br</p>
                <button className="text-indigo-600 font-bold text-xs">Copiar</button>
              </div>
            </div>
          )}

          {metodoPagamento === 'cartao' && (
            <div className="space-y-3 mb-6">
              <input placeholder="Número do cartão" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="MM/AA" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
                <input placeholder="CVV" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
              <input placeholder="Nome no cartão" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
            </div>
          )}

          <button onClick={ativarAssinatura} disabled={carregando}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-60">
            {carregando ? <Loader2 size={18} className="animate-spin" /> : <><Lock size={18} /> Ativar Match Pro agora</>}
          </button>
          <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> Pagamento seguro e criptografado
          </p>
        </div>
      </div>

      <button onClick={() => setModo('buscar')} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors">
        Agora não, voltar para o marketplace
      </button>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState('buscar');
  const [matches, setMatches] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroNegocio, setFiltroNegocio] = useState('todos');
  const [selecionadoParaEdicao, setSelecionadoParaEdicao] = useState(null);

  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuario') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [authModo, setAuthModo] = useState('login');
  const [mostrarPolitica, setMostrarPolitica] = useState(false);
  const [dadosAuth, setDadosAuth] = useState({});

  const [novoImovel, setNovoImovel] = useState({ titulo: '', preco: '', localizacao: '', contato: '', tipoNegocio: 'venda', tipoImovel: 'casa', comissao: '', imagemUrl: '', descricao: '', area: '', quartos: '', banheiros: '', vagas: '' });
  const [fotoArquivo, setFotoArquivo] = useState(null);

  const carregarImoveis = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/imoveis`);
      setImoveis(res.data);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { carregarImoveis(); }, [carregarImoveis]);

  const manipularAuth = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const rota = authModo === 'login' ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_URL}${rota}`, dadosAuth);
      if (authModo === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('usuario', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUsuario(res.data.user);
        setMostrarAuth(false);
        setDadosAuth({});
      } else {
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        setAuthModo('login');
        setDadosAuth({});
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erro de conexão com o servidor. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    setModo('buscar');
  };

  const cadastrar = async (e) => {
    e.preventDefault();
    if (!selecionadoParaEdicao && !fotoArquivo) return alert('Selecione uma foto do imóvel!');
    setCarregando(true);
    try {
      let imagemUrl = novoImovel.imagemUrl;
      if (fotoArquivo) {
        const formData = new FormData();
        formData.append('file', fotoArquivo);
        formData.append('upload_preset', 'meu_imovel');
        const res = await axios.post('https://api.cloudinary.com/v1_1/dolazq2mw/image/upload', formData);
        imagemUrl = res.data.secure_url;
      }
      const config = { headers: { 'x-auth-token': token } };
      if (selecionadoParaEdicao) {
        await axios.put(`${API_URL}/imoveis/${selecionadoParaEdicao}`, { ...novoImovel, imagemUrl }, config);
      } else {
        await axios.post(`${API_URL}/imoveis`, { ...novoImovel, imagemUrl }, config);
      }
      setSelecionadoParaEdicao(null);
      setNovoImovel({ titulo: '', preco: '', localizacao: '', contato: '', tipoNegocio: 'venda', tipoImovel: 'casa', comissao: '', imagemUrl: '', descricao: '', area: '', quartos: '', banheiros: '', vagas: '' });
      setFotoArquivo(null);
      setModo('buscar');
      carregarImoveis();
    } catch {
      alert('Erro ao salvar. Verifique se você está logado.');
    } finally {
      setCarregando(false);
    }
  };

  const excluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este anúncio?')) return;
    try {
      await axios.delete(`${API_URL}/imoveis/${id}`, { headers: { 'x-auth-token': token } });
      carregarImoveis();
    } catch { alert('Erro ao excluir.'); }
  };

  const carregarMatches = async () => {
    setCarregando(true);
    try {
      const res = await axios.get(`${API_URL}/imoveis/matches`, { headers: { 'x-auth-token': token } });
      setMatches(res.data);
      setModo('matches');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao carregar matches.');
    } finally { setCarregando(false); }
  };

  const filtrados = imoveis.filter(i => {
    const matchBusca = !busca || i.titulo?.toLowerCase().includes(busca.toLowerCase()) || i.localizacao?.toLowerCase().includes(busca.toLowerCase());
    const matchNegocio = filtroNegocio === 'todos' || i.tipoNegocio === filtroNegocio;
    const matchTipo = filtroTipo === 'todos' || i.tipoImovel === filtroTipo;
    return matchBusca && matchNegocio && matchTipo;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {mostrarPolitica && <PrivacyPolicy onClose={() => setMostrarPolitica(false)} />}

      {/* AUTH MODAL */}
      {mostrarAuth && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Home size={16} className="text-white" />
                </div>
                <span className="font-black text-slate-900">Imóvel Pro</span>
              </div>
              <button onClick={() => { setMostrarAuth(false); setDadosAuth({}); }} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <X size={16} />
              </button>
            </div>

            {authModo === 'login'
              ? <LoginForm dados={dadosAuth} setDados={setDadosAuth} onSubmit={manipularAuth} carregando={carregando} onSwitch={() => setAuthModo('cadastro')} />
              : <MultiStepRegister dados={dadosAuth} setDados={setDadosAuth} onSubmit={manipularAuth} carregando={carregando} onSwitch={() => setAuthModo('login')} mostrarPolitica={() => setMostrarPolitica(true)} />
            }
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Home size={18} className="text-white" />
            </div>
            <span className="font-black text-slate-900 text-lg">Imóvel<span className="text-indigo-600">Pro</span></span>
          </div>

          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar por cidade, bairro ou título..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Marketplace', mode: 'buscar', icon: Home },
              ...(usuario ? [
                { label: 'Dashboard', mode: 'dashboard', icon: LayoutDashboard },
                { label: 'Match Pro', mode: usuario.isSubscriptionActive ? 'matches' : 'pagamento', icon: Zap, highlight: true },
                ...(usuario.isAdmin ? [{ label: 'Admin', mode: 'admin', icon: ShieldCheck, admin: true }] : []),
              ] : []),
            ].map(({ label, mode, icon: Icon, highlight, admin }) => (
              <button key={mode}
                onClick={() => {
                  if (mode === 'matches' && usuario?.isSubscriptionActive) carregarMatches();
                  else setModo(mode);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${modo === mode
                  ? admin ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                    : highlight ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-900'
                  : admin ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : highlight ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {usuario ? (
              <>
                <button onClick={() => setModo('anunciar')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100">
                  <PlusCircle size={16} /> Anunciar
                </button>
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black text-sm">
                  {usuario.nome[0].toUpperCase()}
                </div>
                <button onClick={logout} className="w-9 h-9 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 rounded-xl flex items-center justify-center transition-colors">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthModo('login'); setMostrarAuth(true); }} className="px-4 py-2 text-slate-600 font-bold text-sm hover:text-indigo-600 transition-colors">
                  Entrar
                </button>
                <button onClick={() => { setAuthModo('cadastro'); setMostrarAuth(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  Cadastrar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ADMIN */}
        {modo === 'admin' && usuario?.isAdmin && (
          <AdminPanel token={token} />
        )}

        {/* DASHBOARD */}
        {modo === 'dashboard' && usuario && (
          <Dashboard usuario={usuario} imoveis={imoveis} token={token} onNovoImovel={() => setModo('anunciar')} />
        )}

        {/* PAGAMENTO */}
        {modo === 'pagamento' && (
          <PaginaPagamento token={token} setUsuario={setUsuario} setModo={setModo} carregando={carregando} setCarregando={setCarregando} />
        )}

        {/* MATCHES */}
        {modo === 'matches' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Oportunidades de Parceria</h2>
                <p className="text-slate-500 text-sm mt-1">{matches.length} imóveis disponíveis para divisão de comissão</p>
              </div>
              <button onClick={() => setModo('buscar')} className="text-sm text-indigo-600 font-bold hover:underline">← Voltar</button>
            </div>
            {matches.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <Handshake size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-700">Nenhuma oportunidade no momento</p>
                <p className="text-sm text-slate-400 mt-1">Volte mais tarde para novas parcerias</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {matches.map(m => (
                  <div key={m._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48">
                      {m.imagemUrl ? <img src={m.imagemUrl} className="w-full h-full object-cover" alt={m.titulo} /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Building2 size={32} className="text-slate-300" /></div>}
                      <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-black">+{m.comissao}% comissão</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 mb-1">{m.titulo}</h3>
                      <p className="text-slate-500 text-sm mb-1 flex items-center gap-1"><MapPin size={13} /> {m.localizacao}</p>
                      <p className="font-black text-slate-900 text-lg mb-3">{fmt(m.preco)}</p>
                      <div className="bg-slate-50 rounded-xl p-3 mb-4">
                        <p className="text-xs text-slate-500">Corretor responsável</p>
                        <p className="font-bold text-slate-900 text-sm">{m.criadoPor?.nome}</p>
                        {m.criadoPor?.creci && <p className="text-xs text-slate-500">CRECI: {m.criadoPor.creci}</p>}
                      </div>
                      <a href={`https://wa.me/${m.criadoPor?.telefone}?text=Olá ${m.criadoPor?.nome}! Vi sua oportunidade de parceria no ImóvelPro referente ao imóvel "${m.titulo}". Gostaria de conversar sobre a divisão de comissão.`}
                        target="_blank" rel="noreferrer"
                        className="block w-full text-center bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">
                        Propor parceria via WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANUNCIAR */}
        {modo === 'anunciar' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setModo('buscar')} className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-900">{selecionadoParaEdicao ? 'Editar anúncio' : 'Novo anúncio'}</h2>
                <p className="text-sm text-slate-500">Preencha os detalhes do imóvel</p>
              </div>
            </div>

            <form onSubmit={cadastrar} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Foto do imóvel</label>
                <div className="relative w-full h-52 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors cursor-pointer">
                  {fotoArquivo
                    ? <img src={URL.createObjectURL(fotoArquivo)} className="w-full h-full object-cover" alt="" />
                    : novoImovel.imagemUrl
                      ? <img src={novoImovel.imagemUrl} className="w-full h-full object-cover" alt="" />
                      : <><Camera size={32} className="text-slate-400 mb-2" /><p className="text-sm text-slate-400">Clique para adicionar foto</p></>
                  }
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFotoArquivo(e.target.files[0])} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Título do anúncio</label>
                <input required placeholder="Ex: Casa térrea com piscina em condomínio fechado" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  value={novoImovel.titulo} onChange={e => setNovoImovel({ ...novoImovel, titulo: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Descrição</label>
                <textarea rows={3} placeholder="Descreva os detalhes do imóvel..." className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"
                  value={novoImovel.descricao || ''} onChange={e => setNovoImovel({ ...novoImovel, descricao: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Finalidade</label>
                  <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 font-medium"
                    value={novoImovel.tipoNegocio} onChange={e => setNovoImovel({ ...novoImovel, tipoNegocio: e.target.value })}>
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                  <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 font-medium"
                    value={novoImovel.tipoImovel} onChange={e => setNovoImovel({ ...novoImovel, tipoImovel: e.target.value })}>
                    <option value="casa">Casa</option>
                    <option value="apto">Apartamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="comercial">Comercial</option>
                    <option value="rural">Rural</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Preço (R$)</label>
                  <input required type="number" placeholder="0,00" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                    value={novoImovel.preco} onChange={e => setNovoImovel({ ...novoImovel, preco: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Área (m²)</label>
                  <input type="number" placeholder="0" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                    value={novoImovel.area || ''} onChange={e => setNovoImovel({ ...novoImovel, area: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Quartos', name: 'quartos' },
                  { label: 'Banheiros', name: 'banheiros' },
                  { label: 'Vagas', name: 'vagas' },
                ].map(({ label, name }) => (
                  <div key={name}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input type="number" placeholder="0" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                      value={novoImovel[name] || ''} onChange={e => setNovoImovel({ ...novoImovel, [name]: e.target.value })} />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Localização</label>
                <input required placeholder="Rua, Bairro, Cidade - UF" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  value={novoImovel.localizacao} onChange={e => setNovoImovel({ ...novoImovel, localizacao: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">WhatsApp de contato</label>
                <input required placeholder="(11) 99999-9999" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  value={novoImovel.contato} onChange={e => setNovoImovel({ ...novoImovel, contato: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Comissão para parceria (%)</label>
                <input type="number" placeholder="Ex: 6 (deixe em branco se não quiser parceria)" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  value={novoImovel.comissao} onChange={e => setNovoImovel({ ...novoImovel, comissao: e.target.value })} />
                <p className="text-xs text-slate-400 mt-1.5">Preencha para aparecer no Sistema de Match</p>
              </div>

              <button disabled={carregando} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-60">
                {carregando ? <Loader2 size={18} className="animate-spin" /> : <><CheckCheck size={18} /> {selecionadoParaEdicao ? 'Salvar alterações' : 'Publicar anúncio'}</>}
              </button>
            </form>
          </div>
        )}

        {/* MARKETPLACE */}
        {modo === 'buscar' && (
          <div>
            {!usuario && (
              <div className="bg-indigo-600 rounded-3xl p-10 mb-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>
                <div className="relative">
                  <Badge color="indigo">🏆 Plataforma nº 1 para corretores</Badge>
                  <h1 className="text-4xl font-black mt-4 mb-3 leading-tight">Encontre o imóvel ideal<br />ou feche mais negócios</h1>
                  <p className="text-indigo-200 text-lg mb-6 max-w-xl">Marketplace completo para compradores, vendedores e corretores. Sistema de Match exclusivo para parcerias lucrativas.</p>
                  <div className="flex gap-3">
                    <button onClick={() => { setAuthModo('cadastro'); setMostrarAuth(true); }} className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                      Criar conta grátis
                    </button>
                    <button onClick={() => { setAuthModo('login'); setMostrarAuth(true); }} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-400 transition-colors">
                      Já tenho conta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {usuario && !usuario.isSubscriptionActive && (
              <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-white">Ative o Match Pro</p>
                    <p className="text-indigo-200 text-sm">Acesse parcerias exclusivas por R$ 29,90/mês</p>
                  </div>
                </div>
                <button onClick={() => setModo('pagamento')} className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shrink-0">
                  Ativar agora
                </button>
              </div>
            )}

            <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                {['todos', 'venda', 'aluguel'].map(t => (
                  <button key={t} onClick={() => setFiltroNegocio(t)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filtroNegocio === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                {['todos', 'casa', 'apto', 'terreno', 'comercial'].map(t => (
                  <button key={t} onClick={() => setFiltroTipo(t)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filtroTipo === t ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {usuario && (
                <button onClick={() => setModo('anunciar')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shrink-0 shadow-lg shadow-emerald-100">
                  <PlusCircle size={14} /> Anunciar imóvel
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500"><span className="font-bold text-slate-900">{filtrados.length}</span> imóveis encontrados</p>
            </div>

            {filtrados.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-700">Nenhum imóvel encontrado</p>
                <p className="text-sm text-slate-400 mt-1">Tente outros filtros ou termos de busca</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtrados.map(imovel => (
                  <ImovelCard
                    key={imovel._id}
                    imovel={imovel}
                    usuario={usuario}
                    onDelete={excluir}
                    onEdit={(im) => {
                      setSelecionadoParaEdicao(im._id);
                      setNovoImovel({ ...im });
                      setModo('anunciar');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;