import React, { useEffect } from 'react';

interface SuccessMessageProps {
  message?: string;
  onClose?: () => void;
  autoCloseDuration?: number; // em ms
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message = 'Denúncia registrada com sucesso!',
  onClose,
  autoCloseDuration = 5000,
}) => {
  useEffect(() => {
    if (autoCloseDuration && onClose) {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDuration, onClose]);

  return (
    <div
      className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 sm:w-96 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-lg animate-pulse z-50"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className="flex-shrink-0 text-green-600 text-2xl">✅</div>

        {/* Mensagem */}
        <div className="flex-1">
          <h3 className="font-semibold text-green-800">Sucesso!</h3>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>

        {/* Botão fechar */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-600 hover:text-green-800 font-bold"
            aria-label="Fechar mensagem de sucesso"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};