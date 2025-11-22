import React from 'react';

interface QuestionProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'radio' | 'checkbox' | 'select';
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

export const Question: React.FC<QuestionProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = '',
  error = '',
  hint = '',
  disabled = false,
  maxLength,
  minLength,
  pattern,
  autoComplete,
}) => {
  const labelId = `${name}-label`;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  // Acessibilidade: descrição composta
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ');

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            minLength={minLength}
            aria-labelledby={labelId}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded resize-none focus:outline-none focus:ring-2 transition ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            rows={4}
          />
        );

      case 'radio':
        return (
          <fieldset aria-labelledby={labelId}>
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required={required}
                    className="w-4 h-4 focus:ring-2 focus:ring-blue-500"
                    aria-describedby={describedBy || undefined}
                  />
                  <span className="text-gray-700 text-sm sm:text-base">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={name}
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              required={required}
              aria-labelledby={labelId}
              aria-describedby={describedBy || undefined}
              className="w-4 h-4 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700 text-sm sm:text-base">{label}</span>
          </label>
        );

      case 'select':
        return (
          <select
            id={name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            aria-labelledby={labelId}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded focus:outline-none focus:ring-2 transition ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">Selecione uma opção...</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type={type}
            id={name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            autoComplete={autoComplete}
            aria-labelledby={labelId}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded focus:outline-none focus:ring-2 transition ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
        );
    }
  };

  return (
    <div className="mb-6">
      {type !== 'checkbox' && (
        <label
          id={labelId}
          htmlFor={name}
          className="block text-gray-800 font-medium text-sm sm:text-base mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {renderInput()}

      {hint && (
        <p id={hintId} className="text-gray-500 text-xs sm:text-sm mt-1">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-red-600 text-xs sm:text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};