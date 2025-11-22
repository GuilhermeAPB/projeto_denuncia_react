import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, setLogLevel } from 'firebase/firestore';

// --- CONFIGURAÇÃO E TIPAGEM ---

// Variáveis globais de ambiente (disponíveis no Canvas)
// ATENÇÃO: Substitua 'default-app-id', '{}' e 'null' pelos valores reais do seu ambiente.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Configuração do Log do Firestore (útil para debug)
setLogLevel('debug');

/**
 * Interface para as respostas do formulário, com tipagem estrita.
 */
interface FormAnswers {
  nome: string;
  idade: string;
  quemResponde: 'Criança' | 'Adolescente' | 'Mãe/Pai ou responsável' | 'Outro' | '';
  quemRespondeOutro: string; // Obrigatório se 'Outro'
  secaoOutro: 'Criança/Adolescente' | 'Pais/Responsáveis' | ''; // Opcional se 'Outro'
  // Seção 2 - Criança/Adolescente
  sabeAbuso: 'Sim' | 'Mais ou menos' | 'Não' | '';
  tocadoVergonha: 'Sim' | 'Não' | 'Prefiro não responder' | '';
  segredoToque: 'Sim' | 'Não' | '';
  avontadeConversarAdulto: 'Sim' | 'Às vezes' | 'Não' | '';
  usaRedesSociais: 'Sim' | 'Não' | '';
  mensagemDesconfortavel: 'Sim' | 'Não' | '';
  sabeComQuemConversar: 'Sim' | 'Mais ou menos' | 'Não' | '';
  confiaProtecaoAdultos: 'Sim' | 'Às vezes' | 'Não' | '';
  // Seção 3 - Pai/Responsável
  conversaLimitesCorpo: 'Sim, com frequência' | 'Às vezes' | 'Não' | '';
  sabeDizerNao: 'Sim' | 'Acho que não' | 'Nunca conversamos sobre isso' | '';
  acompanhaInternet: 'Sempre' | 'Às vezes' | 'Raramente' | '';
  mudancasComportamento: 'Sim' | 'Não' | '';
  sabeQuemProcurar: 'Sim' | 'Não' | 'Não tenho certeza' | '';
  conheceConselhoDisque100: 'Sim' | 'Não' | '';
  // Seção 4 - Espaço para compartilhar
  observacao: string;
}

// Estado inicial do formulário
const initialFormState: FormAnswers = {
  nome: '',
  idade: '',
  quemResponde: '',
  quemRespondeOutro: '',
  secaoOutro: '', 
  sabeAbuso: '',
  tocadoVergonha: '',
  segredoToque: '',
  avontadeConversarAdulto: '',
  usaRedesSociais: '',
  mensagemDesconfortavel: '',
  sabeComQuemConversar: '',
  confiaProtecaoAdultos: '',
  conversaLimitesCorpo: '',
  sabeDizerNao: '',
  acompanhaInternet: '',
  mudancasComportamento: '',
  sabeQuemProcurar: '',
  conheceConselhoDisque100: '',
  observacao: '',
};

// --- PALETA DE CORES E IMAGENS ---
// ATENÇÃO: Substitua estas URLs pelas URLs reais das suas imagens.
// Para a logo, use um caminho relativo se estiver na pasta 'public' ou um URL completo.
const LOGO_URL = "/logo.png"; // Ex: '/logo.png' se estiver na pasta public
// Para a imagem da landing page, use um caminho relativo ou um URL completo.
const LANDING_PAGE_IMAGE_URL = "/landing-page-image.jpg"; // Ex: '/landing-page-image.jpg'

const COLORS = {
  primaryBlue: '#335aa4',
  primaryGreen: '#669935',
  primaryRed: '#cd3533',
  primaryYellow: '#fdca39',
  lightGray: '#f8f8f8',
  darkGray: '#333333',
  mediumGray: '#666666',
};

// --- COMPONENTES AUXILIARES (Header, Footer, Question, FormSection) ---

