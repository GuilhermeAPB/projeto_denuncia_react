export interface FormAnswers {
  // Informações do respondente
  quemResponde: 'Criança' | 'Adolescente' | 'Mãe/Pai ou responsável' | 'Outro' | '';
  idade: string;
  nome: string;

  // Informações sobre a criança/adolescente
  nomeCrianca: string;
  idadeCrianca: string;
  genero: 'Masculino' | 'Feminino' | 'Outro' | '';

  // Local da denúncia
  local: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;

  // Tipo de denúncia
  categoria: string;

  // Descrição detalhada
  descricao: string;
  descricaoAcoes: string;

  // Responsáveis suspeitos
  nomeSuspeito: string;
  relacao: string;

  // Contato (opcional)
  telefone: string;
  email: string;

  // Consentimento
  consentimento: boolean;
  politicaPrivacidade: boolean;

  // Metadados (gerados automaticamente)
  userId?: string;
  timestamp?: string;
  ipAddress?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  id?: string;
  timestamp?: string;
}