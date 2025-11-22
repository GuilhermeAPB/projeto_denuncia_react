import { signInAnonymously, User } from 'firebase/auth';
import { auth } from '../config/firebase';

export class AuthService {
  /**
   * Autentica usuário anonimamente
   */
  static async signInAnon(): Promise<User | null> {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      throw new Error('Falha na autenticação');
    }
  }

  /**
   * Obtém ID do usuário atual
   */
  static getCurrentUserId(): string {
    const user = auth.currentUser;
    return user?.uid || 'anonymous';
  }

  /**
   * Obtém usuário atual
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Verifica se está autenticado
   */
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}