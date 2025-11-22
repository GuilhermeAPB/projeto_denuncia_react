import { FormAnswers } from '../types/form.types';
import { GoogleSheetsResponse } from '../types/api.types';
import { GOOGLE_SHEETS_URL } from '../config/constants';
import { sanitizeFormData } from '../security/sanitize';

export class GoogleSheetsService {
  /**
   * Envia dados para Google Sheets via Apps Script
   */
  static async submitDenunciation(
    formData: FormAnswers,
    userId: string
  ): Promise<GoogleSheetsResponse> {
    try {
      if (!GOOGLE_SHEETS_URL) {
        throw new Error('Google Sheets URL não configurada');
      }

      // Sanitizar dados antes de enviar
      const sanitizedData = sanitizeFormData(formData as any);

      // Adicionar metadados
      const dataToSubmit = {
        ...sanitizedData,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        // IP será obtido servidor-side do Google Apps Script
      };

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors', // Importante para CORS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      // Com 'no-cors', não conseguimos ler a resposta
      // Então consideramos sucesso se não lançou erro
      return {
        status: 'success',
        message: 'Denúncia registrada com sucesso',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao enviar para Google Sheets:', error);

      return {
        status: 'error',
        message: 'Erro ao registrar denúncia. Tente novamente.',
      };
    }
  }

  /**
   * Valida se a URL do Google Sheets está configurada
   */
  static isConfigured(): boolean {
    return !!GOOGLE_SHEETS_URL;
  }
}