const Header = () => (
  <header style={{ backgroundColor: COLORS.primaryBlue }} className="shadow-2xl p-4 sm:p-6 w-full sticky top-0 z-10">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center">
        <img src={LOGO_URL} alt="Logo Projeto Acolhimento" className="h-10 sm:h-12 mr-3" />
        <h1 className="text-white text-xl sm:text-2xl font-extrabold tracking-wider font-inter">
          Projeto Acolhimento e Denúncia
        </h1>
      </div>
      <p className="hidden sm:block text-blue-200 text-sm">
        Proteção para Crianças e Adolescentes
      </p>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-900 p-4 w-full mt-10">
    <div className="max-w-7xl mx-auto text-center text-gray-400 text-xs">
      &copy; {new Date().getFullYear()} Projeto Denúncia. As respostas são confidenciais.
      <p className="mt-1 text-sm font-semibold" style={{ color: COLORS.primaryRed }}>
        Em risco imediato, ligue para o Conselho Tutelar ou Disque 100.
      </p>
    </div>
  </footer>
);

interface QuestionProps {
  label: string;
  name: keyof FormAnswers;
  value: string;
  onChange: (name: keyof FormAnswers, value: string) => void;
  options?: string[];
  type: 'radio' | 'text' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
}

const Question: React.FC<QuestionProps> = ({ label, name, value, onChange, options, type, placeholder, required = false }) => {
  const baseClasses = "mt-1 p-3 border rounded-lg w-full transition duration-300 shadow-sm";
  const focusClasses = `focus:ring-2 focus:ring-[${COLORS.primaryBlue}] focus:border-[${COLORS.primaryBlue}]`; // Using bracket notation for dynamic Tailwind

  let inputElement;

  if (type === 'radio' && options) {
    inputElement = (
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition duration-150">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(name, e.target.value)}
              className="h-5 w-5 border-gray-300 focus:ring-2"
              style={{ color: COLORS.primaryBlue, accentColor: COLORS.primaryBlue }} // Custom radio button color
              required={required}
            />
            <span className="ml-3 text-gray-700 text-sm font-medium">{option}</span>
          </label>
        ))}
      </div>
    );
  } else if (type === 'text' || type === 'number') {
    inputElement = (
      <input
        type="text" 
        inputMode={type === 'number' ? 'numeric' : 'text'}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseClasses} ${focusClasses}`}
        placeholder={placeholder}
        required={required}
      />
    );
  } else if (type === 'textarea') {
    inputElement = (
      <textarea
        name={name}
        rows={4}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseClasses} ${focusClasses}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      <label className="block text-base font-semibold text-gray-900 mb-2">
        {label} {required && <span style={{ color: COLORS.primaryRed }}>*</span>}
      </label>
      {inputElement}
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  warning?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description, children, warning }) => (
  <section className="mt-8">
    <h2 className="text-3xl font-extrabold pb-2 mb-4" style={{ color: COLORS.primaryBlue, borderBottom: `4px solid ${COLORS.primaryBlue}20` }}>{title}</h2>
    <p className="text-gray-600 mb-6 italic">{description}</p>
    {warning && (
      <div className="p-4 border-l-4 mb-6 rounded-lg" style={{ backgroundColor: `${COLORS.primaryYellow}1A`, borderColor: COLORS.primaryYellow, color: COLORS.darkGray }}>
        <p className="font-semibold">{warning}</p>
      </div>
    )}
    {children}
  </section>
);

// --- PÁGINAS PRINCIPAIS ---

// Define os campos obrigatórios para o cálculo de progresso (excluindo nome e observação)
const REQUIRED_CA_FIELDS: (keyof FormAnswers)[] = [
  'idade', 'quemResponde', 'sabeAbuso', 'tocadoVergonha', 'segredoToque', 'avontadeConversarAdulto', 
  'usaRedesSociais', 'mensagemDesconfortavel', 'sabeComQuemConversar', 'confiaProtecaoAdultos'
]; // Total: 8 perguntas + 2 iniciais = 10 (se Criança/Adolescente)

const REQUIRED_PR_FIELDS: (keyof FormAnswers)[] = [
  'idade', 'quemResponde', 'conversaLimitesCorpo', 'sabeDizerNao', 'acompanhaInternet', 
  'mudancasComportamento', 'sabeQuemProcurar', 'conheceConselhoDisque100'
]; // Total: 6 perguntas + 2 iniciais = 8 (se Pais/Responsáveis)

interface AuthStatus {
  app: any;
  db: any;
  auth: any;
  userId: string | null;
  isReady: boolean;
}

const FormPage: React.FC<{ navigate: (page: string) => void, authStatus: AuthStatus }> = ({ navigate, authStatus }) => {
  const [formData, setFormData] = useState<FormAnswers>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });

  const { db, userId } = authStatus;

  // Lógica central de mudança de estado, incluindo validação de idade
  const handleChange = useCallback((name: keyof FormAnswers, value: string) => {
    
    // Validação de Idade (só aceita números inteiros positivos ou vazio)
    if (name === 'idade') {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue === '' || (parseInt(numericValue) >= 0 && parseInt(numericValue) <= 120)) {
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        }
        return;
    }

    setFormData((prev) => {
        let newState = { ...prev, [name]: value };
        
        // Se mudar "quemResponde" para algo que não seja "Outro", limpa secaoOutro
        if (name === 'quemResponde' && value !== 'Outro') {
            newState.secaoOutro = '';
            newState.quemRespondeOutro = '';
        }

        return newState;
    });
  }, []);

  // Determina qual seção de perguntas (CA ou PR) deve ser exibida
  const targetSection = useMemo(() => {
    if (['Criança', 'Adolescente'].includes(formData.quemResponde)) return 'CA';
    if (formData.quemResponde === 'Mãe/Pai ou responsável') return 'PR';
    if (formData.quemResponde === 'Outro') {
      return formData.secaoOutro === 'Criança/Adolescente' ? 'CA' : (formData.secaoOutro === 'Pais/Responsáveis' ? 'PR' : '');
    }
    return '';
  }, [formData.quemResponde, formData.secaoOutro]);

  const isChildOrAdolescentSection = targetSection === 'CA';
  const isParentOrGuardianSection = targetSection === 'PR';
  
  // Lógica de cálculo da barra de progresso
  const progressPercentage = useMemo(() => {
    const requiredFields = isChildOrAdolescentSection ? REQUIRED_CA_FIELDS : (isParentOrGuardianSection ? REQUIRED_PR_FIELDS : []);

    // Se "Outro" for selecionado, adiciona os campos 'quemRespondeOutro' e 'secaoOutro'
    if (formData.quemResponde === 'Outro') {
        requiredFields.push('quemRespondeOutro', 'secaoOutro');
    }

    if (requiredFields.length === 0) return 0;

    let answeredCount = 0;
    
    requiredFields.forEach(field => {
      // Verifica se o campo não está vazio ou é um valor falsy (exceto 0 para idade, mas aqui é string)
      if (formData[field] && String(formData[field]).trim() !== '') {
        answeredCount++;
      }
    });

    return Math.round((answeredCount / requiredFields.length) * 100);

  }, [formData, isChildOrAdolescentSection, isParentOrGuardianSection]);


  // Função principal de submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !userId) {
      setSubmitMessage({ type: 'error', text: 'Erro de autenticação. Tente recarregar a página.' });
      return;
    }

    // 1. Validação mínima (seção escolhida)
    if (!targetSection) {
        setSubmitMessage({ type: 'error', text: 'Por favor, preencha a Seção 1 para selecionar o tipo de questionário a responder.' });
        return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      // 2. Criação do objeto de dados base (usando cópia)
      const reportData: Partial<FormAnswers & { userId: string, timestamp: string, nomeAnonimo: string }> = {
        ...formData,
        userId: userId,
        timestamp: new Date().toISOString(),
      };
      
      // 3. Tratamento de "Nome" (se não preenchido, vira 'Anônimo')
      reportData.nomeAnonimo = reportData.nome?.trim() || 'Anônimo';
      delete reportData.nome; 
      
      // 4. Limpeza de campos irrelevantes para evitar o erro "undefined" no Firestore
      const caFields: (keyof FormAnswers)[] = [
        'sabeAbuso', 'tocadoVergonha', 'segredoToque', 'avontadeConversarAdulto', 'usaRedesSociais', 
        'mensagemDesconfortavel', 'sabeComQuemConversar', 'confiaProtecaoAdultos'
      ];
      const prFields: (keyof FormAnswers)[] = [
        'conversaLimitesCorpo', 'sabeDizerNao', 'acompanhaInternet', 'mudancasComportamento', 
        'sabeQuemProcurar', 'conheceConselhoDisque100'
      ];

      if (targetSection === 'PR') {
        caFields.forEach(key => delete reportData[key]);
      } else if (targetSection === 'CA') {
        prFields.forEach(key => delete reportData[key]);
      }
      
      // 5. Envio ao Firestore
      const reportsCollectionRef = collection(db, `/artifacts/${appId}/public/data/reports`);
      await addDoc(reportsCollectionRef, reportData);

      setSubmitMessage({
        type: 'success',
        text: 'Denúncia/Questionário enviado com sucesso! Agradecemos sua colaboração.',
      });
      setFormData(initialFormState);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Erro ao enviar para o Firestore:", error);
      setSubmitMessage({
        type: 'error',
        text: `Erro ao enviar. Por favor, tente novamente. Detalhes: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Renderiza a mensagem de status (sucesso/erro)
  const StatusMessage = useMemo(() => {
    if (!submitMessage.text) return null;

    const colorClasses = submitMessage.type === 'success'
      ? `bg-green-100 border-green-500 text-green-800` // Tailwind default green
      : `bg-red-100 border-red-500 text-red-800`; // Tailwind default red

    const bgColor = submitMessage.type === 'success' ? `${COLORS.primaryGreen}1A` : `${COLORS.primaryRed}1A`;
    const borderColor = submitMessage.type === 'success' ? COLORS.primaryGreen : COLORS.primaryRed;
    const textColor = submitMessage.type === 'success' ? COLORS.darkGray : COLORS.darkGray;


    return (
      <div className={`p-4 border-l-4 font-bold rounded-lg mb-6 shadow-md`} style={{ backgroundColor: bgColor, borderColor: borderColor, color: textColor }} role="alert">
        {submitMessage.text}
      </div>
    );
  }, [submitMessage]);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Questionário de Acolhimento</h1>
          <p className="text-lg text-gray-600 border-b pb-4 mb-6">
            Este questionário tem o objetivo de proteger crianças e adolescentes e identificar situações de risco
            relacionadas ao abuso sexual infantil e pedofilia.
          </p>
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('landing')}
              className="hover:underline font-semibold text-sm"
              style={{ color: COLORS.primaryBlue }}
            >
              &larr; Voltar para a Página Inicial
            </button>
            {/* Barra de Progresso */}
            <div className="flex-grow">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: COLORS.primaryBlue }}>Progresso do Formulário</span>
                    <span className="text-sm font-medium" style={{ color: COLORS.primaryBlue }}>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className="h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${progressPercentage}%`, backgroundColor: COLORS.primaryBlue }}
                    ></div>
                </div>
            </div>
          </div>

          {StatusMessage}

          <form onSubmit={handleSubmit}>

            {/* Seção 1 – Identificação (opcional) */}
            <FormSection
              title="Seção 1 – Identificação (Opcional)"
              description="A identificação é opcional para garantir a segurança e o anonimato."
            >
              <Question
                label="Nome (Opcional)"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Seu nome (opcional)"
              />
              <Question
                label="Idade"
                name="idade"
                type="number" // Para validação, mas o input é text com validação no handleChange
                value={formData.idade}
                onChange={handleChange}
                placeholder="Sua idade (apenas números)"
                required={true}
              />
              <Question
                label="Quem está respondendo este formulário?"
                name="quemResponde"
                type="radio"
                value={formData.quemResponde}
                onChange={handleChange}
                options={['Criança', 'Adolescente', 'Mãe/Pai ou responsável', 'Outro']}
                required={true}
              />
              {formData.quemResponde === 'Outro' && (
                <>
                  <Question
                    label="Especifique quem está respondendo"
                    name="quemRespondeOutro"
                    type="text"
                    value={formData.quemRespondeOutro}
                    onChange={handleChange}
                    placeholder="Especifique (ex: Professor, Terapeuta, etc.)"
                    required={true}
                  />
                   <Question
                    label="Este questionário será respondido com foco em:"
                    name="secaoOutro"
                    type="radio"
                    value={formData.secaoOutro}
                    onChange={handleChange}
                    options={['Criança/Adolescente', 'Pais/Responsáveis']}
                    required={true}
                  />
                </>
              )}
            </FormSection>

            {/* Seção 2 – Para Crianças e Adolescentes (Condicional) */}
            {isChildOrAdolescentSection && (
              <FormSection
                title="Seção 2 – Para Crianças e Adolescentes"
                description="Suas respostas são importantes para que possamos entender e ajudar. (8 Perguntas)"
                warning="As respostas são confidenciais. Você não precisa responder nada que não se sinta à vontade."
              >
                <Question
                  label="1. Você sabe o que é “abuso” ou quando alguém faz algo com o seu corpo que você não gosta?"
                  name="sabeAbuso"
                  type="radio"
                  value={formData.sabeAbuso}
                  onChange={handleChange}
                  options={['Sim', 'Mais ou menos', 'Não']}
                  required={true}
                />
                <Question
                  label="2. Alguém já tocou no seu corpo de um jeito que te deixou com vergonha, medo ou confuso(a)?"
                  name="tocadoVergonha"
                  type="radio"
                  value={formData.tocadoVergonha}
                  onChange={handleChange}
                  options={['Sim', 'Não', 'Prefiro não responder']}
                  required={true}
                />
                <Question
                  label="3. Alguém já pediu pra você guardar segredo sobre algum toque, foto ou conversa?"
                  name="segredoToque"
                  type="radio"
                  value={formData.segredoToque}
                  onChange={handleChange}
                  options={['Sim', 'Não']}
                  required={true}
                />
                <Question
                  label="4. Você se sente à vontade para conversar com um adulto (pais, professores, Conselho Tutelar) quando algo te incomoda?"
                  name="avontadeConversarAdulto"
                  type="radio"
                  value={formData.avontadeConversarAdulto}
                  onChange={handleChange}
                  options={['Sim', 'Às vezes', 'Não']}
                  required={true}
                />
                <Question
                  label="5. Você usa celular, internet ou redes sociais?"
                  name="usaRedesSociais"
                  type="radio"
                  value={formData.usaRedesSociais}
                  onChange={handleChange}
                  options={['Sim', 'Não']}
                  required={true}
                />
                <Question
                  label="6. Alguém já te mandou mensagem, foto ou vídeo que te deixou desconfortável?"
                  name="mensagemDesconfortavel"
                  type="radio"
                  value={formData.mensagemDesconfortavel}
                  onChange={handleChange}
                  options={['Sim', 'Não']}
                  required={true}
                />
                <Question
                  label="7. Se algo te deixa triste ou com medo, você sabe com quem pode conversar?"
                  name="sabeComQuemConversar"
                  type="radio"
                  value={formData.sabeComQuemConversar}
                  onChange={handleChange}
                  options={['Sim', 'Mais ou menos', 'Não']}
                  required={true}
                />
                <Question
                  label="8. Você confia que os adultos ao redor te protegem e escutam quando você fala algo sério?"
                  name="confiaProtecaoAdultos"
                  type="radio"
                  value={formData.confiaProtecaoAdultos}
                  onChange={handleChange}
                  options={['Sim', 'Às vezes', 'Não']}
                  required={true}
                />
              </FormSection>
            )}

            {/* Seção 3 – Para Pais ou Responsáveis (Condicional) */}
            {isParentOrGuardianSection && (
              <FormSection
                title="Seção 3 – Para Pais ou Responsáveis"
                description="Respostas para avaliar o ambiente de segurança e proteção no lar. (6 Perguntas)"
              >
                <Question
                  label="1. Você conversa com seu filho(a) sobre limites do corpo, toques e segurança?"
                  name="conversaLimitesCorpo"
                  type="radio"
                  value={formData.conversaLimitesCorpo}
                  onChange={handleChange}
                  options={['Sim, com frequência', 'Às vezes', 'Não']}
                  required={true}
                />
                <Question
                  label="2. Seu filho(a) sabe que pode dizer “não” se alguém quiser tocá-lo de forma errada ou pedir segredo?"
                  name="sabeDizerNao"
                  type="radio"
                  value={formData.sabeDizerNao}
                  onChange={handleChange}
                  options={['Sim', 'Acho que não', 'Nunca conversamos sobre isso']}
                  required={true}
                />
                <Question
                  label="3. Você acompanha o uso da internet, redes sociais e contatos virtuais da criança/adolescente?"
                  name="acompanhaInternet"
                  type="radio"
                  value={formData.acompanhaInternet}
                  onChange={handleChange}
                  options={['Sempre', 'Às vezes', 'Raramente']}
                  required={true}
                />
                <Question
                  label="4. Já notou mudanças de comportamento (tristeza, medo, isolamento, raiva) sem motivo aparente?"
                  name="mudancasComportamento"
                  type="radio"
                  value={formData.mudancasComportamento}
                  onChange={handleChange}
                  options={['Sim', 'Não']}
                  required={true}
                />
                <Question
                  label="5. Você sabe a quem procurar se suspeitar de abuso sexual ou exposição à pedofilia?"
                  name="sabeQuemProcurar"
                  type="radio"
                  value={formData.sabeQuemProcurar}
                  onChange={handleChange}
                  options={['Sim', 'Não', 'Não tenho certeza']}
                  required={true}
                />
                <Question
                  label="6. Você conhece o Conselho Tutelar ou o Disque 100?"
                  name="conheceConselhoDisque100"
                  type="radio"
                  value={formData.conheceConselhoDisque100}
                  onChange={handleChange}
                  options={['Sim', 'Não']}
                  required={true}
                />
              </FormSection>
            )}

            {/* Seção 4 – Espaço para compartilhar (opcional) */}
            {(isChildOrAdolescentSection || isParentOrGuardianSection) && (
              <FormSection
                title="Seção 4 – Espaço para Compartilhar (Opcional)"
                description="Sinta-se à vontade para contar algo mais ou deixar uma observação. Não é obrigatório."
              >
                <Question
                  label="Você gostaria de contar algo, tirar uma dúvida ou deixar uma observação?"
                  name="observacao"
                  type="textarea"
                  value={formData.observacao}
                  onChange={handleChange}
                  placeholder="Escreva sua mensagem aqui..."
                />
              </FormSection>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-center text-gray-500 mb-4">
                    As respostas são confidenciais e devem ser coletadas com acolhimento, escuta e respeito.
                </p>
                <button
                type="submit"
                // Desabilita se estiver enviando, ou se a Seção 1 não foi totalmente preenchida
                disabled={isSubmitting || !targetSection || (formData.quemResponde === 'Outro' && !formData.quemRespondeOutro)}
                className="w-full py-4 px-4 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition duration-300 transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed text-lg"
                style={{ backgroundColor: COLORS.primaryRed, borderBottom: `4px solid ${COLORS.primaryRed}B3` }} // Darker red for border
                >
                {isSubmitting ? 'Enviando...' : 'Enviar Respostas Confidenciais'}
                </button>
                <p className="text-sm text-center mt-3 font-semibold" style={{ color: COLORS.primaryRed }}>
                    Em casos de risco, procure o Conselho Tutelar ou ligue 100.
                </p>
            </div>
          </form>
        </div>
        <p className="text-xs text-center text-gray-400 mt-4">ID do Usuário: {userId || 'Autenticando...'}</p>
      </main>
      <Footer />
    </>
  );
};

