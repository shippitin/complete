// src/components/InputField.tsx
import React, { ChangeEvent, FocusEvent } from 'react';
import { IconType } from 'react-icons';

// Define a union type for all possible HTML input/select/textarea elements
type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// Define a generic ChangeEvent type that can handle all these elements
type GenericChangeEvent = ChangeEvent<InputElement>;

// Define a generic FocusEvent type for input elements (for onFocus/onBlur)
type GenericFocusEvent = FocusEvent<HTMLInputElement>;

interface InputFieldProps {
  label: string;
  icon?: IconType;
  value: string | number;
  onChange: (e: GenericChangeEvent) => void;
  // Expanded type prop to include more common HTML input types
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'tel' | 'password' | 'url';
  placeholder?: string;
  options?: string[]; // For select type
  rows?: number; // For textarea type
  min?: string; // For date/number types
  onFocus?: (e: GenericFocusEvent) => void;
  onBlur?: (e: GenericChangeEvent) => void;
  colSpan?: number; // If you pass colSpan to InputField
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  placeholder,
  options,
  rows,
  min,
  onFocus,
  onBlur,
  colSpan
}) => {
  const colSpanClass = colSpan ? `md:col-span-${colSpan}` : '';

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={onChange}
            className="flex-1 bg-transparent text-lg font-semibold text-gray-800 outline-none cursor-pointer"
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="flex-1 text-lg font-semibold outline-none bg-transparent text-gray-800 placeholder:text-gray-500 resize-y"
          />
        );
      default: // text, number, date, email, tel, password, url
        return (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            min={min}
            className="flex-1 text-lg font-semibold outline-none bg-transparent text-gray-800 placeholder:text-gray-500"
          />
        );
    }
  };

  return (
    <div className={`flex flex-col py-4 px-6 border-b md:border-b-0 border-gray-200 last:border-b-0 md:last:border-r-0 md:odd:border-r md:[&:nth-child(3n+1)]:border-r md:[&:nth-child(3n+2)]:border-r ${colSpanClass}`}>
      <label className="text-xs font-medium text-gray-600 uppercase mb-1">{label}</label>
      <div className="flex items-center">
        {Icon && <Icon className="text-gray-400 mr-2 text-xl" />}
        {renderInput()}
      </div>
    </div>
  );
};

export default InputField;