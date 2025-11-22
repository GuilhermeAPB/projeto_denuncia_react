import { RATE_LIMIT_CONFIG } from '../config/constants';
import { RateLimitInfo } from '../types/api.types';

/**
 * Verifica se o usuário pode enviar denúncia
 * Implementa rate limiting usando localStorage
 */
export class RateLimitService {
  private static readonly STORAGE_KEY = 'denunciaSubmissions';

  /**
   * Registra uma submissão
   */
  static recordSubmission(userId: string): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    const submissions = this.getSubmissions(userId);

    submissions.push(Date.now());

    // Manter apenas as últimas submissões dentro do intervalo
    const recentSubmissions = submissions.filter(
      (timestamp) => Date.now() - timestamp < RATE_LIMIT_CONFIG.INTERVAL_MS
    );

    localStorage.setItem(key, JSON.stringify(recentSubmissions));
  }

  /**
   * Obtém histórico de submissões do usuário
   */
  private static getSubmissions(userId: string): number[] {
    const key = `${this.STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);

    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Verifica se o usuário pode fazer submissão
   */
  static canSubmit(userId: string): RateLimitInfo {
    const submissions = this.getSubmissions(userId);
    const now = Date.now();

    // Filtrar submissões dentro do intervalo
    const recentSubmissions = submissions.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_CONFIG.INTERVAL_MS
    );

    if (recentSubmissions.length >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
      // Encontrar quando a próxima submissão será permitida
      const oldestSubmission = recentSubmissions[0];
      const nextAllowedTime = oldestSubmission + RATE_LIMIT_CONFIG.INTERVAL_MS;
      const waitSeconds = Math.ceil((nextAllowedTime - now) / 1000);

      return {
        isAllowed: false,
        waitSeconds,
        nextAllowedTime,
      };
    }

    return {
      isAllowed: true,
      waitSeconds: 0,
      nextAllowedTime: 0,
    };
  }

  /**
   * Limpa histórico (útil para testes)
   */
  static clearHistory(userId: string): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.removeItem(key);
  }
}