const LandingPage: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.lightGray }}>
    <Header />
    <main className="flex-grow flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl max-w-xl w-full text-center border-t-8 transform transition duration-500 hover:shadow-xl hover:scale-[1.02]" style={{ borderColor: COLORS.primaryBlue }}>
        
        {/* Imagem grande da Landing Page */}
        <img src={LANDING_PAGE_IMAGE_URL} alt="Crianças e Adolescentes Protegidos" className="w-full h-auto rounded-lg mb-6 shadow-md" />

        <h2 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Sua Segurança é Prioridade
        </h2>
        <p className="text-xl text-gray-700 mb-8 font-light">
          Um espaço seguro e **confidencial** para buscar ajuda, tirar dúvidas ou reportar situações de risco envolvendo crianças e adolescentes.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('form')}
            className="w-full py-4 px-6 text-white font-extrabold text-lg rounded-xl shadow-xl hover:brightness-110 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-opacity-50 border-b-4"
            style={{ backgroundColor: COLORS.primaryRed, borderColor: `${COLORS.primaryRed}B3`, focusRingColor: COLORS.primaryRed }}
          >
            Iniciar Questionário Confidencial Agora
          </button>
          <div className="p-3 border rounded-lg" style={{ backgroundColor: `${COLORS.primaryYellow}1A`, borderColor: COLORS.primaryYellow }}>
            <p className="text-sm font-bold" style={{ color: COLORS.primaryRed }}>
              ATENÇÃO: Em caso de risco imediato ou emergência, interrompa o formulário e **LIGUE IMEDIATAMENTE** para o Conselho Tutelar ou **Disque 100**.
            </p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

