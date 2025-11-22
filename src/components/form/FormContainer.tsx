import React, { useEffect, useRef } from 'react';
import { FormAnswers } from '../../types/form.types';
import { useForm } from '../../hooks/useForm';
import { useSubmit } from '../../hooks/useSubmit';
import { Question } from './Question';
import { SubmitButton } from './SubmitButton';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { SuccessMessage } from '../feedback/SuccessMessage';
import { ErrorMessage } from '../feedback/ErrorMessage';
import { RESPONDENT_TYPES, REPORT_CATEGORIES, MESSAGES } from '../../config/constants';

export const FormContainer: React.FC = () => {
  const { formData, errors, updateField, validateForm, getFieldError, resetForm } = useForm();
  const { isSubmitting, submitSuccess, submitError, submitForm, resetSubmit } = useSubmit();
  const messageRef = useRef<HTMLDivElement>(null);

  // Validação de idade vs categoria em tempo real
  useEffect(() => {
    if (formData.idade && formData.quemResponde) {
       // Validação em tempo real pode ser adicionada aqui
      // Este efeito será útil para validação em tempo real
      // A validação completa acontece no submit
    }
  }, [formData.idade, formData.quemResponde]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    if (!validateForm()) {
      // Scroll para o primeiro erro
      const firstError = document.querySelector('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Submeter
    const success = await submitForm(formData);

    if (success) {
      // Scroll para mensagem de sucesso
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Limpar formulário
      resetForm();

      // Resetar estado de submit após 5 segundos
      setTimeout(resetSubmit, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            📋 Formulário de Denúncia
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sua denúncia é importante. Preencha o formulário abaixo com os dados do caso.
            Você pode denunciar anonimamente.
          </p>
        </div>

        {/* Mensagem de Sucesso */}
        {submitSuccess && (
          <div ref={messageRef}>
            <SuccessMessage
              message={MESSAGES.SUCCESS}
              onClose={() => {
                resetSubmit();
              }}
            />
          </div>
        )}

        {/* Mensagem de Erro */}
        {submitError && (
          <ErrorMessage
            message={submitError}
            onClose={() => resetSubmit()}
          />
        )}

        {/* Formulário */}
        {!submitSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              {/* ===== SEÇÃO 1: INFORMAÇÕES DO RESPONDENTE ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 pb-4 border-b-2 border-blue-500">
                1️⃣ Quem Está Respondendo?
              </h2>

              <Question
                label="Você é:"
                name="quemResponde"
                type="radio"
                value={formData.quemResponde}
                onChange={(value) => updateField('quemResponde', value)}
                options={RESPONDENT_TYPES}
                required={true}
                error={getFieldError('quemResponde')}
              />

              <Question
                label="Qual é sua idade?"
                name="idade"
                type="number"
                value={formData.idade}
                onChange={(value) => updateField('idade', value)}
                required={true}
                placeholder="Ex: 25"
                error={getFieldError('idade')}
                hint="Informe um número entre 0 e 150"
              />

              <Question
                label="Como você gostaria de ser identificado? (opcional)"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={(value) => updateField('nome', value)}
                placeholder="Ex: João Silva (deixe em branco para anonimato)"
              />

              {/* ===== SEÇÃO 2: INFORMAÇÕES SOBRE A CRIANÇA/ADOLESCENTE ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 mt-10 pb-4 border-b-2 border-blue-500">
                2️⃣ Informações Sobre a Criança/Adolescente
              </h2>

              <Question
                label="Nome da criança/adolescente"
                name="nomeCrianca"
                type="text"
                value={formData.nomeCrianca}
                onChange={(value) => updateField('nomeCrianca', value)}
                required={true}
                placeholder="Ex: Maria Silva"
                error={getFieldError('nomeCrianca')}
              />

              <Question
                label="Idade da criança/adolescente"
                name="idadeCrianca"
                type="number"
                value={formData.idadeCrianca}
                onChange={(value) => updateField('idadeCrianca', value)}
                required={true}
                placeholder="Ex: 8"
                error={getFieldError('idadeCrianca')}
              />

              <Question
                label="Gênero"
                name="genero"
                type="radio"
                value={formData.genero}
                onChange={(value) => updateField('genero', value)}
                options={['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']}
                required={true}
                error={getFieldError('genero')}
              />

              {/* ===== SEÇÃO 3: LOCAL DA DENÚNCIA ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 mt-10 pb-4 border-b-2 border-blue-500">
                📍 3️⃣ Local da Denúncia
              </h2>

              <Question
                label="Onde a criança/adolescente reside ou estava quando ocorreu o fato?"
                name="local"
                type="text"
                value={formData.local}
                onChange={(value) => updateField('local', value)}
                required={true}
                placeholder="Ex: Residência, Escola, Rua, etc"
                error={getFieldError('local')}
              />

              <Question
                label="Logradouro"
                name="logradouro"
                type="text"
                value={formData.logradouro}
                onChange={(value) => updateField('logradouro', value)}
                placeholder="Ex: Rua das Flores"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Question
                  label="Número"
                  name="numero"
                  type="text"
                  value={formData.numero}
                  onChange={(value) => updateField('numero', value)}
                  placeholder="Ex: 123"
                />

                <Question
                  label="Complemento"
                  name="complemento"
                  type="text"
                  value={formData.complemento}
                  onChange={(value) => updateField('complemento', value)}
                  placeholder="Apto, Bloco, etc"
                />

                <Question
                  label="CEP"
                  name="cep"
                  type="text"
                  value={formData.cep}
                  onChange={(value) => updateField('cep', value)}
                  placeholder="00000-000"
                  error={getFieldError('cep')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Question
                  label="Bairro"
                  name="bairro"
                  type="text"
                  value={formData.bairro}
                  onChange={(value) => updateField('bairro', value)}
                  placeholder="Ex: Centro"
                />

                <Question
                  label="Cidade"
                  name="cidade"
                  type="text"
                  value={formData.cidade}
                  onChange={(value) => updateField('cidade', value)}
                  placeholder="Ex: Manaus"
                />
              </div>

              {/* ===== SEÇÃO 4: TIPO DE DENÚNCIA ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 mt-10 pb-4 border-b-2 border-blue-500">
                ⚠️ 4️⃣ Tipo de Denúncia
              </h2>

              <Question
                label="Que tipo de denúncia está reportando?"
                name="categoria"
                type="select"
                value={formData.categoria}
                onChange={(value) => updateField('categoria', value)}
                options={REPORT_CATEGORIES}
                required={true}
                error={getFieldError('categoria')}
              />

              {/* ===== SEÇÃO 5: DESCRIÇÃO DETALHADA ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 mt-10 pb-4 border-b-2 border-blue-500">
                📝 5️⃣ Descrição Detalhada
              </h2>

              <Question
                label="Descreva o que aconteceu"
                name="descricao"
                type="textarea"
                value={formData.descricao}
                onChange={(value) => updateField('descricao', value)}
                required={true}
                placeholder="Conte com detalhes o que você sabe sobre o caso..."
                error={getFieldError('descricao')}
                hint="Quanto mais detalhes, melhor"
                maxLength={2000}
              />

              <Question
                label="Que ações a criança/adolescente já sofreu? (opcional)"
                name="descricaoAcoes"
                type="textarea"
                value={formData.descricaoAcoes}
                onChange={(value) => updateField('descricaoAcoes', value)}
                placeholder="Descreva as ações, ferimentos, comportamentos, etc..."
                maxLength={1000}
              />

              {/* ===== SEÇÃO 6: RESPONSÁVEL SUSPEITO ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 mt-10 pb-4 border-b-2 border-blue-500">
                👤 6️⃣ Responsável Suspeito
              </h2>

              <Question
                label="Nome da pessoa suspeita (se souber)"
                name="nomeSuspeito"
                type="text"
                value={formData.nomeSuspeito}
                onChange={(value) => updateField('nomeSuspeito', value)}
                placeholder="Ex: João da Silva (deixe em branco se não souber)"
              />

              <Question
                label="Qual é a relação com a criança/adolescente?"
                name="relacao"
                type="text"
                value={formData.relacao}
                onChange={(value) => updateField('relacao', value)}
                placeholder="Ex: Pai, Padrasto, Professor, Vizinho, etc"
              />

              {/* ===== SEÇÃO 7: CONTATO (OPCIONAL) ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 mt-10 pb-4 border-b-2 border-blue-500">
                📞 7️⃣ Contato (Opcional)
              </h2>

              <p className="text-gray-600 text-sm mb-4">
                Deixe em branco para manter total anonimato
              </p>

              <Question
                label="Telefone"
                name="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(value) => updateField('telefone', value)}
                placeholder="(xx) xxxxx-xxxx"
                error={getFieldError('telefone')}
              />

              <Question
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => updateField('email', value)}
                placeholder="seu@email.com"
                error={getFieldError('email')}
              />

              {/* ===== SEÇÃO 8: CONSENTIMENTO ===== */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 mt-10 pb-4 border-b-2 border-blue-500">
                ✅ 8️⃣ Consentimento
              </h2>

              <Question
                label="Confirmo que as informações prestadas são verdadeiras"
                name="consentimento"
                type="checkbox"
                value={formData.consentimento}
                onChange={(value) => updateField('consentimento', value)}
                required={true}
                error={getFieldError('consentimento')}
              />

              <Question
                label="Li e concordo com a Política de Privacidade"
                name="politicaPrivacidade"
                type="checkbox"
                value={formData.politicaPrivacidade}
                onChange={(value) => updateField('politicaPrivacidade', value)}
                required={true}
                error={getFieldError('politicaPrivacidade')}
              />

              {/* Botão Enviar */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <SubmitButton
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                  loadingText="Enviando denúncia..."
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  ✉️ Enviar Denúncia
                </SubmitButton>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                Denúncia Registrada com Sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Obrigado por ajudar a proteger crianças e adolescentes.
              </p>
              <button
                onClick={() => {
                  resetSubmit();
                  resetForm();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition"
              >
                ➕ Fazer Outra Denúncia
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};