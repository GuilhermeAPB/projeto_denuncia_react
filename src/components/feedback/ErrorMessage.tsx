import React, { useEffect } from 'react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  autoCloseDuration?: number;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
  autoCloseDuration = 0, // Não fecha automaticamente por padrão
}) => {
  useEffect(() => {
    if (autoCloseDuration && onClose) {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDuration, onClose]);

  return (
    <div
      className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md mb-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className="flex-shrink-0 text-red-600 text-2xl">❌</div>

        {/* Mensagem */}
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Erro!</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>

        {/* Botão fechar */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 font-bold"
            aria-label="Fechar mensagem de erro"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};