import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-110 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} />
            <h2 className="text-xl font-bold uppercase tracking-wider">Política de Privacidade & LGPD</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
          <section>
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase text-sm">1. Coleta de Dados e Leads</h3>
            <p>O <strong>Meu Imóvel App</strong> coleta informações pessoais como Nome, E-mail, CPF e Telefone. Estes dados são coletados especificamente para a finalidade de <strong>geração de leads imobiliários</strong>, permitindo que interessados e anunciantes estabeleçam contato direto.</p>
          </section>

          <section>
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase text-sm">2. Finalidade do Tratamento</h3>
            <p>Seus dados serão utilizados para: (a) Identificação do usuário na plataforma; (b) Viabilização de contatos via WhatsApp; (c) Segurança e prevenção a fraudes; (d) Gestão de anúncios próprios.</p>
          </section>

          <section>
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase text-sm">3. Base Legal (LGPD)</h3>
            <p>O tratamento de seus dados é baseado no <strong>Consentimento</strong> (Art. 7º, I da Lei 13.709/18) e na <strong>Execução de Contrato</strong> para a prestação dos serviços de marketplace imobiliário.</p>
          </section>

          <section>
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase text-sm">4. Seus Direitos</h3>
            <p>Você tem direito de acessar, corrigir, portar ou solicitar a exclusão de seus dados a qualquer momento, enviando uma solicitação através do nosso canal de contato.</p>
          </section>

          <section>
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase text-sm">5. Segurança</h3>
            <p>Utilizamos criptografia (hashing) para senhas e conexões seguras (HTTPS) para garantir que sua captação de lead ocorra em um ambiente protegido.</p>
          </section>
          
          <section>
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase text-sm">6. Taxas de Intermediação</h3>
            <p>Ao utilizar a plataforma para anunciar, o anunciante concorda que, em caso de concretização da venda, uma taxa de <strong>2% (dois por cento)</strong> sobre o valor total do imóvel é devida ao <strong>Meu Imóvel App</strong> a título de taxa de serviço e manutenção da plataforma.</p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Última atualização: Março de 2024.
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;