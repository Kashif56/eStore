import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Input = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  icon,
  error,
  required = false,
  autoComplete,
  className = '',
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={icon} className="text-gray-400 h-5 w-5" />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          className={`
            block w-full rounded-md
            ${icon ? 'pl-10' : 'pl-4'}
            pr-4 py-2.5
            text-gray-900 
            border-gray-300
            placeholder:text-gray-400
            focus:ring-2
            focus:ring-indigo-600
            focus:border-indigo-600
            sm:text-sm
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
            transition duration-150 ease-in-out
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
