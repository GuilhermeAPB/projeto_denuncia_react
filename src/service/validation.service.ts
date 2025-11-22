
import { FormAnswers, ValidationError } from '../types/form.types';
import { VALID_AGE_RANGES } from '../config/constants';

export class ValidationService {
  /**
   * Valida se a idade é zero
   */
  static validateZeroAge(age: string): ValidationError | null {
    const ageNum = parseInt(age);
    
    if (ageNum === 0) {
      return {
        field: 'idade',
        message: 'A idade não pode ser zero. Por favor, informe uma idade válida.',
      };
    }
    
    return null;
  }

  /**
   * Valida a coerência entre idade e tipo de respondente
   */
  static validateAgeVsCategory(
    age: string,
    category: string
  ): ValidationError | null {
    const ageNum = parseInt(age);
    
    if (isNaN(ageNum)) {
      return {
        field: 'idade',
        message: 'Idade inválida. Por favor, informe um número.',
      };
    }

    const range = VALID_AGE_RANGES[category as keyof typeof VALID_AGE_RANGES];

    if (!range) {
      return {
        field: 'quemResponde',
        message: 'Perfil inválido selecionado.',
      };
    }

    if (ageNum < range.min || ageNum > range.max) {
      return {
        field: 'idade',
        message: `Para o perfil "${category}", a idade deve estar entre ${range.min} e ${range.max} anos. Sua idade (${ageNum}) não corresponde. Por favor, corrija.`,
      };
    }

    return null;
  }

  /**
   * Valida campos obrigatórios
   */
  static validateRequiredFields(formData: Partial<FormAnswers>): ValidationError[] {
    const errors: ValidationError[] = [];
    const requiredFields: (keyof FormAnswers)[] = [
      'quemResponde',
      'idade',
      'nomeCrianca',
      'idadeCrianca',
      'genero',
      'categoria',
      'descricao',
      'consentimento',
      'politicaPrivacidade',
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];

      if (!value || String(value).trim() === '' || value === false) {
        errors.push({
          field: String(field),
          message: `${this.getFieldLabel(String(field))} é obrigatório.`,
        });
      }
    });

    return errors;
  }

  /**
   * Valida email (opcional, mas se fornecido, deve ser válido)
   */
  static validateEmail(email: string): ValidationError | null {
    if (!email) return null; // Opcional

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        field: 'email',
        message: 'Email inválido. Por favor, informe um email válido.',
      };
    }

    return null;
  }

  /**
   * Valida telefone (opcional)
   */
  static validatePhone(phone: string): ValidationError | null {
    if (!phone) return null; // Opcional

    const phoneRegex = /^(\d{10,11})$/; // Brasil: 10 ou 11 dígitos

    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return {
        field: 'telefone',
        message: 'Telefone inválido. Por favor, informe um telefone válido (10 ou 11 dígitos).',
      };
    }

    return null;
  }

  /**
   * Valida CEP (opcional)
   */
  static validateCEP(cep: string): ValidationError | null {
    if (!cep) return null; // Opcional

    const cepRegex = /^\d{5}-?\d{3}$/;

    if (!cepRegex.test(cep)) {
      return {
        field: 'cep',
        message: 'CEP inválido. Formato: 00000-000',
      };
    }

    return null;
  }

  /**
   * Valida toda a submissão
   */
  static validateForm(formData: Partial<FormAnswers>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validações obrigatórias
    const requiredErrors = this.validateRequiredFields(formData);
    errors.push(...requiredErrors);

    // Validação: Idade zero
    if (formData.idade) {
      const zeroAgeError = this.validateZeroAge(formData.idade);
      if (zeroAgeError) errors.push(zeroAgeError);
    }

    // Validação: Idade vs Categoria
    if (formData.idade && formData.quemResponde) {
      const ageVsCategoryError = this.validateAgeVsCategory(
        formData.idade,
        formData.quemResponde
      );
      if (ageVsCategoryError) errors.push(ageVsCategoryError);
    }

    // Validações opcionais (mas se preenchidas, devem estar válidas)
    if (formData.email) {
      const emailError = this.validateEmail(formData.email);
      if (emailError) errors.push(emailError);
    }

    if (formData.telefone) {
      const phoneError = this.validatePhone(formData.telefone);
      if (phoneError) errors.push(phoneError);
    }

    if (formData.cep) {
      const cepError = this.validateCEP(formData.cep);
      if (cepError) errors.push(cepError);
    }

    return errors;
  }

  private static getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      quemResponde: 'Perfil',
      idade: 'Idade',
      nomeCrianca: 'Nome da criança',
      idadeCrianca: 'Idade da criança',
      genero: 'Gênero',
      categoria: 'Categoria de denúncia',
      descricao: 'Descrição',
      consentimento: 'Confirmação',
      politicaPrivacidade: 'Política de Privacidade',
    };

    return labels[field] || field;
  }
}