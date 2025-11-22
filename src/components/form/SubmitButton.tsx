import React from 'react';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

interface SubmitButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  loadingText?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading = false,
  isDisabled = false,
  onClick,
  loadingText = 'Enviando...',
  children = 'Enviar',
  variant = 'primary',
  size = 'md',
  fullWidth = true,
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const isButtonDisabled = isLoading || isDisabled;

  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      aria-label={isLoading ? loadingText : String(children)}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isButtonDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        font-semibold rounded transition-all duration-200
        flex items-center justify-center gap-2
        focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-blue-500
      `}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" message="" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};