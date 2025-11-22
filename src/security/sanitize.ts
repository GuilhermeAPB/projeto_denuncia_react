import DOMPurify from 'dompurify';

/**
 * Sanitiza string para remover XSS attacks
 * Remove tags HTML e scripts maliciosos
 */
export const sanitizeInput = (dirtyString: string): string => {
  if (!dirtyString) return '';

  // Configuração de DOMPurify - permitir apenas texto
  const config = {
    ALLOWED_TAGS: [], // Não permite nenhuma tag HTML
    ALLOWED_ATTR: [], // Não permite nenhum atributo
    KEEP_CONTENT: true, // Manter o conteúdo de texto
  };

  return DOMPurify.sanitize(dirtyString, config as any);
};

/**
 * Sanitiza objeto inteiro de formulário
 */
export const sanitizeFormData = (
  formData: Record<string, any>
): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Remove caracteres perigosos
 */
export const removeSpecialCharacters = (str: string): string => {
  return str.replace(/[<>\"'%;()&+]/g, '');
};

/**
 * Escapa HTML
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
};