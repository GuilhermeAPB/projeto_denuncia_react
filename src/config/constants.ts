// Configurações de validação de idade
export const VALID_AGE_RANGES = {
  'Criança': { min: 3, max: 12 },
  'Adolescente': { min: 13, max: 17 },
  'Mãe/Pai ou responsável': { min: 18, max: 100 },
  'Outro': { min: 0, max: 150 },
};

// Configurações de rate limiting
export const RATE_LIMIT_CONFIG = {
  INTERVAL_MS: 300000, // 5 minutos
  MAX_ATTEMPTS: 3, // Máximo 3 denúncias em 5 minutos
  WARNING_TIME_SECONDS: 300,
};

// URL do Google Apps Script
export const GOOGLE_SHEETS_URL = process.env.REACT_APP_GOOGLE_SHEETS_URL || '';

// Mensagens de erro e sucesso
export const MESSAGES = {
  SUCCESS: 'Denúncia registrada com sucesso!',
  ERROR_GENERIC: 'Erro ao enviar denúncia. Tente novamente.',
  ERROR_VALIDATION: 'Por favor, corrija os erros no formulário.',
  ERROR_RATE_LIMIT: 'Você enviou muitas denúncias. Tente novamente em alguns minutos.',
  ERROR_AGE_MISMATCH: 'A idade informada não corresponde ao perfil selecionado. Por favor, corrija.',
  ERROR_ZERO_AGE: 'A idade não pode ser zero. Por favor, informe uma idade válida.',
  WARNING_LOADING: 'Enviando denúncia...',
};

// Categorias de denúncia
export const REPORT_CATEGORIES = [
  'Abuso físico',
  'Abuso sexual',
  'Negligência',
  'Abuso emocional',
  'Exploração',
  'Trabalho infantil',
  'Outro',
];

// Responsáveis de resposta
export const RESPONDENT_TYPES = [
  'Criança',
  'Adolescente',
  'Mãe/Pai ou responsável',
  'Outro',
];