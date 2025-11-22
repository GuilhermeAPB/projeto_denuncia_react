import { useState, useCallback } from 'react';
import { FormAnswers, ValidationError } from '../types/form.types';
import { ValidationService } from '../services/validation.service';

const initialState: FormAnswers = {
  quemResponde: '',
  idade: '',
  nome: '',
  nomeCrianca: '',
  idadeCrianca: '',
  genero: '',
  local: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  cep: '',
  categoria: '',
  descricao: '',
  descricaoAcoes: '',
  nomeSuspeito: '',
  relacao: '',
  telefone: '',
  email: '',
  consentimento: false,
  politicaPrivacidade: false,
};

export const useForm = () => {
  const [formData, setFormData] = useState<FormAnswers>(initialState);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const updateField = useCallback((field: keyof FormAnswers, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando o usuário começa a corrigir
    setErrors((prev) => prev.filter((error) => error.field !== field));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors = ValidationService.validateForm(formData);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors([]);
    return true;
  }, [formData]);

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors.find((error) => error.field === field)?.message;
    },
    [errors]
  );

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors([]);
  }, []);

  return {
    formData,
    errors,
    updateField,
    validateForm,
    getFieldError,
    resetForm,
    hasErrors: errors.length > 0,
  };
};