import { useState, useCallback } from 'react';
import { FormAnswers, SubmissionResponse } from '../types/form.types';
import { GoogleSheetsService } from '../services/googleSheets.service';
import { RateLimitService } from '../security/rateLimit';
import { AuthService } from '../services/auth.service';

export const useSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [response, setResponse] = useState<SubmissionResponse | null>(null);

  const submitForm = useCallback(
    async (formData: FormAnswers): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        // Obter ID do usuário
        const userId = AuthService.getCurrentUserId();

        // Verificar rate limiting
        const rateLimitCheck = RateLimitService.canSubmit(userId);

        if (!rateLimitCheck.isAllowed) {
          const message = `⏳ Aguarde ${rateLimitCheck.waitSeconds}s antes de enviar outra denúncia.`;
          setSubmitError(message);
          setIsSubmitting(false);
          return false;
        }

        // Enviar para Google Sheets
        const result = await GoogleSheetsService.submitDenunciation(
          formData,
          userId
        );

        if (result.status === 'success') {
          // Registrar submissão para rate limiting
          RateLimitService.recordSubmission(userId);

          setSubmitSuccess(true);
          setResponse(result);
          setIsSubmitting(false);
          return true;
        } else {
          setSubmitError(result.message);
          setIsSubmitting(false);
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        setSubmitError(
          `Erro ao enviar denúncia: ${errorMessage}`
        );
        setIsSubmitting(false);
        return false;
      }
    },
    []
  );

  const resetSubmit = useCallback(() => {
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setSubmitError(null);
    setResponse(null);
  }, []);

  return {
    isSubmitting,
    submitSuccess,
    submitError,
    response,
    submitForm,
    resetSubmit,
  };
};