// --- COMPONENTE PRINCIPAL (App) ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' ou 'form'
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    app: null,
    db: null,
    auth: null,
    userId: null,
    isReady: false,
  });

  useEffect(() => {
    // 1. Inicializa o Firebase
    let app, db, auth;
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    } catch (e) {
      console.error("Erro na inicialização do Firebase:", e);
      // Em caso de erro, ainda tentamos prosseguir, mas o db/auth será null
      setAuthStatus({
        app: null,
        db: null,
        auth: null,
        userId: null,
        isReady: true, // Marca como pronto para não travar a UI, mas com erro
      });
      return;
    }

    // 2. Função para autenticar
    const authenticate = async (authInstance) => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
          console.log("Autenticação com token customizado realizada com sucesso.");
        } else {
          await signInAnonymously(authInstance);
          console.log("Autenticação anônima realizada com sucesso.");
        }
      } catch (e) {
        console.error("Erro durante o processo de signIn:", e);
      }
    };

    // 3. Listener do estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // O userId é crucial para a segurança do Firestore
      const userId = user?.uid || crypto.randomUUID(); 
      setAuthStatus({
        app,
        db,
        auth,
        userId: userId,
        isReady: true,
      });
      console.log(`Estado de Autenticação atualizado. User ID: ${userId}`);
    });

    // Inicia o processo de autenticação
    authenticate(auth);

    // Cleanup
    return () => unsubscribe();
  }, []);

  if (!authStatus.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: COLORS.primaryBlue }}></div>
          <p className="text-lg font-semibold text-gray-700">Carregando e preparando ambiente seguro...</p>
        </div>
      </div>
    );
  }

  // Lógica de roteamento simples
  const renderPage = () => {
    switch (currentPage) {
      case 'form':
        return <FormPage navigate={setCurrentPage} authStatus={authStatus} />;
      case 'landing':
      default:
        return <LandingPage navigate={setCurrentPage} />;
    }
  };

  return (
    <div className="font-inter min-h-screen" style={{ backgroundColor: COLORS.lightGray }}>
      {renderPage()}
    </div>
  );
};

export default App;